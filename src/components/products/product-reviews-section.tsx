"use client";

import React, { useState } from "react";
import { Star, CheckCircle, ThumbsUp, MessageSquarePlus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
}

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
  rating: number;
  reviewCount: number;
}

export function ProductReviewsSection({
  productTitle,
  rating,
  reviewCount,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: "rev-1",
      author: "Pooja Singhania",
      rating: 5,
      date: "2 days ago",
      title: "Royal elegance and impeccable finish!",
      comment:
        "The craftsmanship on this piece exceeded all my expectations. The Kundan stones sparkle brilliantly under evening lighting, and the pastel Meenakari on the reverse is divine. Came packaged in a gorgeous velvet keepsake box.",
      isVerified: true,
      helpfulCount: 14,
    },
    {
      id: "rev-2",
      author: "Ananya Iyer",
      rating: 5,
      date: "1 week ago",
      title: "Wore it for my reception — endless compliments",
      comment:
        "Comfortable to wear for 6+ hours without any pinching or irritation. Truly hypoallergenic as promised. The weight feels substantial and luxurious.",
      isVerified: true,
      helpfulCount: 9,
    },
    {
      id: "rev-3",
      author: "Rohan Deshmukh",
      rating: 4,
      date: "2 weeks ago",
      title: "Thoughtful anniversary gift",
      comment:
        "Gifted this to my wife for our 5th anniversary. She loved the handwritten calligraphy note and the premium unboxing experience. Fast delivery to Pune within 2 days.",
      isVerified: true,
      helpfulCount: 6,
    },
  ]);

  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [titleInput, setTitleInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleHelpful = (id: string) => {
    if (helpfulMap[id]) return;
    setHelpfulMap((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );
    toast.info("Feedback recorded", "Thank you for letting us know.");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !commentInput.trim() || !nameInput.trim()) {
      toast.error("Incomplete review", "Please fill in all required fields.");
      return;
    }

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: nameInput.trim(),
      rating: newRating,
      date: "Just now",
      title: titleInput.trim(),
      comment: commentInput.trim(),
      isVerified: true,
      helpfulCount: 0,
    };

    setReviews([newRev, ...reviews]);
    setIsDialogOpen(false);
    setTitleInput("");
    setCommentInput("");
    setNameInput("");
    toast.success("Review Submitted", "Thank you! Your verified review is now live.");
  };

  // Rating Distribution breakdown
  const ratingDistribution = [
    { stars: 5, percent: 84 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ];

  return (
    <section id="customer-reviews" className="pt-12 border-t border-champagne/40">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold block mb-1">
            Verified Experiences
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
            Customer Reviews & Ratings
          </h2>
        </div>

        {/* Write a Review Modal Button */}
        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="bg-charcoal hover:bg-muted-gold text-white text-xs h-10 px-5 font-sans uppercase tracking-wider font-semibold rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-2"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md bg-white border border-champagne/80 p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-charcoal">
                Share Your Experience
              </DialogTitle>
              <p className="text-xs text-dark-brown/60">
                Writing a review for <strong className="text-charcoal">{productTitle}</strong>
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || newRating)
                            ? "fill-muted-gold text-muted-gold"
                            : "text-champagne fill-secondary-bg"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-medium text-dark-brown/70">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Breathtaking finish & packaging!"
                  className="w-full text-xs px-3 py-2 border border-champagne rounded-lg focus:outline-hidden focus:border-muted-gold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Your Review
                </label>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Tell other connoisseurs about the quality, weight, design, and compliments received..."
                  rows={4}
                  className="w-full text-xs p-3 border border-champagne rounded-lg focus:outline-hidden focus:border-muted-gold resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full text-xs px-3 py-2 border border-champagne rounded-lg focus:outline-hidden focus:border-muted-gold"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-charcoal hover:bg-muted-gold text-white text-xs h-9"
                >
                  Post Review
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aggregate Score & Star Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 rounded-2xl bg-white border border-champagne/60 mb-10 shadow-subtle">
        {/* Left: Overall Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-champagne/40">
          <span className="font-serif text-5xl font-normal text-charcoal">
            {rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 my-2 text-muted-gold">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(rating)
                    ? "fill-muted-gold text-muted-gold"
                    : "fill-secondary-bg text-champagne"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-dark-brown/70">
            Based on {reviewCount} authenticated client ratings
          </span>
          <span className="mt-2 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full">
            98% would recommend this treasure
          </span>
        </div>

        {/* Right: Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          {ratingDistribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-dark-brown/70 font-medium shrink-0 flex items-center gap-1">
                <span>{d.stars}</span>
                <Star className="w-3 h-3 text-muted-gold fill-muted-gold" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-secondary-bg overflow-hidden">
                <div
                  className="h-full bg-muted-gold rounded-full transition-all duration-500"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
              <span className="w-9 text-right text-[11px] text-dark-brown/60">
                {d.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <article
            key={rev.id}
            className="p-5 sm:p-6 rounded-xl bg-white border border-champagne/50 space-y-3 transition-shadow hover:shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center text-charcoal text-xs font-semibold">
                  <User className="w-4 h-4 text-dark-brown/70" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-charcoal">
                      {rev.author}
                    </span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-dark-brown/50">{rev.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-muted-gold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating
                        ? "fill-muted-gold text-muted-gold"
                        : "text-champagne fill-secondary-bg"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif text-sm font-medium text-charcoal mb-1">
                {rev.title}
              </h4>
              <p className="text-xs text-dark-brown/80 leading-relaxed font-light">
                {rev.comment}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-dark-brown/60 border-t border-secondary-bg/80">
              <span>Authentic purchaser from TiniWish</span>
              <button
                type="button"
                onClick={() => handleHelpful(rev.id)}
                className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  helpfulMap[rev.id]
                    ? "text-muted-gold font-medium"
                    : "hover:text-charcoal"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({rev.helpfulCount})</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
