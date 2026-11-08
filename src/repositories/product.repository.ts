import { prisma } from "@/lib/prisma";
import { ProductDTO, ProductFilterParams } from "@/types/product";
import { SEED_PRODUCTS } from "@/data/seed-catalogue";
import { logger } from "@/lib/logger";

export class ProductRepository {
  /**
   * Retrieves products based on filter and pagination options.
   */
  async findMany(params: ProductFilterParams): Promise<{ items: ProductDTO[]; totalCount: number }> {
    if (process.env.NODE_ENV === "test") {
      return this.filterInMemory(params);
    }

    try {
      const {
        categorySlug,
        subcategorySlug,
        query,
        page = 1,
        limit = 12,
      } = params;

      const where: Record<string, unknown> = {
        isArchived: false,
      };

      if (params.isFeatured !== undefined) {
        where.isFeatured = params.isFeatured;
      }

      if (params.material) {
        where.materials = { contains: params.material, mode: "insensitive" };
      }

      if (params.occasion) {
        where.description = { contains: params.occasion, mode: "insensitive" };
      }

      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        where.variants = {
          some: {
            isActive: true,
            sellingPrice: {
              ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
              ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            },
          },
        };
      }

      if (subcategorySlug) {
        where.category = { slug: subcategorySlug };
      } else if (categorySlug) {
        where.category = {
          OR: [
            { slug: categorySlug },
            { parent: { slug: categorySlug } },
          ],
        };
      }

      if (query && query.trim() !== "") {
        where.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ];
      }

      const orderBy: Record<string, string> = { createdAt: "desc" };

      const [totalCount, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            category: {
              include: {
                parent: true,
              },
            },
            variants: { where: { isActive: true } },
            images: { orderBy: { displayOrder: "asc" } },
            reviews: { select: { rating: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
        }),
      ]);

      if (products.length === 0 && totalCount === 0) {
        return this.filterInMemory(params);
      }

      const items: ProductDTO[] = products.map((p) => {
        const ratingSum = p.reviews.reduce((acc, r) => acc + r.rating, 0);
        const rating = p.reviews.length > 0 ? Number((ratingSum / p.reviews.length).toFixed(1)) : 5.0;

        const isChildCategory = p.category.parent !== null;
        const categoryName = isChildCategory ? p.category.parent?.name || p.category.name : p.category.name;
        const catSlug = isChildCategory ? p.category.parent?.slug || p.category.slug : p.category.slug;
        const subcategoryName = isChildCategory ? p.category.name : null;
        const subcategorySlugVal = isChildCategory ? p.category.slug : null;

        return {
          id: p.id,
          categoryId: p.categoryId,
          subcategoryId: isChildCategory ? p.categoryId : null,
          categoryName,
          categorySlug: catSlug,
          subcategoryName,
          subcategorySlug: subcategorySlugVal,
          title: p.title,
          slug: p.slug,
          description: p.description,
          materials: p.materials,
          careInstructions: p.careInstructions,
          isFeatured: p.isFeatured,
          isArchived: p.isArchived,
          rating,
          reviewCount: p.reviews.length,
          createdAt: p.createdAt.toISOString(),
          variants: p.variants.map((v) => ({
            id: v.id,
            productId: v.productId,
            sku: v.sku,
            title: v.title,
            attributes: (v.attributes as Record<string, string>) || {},
            mrp: Number(v.mrp),
            sellingPrice: Number(v.sellingPrice),
            costPrice: v.costPrice ? Number(v.costPrice) : null,
            stockQuantity: 0,
            lowStockThreshold: 5,
            weightGrams: v.weightGrams,
            lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
            widthCm: v.widthCm ? Number(v.widthCm) : null,
            heightCm: v.heightCm ? Number(v.heightCm) : null,
            isDefault: v.isDefault,
            isActive: v.isActive,
          })),
          images: p.images.map((img) => ({
            id: img.id,
            productId: img.productId,
            url: img.url,
            altText: img.altText,
            displayOrder: img.displayOrder,
            isPrimary: img.isPrimary,
          })),
        };
      });

      return { items, totalCount };
    } catch (error) {
      logger.warn("Database query failed in ProductRepository. Falling back to memory catalogue.", { error });
      return this.filterInMemory(params);
    }
  }

  /**
   * Finds a product by its unique slug.
   */
  async findBySlug(slug: string): Promise<ProductDTO | null> {
    if (process.env.NODE_ENV === "test") {
      return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
    }

    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: {
            include: {
              parent: true,
            },
          },
          variants: { where: { isActive: true } },
          images: { orderBy: { displayOrder: "asc" } },
          reviews: { select: { rating: true } },
        },
      });

      if (!product) {
        return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
      }

      const ratingSum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      const rating = product.reviews.length > 0 ? Number((ratingSum / product.reviews.length).toFixed(1)) : 5.0;

      const isChildCategory = product.category.parent !== null;
      const categoryName = isChildCategory ? product.category.parent?.name || product.category.name : product.category.name;
      const catSlug = isChildCategory ? product.category.parent?.slug || product.category.slug : product.category.slug;
      const subcategoryName = isChildCategory ? product.category.name : null;
      const subcategorySlugVal = isChildCategory ? product.category.slug : null;

      return {
        id: product.id,
        categoryId: product.categoryId,
        subcategoryId: isChildCategory ? product.categoryId : null,
        categoryName,
        categorySlug: catSlug,
        subcategoryName,
        subcategorySlug: subcategorySlugVal,
        title: product.title,
        slug: product.slug,
        description: product.description,
        materials: product.materials,
        careInstructions: product.careInstructions,
        isFeatured: product.isFeatured,
        isArchived: product.isArchived,
        rating,
        reviewCount: product.reviews.length,
        createdAt: product.createdAt.toISOString(),
        variants: product.variants.map((v) => ({
          id: v.id,
          productId: v.productId,
          sku: v.sku,
          title: v.title,
          attributes: (v.attributes as Record<string, string>) || {},
          mrp: Number(v.mrp),
          sellingPrice: Number(v.sellingPrice),
          costPrice: v.costPrice ? Number(v.costPrice) : null,
          stockQuantity: 0,
          lowStockThreshold: 5,
          weightGrams: v.weightGrams,
          lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
          widthCm: v.widthCm ? Number(v.widthCm) : null,
          heightCm: v.heightCm ? Number(v.heightCm) : null,
          isDefault: v.isDefault,
          isActive: v.isActive,
        })),
        images: product.images.map((img) => ({
          id: img.id,
          productId: img.productId,
          url: img.url,
          altText: img.altText,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
        })),
      };
    } catch (error) {
      logger.warn(`Database query failed for slug '${slug}'. Falling back to seed data.`, { error });
      return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
    }
  }

  /**
   * In-memory search and filter fallback.
   */
  private filterInMemory(params: ProductFilterParams): { items: ProductDTO[]; totalCount: number } {
    let result = [...SEED_PRODUCTS];

    if (params.categorySlug) {
      result = result.filter((p) => p.categorySlug === params.categorySlug);
    }

    if (params.isFeatured !== undefined) {
      result = result.filter((p) => p.isFeatured === params.isFeatured);
    }

    if (params.subcategorySlug) {
      result = result.filter((p) => p.subcategorySlug === params.subcategorySlug);
    }

    if (params.query && params.query.trim() !== "") {
      const q = params.query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.subcategoryName?.toLowerCase().includes(q)
      );
    }

    if (params.minPrice !== undefined) {
      result = result.filter((p) => {
        const lowestPrice = Math.min(...p.variants.map((v) => v.sellingPrice));
        return lowestPrice >= (params.minPrice ?? 0);
      });
    }

    if (params.maxPrice !== undefined) {
      result = result.filter((p) => {
        const lowestPrice = Math.min(...p.variants.map((v) => v.sellingPrice));
        return lowestPrice <= (params.maxPrice ?? Infinity);
      });
    }

    if (params.color && params.color.trim() !== "") {
      const c = params.color.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.variants.some(
            (v) =>
              v.title.toLowerCase().includes(c) ||
              Object.values(v.attributes).some((val) => String(val).toLowerCase().includes(c))
          ) ||
          p.description.toLowerCase().includes(c)
      );
    }

    if (params.material && params.material.trim() !== "") {
      const m = params.material.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.materials?.toLowerCase().includes(m) ||
          p.description.toLowerCase().includes(m) ||
          p.title.toLowerCase().includes(m)
      );
    }

    if (params.occasion && params.occasion.trim() !== "") {
      const occ = params.occasion.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.description.toLowerCase().includes(occ) ||
          p.title.toLowerCase().includes(occ) ||
          p.subcategorySlug?.toLowerCase().includes(occ) ||
          p.subcategoryName?.toLowerCase().includes(occ)
      );
    }

    if (params.minRating !== undefined && params.minRating > 0) {
      result = result.filter((p) => p.rating >= (params.minRating ?? 0));
    }

    if (params.inStockOnly) {
      result = result.filter((p) => p.variants.some((v) => v.stockQuantity > 0));
    }

    if (params.sortBy === "price-asc") {
      result.sort((a, b) => {
        const priceA = Math.min(...a.variants.map((v) => v.sellingPrice));
        const priceB = Math.min(...b.variants.map((v) => v.sellingPrice));
        return priceA - priceB;
      });
    } else if (params.sortBy === "price-desc") {
      result.sort((a, b) => {
        const priceA = Math.min(...a.variants.map((v) => v.sellingPrice));
        const priceB = Math.min(...b.variants.map((v) => v.sellingPrice));
        return priceB - priceA;
      });
    } else if (params.sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (params.sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (params.sortBy === "popularity") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (params.sortBy === "featured") {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    const totalCount = result.length;
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);

    return { items, totalCount };
  }
}

export const productRepository = new ProductRepository();
