"use client";

import React from "react";
import { ProductCardUI } from "@/components/ui/product-card";
import { useStore } from "@/context/store-context";
import { ProductDTO } from "@/types/product";
import { SearchHighlight } from "@/components/search/search-highlight";

interface ProductGridItemProps {
  product: ProductDTO;
  searchQuery?: string;
  onQuickView?: (product: ProductDTO) => void;
}

export function ProductGridItem({ product, searchQuery, onQuickView }: ProductGridItemProps) {
  const { isWishlisted, toggleWishlist, addToCart } = useStore();

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop";

  const secondaryImage =
    product.images.find((img) => !img.isPrimary)?.url || null;

  const defaultVariant =
    product.variants.find((v) => v.isDefault) || product.variants[0];

  const price = defaultVariant?.sellingPrice || 0;
  const compareAtPrice = defaultVariant?.mrp || null;
  const wishlisted = isWishlisted(product.id);
  const inStock = product.variants.some((v) => v.stockQuantity > 0);

  const handleWishlistToggle = () => {
    toggleWishlist({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: Number(price),
    });
  };

  const handleAddToCart = () => {
    if (!inStock || (defaultVariant && defaultVariant.stockQuantity <= 0)) {
      return;
    }
    addToCart({
      id: `${product.id}-${defaultVariant?.id || "default"}`,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: Number(price),
      variantId: defaultVariant?.id,
      variantTitle: defaultVariant?.title,
    });
  };

  return (
    <ProductCardUI
      id={product.id}
      altText={product.title}
      title={
        searchQuery ? (
          <SearchHighlight text={product.title} query={searchQuery} />
        ) : (
          product.title
        )
      }
      slug={product.slug}
      price={price}
      compareAtPrice={compareAtPrice}
      primaryImage={primaryImage}
      secondaryImage={secondaryImage}
      categoryName={product.categoryName}
      rating={product.rating}
      reviewCount={product.reviewCount}
      isWishlisted={wishlisted}
      isBestseller={product.isFeatured}
      isNewArrival={!product.isFeatured}
      inStock={inStock}
      onWishlistToggle={handleWishlistToggle}
      onAddToCart={inStock ? handleAddToCart : undefined}
      onQuickView={onQuickView ? () => onQuickView(product) : undefined}
    />
  );
}

