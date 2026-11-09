"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    image: string;
    categoryName?: string;
  };
}

export function ProductShareModal({
  isOpen,
  onClose,
  product,
}: ProductShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/products/${product.slug}`;
    }
    return `https://tiniwish.com/products/${product.slug}`;
  };

  const handleCopyLink = async () => {
    const url = getProductUrl();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link Copied", "Direct link copied to your clipboard.");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Copy Failed", "Please manually copy the URL from your browser.");
    }
  };

  const handleWhatsAppShare = () => {
    const url = getProductUrl();
    const text = encodeURIComponent(
      `Check out this stunning ${product.title} on TiniWish (₹${product.price.toLocaleString("en-IN")}): ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handlePinterestShare = () => {
    const url = encodeURIComponent(getProductUrl());
    const media = encodeURIComponent(product.image);
    const desc = encodeURIComponent(`${product.title} - Handcrafted luxury on TiniWish`);
    window.open(
      `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${desc}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleTwitterShare = () => {
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(`Adoring this ${product.title} from @TiniWishLuxury`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(getProductUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    const url = getProductUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Discover ${product.title} on TiniWish`,
          url,
        });
      } catch {
        // User dismissed native share sheet
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-white border border-champagne rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-champagne/40">
          <Share2 className="w-4 h-4 text-muted-gold" />
          <DialogTitle className="font-serif text-lg text-charcoal font-medium">
            Share this Treasure
          </DialogTitle>
        </div>

        {/* Product Preview Snippet */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-primary-bg/50 border border-champagne/50 mb-5">
          <div className="relative size-14 rounded-lg overflow-hidden shrink-0 bg-secondary-bg/30 border border-champagne/40">
            <Image
              src={product.image || "/images/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            {product.categoryName && (
              <span className="text-[10px] uppercase tracking-widest text-muted-gold font-medium block">
                {product.categoryName}
              </span>
            )}
            <h4 className="font-serif text-xs font-medium text-charcoal truncate">
              {product.title}
            </h4>
            <span className="font-sans text-xs font-semibold text-charcoal mt-0.5 block">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Social Sharing Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-champagne/80 hover:border-emerald-600/60 hover:bg-emerald-50/50 text-xs text-charcoal transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePinterestShare}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-champagne/80 hover:border-rose-600/60 hover:bg-rose-50/50 text-xs text-charcoal transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="font-medium">Pinterest</span>
          </button>

          <button
            type="button"
            onClick={handleTwitterShare}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-champagne/80 hover:border-sky-500/60 hover:bg-sky-50/50 text-xs text-charcoal transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-sky-500" />
            <span className="font-medium">X (Twitter)</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-champagne/80 hover:border-blue-600/60 hover:bg-blue-50/50 text-xs text-charcoal transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Facebook</span>
          </button>
        </div>

        {/* Copy Link Row */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider text-dark-brown/70 font-semibold block">
            Direct Treasure Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={getProductUrl()}
              aria-label="Direct product URL"
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-secondary-bg/30 border border-champagne/80 text-dark-brown/80 font-mono truncate select-all"
            />
            <Button
              type="button"
              onClick={handleCopyLink}
              variant="outline"
              className="text-xs h-9 px-3 border-champagne text-charcoal hover:bg-secondary-bg cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted-gold" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Optional Native Device Share */}
        {hasNativeShare && (
          <div className="mt-4 pt-4 border-t border-champagne/40">
            <Button
              type="button"
              onClick={handleNativeShare}
              className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs h-10 rounded-lg font-sans tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>More Sharing Options</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

