import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowLeft, ShieldCheck, HeartHandshake } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-stone-200/60 bg-white/80 backdrop-blur-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Boutique</span>
        </Link>
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/icons/logo.png"
            alt="TiniWish Logo"
            width={34}
            height={30}
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="flex flex-col text-left">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.15em] font-medium text-stone-900 block leading-none group-hover:text-amber-800 transition-colors">
              TINIWISH
            </span>
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Encrypted Gateway</span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="py-6 border-t border-stone-200/60 bg-white/60 text-center text-xs text-stone-500">
        <div className="flex flex-wrap justify-center items-center gap-6 mb-2">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Handcrafted Heritage
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Authenticity Assured
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> Dedicated Concierge
          </span>
        </div>
        <p className="text-[11px] text-stone-400">
          &copy; 2026 TiniWish Luxury Retails LLP. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

