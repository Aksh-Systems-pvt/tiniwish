import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { StoreProvider } from "@/context/store-context";
import { StoreLayout } from "@/components/layout/store-layout";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TiniWish | Little wishes. Timeless treasures.",
  description:
    "Luxury Indian artificial jewellery, charming personalized gifts, and timeless artisanal home décor. Handcrafted elegance delivered across India.",
  keywords: [
    "artificial jewellery",
    "kundan jewellery",
    "charming gifts",
    "home decor",
    "indian luxury gifts",
    "handcrafted decor",
    "tiniwish",
  ],
  icons: {
    icon: "/icons/logo.png",
    shortcut: "/icons/logo.png",
    apple: "/icons/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-champagne selection:text-charcoal">
        <ToastProvider>
          <StoreProvider>
            <StoreLayout>{children}</StoreLayout>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
