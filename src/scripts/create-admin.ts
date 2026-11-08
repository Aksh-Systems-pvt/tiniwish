import { createAdminClient } from "../lib/supabase/admin";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@tiniwish.com";
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "TiniWishAdmin@2026!";
  const role = (process.argv[4] as Role) || Role.ADMIN;

  console.log(`\n👑 Bootstrapping Administrative Account: ${email}`);
  console.log(`Role: ${role}`);

  const adminClient = createAdminClient();

  // 1. Check or create in Supabase Auth
  let supabaseUid: string;
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();

  if (listError) {
    throw new Error(`Failed to list Supabase users: ${listError.message}`);
  }

  const existingAuth = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingAuth) {
    console.log(`ℹ️ User exists in Supabase Auth (${existingAuth.id}). Updating password and metadata...`);
    const { data: updated, error: updateError } = await adminClient.auth.admin.updateUserById(
      existingAuth.id,
      {
        password,
        email_confirm: true,
        app_metadata: { role },
      }
    );
    if (updateError) {
      throw updateError;
    }
    supabaseUid = updated.user.id;
  } else {
    console.log("Creating new user in Supabase Auth...");
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: {
        first_name: "TiniWish",
        last_name: "Admin",
      },
    });
    if (createError || !created.user) {
      throw createError || new Error("Failed to create Supabase user");
    }
    supabaseUid = created.user.id;
  }

  // 2. Upsert in Prisma PostgreSQL
  const dbUser = await prisma.user.upsert({
    where: { email },
    update: {
      supabaseUid,
      role,
      isActive: true,
      deletedAt: null,
    },
    create: {
      supabaseUid,
      email,
      firstName: "TiniWish",
      lastName: "Admin",
      role,
      isActive: true,
    },
  });

  console.log(`\n✅ Administrative account active and ready:`);
  console.log(`- Database ID: ${dbUser.id}`);
  console.log(`- Supabase UID: ${dbUser.supabaseUid}`);
  console.log(`- Email: ${dbUser.email}`);
  console.log(`- Role: ${dbUser.role}`);
  console.log(`- Status: Active\n`);
}

main()
  .catch((e) => {
    console.error("❌ Admin creation failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

