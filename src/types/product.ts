export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  title: string;
  attributes: Record<string, string>; // e.g. { finish: "18K Gold Plated", size: "Adjustable" }
  mrp: number;
  sellingPrice: number;
  costPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  weightGrams: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface ProductImageDTO {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductDTO {
  id: string;
  categoryId: string;
  subcategoryId?: string | null;
  categoryName?: string;
  categorySlug?: string;
  subcategoryName?: string | null;
  subcategorySlug?: string | null;
  title: string;
  slug: string;
  description: string;
  materials?: string | null;
  careInstructions?: string | null;
  isFeatured: boolean;
  isArchived: boolean;
  rating: number;
  reviewCount: number;
  variants: ProductVariantDTO[];
  images: ProductImageDTO[];
  createdAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  parentId?: string | null;
  parentName?: string | null;
  parentSlug?: string | null;
  subcategories: SubcategoryDTO[];
}

export interface SubcategoryDTO {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface ProductFilterParams {
  categorySlug?: string;
  subcategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "featured" | "popularity" | "price-asc" | "price-desc" | "newest" | "rating";
  query?: string;
  inStockOnly?: boolean;
  isFeatured?: boolean;
  color?: string;
  material?: string;
  occasion?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

