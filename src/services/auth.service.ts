import { userRepository } from "@/repositories/user.repository";
import { RegisterInput, LoginInput, UpdateProfileInput } from "@/validators/auth.schema";
import { UnauthorizedError, ForbiddenError, ConflictError, NotFoundError } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export class AuthService {
  /**
   * Registers a new customer with Supabase Auth and Prisma DB.
   * Privilege escalation prevention: Enforces CUSTOMER role.
   */
  async register(input: RegisterInput) {
    const supabase = await createServerSupabaseClient();

    // Check if email already registered in database
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists");
    }

    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName || "",
          phone: input.phone || "",
        },
      },
    });

    if (authError || !authData.user) {
      logger.error("Supabase Auth registration failed", authError);
      throw new ConflictError(authError?.message || "Failed to create customer account");
    }

    // Create user in application database with Role.CUSTOMER
    const user = await userRepository.createCustomer({
      supabaseUid: authData.user.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    // Sync app_metadata with role for JWT-based claims
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(authData.user.id, {
        app_metadata: { role: user.role },
      });
    } catch (err) {
      logger.warn("Could not sync app_metadata role on register (non-fatal)", { error: String(err) });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      session: authData.session,
      requiresEmailVerification: !authData.session,
    };
  }

  /**
   * Logs in a user, verifying credentials against Supabase Auth and checking account status.
   */
  async login(input: LoginInput) {
    const supabase = await createServerSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (authError || !authData.user) {
      logger.warn(`Failed login attempt for: ${input.email}`, { message: authError?.message });
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify account status in database
    let user = await userRepository.findBySupabaseUid(authData.user.id);

    // Auto-sync if user signed in but record not in Prisma or was seeded with another UID
    if (!user) {
      const existingByEmail = await userRepository.findByEmail(authData.user.email || input.email);
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { supabaseUid: authData.user.id },
        });
      } else {
        user = await userRepository.createCustomer({
          supabaseUid: authData.user.id,
          email: authData.user.email || input.email,
          firstName: authData.user.user_metadata?.first_name || null,
          lastName: authData.user.user_metadata?.last_name || null,
          phone: authData.user.user_metadata?.phone || null,
        });
      }
    }

    // Account status check
    if (!user.isActive || user.deletedAt !== null) {
      await supabase.auth.signOut();
      throw new ForbiddenError("Your account has been deactivated. Please contact TiniWish care.");
    }

    // Ensure app_metadata contains the actual role from DB
    try {
      if (authData.user.app_metadata?.role !== user.role) {
        const adminClient = createAdminClient();
        await adminClient.auth.admin.updateUserById(authData.user.id, {
          app_metadata: { role: user.role },
        });
      }
    } catch (err) {
      logger.warn("Could not sync app_metadata role on login (non-fatal)", { error: String(err) });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      session: authData.session,
    };
  }

  /**
   * Logs out the current user session.
   */
  async logout() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  /**
   * Sends password reset link.
   */
  async forgotPassword(email: string, redirectTo?: string) {
    const supabase = await createServerSupabaseClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = redirectTo || `${appUrl}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    });

    if (error) {
      logger.warn(`Forgot password request failed for: ${email}`, { error: error.message });
      // To prevent account enumeration, do not throw; return standard message
    }

    return { message: "If an account exists with this email, a password reset link has been dispatched." };
  }

  /**
   * Resets password for authenticated session.
   */
  async resetPassword(newPassword: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error("Password update failed", error);
      throw new UnauthorizedError(error.message || "Failed to update password");
    }

    return { user: data.user };
  }

  /**
   * Syncs user after Google OAuth or magic link confirmation.
   */
  async syncOAuthUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    if (!supabaseUser.email) {
      throw new UnauthorizedError("Email missing from OAuth provider profile");
    }

    let user = await userRepository.findBySupabaseUid(supabaseUser.id);
    if (!user) {
      const existingByEmail = await userRepository.findByEmail(supabaseUser.email);
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { supabaseUid: supabaseUser.id },
        });
      } else {
        const fullName = (supabaseUser.user_metadata?.full_name as string) || "";
        const parts = fullName.split(" ");
        const firstName = parts[0] || (supabaseUser.user_metadata?.first_name as string) || "Customer";
        const lastName = parts.slice(1).join(" ") || (supabaseUser.user_metadata?.last_name as string) || "";

        user = await userRepository.createCustomer({
          supabaseUid: supabaseUser.id,
          email: supabaseUser.email,
          firstName,
          lastName,
        });
      }
    }

    if (!user.isActive || user.deletedAt !== null) {
      throw new ForbiddenError("Your account has been deactivated.");
    }

    // Sync role to app_metadata
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(supabaseUser.id, {
        app_metadata: { role: user.role },
      });
    } catch (err) {
      logger.warn("Could not sync app_metadata role on OAuth sync (non-fatal)", { error: String(err) });
    }

    return user;
  }

  /**
   * Gets user profile with associated details.
   */
  async getProfile(userId: string) {
    const user = await userRepository.findByIdWithDetails(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      addresses: user.addresses,
      orders: user.orders,
      stats: {
        totalOrders: user._count.orders,
        totalReviews: user._count.reviews,
      },
    };
  }

  /**
   * Updates user profile fields (firstName, lastName, phone).
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await userRepository.updateProfile(userId, input);
    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      role: updated.role,
    };
  }
}

export const authService = new AuthService();
