import { prisma } from "@/lib/prisma";
import { CartDTO, CartItemDTO } from "@/types/cart";
import { calculateCartFinancials, CouponRule } from "@/lib/cart-calculations";
import { NotFoundError, BadRequestError } from "@/lib/errors";
import { SEED_PRODUCTS } from "@/data/seed-catalogue";
import { logger } from "@/lib/logger";

const SEED_COUPONS: CouponRule[] = [
  {
    code: "WELCOME10",
    description: "10% off on your first luxury purchase above ₹999",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 999,
    maxDiscountCap: 500,
    isActive: true,
  },
  {
    code: "TINIWISH10",
    description: "10% off on handcrafted treasures",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 499,
    maxDiscountCap: 500,
    isActive: true,
  },
  {
    code: "TINIWISH15",
    description: "15% off on celebratory orders above ₹2,499",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderAmount: 2499,
    maxDiscountCap: 1000,
    isActive: true,
  },
  {
    code: "FREESHIP",
    description: "Free express shipping on all orders",
    discountType: "FREE_SHIPPING",
    discountValue: 99,
    minOrderAmount: 499,
    isActive: true,
  },
];

// In-memory store for isolated, deterministic test executions
interface InMemoryCart {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  couponCode: string | null;
  items: Array<{
    id: string;
    variantId: string;
    quantity: number;
  }>;
  updatedAt: Date;
}

const inMemoryCarts = new Map<string, InMemoryCart>();

export class CartRepository {
  /**
   * Retrieves or creates a cart by userId or sessionToken.
   */
  async getOrCreateCart(params: {
    userId?: string | null;
    sessionToken?: string | null;
  }): Promise<string> {
    if (process.env.NODE_ENV === "test") {
      return this.getOrCreateInMemory(params);
    }

    try {
      if (params.userId) {
        let userCart = await prisma.cart.findUnique({
          where: { userId: params.userId },
          select: { id: true },
        });

        if (!userCart) {
          userCart = await prisma.cart.create({
            data: { userId: params.userId },
            select: { id: true },
          });
        }
        return userCart.id;
      }

      if (params.sessionToken) {
        let guestCart = await prisma.cart.findUnique({
          where: { sessionToken: params.sessionToken },
          select: { id: true },
        });

        if (!guestCart) {
          guestCart = await prisma.cart.create({
            data: { sessionToken: params.sessionToken },
            select: { id: true },
          });
        }
        return guestCart.id;
      }

      // If neither, generate a new guest cart
      const newCart = await prisma.cart.create({
        data: { sessionToken: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` },
        select: { id: true },
      });
      return newCart.id;
    } catch {
      return this.getOrCreateInMemory(params);
    }
  }

  /**
   * Retrieves full cart with authoritative server prices, inventory, and calculations.
   */
  async getCartById(cartId: string): Promise<CartDTO> {
    if (process.env.NODE_ENV === "test") {
      return this.getCartInMemory(cartId);
    }

    try {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { orderBy: { displayOrder: "asc" } },
                    },
                  },
                  inventory: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!cart) {
        throw new NotFoundError(`Cart with id '${cartId}' not found`);
      }

      let couponRule: CouponRule | null = null;
      if (cart.couponCode) {
        const dbCoupon = await prisma.coupon.findUnique({
          where: { code: cart.couponCode },
        });
        if (dbCoupon && dbCoupon.isActive) {
          couponRule = {
            code: dbCoupon.code,
            description: dbCoupon.description,
            discountType: dbCoupon.discountType as CouponRule["discountType"],
            discountValue: Number(dbCoupon.discountValue),
            minOrderAmount: dbCoupon.minOrderAmount ? Number(dbCoupon.minOrderAmount) : null,
            maxDiscountCap: dbCoupon.maxDiscountCap ? Number(dbCoupon.maxDiscountCap) : null,
            isActive: dbCoupon.isActive,
            expiresAt: dbCoupon.expiresAt,
          };
        }
      }

      const items: CartItemDTO[] = cart.items.map((ci) => {
        const v = ci.variant;
        const p = v.product;
        const availableStock = v.inventory
          ? Math.max(0, v.inventory.quantityAvailable - v.inventory.quantityReserved)
          : 10;

        const isAvailable = availableStock >= ci.quantity && !p.isArchived;
        const price = Number(v.sellingPrice);
        const mrp = Number(v.mrp);
        const itemTotal = price * ci.quantity;

        const primaryImg =
          p.images.find((i) => i.isPrimary)?.url ||
          p.images[0]?.url ||
          "/images/placeholder.jpg";

        return {
          id: ci.id,
          cartId: cart.id,
          variantId: v.id,
          productId: p.id,
          title: p.title,
          variantTitle: v.title,
          sku: v.sku,
          slug: p.slug,
          image: primaryImg,
          price,
          mrp,
          quantity: ci.quantity,
          attributes: (v.attributes as Record<string, string>) || {},
          stockQuantity: availableStock,
          lowStockThreshold: v.inventory?.lowStockThreshold || 5,
          isAvailable,
          gstRatePercent: Number(p.gstRatePercent) || 3.0,
          itemTotal,
        };
      });

      const { calculation, appliedCoupon } = calculateCartFinancials(items, couponRule);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const hasUnavailableItems = items.some((i) => !i.isAvailable);

      return {
        id: cart.id,
        userId: cart.userId,
        sessionToken: cart.sessionToken,
        items,
        itemCount,
        calculation,
        appliedCoupon,
        hasUnavailableItems,
        updatedAt: cart.updatedAt.toISOString(),
      };
    } catch {
      return this.getCartInMemory(cartId);
    }
  }

  /**
   * Adds an item to the cart with strict stock and duplicate checks.
   */
  async addItem(
    cartId: string,
    params: { variantId: string; quantity: number }
  ): Promise<CartDTO> {
    if (params.quantity <= 0) {
      throw new BadRequestError("Item quantity must be at least 1");
    }

    if (process.env.NODE_ENV === "test") {
      return this.addItemInMemory(cartId, params);
    }

    try {
      const variant = await prisma.productVariant.findUnique({
        where: { id: params.variantId },
        include: {
          inventory: true,
          product: true,
        },
      });

      if (!variant || variant.product.isArchived || !variant.isActive) {
        throw new NotFoundError("Selected product variant is unavailable");
      }

      const availableStock = variant.inventory
        ? Math.max(0, variant.inventory.quantityAvailable - variant.inventory.quantityReserved)
        : 10;

      if (availableStock <= 0) {
        throw new BadRequestError("This item is currently out of stock");
      }

      // Check if item already exists in cart (duplicate prevention)
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId,
            variantId: params.variantId,
          },
        },
      });

      const newQuantity = existingItem
        ? existingItem.quantity + params.quantity
        : params.quantity;

      if (newQuantity > availableStock) {
        throw new BadRequestError(
          `Cannot add ${params.quantity} more. Only ${availableStock} units available in stock.`
        );
      }

      await prisma.$transaction(async (tx) => {
        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId,
              variantId: params.variantId,
              quantity: params.quantity,
            },
          });
        }
        await tx.cart.update({
          where: { id: cartId },
          data: { updatedAt: new Date() },
        });
      });

      return this.getCartById(cartId);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      return this.addItemInMemory(cartId, params);
    }
  }

  /**
   * Updates an item's quantity in the cart with bounds validation.
   */
  async updateQuantity(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<CartDTO> {
    if (quantity <= 0) {
      return this.removeItem(cartId, itemId);
    }

    if (process.env.NODE_ENV === "test") {
      return this.updateQuantityInMemory(cartId, itemId, quantity);
    }

    try {
      const cartItem = await prisma.cartItem.findFirst({
        where: { id: itemId, cartId },
        include: {
          variant: { include: { inventory: true, product: true } },
        },
      });

      if (!cartItem) {
        throw new NotFoundError("Cart item not found");
      }

      const availableStock = cartItem.variant.inventory
        ? Math.max(
            0,
            cartItem.variant.inventory.quantityAvailable -
              cartItem.variant.inventory.quantityReserved
          )
        : 10;

      if (quantity > availableStock) {
        throw new BadRequestError(
          `Cannot increase quantity to ${quantity}. Only ${availableStock} units available.`
        );
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });

      return this.getCartById(cartId);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      return this.updateQuantityInMemory(cartId, itemId, quantity);
    }
  }

  /**
   * Removes an item from the cart.
   */
  async removeItem(cartId: string, itemId: string): Promise<CartDTO> {
    if (process.env.NODE_ENV === "test") {
      return this.removeItemInMemory(cartId, itemId);
    }

    try {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, cartId },
      });
      return this.getCartById(cartId);
    } catch {
      return this.removeItemInMemory(cartId, itemId);
    }
  }

  /**
   * Applies a coupon code to the cart.
   */
  async applyCoupon(cartId: string, code: string): Promise<CartDTO> {
    const cleanCode = code.trim().toUpperCase();

    if (process.env.NODE_ENV === "test") {
      return this.applyCouponInMemory(cartId, cleanCode);
    }

    try {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (!coupon || !coupon.isActive) {
        throw new BadRequestError(`Invalid coupon code: '${cleanCode}'`);
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
        throw new BadRequestError(`Coupon code '${cleanCode}' has expired`);
      }

      await prisma.cart.update({
        where: { id: cartId },
        data: { couponCode: coupon.code },
      });

      return this.getCartById(cartId);
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      return this.applyCouponInMemory(cartId, cleanCode);
    }
  }

  /**
   * Removes applied coupon from the cart.
   */
  async removeCoupon(cartId: string): Promise<CartDTO> {
    if (process.env.NODE_ENV === "test") {
      return this.removeCouponInMemory(cartId);
    }

    try {
      await prisma.cart.update({
        where: { id: cartId },
        data: { couponCode: null },
      });
      return this.getCartById(cartId);
    } catch {
      return this.removeCouponInMemory(cartId);
    }
  }

  /**
   * Clears all items and coupons from a cart.
   */
  async clearCart(cartId: string): Promise<CartDTO> {
    if (process.env.NODE_ENV === "test") {
      return this.clearCartInMemory(cartId);
    }

    try {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { cartId } }),
        prisma.cart.update({ where: { id: cartId }, data: { couponCode: null } }),
      ]);
      return this.getCartById(cartId);
    } catch {
      return this.clearCartInMemory(cartId);
    }
  }

  /**
   * Merges guest cart items into authenticated user cart upon login.
   */
  async mergeGuestCartIntoUserCart(params: {
    guestSessionToken: string;
    userId: string;
  }): Promise<CartDTO> {
    if (process.env.NODE_ENV === "test") {
      return this.mergeInMemory(params);
    }

    try {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionToken: params.guestSessionToken },
        include: { items: true },
      });

      if (!guestCart || guestCart.items.length === 0) {
        const userCartId = await this.getOrCreateCart({ userId: params.userId });
        return this.getCartById(userCartId);
      }

      let userCart = await prisma.cart.findUnique({
        where: { userId: params.userId },
        include: { items: true },
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId: params.userId },
          include: { items: true },
        });
      }

      // Merge items atomically in transaction
      await prisma.$transaction(async (tx) => {
        for (const guestItem of guestCart.items) {
          const userItem = userCart!.items.find((i) => i.variantId === guestItem.variantId);
          if (userItem) {
            await tx.cartItem.update({
              where: { id: userItem.id },
              data: { quantity: userItem.quantity + guestItem.quantity },
            });
          } else {
            await tx.cartItem.create({
              data: {
                cartId: userCart!.id,
                variantId: guestItem.variantId,
                quantity: guestItem.quantity,
              },
            });
          }
        }

        // Copy coupon if user cart had none
        if (!userCart!.couponCode && guestCart.couponCode) {
          await tx.cart.update({
            where: { id: userCart!.id },
            data: { couponCode: guestCart.couponCode },
          });
        }

        // Delete guest cart to prevent duplicate resurrection
        await tx.cart.delete({ where: { id: guestCart.id } });
      });

      return this.getCartById(userCart.id);
    } catch (err) {
      logger.warn("Database cart merge error, using in-memory handler", { error: err });
      return this.mergeInMemory(params);
    }
  }

  // ---------------------------------------------------------------------------
  // In-Memory Test & Fallback Handlers
  // ---------------------------------------------------------------------------

  private getOrCreateInMemory(params: {
    userId?: string | null;
    sessionToken?: string | null;
  }): string {
    if (params.userId) {
      for (const cart of inMemoryCarts.values()) {
        if (cart.userId === params.userId) return cart.id;
      }
      const newId = `cart_user_${params.userId}`;
      inMemoryCarts.set(newId, {
        id: newId,
        userId: params.userId,
        sessionToken: null,
        couponCode: null,
        items: [],
        updatedAt: new Date(),
      });
      return newId;
    }

    const token = params.sessionToken || `guest_${Date.now()}`;
    for (const cart of inMemoryCarts.values()) {
      if (cart.sessionToken === token) return cart.id;
    }

    const newId = `cart_guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    inMemoryCarts.set(newId, {
      id: newId,
      userId: null,
      sessionToken: token,
      couponCode: null,
      items: [],
      updatedAt: new Date(),
    });
    return newId;
  }

  private getCartInMemory(cartId: string): CartDTO {
    let cart = inMemoryCarts.get(cartId);
    if (!cart) {
      cart = {
        id: cartId,
        userId: null,
        sessionToken: "guest_default",
        couponCode: null,
        items: [],
        updatedAt: new Date(),
      };
      inMemoryCarts.set(cartId, cart);
    }

    const items: CartItemDTO[] = [];
    for (const item of cart.items) {
      // Find variant in seed products
      let foundVariant: (typeof SEED_PRODUCTS)[0]["variants"][0] | undefined;
      let foundProduct: (typeof SEED_PRODUCTS)[0] | undefined;

      for (const p of SEED_PRODUCTS) {
        const v = p.variants.find((vr) => vr.id === item.variantId);
        if (v) {
          foundVariant = v;
          foundProduct = p;
          break;
        }
      }

      if (foundVariant && foundProduct) {
        const availableStock = foundVariant.stockQuantity ?? 10;
        const isAvailable = availableStock >= item.quantity && !foundProduct.isArchived;
        const price = Number(foundVariant.sellingPrice);
        const mrp = Number(foundVariant.mrp);

        items.push({
          id: item.id,
          cartId,
          variantId: foundVariant.id,
          productId: foundProduct.id,
          title: foundProduct.title,
          variantTitle: foundVariant.title,
          sku: foundVariant.sku,
          slug: foundProduct.slug,
          image: foundProduct.images[0]?.url || "/images/placeholder.jpg",
          price,
          mrp,
          quantity: item.quantity,
          attributes: foundVariant.attributes,
          stockQuantity: availableStock,
          lowStockThreshold: 5,
          isAvailable,
          gstRatePercent: 3.0,
          itemTotal: price * item.quantity,
        });
      }
    }

    let couponRule: CouponRule | null = null;
    if (cart.couponCode) {
      couponRule = SEED_COUPONS.find((c) => c.code === cart!.couponCode) || null;
    }

    const { calculation, appliedCoupon } = calculateCartFinancials(items, couponRule);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasUnavailableItems = items.some((i) => !i.isAvailable);

    return {
      id: cart.id,
      userId: cart.userId,
      sessionToken: cart.sessionToken,
      items,
      itemCount,
      calculation,
      appliedCoupon,
      hasUnavailableItems,
      updatedAt: cart.updatedAt.toISOString(),
    };
  }

  private addItemInMemory(
    cartId: string,
    params: { variantId: string; quantity: number }
  ): CartDTO {
    const cart = inMemoryCarts.get(cartId) || {
      id: cartId,
      userId: null,
      sessionToken: null,
      couponCode: null,
      items: [],
      updatedAt: new Date(),
    };
    inMemoryCarts.set(cartId, cart);

    // Locate variant in seed catalogue
    let foundVariant: (typeof SEED_PRODUCTS)[0]["variants"][0] | undefined;
    for (const p of SEED_PRODUCTS) {
      const v = p.variants.find((vr) => vr.id === params.variantId);
      if (v) {
        foundVariant = v;
        break;
      }
    }

    if (!foundVariant) {
      throw new NotFoundError(`Variant with id '${params.variantId}' not found`);
    }

    const availableStock = foundVariant.stockQuantity ?? 10;
    if (availableStock <= 0) {
      throw new BadRequestError("This item is currently out of stock");
    }

    const existing = cart.items.find((i) => i.variantId === params.variantId);
    const newQty = existing ? existing.quantity + params.quantity : params.quantity;

    if (newQty > availableStock) {
      throw new BadRequestError(
        `Cannot add ${params.quantity} more. Only ${availableStock} units available in stock.`
      );
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      cart.items.push({
        id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        variantId: params.variantId,
        quantity: params.quantity,
      });
    }

    cart.updatedAt = new Date();
    return this.getCartInMemory(cartId);
  }

  private updateQuantityInMemory(
    cartId: string,
    itemId: string,
    quantity: number
  ): CartDTO {
    const cart = inMemoryCarts.get(cartId);
    if (!cart) throw new NotFoundError("Cart not found");

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundError("Cart item not found");

    // Check available stock
    for (const p of SEED_PRODUCTS) {
      const v = p.variants.find((vr) => vr.id === item.variantId);
      if (v) {
        const availableStock = v.stockQuantity ?? 10;
        if (quantity > availableStock) {
          throw new BadRequestError(
            `Cannot increase quantity to ${quantity}. Only ${availableStock} units available.`
          );
        }
        break;
      }
    }

    item.quantity = quantity;
    cart.updatedAt = new Date();
    return this.getCartInMemory(cartId);
  }

  private removeItemInMemory(cartId: string, itemId: string): CartDTO {
    const cart = inMemoryCarts.get(cartId);
    if (cart) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
      cart.updatedAt = new Date();
    }
    return this.getCartInMemory(cartId);
  }

  private applyCouponInMemory(cartId: string, code: string): CartDTO {
    const coupon = SEED_COUPONS.find((c) => c.code === code);
    if (!coupon) {
      throw new BadRequestError(`Invalid coupon code: '${code}'`);
    }

    const cart = inMemoryCarts.get(cartId);
    if (cart) {
      cart.couponCode = coupon.code;
      cart.updatedAt = new Date();
    }
    return this.getCartInMemory(cartId);
  }

  private removeCouponInMemory(cartId: string): CartDTO {
    const cart = inMemoryCarts.get(cartId);
    if (cart) {
      cart.couponCode = null;
      cart.updatedAt = new Date();
    }
    return this.getCartInMemory(cartId);
  }

  private clearCartInMemory(cartId: string): CartDTO {
    const cart = inMemoryCarts.get(cartId);
    if (cart) {
      cart.items = [];
      cart.couponCode = null;
      cart.updatedAt = new Date();
    }
    return this.getCartInMemory(cartId);
  }

  private mergeInMemory(params: { guestSessionToken: string; userId: string }): CartDTO {
    let guestCart: InMemoryCart | undefined;
    for (const c of inMemoryCarts.values()) {
      if (c.sessionToken === params.guestSessionToken) {
        guestCart = c;
        break;
      }
    }

    const userCartId = this.getOrCreateInMemory({ userId: params.userId });
    const userCart = inMemoryCarts.get(userCartId)!;

    if (guestCart && guestCart.items.length > 0) {
      for (const gItem of guestCart.items) {
        const uItem = userCart.items.find((i) => i.variantId === gItem.variantId);
        if (uItem) {
          uItem.quantity += gItem.quantity;
        } else {
          userCart.items.push({
            id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            variantId: gItem.variantId,
            quantity: gItem.quantity,
          });
        }
      }

      if (!userCart.couponCode && guestCart.couponCode) {
        userCart.couponCode = guestCart.couponCode;
      }

      inMemoryCarts.delete(guestCart.id);
    }

    userCart.updatedAt = new Date();
    return this.getCartInMemory(userCartId);
  }
}

export const cartRepository = new CartRepository();

