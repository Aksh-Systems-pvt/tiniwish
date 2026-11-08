"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: "signup",
        email,
      });
      setResent(true);
    } catch {
      // Ignored
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 p-8 sm:p-10 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200/80">
        <Mail className="w-8 h-8 text-amber-800" />
      </div>

      <h1 className="font-serif text-3xl font-normal text-stone-900 tracking-tight mb-2">
        Verify Your Email
      </h1>

      <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed mb-6">
        We have dispatched a verification link to{" "}
        <strong className="text-stone-900 font-medium">{email || "your email address"}</strong>.
        Please click the link inside to activate your TiniWish membership.
      </p>

      {resent ? (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center justify-center gap-2 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> A fresh verification link has been sent.
        </div>
      ) : (
        email && (
          <div className="mb-6">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs text-amber-800 hover:text-amber-900 font-medium underline cursor-pointer disabled:opacity-50"
            >
              {resending ? "Sending link..." : "Did not receive the email? Click to resend"}
            </button>
          </div>
        )
      )}

      <div className="space-y-3">
        <Link
          href="/login"
          className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 h-11 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
        >
          <span>Proceed to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl p-10 text-center text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
          Loading verification instructions...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
