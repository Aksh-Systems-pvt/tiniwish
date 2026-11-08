-- ==============================================================================
-- TiniWish Supabase PostgreSQL Row Level Security (RLS) Policies
-- Brand: TiniWish ("Little wishes. Timeless treasures.")
-- Execute in Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Functions
-- ------------------------------------------------------------------------------

-- Get current authenticated user's internal database UUID
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS text AS $$
  SELECT id FROM public."User" WHERE "supabaseUid" = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current authenticated user has administrative roles
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'ORDER_MANAGER'),
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. USER & PROFILE POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (
    "supabaseUid" = auth.uid()::text
    OR public.is_admin_or_staff()
  );

-- Customers can update their own profile (name, phone)
CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  USING ("supabaseUid" = auth.uid()::text)
  WITH CHECK ("supabaseUid" = auth.uid()::text);

-- ------------------------------------------------------------------------------
-- 3. ADDRESS POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;

-- Customers can view own addresses; staff can view for fulfillment
CREATE POLICY "Users can view own addresses"
  ON "Address" FOR SELECT
  USING (
    "userId" = public.get_current_user_id()
    OR public.is_admin_or_staff()
  );

-- Customers can create own addresses
CREATE POLICY "Users can insert own addresses"
  ON "Address" FOR INSERT
  WITH CHECK ("userId" = public.get_current_user_id());

-- Customers can modify own addresses
CREATE POLICY "Users can update own addresses"
  ON "Address" FOR UPDATE
  USING ("userId" = public.get_current_user_id())
  WITH CHECK ("userId" = public.get_current_user_id());

-- Customers can remove own addresses
CREATE POLICY "Users can delete own addresses"
  ON "Address" FOR DELETE
  USING ("userId" = public.get_current_user_id());

-- ------------------------------------------------------------------------------
-- 4. CART & CART ITEMS POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON "Cart" FOR ALL
  USING ("userId" = public.get_current_user_id())
  WITH CHECK ("userId" = public.get_current_user_id());

CREATE POLICY "Users can manage own cart items"
  ON "CartItem" FOR ALL
  USING (
    "cartId" IN (SELECT id FROM "Cart" WHERE "userId" = public.get_current_user_id())
  )
  WITH CHECK (
    "cartId" IN (SELECT id FROM "Cart" WHERE "userId" = public.get_current_user_id())
  );

-- ------------------------------------------------------------------------------
-- 5. WISHLIST POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON "Wishlist" FOR ALL
  USING ("userId" = public.get_current_user_id())
  WITH CHECK ("userId" = public.get_current_user_id());

CREATE POLICY "Users can manage own wishlist items"
  ON "WishlistItem" FOR ALL
  USING (
    "wishlistId" IN (SELECT id FROM "Wishlist" WHERE "userId" = public.get_current_user_id())
  )
  WITH CHECK (
    "wishlistId" IN (SELECT id FROM "Wishlist" WHERE "userId" = public.get_current_user_id())
  );

-- ------------------------------------------------------------------------------
-- 6. ORDER & ORDER ITEM POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders; staff can view all orders
CREATE POLICY "Users can view own orders"
  ON "Order" FOR SELECT
  USING (
    "userId" = public.get_current_user_id()
    OR public.is_admin_or_staff()
  );

CREATE POLICY "Users can view own order items"
  ON "OrderItem" FOR SELECT
  USING (
    "orderId" IN (SELECT id FROM "Order" WHERE "userId" = public.get_current_user_id())
    OR public.is_admin_or_staff()
  );

-- Orders can only be inserted or updated by backend service role or authorized checkout
CREATE POLICY "Staff can manage all orders"
  ON "Order" FOR ALL
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- ------------------------------------------------------------------------------
-- 7. REVIEWS POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved published reviews
CREATE POLICY "Public can view approved reviews"
  ON "Review" FOR SELECT
  USING ("isPublished" = true OR public.is_admin_or_staff());

-- Authenticated customers can author reviews
CREATE POLICY "Users can insert own reviews"
  ON "Review" FOR INSERT
  WITH CHECK ("userId" = public.get_current_user_id());

-- Customers can edit their own reviews
CREATE POLICY "Users can update own reviews"
  ON "Review" FOR UPDATE
  USING ("userId" = public.get_current_user_id())
  WITH CHECK ("userId" = public.get_current_user_id());

-- ------------------------------------------------------------------------------
-- 8. PRODUCT & CATALOGUE POLICIES (PUBLIC READ, ADMIN WRITE)
-- ------------------------------------------------------------------------------

ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active products"
  ON "Product" FOR SELECT
  USING ("isActive" = true OR public.is_admin_or_staff());

CREATE POLICY "Public read active categories"
  ON "Category" FOR SELECT
  USING ("isActive" = true OR public.is_admin_or_staff());

CREATE POLICY "Public read active variants"
  ON "ProductVariant" FOR SELECT
  USING ("isActive" = true OR public.is_admin_or_staff());

CREATE POLICY "Public read product images"
  ON "ProductImage" FOR SELECT
  USING (true);

-- Catalogue modifications restricted to staff
CREATE POLICY "Staff manage products"
  ON "Product" FOR ALL
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "Staff manage categories"
  ON "Category" FOR ALL
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "Staff manage variants"
  ON "ProductVariant" FOR ALL
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

-- ------------------------------------------------------------------------------
-- 9. AUDIT LOGS (STAFF ONLY)
-- ------------------------------------------------------------------------------

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view audit logs"
  ON "AuditLog" FOR SELECT
  USING (public.is_admin_or_staff());

