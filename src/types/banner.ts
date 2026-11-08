export interface BannerDTO {
  id: string;
  title: string;
  subtitle?: string | null;
  linkUrl: string;
  desktopImageUrl: string;
  mobileImageUrl?: string | null;
  placement: string;
  displayOrder: number;
  isActive: boolean;
  ctaText?: string;
}

