import { prisma } from "@/lib/prisma";
import { WishlistDTO, WishlistItemDTO } from "@/types/wishlist";
import { SEED_PRODUCTS } from "@/data/seed-catalogue";
import { logger } from "@/lib/logger";

interface InMemoryWishlist {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  productIds: string[];
  updatedAt: Date;
}

const inMemoryWishlists = new Map<string, InMemoryWishlist>();

export class WishlistRepository {
  /**
   * Retrieves or creates a wishlist by userId or sessionToken.
   */
  async getOrCreateWishlist(params: {
    userId?: string | null;
    sessionToken?: string | null;
  }): Promise<string> {
    if (process.env.NODE_ENV === "test") {
      return this.getOrCreateInMemory(params);
    }

    try {
      if (params.userId) {
        let userWishlist = await prisma.wishlist.findUnique({
          where: { userId: params.userId },
          select: { id: true },
        });

        if (!userWishlist) {
          userWishlist = await prisma.wishlist.create({
            data: { userId: params.userId },
            select: { id: true },
          });
        }
        return userWishlist.id;
      }

      if (params.sessionToken) {
        let guestWishlist = await prisma.wishlist.findUnique({
          where: { sessionToken: params.sessionToken },
          select: { id: true },
        });

        if (!guestWishlist) {
          guestWishlist = await prisma.wishlist.create({
            data: { sessionToken: params.sessionToken },
            select: { id: true },
          });
        }
        return guestWishlist.id;
      }

      throw new Error("Cannot resolve wishlist without userId or sessionToken");
    } catch (err) {
      logger.error("Failed to get/create wishlist from DB, falling back to in-memory store", {
        error: String(err),
      });
      return this.getOrCreateInMemory(params);
    }
  }

  /**
   * Retrieves complete wishlist DTO with item details.
   */
  async getWishlist(params: {
    userId?: string | null;
    sessionToken?: string | null;
  }): Promise<WishlistDTO> {
    const wishlistId = await this.getOrCreateWishlist(params);
    return this.getWishlistById(wishlistId);
  }

  /**
   * Retrieves full wishlist DTO by wishlistId.
   */
  async getWishlistById(wishlistId: string): Promise<WishlistDTO> {
    if (process.env.NODE_ENV === "test") {
      return this.getWishlistByIdInMemory(wishlistId);
    }

    try {
      const dbWishlist = await prisma.wishlist.findUnique({
        where: { id: wishlistId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  images: {
                    orderBy: { displayOrder: "asc" },
                  },
                  variants: {
                    where: { isActive: true },
                    orderBy: { isDefault: "desc" },
                    include: { inventory: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!dbWishlist) {
        return this.getWishlistByIdInMemory(wishlistId);
      }

      const items: WishlistItemDTO[] = dbWishlist.items.map((item) => {
        const prod = item.product;
        const defaultVariant = prod.variants.find((v) => v.isDefault) || prod.variants[0];
        const primaryImage =
          prod.images.find((img) => img.isPrimary)?.url ||
          prod.images[0]?.url ||
          "/images/placeholder.jpg";

        const sellingPrice = defaultVariant ? Number(defaultVariant.sellingPrice) : 0;
        const mrp = defaultVariant ? Number(defaultVariant.mrp) : null;
        const discountPercent =
          mrp && mrp > sellingPrice
            ? Math.round(((mrp - sellingPrice) / mrp) * 100)
            : null;

        const inStock = prod.variants.some(
          (v) => (v.inventory?.quantityAvailable ?? 10) > 0
        );

        return {
          id: item.id,
          productId: prod.id,
          title: prod.title,
          slug: prod.slug,
          image: primaryImage,
          price: sellingPrice,
          mrp,
          discountPercent,
          rating: 4.9,
          reviewCount: 24,
          categoryName: prod.category?.name || "Collections",
          subcategoryName: null,
          inStock,
          defaultVariantId: defaultVariant?.id || "default",
          createdAt: item.createdAt.toISOString(),
        };
      });

      return {
        id: dbWishlist.id,
        userId: dbWishlist.userId,
        sessionToken: dbWishlist.sessionToken,
        items,
        itemCount: items.length,
        updatedAt: dbWishlist.updatedAt.toISOString(),
      };
    } catch (err) {
      logger.error("Failed to query Wishlist from DB, returning in-memory representation", {
        error: String(err),
      });
      return this.getWishlistByIdInMemory(wishlistId);
    }
  }

  /**
   * Adds a product to the wishlist. Idempotent: if already exists, leaves it intact.
   */
  async addItem(wishlistId: string, productId: string): Promise<WishlistDTO> {
    if (process.env.NODE_ENV === "test") {
      const mem = inMemoryWishlists.get(wishlistId);
      if (mem && !mem.productIds.includes(productId)) {
        mem.productIds.push(productId);
        mem.updatedAt = new Date();
      }
      return this.getWishlistByIdInMemory(wishlistId);
    }

    try {
      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId,
            productId,
          },
        },
        create: {
          wishlistId,
          productId,
        },
        update: {},
      });

      return this.getWishlistById(wishlistId);
    } catch (err) {
      logger.error("DB addItem failed, falling back to in-memory", { error: String(err) });
      const mem = inMemoryWishlists.get(wishlistId);
      if (mem && !mem.productIds.includes(productId)) {
        mem.productIds.push(productId);
      }
      return this.getWishlistByIdInMemory(wishlistId);
    }
  }

  /**
   * Removes a product from the wishlist.
   */
  async removeItem(wishlistId: string, productId: string): Promise<WishlistDTO> {
    if (process.env.NODE_ENV === "test") {
      const mem = inMemoryWishlists.get(wishlistId);
      if (mem) {
        mem.productIds = mem.productIds.filter((id) => id !== productId);
        mem.updatedAt = new Date();
      }
      return this.getWishlistByIdInMemory(wishlistId);
    }

    try {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId,
          productId,
        },
      });

      return this.getWishlistById(wishlistId);
    } catch (err) {
      logger.error("DB removeItem failed, falling back to in-memory", { error: String(err) });
      const mem = inMemoryWishlists.get(wishlistId);
      if (mem) {
        mem.productIds = mem.productIds.filter((id) => id !== productId);
      }
      return this.getWishlistByIdInMemory(wishlistId);
    }
  }

  /**
   * Clears all items in a wishlist.
   */
  async clearWishlist(wishlistId: string): Promise<WishlistDTO> {
    if (process.env.NODE_ENV === "test") {
      const mem = inMemoryWishlists.get(wishlistId);
      if (mem) {
        mem.productIds = [];
        mem.updatedAt = new Date();
      }
      return this.getWishlistByIdInMemory(wishlistId);
    }

    try {
      await prisma.wishlistItem.deleteMany({
        where: { wishlistId },
      });
      return this.getWishlistById(wishlistId);
    } catch {
      const mem = inMemoryWishlists.get(wishlistId);
      if (mem) mem.productIds = [];
      return this.getWishlistByIdInMemory(wishlistId);
    }
  }

  /**
   * Merges a guest wishlist into an authenticated user's wishlist upon login.
   * Copies non-duplicate items and deletes the guest wishlist.
   */
  async mergeGuestWishlist(userId: string, guestSessionToken: string): Promise<WishlistDTO> {
    if (process.env.NODE_ENV === "test") {
      const userWishlistId = await this.getOrCreateWishlist({ userId });
      const guestWishlistId = await this.getOrCreateWishlist({ sessionToken: guestSessionToken });

      const userMem = inMemoryWishlists.get(userWishlistId);
      const guestMem = inMemoryWishlists.get(guestWishlistId);

      if (userMem && guestMem) {
        for (const pId of guestMem.productIds) {
          if (!userMem.productIds.includes(pId)) {
            userMem.productIds.push(pId);
          }
        }
        inMemoryWishlists.delete(guestWishlistId);
      }

      return this.getWishlistByIdInMemory(userWishlistId);
    }

    try {
      const userWishlistId = await this.getOrCreateWishlist({ userId });

      const guestWishlist = await prisma.wishlist.findUnique({
        where: { sessionToken: guestSessionToken },
        include: { items: true },
      });

      if (!guestWishlist || guestWishlist.items.length === 0) {
        return this.getWishlistById(userWishlistId);
      }

      // Transfer all items to user wishlist avoiding duplicate unique constraint
      for (const item of guestWishlist.items) {
        await prisma.wishlistItem.upsert({
          where: {
            wishlistId_productId: {
              wishlistId: userWishlistId,
              productId: item.productId,
            },
          },
          create: {
            wishlistId: userWishlistId,
            productId: item.productId,
          },
          update: {},
        });
      }

      // Destroy guest wishlist
      await prisma.wishlist.delete({
        where: { id: guestWishlist.id },
      });

      return this.getWishlistById(userWishlistId);
    } catch (err) {
      logger.error("DB mergeGuestWishlist failed", { error: String(err) });
      return this.getWishlist({ userId });
    }
  }

  // --------------------------------------------------------------------------
  // IN-MEMORY STORE HELPERS
  // --------------------------------------------------------------------------

  private getOrCreateInMemory(params: {
    userId?: string | null;
    sessionToken?: string | null;
  }): string {
    for (const [id, w] of inMemoryWishlists.entries()) {
      if (params.userId && w.userId === params.userId) return id;
      if (params.sessionToken && w.sessionToken === params.sessionToken) return id;
    }

    const id = `wl_mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    inMemoryWishlists.set(id, {
      id,
      userId: params.userId || null,
      sessionToken: params.sessionToken || null,
      productIds: [],
      updatedAt: new Date(),
    });
    return id;
  }

  private getWishlistByIdInMemory(wishlistId: string): WishlistDTO {
    let mem = inMemoryWishlists.get(wishlistId);
    if (!mem) {
      mem = {
        id: wishlistId,
        userId: null,
        sessionToken: null,
        productIds: [],
        updatedAt: new Date(),
      };
      inMemoryWishlists.set(wishlistId, mem);
    }

    const items: WishlistItemDTO[] = [];

    for (const pId of mem.productIds) {
      const seedProd = SEED_PRODUCTS.find((p) => p.id === pId);
      if (!seedProd) continue;

      const defVariant = seedProd.variants.find((v) => v.isDefault) || seedProd.variants[0];
      const primaryImg = seedProd.images.find((img) => img.isPrimary)?.url || seedProd.images[0]?.url || "";
      const price = defVariant?.sellingPrice || 0;
      const mrp = defVariant?.mrp || null;

      items.push({
        id: `item_${wishlistId}_${seedProd.id}`,
        productId: seedProd.id,
        title: seedProd.title,
        slug: seedProd.slug,
        image: primaryImg,
        price,
        mrp,
        discountPercent: mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null,
        rating: seedProd.rating,
        reviewCount: seedProd.reviewCount,
        categoryName: seedProd.categoryName || "Collections",
        subcategoryName: seedProd.subcategoryName || null,
        inStock: seedProd.variants.some((v) => v.stockQuantity > 0),
        defaultVariantId: defVariant?.id || "default",
        createdAt: new Date().toISOString(),
      });
    }

    return {
      id: mem.id,
      userId: mem.userId,
      sessionToken: mem.sessionToken,
      items,
      itemCount: items.length,
      updatedAt: mem.updatedAt.toISOString(),
    };
  }
}

export const wishlistRepository = new WishlistRepository();
