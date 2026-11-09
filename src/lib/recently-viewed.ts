import { ProductDTO } from "@/types/product";

export const RECENTLY_VIEWED_STORAGE_KEY = "tiniwish_recently_viewed_v1";
export const MAX_RECENTLY_VIEWED = 12;

/**
 * Tracks a viewed product, moving it to the front of history without duplicates.
 */
export function trackRecentlyViewed(product: ProductDTO): ProductDTO[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const existing: ProductDTO[] = raw ? JSON.parse(raw) : [];

    // Filter out current product to prevent duplicate entry
    const deduped = existing.filter((p) => p.id !== product.id);

    // Insert at front
    const updated = [product, ...deduped].slice(0, MAX_RECENTLY_VIEWED);

    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [product];
  }
}

/**
 * Retrieves the current recently viewed products from client storage.
 */
export function getRecentlyViewed(): ProductDTO[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clears the recently viewed browsing history.
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
  } catch {
    // Storage quota or privacy restriction
  }
}

