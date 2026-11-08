import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductDetailsClient } from "./product-details-client";
import { RelatedProducts } from "@/components/products/related-products";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productService.getProductBySlug(slug);
    const primaryImage =
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop";

    const defaultVariant =
      product.variants.find((v) => v.isDefault) || product.variants[0];

    const priceText = defaultVariant
      ? `₹${defaultVariant.sellingPrice.toLocaleString("en-IN")}`
      : "";

    const title = `${product.title} ${priceText ? `| ${priceText}` : ""} | TiniWish`;
    const description = `${product.description.slice(0, 155)}... Buy authentic handcrafted luxury on TiniWish with free express shipping across India.`;
    const canonicalUrl = `https://tiniwish.com/products/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "TiniWish",
        type: "website",
        images: [
          {
            url: primaryImage,
            width: 800,
            height: 1067,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryImage],
      },
    };
  } catch {
    return {
      title: "Luxury Treasure | TiniWish",
      description: "Discover curated handcrafted jewellery, gifts, and home décor at TiniWish.",
    };
  }
}

function ProductDetailsFallback() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="w-full aspect-[3/4] rounded-2xl bg-secondary-bg/50" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-20 h-24 rounded-lg bg-secondary-bg/40" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-4 w-32 bg-secondary-bg/60" />
          <Skeleton className="h-10 w-3/4 bg-secondary-bg/60" />
          <Skeleton className="h-6 w-28 bg-secondary-bg/40" />
          <Skeleton className="h-20 w-full bg-secondary-bg/30" />
          <Skeleton className="h-12 w-full bg-secondary-bg/50" />
          <Skeleton className="h-12 w-full bg-secondary-bg/50" />
        </div>
      </div>
    </div>
  );
}

async function ProductPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await productService.getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Fetch related products from same category
  const relatedProducts = await productService.getRelatedProducts(
    product.id,
    product.categorySlug,
    4
  );

  const defaultVariant =
    product.variants.find((v) => v.isDefault) || product.variants[0];

  const inStock = product.variants.some((v) => v.stockQuantity > 0);

  // Structured Data (JSON-LD) for Schema.org/Product and BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `https://tiniwish.com/products/${product.slug}#product`,
        name: product.title,
        description: product.description,
        image: product.images.map((img) => img.url),
        sku: defaultVariant?.sku || `TW-${product.id}`,
        brand: {
          "@type": "Brand",
          name: "TiniWish",
        },
        offers: {
          "@type": "Offer",
          url: `https://tiniwish.com/products/${product.slug}`,
          priceCurrency: "INR",
          price: defaultVariant?.sellingPrice || 0,
          itemCondition: "https://schema.org/NewCondition",
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "TiniWish",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating || 5.0,
          reviewCount: product.reviewCount || 38,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://tiniwish.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Collections",
            item: "https://tiniwish.com/products",
          },
          ...(product.categoryName
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.categoryName,
                  item: `https://tiniwish.com/categories/${product.categorySlug}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: product.title,
                  item: `https://tiniwish.com/products/${product.slug}`,
                },
              ]
            : [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.title,
                  item: `https://tiniwish.com/products/${product.slug}`,
                },
              ]),
        ],
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Accessible Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center space-x-2 text-xs text-dark-brown/60 mb-8 overflow-x-auto scrollbar-none py-1"
      >
        <Link href="/" className="hover:text-muted-gold transition-colors shrink-0">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-dark-brown/40 shrink-0" />
        <Link href="/products" className="hover:text-muted-gold transition-colors shrink-0">
          Collections
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="w-3 h-3 text-dark-brown/40 shrink-0" />
            <Link
              href={`/categories/${product.categorySlug}`}
              className="hover:text-muted-gold transition-colors shrink-0"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-dark-brown/40 shrink-0" />
        <span className="text-charcoal font-medium truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      {/* Product Details Presentation */}
      <ProductDetailsClient product={product} />

      {/* Related Products from Category */}
      <RelatedProducts products={relatedProducts} />
    </>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="py-8 sm:py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Suspense fallback={<ProductDetailsFallback />}>
          <ProductPageContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
