"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to process request. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch {
      setErrorMessage("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-normal text-stone-900 tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Enter the email associated with your account, and we will send a secure reset link.
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-medium text-stone-900 text-base mb-2">Check Your Email</h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed mb-6">
            If an account exists for <strong className="text-stone-800">{email}</strong>, a secure reset instructions link has been dispatched.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full border-stone-300 text-stone-700 h-10 rounded-xl text-xs uppercase tracking-wider"
            >
              Try another email
            </Button>
            <Link
              href="/login"
              className="block text-center text-xs text-amber-800 font-medium hover:underline hover:text-amber-900"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1.5 font-medium">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-stone-50/50 border-stone-300 focus-visible:border-amber-700 h-10 px-3.5"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 h-11 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Link...
                </span>
              ) : (
                "Send Password Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

