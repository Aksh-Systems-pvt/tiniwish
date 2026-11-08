import { prisma } from "@/lib/prisma";
import { Role, User } from "@prisma/client";
import { logger } from "@/lib/logger";

export interface CreateUserData {
  supabaseUid: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export class UserRepository {
  /**
   * Finds a user by their Supabase Auth UID.
   */
  async findBySupabaseUid(supabaseUid: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { supabaseUid },
      });
    } catch (error) {
      logger.error(`Failed to find user by supabaseUid: ${supabaseUid}`, error);
      return null;
    }
  }

  /**
   * Finds a user by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (error) {
      logger.error(`Failed to find user by email: ${email}`, error);
      return null;
    }
  }

  /**
   * Finds a user by internal database ID.
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(`Failed to find user by id: ${id}`, error);
      return null;
    }
  }

  /**
   * Finds a user by internal ID with associated addresses, recent orders, and counts.
   */
  async findByIdWithDetails(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          addresses: {
            orderBy: { isDefaultShipping: "desc" },
          },
          orders: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              items: {
                take: 2,
              },
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Failed to find user with details: ${id}`, error);
      return null;
    }
  }

  /**
   * Creates a new customer record.
   * SECURITY: Always defaults to Role.CUSTOMER to prevent privilege escalation.
   */
  async createCustomer(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        supabaseUid: data.supabaseUid,
        email: data.email.toLowerCase().trim(),
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        role: Role.CUSTOMER,
        isActive: true,
      },
    });
  }

  /**
   * Updates an existing user's profile details.
   */
  async updateProfile(
    id: string,
    data: { firstName?: string; lastName?: string; phone?: string }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });
  }

  /**
   * Updates user role (Administrative action only).
   */
  async updateRole(id: string, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  /**
   * Toggles account active status (Deactivate / Reactivate).
   */
  async setActiveStatus(id: string, isActive: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Soft deletes a user account.
   */
  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

export const userRepository = new UserRepository();
