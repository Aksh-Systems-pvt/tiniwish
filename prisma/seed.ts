import { PrismaClient, Role, InventoryMovementType, DiscountType, BannerPlacement } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TiniWish database seeding...");

  // ----------------------------------------------------------------------------
  // 1. Initial Administrative Account (Secure Setup)
  // ----------------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || "admin@tiniwish.com";
  const adminUid = process.env.ADMIN_SUPABASE_UID || "admin_seed_auth_uuid_001";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      supabaseUid: adminUid,
      email: adminEmail,
      phone: "+919876543210",
      firstName: "TiniWish",
      lastName: "SuperAdmin",
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin account configured: ${adminUser.email} (Role: ${adminUser.role})`);

  // ----------------------------------------------------------------------------
  // 2. Site Settings
  // ----------------------------------------------------------------------------
  const defaultSettings = [
    {
      key: "STORE_INFO",
      description: "Official store metadata, registered office, and customer care details",
      isPublic: true,
      value: {
        storeName: "TiniWish",
        tagline: "Little wishes. Timeless treasures.",
        legalEntity: "TiniWish Luxury Retails LLP",
        registeredAddress: "Plot 42, DLF Phase 5, Golf Course Road, Gurugram, Haryana - 122002",
        supportEmail: "care@tiniwish.com",
        supportPhone: "+91 8000 123 456",
        gstin: "06AAACT0000A1Z5",
      },
    },
    {
      key: "SHIPPING_CONFIG",
      description: "Shipping fee tiers and free delivery thresholds",
      isPublic: true,
      value: {
        freeShippingThreshold: 999,
        standardShippingFee: 99,
        expressShippingFee: 199,
        estimatedDeliveryDays: {
          metro: "2-3 business days",
          restOfIndia: "4-6 business days",
        },
      },
    },
    {
      key: "TAX_CONFIG",
      description: "Indian Goods & Services Tax (GST) classification rules",
      isPublic: false,
      value: {
        jewelleryGstPercent: 3.0,
        decorGstPercent: 12.0,
        giftsGstPercent: 18.0,
        isPricesGstInclusive: true,
      },
    },
    {
      key: "COD_CONFIG",
      description: "Cash on Delivery risk limits and convenience charges",
      isPublic: true,
      value: {
        isCodEnabled: true,
        minOrderAmount: 499,
        maxOrderAmount: 5000,
        codConvenienceFee: 49,
      },
    },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log("✅ Site settings initialized.");

  // ----------------------------------------------------------------------------
  // 3. Three Main Categories & Subcategories (Hierarchical)
  // ----------------------------------------------------------------------------
  const categoryStructure = [
    {
      name: "Artificial Jewellery",
      slug: "jewellery",
      description: "Opulent Kundan, Polki, American Diamond, and temple jewellery for modern Indian grace.",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=1920&auto=format&fit=crop",
      displayOrder: 1,
      subcategories: [
        { name: "Earrings", slug: "earrings", description: "Chandbalis, heritage temple jhumkas, and brilliant AD studs.", displayOrder: 1 },
        { name: "Necklaces", slug: "necklaces", description: "Kundan chokers, layered bridal necklaces, and daily pendants.", displayOrder: 2 },
        { name: "Rings", slug: "rings", description: "Adjustable Kundan cocktail rings and solitaire bands.", displayOrder: 3 },
        { name: "Bracelets", slug: "bracelets", description: "Cuff bracelets, delicate tennis bracelets, and charm bracelets.", displayOrder: 4 },
        { name: "Bangles", slug: "bangles", description: "Handcrafted royal kadas and antique bangles.", displayOrder: 5 },
        { name: "Jewellery Sets", slug: "jewellery-sets", description: "Harmonious sets featuring necklace, earrings, and maang tikka.", displayOrder: 6 },
        { name: "Traditional Jewellery", slug: "traditional-jewellery", description: "Temple jewellery, Jadau motifs, and royal antique heirlooms.", displayOrder: 7 },
        { name: "Daily Wear", slug: "daily-wear", description: "Lightweight, tarnish-resistant minimal jewellery for everyday grace.", displayOrder: 8 },
        { name: "Party Wear", slug: "party-wear", description: "Gleaming cubic zirconia and contemporary statement pieces.", displayOrder: 9 },
      ],
    },
    {
      name: "Charming Gifts",
      slug: "gifts",
      description: "Bespoke celebratory hampers and personalized keepsakes crafted for cherishable moments.",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=85&w=1920&auto=format&fit=crop",
      displayOrder: 2,
      subcategories: [
        { name: "Birthday Gifts", slug: "birthday-gifts", description: "Cherished birthday surprises and gift sets.", displayOrder: 1 },
        { name: "Anniversary Gifts", slug: "anniversary-gifts", description: "Romantic keepsakes and milestone celebration gifts.", displayOrder: 2 },
        { name: "Wedding Gifts", slug: "wedding-gifts", description: "Regal bridal hampers and wedding tokens.", displayOrder: 3 },
        { name: "Personalized Gifts", slug: "personalized-gifts", description: "Custom engraved monogram velvet boxes.", displayOrder: 4 },
        { name: "Gift Hampers", slug: "gift-hampers", description: "Curated luxury gift trunks with candles, teas, and accents.", displayOrder: 5 },
        { name: "Festive Gifts", slug: "festive-gifts", description: "Diwali, Rakhi, and celebratory gift boxes.", displayOrder: 6 },
        { name: "Couple Gifts", slug: "couple-gifts", description: "Harmonious gift sets for pairs and newlyweds.", displayOrder: 7 },
      ],
    },
    {
      name: "Timeless Home Décor",
      slug: "home-decor",
      description: "Artisanal brassware, Makrana marble accents, and soothing aromatics that bring sanctuary to living spaces.",
      imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=85&w=1920&auto=format&fit=crop",
      displayOrder: 3,
      subcategories: [
        { name: "Vases", slug: "vases", description: "Hand-cast ceramic and hammered brass flower vessels.", displayOrder: 1 },
        { name: "Wall Décor", slug: "wall-decor", description: "Carved jharokhas and brass wall plates.", displayOrder: 2 },
        { name: "Table Décor", slug: "table-decor", description: "Makrana marble coasters and table accents.", displayOrder: 3 },
        { name: "Lamps", slug: "lamps", description: "Ambient brass table lamps and lanterns.", displayOrder: 4 },
        { name: "Candles", slug: "candles", description: "Hand-poured coconut-soy wax candles and diffusers.", displayOrder: 5 },
        { name: "Decorative Trays", slug: "decorative-trays", description: "Mirrored brass vanity platters and marble catchalls.", displayOrder: 6 },
        { name: "Planters", slug: "planters", description: "Elevated indoor pedestal planters.", displayOrder: 7 },
        { name: "Showpieces", slug: "showpieces", description: "Solid cast brass urlis, peacocks, and figurines.", displayOrder: 8 },
      ],
    },
  ];

  const categoryMap = new Map<string, string>(); // slug -> id

  for (const cat of categoryStructure) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
      },
    });

    categoryMap.set(cat.slug, parent.id);

    for (const sub of cat.subcategories) {
      const subCat = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          description: sub.description,
          parentId: parent.id,
          displayOrder: sub.displayOrder,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentId: parent.id,
          displayOrder: sub.displayOrder,
        },
      });
      categoryMap.set(sub.slug, subCat.id);
    }
  }
  console.log("✅ Categories and subcategory hierarchy seeded.");

  // ----------------------------------------------------------------------------
  // 4. Sample Products, Variants, Images & Inventories
  // ----------------------------------------------------------------------------
  const sampleProducts = [
    {
      title: "Noor Meenakari & Kundan Choker Necklace Set",
      slug: "noor-meenakari-kundan-choker-set",
      categorySlug: "jewellery",
      description: "A masterpiece of royal heritage featuring hand-cut uncut Kundan stones, reverse pastel green meenakari enameling, and cluster seed pearls.",
      materials: "High-grade brass, 18K gold micro-plating, uncut glass Kundan, freshwater cluster pearls.",
      careInstructions: "Store in airtight velvet pouch. Wipe gently with microfibre cloth. Avoid direct perfumes.",
      hsnCode: "71179090",
      gstRatePercent: 3.0,
      isFeatured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop", isPrimary: true, altText: "Noor Kundan Choker Set" },
        { url: "https://images.unsplash.com/photo-1611591475878-5a676c7c00e1?q=80&w=1000&auto=format&fit=crop", isPrimary: false, altText: "Noor Earrings" },
      ],
      variants: [
        {
          sku: "TW-JWL-NOOR-EMR",
          title: "18K Gold Plated / Mint Green & Pearl",
          attributes: { finish: "18K Gold Plated", stoneColor: "Mint Green & White" },
          mrp: 4999,
          sellingPrice: 3299,
          costPrice: 1500,
          weightGrams: 220,
          lengthCm: 20,
          widthCm: 15,
          heightCm: 6,
          isDefault: true,
          initialStock: 25,
        },
        {
          sku: "TW-JWL-NOOR-RBY",
          title: "18K Gold Plated / Crimson Ruby & Pearl",
          attributes: { finish: "18K Gold Plated", stoneColor: "Crimson Ruby & White" },
          mrp: 4999,
          sellingPrice: 3299,
          costPrice: 1500,
          weightGrams: 220,
          lengthCm: 20,
          widthCm: 15,
          heightCm: 6,
          isDefault: false,
          initialStock: 15,
        },
      ],
    },
    {
      title: "Chandrika Heritage Pearl Chandelier Earrings",
      slug: "chandrika-heritage-pearl-chandelier-earrings",
      categorySlug: "jewellery",
      description: "Graceful bell-shaped dome jhumkas with crescent moon motif, hand-set faux polki, and seed pearl drops.",
      materials: "Antique gold plated brass alloy, cubic zirconia polki, seed pearls.",
      careInstructions: "Avoid contact with water and sweat. Store separately in cotton pouch.",
      hsnCode: "71179090",
      gstRatePercent: 3.0,
      isFeatured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1000&auto=format&fit=crop", isPrimary: true, altText: "Chandrika Jhumkas" },
      ],
      variants: [
        {
          sku: "TW-JWL-CHAN-ANTG",
          title: "Antique Gold / Pearl Drops",
          attributes: { finish: "Antique Gold", size: "Medium" },
          mrp: 2499,
          sellingPrice: 1699,
          costPrice: 700,
          weightGrams: 90,
          lengthCm: 12,
          widthCm: 10,
          heightCm: 4,
          isDefault: true,
          initialStock: 40,
        },
      ],
    },
    {
      title: "The Regal Celebration Luxury Gift Hamper",
      slug: "regal-celebration-luxury-gift-hamper",
      categorySlug: "gifts",
      description: "Presented in an ivory linen keepsake trunk with brass candle, Himalayan saffron green tea, brass diya, and gourmet pistachios.",
      materials: "Handmade ivory keepsake trunk, pure brass candle vessel, brass tea tin, natural soy wax.",
      careInstructions: "Reusable luxury storage trunk. Wipe with dry cloth.",
      hsnCode: "999299",
      gstRatePercent: 18.0,
      isFeatured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop", isPrimary: true, altText: "The Regal Celebration Gift Hamper" },
      ],
      variants: [
        {
          sku: "TW-GFT-RGAL-STD",
          title: "Standard Edition / Ivory Linen Trunk",
          attributes: { packaging: "Ivory Linen Trunk", aroma: "Royal Oud & Saffron" },
          mrp: 4999,
          sellingPrice: 3899,
          costPrice: 2000,
          weightGrams: 1400,
          lengthCm: 28,
          widthCm: 22,
          heightCm: 14,
          isDefault: true,
          initialStock: 30,
        },
      ],
    },
    {
      title: "Mayura Handcrafted Brass Peacock Oil Lamp Diya",
      slug: "mayura-handcrafted-brass-peacock-oil-lamp-diya",
      categorySlug: "home-decor",
      description: "Cast using traditional lost-wax artisan casting in Moradabad with intricate plumage and antique golden patina.",
      materials: "100% solid virgin brass, antique golden lacquer coating.",
      careInstructions: "Clean with Pitambari powder or lemon and salt for restoration of deep luster.",
      hsnCode: "74198030",
      gstRatePercent: 12.0,
      isFeatured: true,
      images: [
        { url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop", isPrimary: true, altText: "Mayura Brass Peacock Diya" },
      ],
      variants: [
        {
          sku: "TW-DEC-MAYU-09IN",
          title: "9-Inch Height / Solid Cast Brass",
          attributes: { height: "9 Inches", weight: "850 grams" },
          mrp: 3299,
          sellingPrice: 2199,
          costPrice: 1100,
          weightGrams: 850,
          lengthCm: 25,
          widthCm: 15,
          heightCm: 15,
          isDefault: true,
          initialStock: 25,
        },
      ],
    },
  ];

  for (const item of sampleProducts) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        materials: item.materials,
        careInstructions: item.careInstructions,
        hsnCode: item.hsnCode,
        gstRatePercent: item.gstRatePercent,
        isFeatured: item.isFeatured,
      },
      create: {
        categoryId,
        title: item.title,
        slug: item.slug,
        description: item.description,
        materials: item.materials,
        careInstructions: item.careInstructions,
        hsnCode: item.hsnCode,
        gstRatePercent: item.gstRatePercent,
        isFeatured: item.isFeatured,
      },
    });

    // Create / Update Images
    for (let i = 0; i < item.images.length; i++) {
      const img = item.images[i];
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          altText: img.altText,
          displayOrder: i + 1,
          isPrimary: img.isPrimary,
        },
      });
    }

    // Create / Update Variants and Inventory
    for (const v of item.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          title: v.title,
          attributes: v.attributes,
          mrp: v.mrp,
          sellingPrice: v.sellingPrice,
          costPrice: v.costPrice,
          weightGrams: v.weightGrams,
          lengthCm: v.lengthCm,
          widthCm: v.widthCm,
          heightCm: v.heightCm,
          isDefault: v.isDefault,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          attributes: v.attributes,
          mrp: v.mrp,
          sellingPrice: v.sellingPrice,
          costPrice: v.costPrice,
          weightGrams: v.weightGrams,
          lengthCm: v.lengthCm,
          widthCm: v.widthCm,
          heightCm: v.heightCm,
          isDefault: v.isDefault,
        },
      });

      // Upsert Inventory
      const inventory = await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantityAvailable: v.initialStock },
        create: {
          variantId: variant.id,
          quantityAvailable: v.initialStock,
          quantityReserved: 0,
          lowStockThreshold: 5,
          warehouseLocation: "Aisle-1-Shelf-B",
        },
      });

      // Log Initial Inventory Movement
      await prisma.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: InventoryMovementType.STOCK_INITIAL,
          quantityChange: v.initialStock,
          balanceAfter: v.initialStock,
          reason: "Initial warehouse intake from artisan supplier",
          performedBy: adminUser.id,
        },
      });
    }
  }
  console.log("✅ Sample products, variants, images, and inventory seeded.");

  // ----------------------------------------------------------------------------
  // 5. Promotional Coupons
  // ----------------------------------------------------------------------------
  const initialCoupons = [
    {
      code: "WELCOME10",
      description: "10% off on your first luxury purchase above ₹999",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderAmount: 999,
      maxDiscountCap: 500,
      usageLimit: 10000,
      perUserLimit: 1,
    },
    {
      code: "TINIWISH15",
      description: "15% off on celebratory orders above ₹2,499",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minOrderAmount: 2499,
      maxDiscountCap: 1000,
      usageLimit: 5000,
      perUserLimit: 1,
    },
    {
      code: "FREESHIP",
      description: "Free express shipping on all orders",
      discountType: DiscountType.FREE_SHIPPING,
      discountValue: 99,
      minOrderAmount: 499,
      usageLimit: 20000,
      perUserLimit: 3,
    },
  ];

  for (const c of initialCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log("✅ Promotional coupons seeded.");

  // ----------------------------------------------------------------------------
  // 6. Promotional Banners
  // ----------------------------------------------------------------------------
  const initialBanners = [
    {
      title: "Little wishes. Timeless treasures.",
      subtitle: "Discover the Festive Jewellery & Luxury Hamper Collection",
      linkUrl: "/jewellery",
      desktopImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1920&auto=format&fit=crop",
      mobileImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      placement: BannerPlacement.HOMEPAGE_HERO,
      displayOrder: 1,
      isActive: true,
    },
    {
      title: "Complimentary Luxury Gift Wrapping",
      subtitle: "Handwritten calligraphic card included on every order",
      linkUrl: "/gifts",
      desktopImageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1920&auto=format&fit=crop",
      placement: BannerPlacement.TOP_ANNOUNCEMENT,
      displayOrder: 2,
      isActive: true,
    },
  ];

  for (const b of initialBanners) {
    await prisma.banner.create({
      data: b,
    });
  }
  console.log("✅ Promotional banners seeded.");

  console.log("✨ TiniWish database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

