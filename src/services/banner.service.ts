import { bannerRepository } from "@/repositories/banner.repository";
import { BannerDTO } from "@/types/banner";
import { BannerPlacement } from "@prisma/client";

export class BannerService {
  /**
   * Retrieves active banners for a specific placement (e.g. HOMEPAGE_HERO).
   */
  async getActiveBanners(placement: BannerPlacement | string = "HOMEPAGE_HERO"): Promise<BannerDTO[]> {
    return bannerRepository.findActiveByPlacement(placement);
  }
}

export const bannerService = new BannerService();

