import { productRepository } from "@/repositories/product.repository";
import { ProductDTO } from "@/types/product";
import { NotFoundError } from "@/lib/errors";

const LUXURY_ATTRIBUTE_KEYWORDS = [
  "kundan",
  "polki",
  "meenakari",
  "pearl",
  "temple",
  "brass",
  "marble",
  "gold",
  "antique",
  "silver",
  "zircon",
  "choker",
  "jhumka",
  "bangle",
  "diya",
  "vase",
  "candle",
  "hamper",
  "keepsake",
  "artisanal",
  "handcrafted",
];

export class RecommendationService {
  /**
   * Retrieves similar product recommendations based on category, subcategory,
   * materials, variant attributes, and price tier.
   */
  async getSimilarProducts(productIdOrSlug: string, limit: number = 4): Promise<ProductDTO[]> {
    let target = await productRepository.findById(productIdOrSlug);
    if (!target) {
      target = await productRepository.findBySlug(productIdOrSlug);
    }
    if (!target) {
      throw new NotFoundError(`Product '${productIdOrSlug}' not found`);
    }

    const { items: allCandidates } = await productRepository.findMany({
      limit: 100,
    });

    const targetPrice =
      target.variants.find((v) => v.isDefault)?.sellingPrice ||
      target.variants[0]?.sellingPrice ||
      0;

    // Extract searchable attribute tokens from target
    const targetTokens = new Set<string>();
    const targetText = `${target.title} ${target.description} ${target.materials || ""} ${target.categoryName || ""}`.toLowerCase();
    for (const kw of LUXURY_ATTRIBUTE_KEYWORDS) {
      if (targetText.includes(kw)) {
        targetTokens.add(kw);
      }
    }

    // Score and rank candidates
    const scored = allCandidates
      .filter((candidate) => candidate.id !== target.id && !candidate.isArchived)
      .map((candidate) => {
        let score = 0;

        // 1. Same subcategory (+40 pts)
        if (target.subcategoryId && candidate.subcategoryId === target.subcategoryId) {
          score += 40;
        }

        // 2. Same primary category (+25 pts)
        if (candidate.categoryId === target.categoryId) {
          score += 25;
        }

        // 3. Keyword / attribute match (+10 pts per matching token)
        const candidateText = `${candidate.title} ${candidate.description} ${candidate.materials || ""} ${candidate.categoryName || ""}`.toLowerCase();
        for (const token of targetTokens) {
          if (candidateText.includes(token)) {
            score += 10;
          }
        }

        // 4. Price tier proximity (+0 to +15 pts)
        const candidatePrice =
          candidate.variants.find((v) => v.isDefault)?.sellingPrice ||
          candidate.variants[0]?.sellingPrice ||
          0;
        if (targetPrice > 0 && candidatePrice > 0) {
          const ratio = Math.abs(candidatePrice - targetPrice) / targetPrice;
          if (ratio <= 0.3) {
            score += 15;
          } else if (ratio <= 0.6) {
            score += 8;
          }
        }

        // 5. Popularity / rating boost (+0 to +10 pts)
        score += Math.min(10, Math.round(candidate.rating * 2));

        return { product: candidate, score };
      });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.product);
  }

  /**
   * Generates recommendations based on the customer's collection of wishlisted items.
   */
  async getWishlistRecommendations(wishlistProductIds: string[], limit: number = 4): Promise<ProductDTO[]> {
    if (wishlistProductIds.length === 0) {
      // Fallback to top featured pieces
      const { items } = await productRepository.findMany({
        isFeatured: true,
        limit,
      });
      return items;
    }

    const { items: allCandidates } = await productRepository.findMany({
      limit: 100,
    });

    const wishlistedSet = new Set(wishlistProductIds);
    const nonWishlisted = allCandidates.filter((p) => !wishlistedSet.has(p.id) && !p.isArchived);

    // Pick top similar from the first few wishlisted items
    const sampleTargetId = wishlistProductIds[0];
    try {
      const similar = await this.getSimilarProducts(sampleTargetId, limit);
      const filtered = similar.filter((p) => !wishlistedSet.has(p.id));
      if (filtered.length >= limit) {
        return filtered.slice(0, limit);
      }
    } catch {
      // Fallback below
    }

    return nonWishlisted.slice(0, limit);
  }
}

export const recommendationService = new RecommendationService();

