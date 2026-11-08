import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/category.repository";
import { ProductDTO, ProductFilterParams, CategoryDTO } from "@/types/product";
import { NotFoundError } from "@/lib/errors";
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination";
import { PaginatedData } from "@/types/api";

export class ProductService {
  /**
   * Retrieves paginated products with applied filters.
   */
  async getProducts(params: ProductFilterParams): Promise<PaginatedData<ProductDTO>> {
    const { page, limit } = parsePaginationParams({
      page: params.page,
      limit: params.limit,
      defaultLimit: 12,
    });

    const { items, totalCount } = await productRepository.findMany({
      ...params,
      page,
      limit,
    });

    const pagination = buildPaginationMeta(totalCount, page, limit);

    return {
      items,
      pagination,
    };
  }

  /**
   * Retrieves single product by slug or throws NotFoundError.
   */
  async getProductBySlug(slug: string): Promise<ProductDTO> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundError(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  /**
   * Retrieves featured products for homepage.
   */
  async getFeaturedProducts(limit: number = 4): Promise<ProductDTO[]> {
    const { items } = await productRepository.findMany({
      page: 1,
      limit,
      isFeatured: true,
    });

    return items;
  }

  /**
   * Retrieves new arrivals for homepage.
   */
  async getNewArrivals(limit: number = 4): Promise<ProductDTO[]> {
    const { items } = await productRepository.findMany({
      page: 1,
      limit,
      sortBy: "newest",
    });

    return items;
  }

  /**
   * Retrieves best sellers for homepage.
   */
  async getBestSellers(limit: number = 4): Promise<ProductDTO[]> {
    const { items } = await productRepository.findMany({
      page: 1,
      limit,
      sortBy: "rating",
    });

    return items;
  }

  /**
   * Retrieves products for a specific category.
   */
  async getProductsByCategory(categorySlug: string, limit: number = 4): Promise<ProductDTO[]> {
    const { items } = await productRepository.findMany({
      categorySlug,
      page: 1,
      limit,
    });

    return items;
  }

  /**
   * Retrieves related products within the same category.
   */
  async getRelatedProducts(productId: string, categorySlug?: string, limit: number = 4): Promise<ProductDTO[]> {
    const { items } = await productRepository.findMany({
      categorySlug,
      page: 1,
      limit: 10,
    });

    return items.filter((p) => p.id !== productId).slice(0, limit);
  }

  /**
   * Retrieves all categories and their subcategories.
   */
  async getCategories(): Promise<CategoryDTO[]> {
    return categoryRepository.findAll();
  }

  /**
   * Retrieves category by slug.
   */
  async getCategoryBySlug(slug: string): Promise<CategoryDTO> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError(`Category with slug '${slug}' not found`);
    }
    return category;
  }
}

export const productService = new ProductService();

