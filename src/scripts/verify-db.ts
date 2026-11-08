import { prisma } from "../lib/prisma";

async function verify() {
  console.log("🔍 Checking connection to Supabase PostgreSQL database...");
  const categories = await prisma.category.findMany({
    select: { name: true, slug: true, parentId: true },
    orderBy: { displayOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    select: { title: true, slug: true, category: { select: { name: true } } },
  });

  const coupons = await prisma.coupon.findMany({
    select: { code: true, discountType: true, discountValue: true },
  });

  const siteSettings = await prisma.siteSetting.findMany({
    select: { key: true },
  });

  console.log("📊 Live Supabase Data Report:");
  console.log(`- Categories in DB: ${categories.length}`);
  console.log(`- Products in DB: ${products.length}`);
  console.log(`- Coupons in DB: ${coupons.length}`);
  console.log(`- Site Settings in DB: ${siteSettings.length}`);

  for (const p of products) {
    console.log(`  • [${p.category.name}] ${p.title} (${p.slug})`);
  }
}

verify()
  .catch((e) => {
    console.error("Connection failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

