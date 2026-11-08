import { prisma } from "@/lib/prisma";
import { BannerDTO } from "@/types/banner";
import { BannerPlacement } from "@prisma/client";
import { logger } from "@/lib/logger";

const FALLBACK_BANNERS: BannerDTO[] = [
  {
    id: "hero_banner_01",
    title: "Little Things. Beautiful Moments.",
    subtitle: "Discover thoughtfully curated jewellery, charming gifts and timeless pieces for your home.",
    linkUrl: "/products",
    desktopImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=1920&auto=format&fit=crop",
    mobileImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=800&auto=format&fit=crop",
    placement: "HOMEPAGE_HERO",
    displayOrder: 1,
    isActive: true,
    ctaText: "Explore Collection",
  },
  {
    id: "hero_banner_02",
    title: "The Royal Festive Edit",
    subtitle: "Handcrafted uncut Kundan, temple motifs, and 24K gold micron plating designed for grand celebrations.",
    linkUrl: "/jewellery",
    desktopImageUrl: "https://images.unsplash.com/photo-1611591475878-5a676c7c00e1?q=85&w=1920&auto=format&fit=crop",
    mobileImageUrl: "https://images.unsplash.com/photo-1611591475878-5a676c7c00e1?q=85&w=800&auto=format&fit=crop",
    placement: "HOMEPAGE_HERO",
    displayOrder: 2,
    isActive: true,
    ctaText: "Shop Jewellery",
  },
  {
    id: "hero_banner_03",
    title: "Artisanal Home Sanctuary",
    subtitle: "Solid cast brassware, sacred diyas, and carved marble accents that bring timeless warmth to sacred corners.",
    linkUrl: "/home-decor",
    desktopImageUrl: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=85&w=1920&auto=format&fit=crop",
    mobileImageUrl: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=85&w=800&auto=format&fit=crop",
    placement: "HOMEPAGE_HERO",
    displayOrder: 3,
    isActive: true,
    ctaText: "Discover Décor",
  },
];

export class BannerRepository {
  /**
   * Retrieves active banners by placement from the database.
   */
  async findActiveByPlacement(placement: BannerPlacement | string = "HOMEPAGE_HERO"): Promise<BannerDTO[]> {
    if (process.env.NODE_ENV === "test") {
      return FALLBACK_BANNERS.filter((b) => b.placement === placement && b.isActive);
    }

    try {
      const now = new Date();
      const banners = await prisma.banner.findMany({
        where: {
          placement: placement as BannerPlacement,
          isActive: true,
          startsAt: { lte: now },
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
        orderBy: { displayOrder: "asc" },
      });

      if (banners.length === 0) {
        return FALLBACK_BANNERS.filter((b) => b.placement === placement && b.isActive);
      }

      return banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        linkUrl: b.linkUrl,
        desktopImageUrl: b.desktopImageUrl,
        mobileImageUrl: b.mobileImageUrl,
        placement: b.placement,
        displayOrder: b.displayOrder,
        isActive: b.isActive,
        ctaText: b.title.includes("Jewellery") ? "Shop Jewellery" : "Explore Collection",
      }));
    } catch (error) {
      logger.warn(`Failed to fetch banners for placement '${placement}'. Using fallback.`, { error: String(error) });
      return FALLBACK_BANNERS.filter((b) => b.placement === placement && b.isActive);
    }
  }
}

export const bannerRepository = new BannerRepository();

