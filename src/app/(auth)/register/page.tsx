"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/account";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service & Privacy Policy to proceed.");
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage("Password must be at least 8 characters long with at least one uppercase letter and one number.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || undefined,
          email,
          phone: phone || undefined,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to create account. Please check the details entered.");
        setLoading(false);
        return;
      }

      if (data.data?.requiresEmailVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setOauthLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Failed to initiate Google sign in.");
        setOauthLoading(false);
      }
    } catch {
      setErrorMessage("Could not connect to Google authentication.");
      setOauthLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-normal text-stone-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Join the world of TiniWish to unlock bespoke treasures and private concierge perks.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={oauthLoading || loading}
        className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {oauthLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Sign up with Google</span>
      </button>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200"></div>
        </div>
        <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-stone-400">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
              First Name *
            </label>
            <Input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Ananya"
              className="w-full bg-stone-50/50 border-stone-300 focus-visible:border-amber-700 h-10 px-3.5"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
              Last Name
            </label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Sharma"
              className="w-full bg-stone-50/50 border-stone-300 focus-visible:border-amber-700 h-10 px-3.5"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
            Email Address *
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

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
            Mobile Number (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400">
              +91
            </span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              className="w-full bg-stone-50/50 border-stone-300 focus-visible:border-amber-700 h-10 pl-11 pr-3.5"
              disabled={loading}
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Used exclusively for delivery updates and dispatch notices.</p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
            Password *
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters (1 uppercase, 1 digit)"
              className="w-full bg-stone-50/50 border-stone-300 focus-visible:border-amber-700 h-10 px-3.5 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-stone-300 text-amber-800 focus:ring-amber-800 mt-0.5"
            />
            <span>
              I agree to TiniWish&apos;s Terms of Service, Privacy Policy, and membership privileges.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 h-11 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer mt-4"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </span>
          ) : (
            "Create Exclusive Account"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-xs text-stone-500">
        Already have a TiniWish account?{" "}
        <Link
          href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-amber-800 font-medium hover:underline hover:text-amber-900"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl p-10 text-center text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
