/**
 * Search Utilities: Normalization, Tokenization, Text Highlighting, and SQL Sanitization.
 */

export const POPULAR_SEARCH_TERMS: string[] = [
  "Kundan Choker",
  "Pearl Jhumkas",
  "Luxury Gift Hamper",
  "Brass Peacock Diya",
  "Bridal Set",
  "Under ₹1,999",
  "Silver Bangles",
  "Handcrafted Urli",
];

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "were", "will", "with"
]);

/**
 * Normalizes a user search query:
 * - Trims whitespace
 * - Strips potential SQL injection characters / comment delimiters
 * - Collapses repeated spaces into single space
 * - Lowercases for matching
 */
export function normalizeSearchQuery(rawQuery: unknown): string {
  if (typeof rawQuery !== "string") {
    return "";
  }

  return rawQuery
    // Strip null bytes and control characters by replacing with space
    .replace(/[\x00-\x1F\x7F]/g, " ")
    // Remove potential SQL injection artifacts
    .replace(/--|\/\*|\*\/|;|'|"|`/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Extracts searchable keyword tokens from a query, filtering out common stop words.
 */
export function extractSearchTokens(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];

  const rawTokens = normalized
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9_-]/gi, "").trim())
    .filter((t) => t.length > 0);

  const filtered = rawTokens.filter((t) => !STOP_WORDS.has(t) && t.length > 1);

  // If all tokens were filtered (e.g. searching "in" or "for"), keep the raw tokens
  return filtered.length > 0 ? filtered : rawTokens;
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Breaks a target text into segments indicating which substrings match the query tokens.
 * Used for luxury, subtle search term highlighting.
 */
export function highlightSearchMatches(
  text: string,
  query: string
): HighlightSegment[] {
  if (!text) return [];
  if (!query || !query.trim()) {
    return [{ text, isMatch: false }];
  }

  const tokens = extractSearchTokens(query);
  if (tokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Escape regex special characters in tokens
  const escapedTokens = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);

  if (escapedTokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  const parts = text.split(regex);

  const segments: HighlightSegment[] = [];
  for (const part of parts) {
    if (!part) continue;
    const isMatch = tokens.some(
      (t) => t.toLowerCase() === part.toLowerCase()
    );
    segments.push({ text: part, isMatch });
  }

  return segments;
}

/**
 * Checks whether an SKU string matches a search query (case-insensitive substring or exact prefix).
 */
export function matchesSku(sku: string | undefined | null, query: string): boolean {
  if (!sku || !query) return false;
  const cleanSku = sku.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleanSku.includes(cleanQuery);
}
