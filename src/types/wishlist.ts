export interface WishlistItemDTO {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  mrp: number | null;
  discountPercent: number | null;
  rating: number;
  reviewCount: number;
  categoryName: string;
  subcategoryName: string | null;
  inStock: boolean;
  defaultVariantId: string;
  createdAt: string;
}

export interface WishlistDTO {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  items: WishlistItemDTO[];
  itemCount: number;
  updatedAt: string;
}

export interface MoveToCartResultDTO {
  wishlist: WishlistDTO;
  movedItem: {
    productId: string;
    variantId: string;
    title: string;
  };
}

