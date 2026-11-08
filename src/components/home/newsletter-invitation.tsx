"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterInvitation() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Welcome to the TiniWish Circle. Code TINIWISH10 is now reserved for your account.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Unable to join. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please check your connection.");
    }
  };

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-b from-primary-bg via-secondary-bg/40 to-primary-bg border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs uppercase tracking-widest font-sans font-medium border border-champagne">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exclusive Maison Membership</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight">
          Join the TiniWish Circle
        </h2>

        <p className="text-xs sm:text-sm text-dark-brown/70 font-light max-w-md mx-auto leading-relaxed">
          Be the first to preview limited seasonal editions, receive invitations to private artisanal trunk shows, and enjoy 10% off your maiden order.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-2 pt-2">
          <div className="flex gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Newsletter email address"
              className="bg-white border-champagne text-xs h-11 placeholder:text-dark-brown/40"
              disabled={status === "loading"}
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 h-11 font-sans uppercase tracking-wider font-semibold shrink-0 cursor-pointer transition-colors"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Join Circle"
              )}
            </Button>
          </div>

          {status === "success" && (
            <p className="text-xs text-emerald-800 flex items-center justify-center gap-1.5 font-medium animate-in fade-in pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </p>
          )}

          {status === "error" && (
            <p className="text-xs text-rose-700 font-medium animate-in fade-in pt-1">
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

