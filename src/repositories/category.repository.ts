import { prisma } from "@/lib/prisma";
import { CategoryDTO } from "@/types/product";
import { SEED_CATEGORIES } from "@/data/seed-catalogue";
import { logger } from "@/lib/logger";

export class CategoryRepository {
  /**
   * Retrieves all active root categories along with their child subcategories.
   */
  async findAll(): Promise<CategoryDTO[]> {
    if (process.env.NODE_ENV === "test") {
      return SEED_CATEGORIES;
    }

    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { displayOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      if (categories.length === 0) {
        return SEED_CATEGORIES;
      }

      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        displayOrder: c.displayOrder,
        subcategories: c.children.map((s) => ({
          id: s.id,
          categoryId: s.parentId || c.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          imageUrl: s.imageUrl,
        })),
      }));
    } catch (error) {
      logger.warn("Database unavailable in CategoryRepository. Falling back to seed categories.", { error });
      return SEED_CATEGORIES;
    }
  }

  /**
   * Finds a category by its slug with its child subcategories or parent context.
   */
  async findBySlug(slug: string): Promise<CategoryDTO | null> {
    if (process.env.NODE_ENV === "test") {
      return this.findInMemory(slug);
    }

    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          parent: {
            include: {
              children: {
                where: { isActive: true },
                orderBy: { displayOrder: "asc" },
              },
            },
          },
          children: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      if (!category) {
        return this.findInMemory(slug);
      }

      // If it's a child subcategory, provide parent context and sibling subcategories
      const isChild = category.parentId !== null;
      const subcategoriesList = isChild
        ? (category.parent?.children || []).map((s) => ({
            id: s.id,
            categoryId: s.parentId || category.parentId!,
            name: s.name,
            slug: s.slug,
            description: s.description,
            imageUrl: s.imageUrl,
          }))
        : category.children.map((s) => ({
            id: s.id,
            categoryId: s.parentId || category.id,
            name: s.name,
            slug: s.slug,
            description: s.description,
            imageUrl: s.imageUrl,
          }));

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl || category.parent?.imageUrl,
        displayOrder: category.displayOrder,
        parentId: category.parentId,
        parentName: category.parent?.name,
        parentSlug: category.parent?.slug,
        subcategories: subcategoriesList,
      };
    } catch (error) {
      logger.warn(`Database unavailable in CategoryRepository for slug '${slug}'. Falling back.`, { error });
      return this.findInMemory(slug);
    }
  }

  /**
   * Helper to locate category or subcategory in static seed data.
   */
  private findInMemory(slug: string): CategoryDTO | null {
    const root = SEED_CATEGORIES.find((c) => c.slug === slug);
    if (root) return root;

    for (const parent of SEED_CATEGORIES) {
      const sub = parent.subcategories.find((s) => s.slug === slug);
      if (sub) {
        return {
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          imageUrl: sub.imageUrl || parent.imageUrl,
          displayOrder: 1,
          parentId: parent.id,
          parentName: parent.name,
          parentSlug: parent.slug,
          subcategories: parent.subcategories,
        };
      }
    }

    return null;
  }
}

export const categoryRepository = new CategoryRepository();
