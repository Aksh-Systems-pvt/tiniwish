"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderDTO } from "@/types/checkout";
import { toast } from "@/components/ui/toast";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [utr, setUtr] = useState("");
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // 1. Fetch Order Details
  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/v1/checkout/orders/${orderNumber}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            const ord: OrderDTO = json.data;
            setOrder(ord);

            // If already confirmed or paid, go straight to success
            if (
              ord.status === "PAID" ||
              ord.status === "PROCESSING" ||
              ord.status === "DELIVERED"
            ) {
              router.push(`/checkout/success?orderNumber=${ord.orderNumber}`);
            }
          }
        }
      } catch {
        // Ignored
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderNumber, router]);

  // 2. Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 3. Background Polling for Automatic Payment Confirmation
  useEffect(() => {
    if (!order || order.status === "PAID" || order.status === "PROCESSING") return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/checkout/orders/${order.orderNumber}`);
        if (res.ok) {
          const json = await res.json();
          if (
            json.success &&
            json.data &&
            (json.data.status === "PAID" || json.data.status === "PROCESSING")
          ) {
            toast.success("Payment Received!", "Your order is now confirmed.");
            router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
          }
        }
      } catch {
        // Polling failure non-fatal
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [order, router]);

  // 4. Verify UPI Payment
  const handleVerifyUpi = async () => {
    if (!order) return;
    setVerifying(true);

    try {
      const res = await fetch(`/api/v1/checkout/orders/${order.id}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "UPI",
          transactionId: utr.trim() || `upi_manual_${Date.now()}`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Payment Verified!", "Your payment has been recorded.");
        router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
      } else {
        toast.error("Verification Pending", json.message || "Could not verify payment yet. Please check again in a moment.");
      }
    } catch {
      toast.error("Network Error", "Unable to reach verification service.");
    } finally {
      setVerifying(false);
    }
  };

  // 5. Authorize Razorpay Test/Sandbox Payment
  const handleAuthorizeSandboxRazorpay = async () => {
    if (!order) return;
    setVerifying(true);

    try {
      const res = await fetch(`/api/v1/checkout/orders/${order.id}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "RAZORPAY",
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpayOrderId: order.razorpayOrderId || "order_sim_123",
          razorpaySignature: "mock_signature_valid",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Payment Successful", "Sandbox test payment authorized.");
        router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
      } else {
        toast.error("Payment Failed", json.message || "Failed to authorize sandbox payment.");
      }
    } catch {
      toast.error("Network Error", "Unable to complete payment simulation.");
    } finally {
      setVerifying(false);
    }
  };

  const copyVpa = () => {
    navigator.clipboard.writeText("phonepe.merchant@ybl");
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-dark-brown/60 space-y-3">
        <div className="w-7 h-7 border-2 border-muted-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading secure payment gateway...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4 px-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-serif text-xl text-charcoal">Order Not Found</h2>
        <p className="text-xs text-dark-brown/70">
          We could not locate this order. Please return to the cart to place your order.
        </p>
        <Link href="/cart">
          <Button className="bg-charcoal text-white text-xs px-5 py-2">Return to Bag</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-6">
        {/* Header navigation & security badge */}
        <div className="flex items-center justify-between pb-3 border-b border-champagne/40">
          <Link
            href="/checkout"
            className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Checkout</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-gold font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Payment</span>
          </div>
        </div>

        {/* Order Amount Banner */}
        <div className="bg-white rounded-2xl border border-champagne/60 p-6 sm:p-7 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-gold block">
              Payment Pending
            </span>
            <h1 className="font-serif text-xl sm:text-2xl text-charcoal mt-0.5">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-dark-brown/70 mt-1">
              Customer: <span className="font-medium">{order.customerName}</span> ({order.customerEmail})
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-dark-brown/60 block">Amount Payable</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal text-muted-gold">
              ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </span>
            <div className="flex items-center gap-1.5 sm:justify-end text-xs text-amber-700 font-medium mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Left: {formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Payment Flow: UPI Option */}
        {order.paymentMethod === "UPI" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Dynamic QR Code Card (7 cols) */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-champagne/60 p-6 shadow-subtle text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal">
                  <QrCode className="w-4 h-4 text-muted-gold" />
                  <span>Scan QR Code to Pay</span>
                </div>

                <div className="p-3 bg-secondary-bg/50 rounded-2xl border border-champagne/40 inline-block mx-auto relative">
                  {order.upiQrDataUrl ? (
                    <img
                      src={order.upiQrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-56 h-56 mx-auto rounded-xl object-contain bg-white shadow-xs p-1"
                    />
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center text-xs text-dark-brown/60">
                      <QrCode className="w-10 h-10 mb-2 opacity-40 text-muted-gold" />
                      <span>Generating QR Code...</span>
                    </div>
                  )}

                  {/* Pulsing indicator */}
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-amber-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Awaiting Payment Reception</span>
                  </div>
                </div>

                <div className="text-xs text-dark-brown/70 space-y-1">
                  <p className="font-medium text-charcoal">Supported Apps:</p>
                  <p className="text-[11px] text-dark-brown/60">
                    PhonePe • Google Pay • Paytm • BHIM • CRED • Any Bank UPI App
                  </p>
                </div>

                <div className="pt-2 border-t border-champagne/30 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-champagne-light/20 border border-champagne/40">
                    <span className="text-[11px] text-dark-brown/80 font-medium">UPI ID / VPA:</span>
                    <button
                      type="button"
                      onClick={copyVpa}
                      className="text-xs font-mono font-bold text-charcoal hover:text-muted-gold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>phonepe.merchant@ybl</span>
                      {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* UPI Mobile Apps / Intent & Verification (5 cols) */}
              <div className="md:col-span-5 space-y-5">
                {/* 1-Click Pay Buttons for Mobile */}
                <div className="bg-white rounded-2xl border border-champagne/60 p-6 shadow-subtle space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
                    <Smartphone className="w-4 h-4 text-muted-gold" />
                    <span>1-Click UPI App Launch</span>
                  </div>
                  <p className="text-[11px] text-dark-brown/60 leading-relaxed">
                    If browsing on mobile, tap below to open your preferred UPI application:
                  </p>

                  <div className="space-y-2 pt-1">
                    {order.intentLinks?.phonepe && (
                      <a
                        href={order.intentLinks.phonepe}
                        className="w-full flex items-center justify-center gap-2 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-xs font-medium py-2.5 rounded-xl transition-colors shadow-xs"
                      >
                        <span>Pay via PhonePe</span>
                      </a>
                    )}

                    {order.intentLinks?.gpay && (
                      <a
                        href={order.intentLinks.gpay}
                        className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-black text-white text-xs font-medium py-2.5 rounded-xl transition-colors shadow-xs"
                      >
                        <span>Pay via Google Pay</span>
                      </a>
                    )}

                    {order.intentLinks?.paytm && (
                      <a
                        href={order.intentLinks.paytm}
                        className="w-full flex items-center justify-center gap-2 bg-[#002e6e] hover:bg-[#001f4a] text-white text-xs font-medium py-2.5 rounded-xl transition-colors shadow-xs"
                      >
                        <span>Pay via Paytm</span>
                      </a>
                    )}

                    {order.intentLinks?.generic && (
                      <a
                        href={order.intentLinks.generic}
                        className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-charcoal text-xs font-medium py-2.5 rounded-xl transition-colors border border-stone-300"
                      >
                        <span>Open Other UPI App</span>
                      </a>
                    )}

                    {order.redirectUrl && (
                      <a
                        href={order.redirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-muted-gold hover:bg-charcoal text-white text-xs font-medium py-2.5 rounded-xl transition-colors shadow-xs mt-2"
                      >
                        <span>Proceed to PhonePe Gateway</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Manual Confirmation / UTR Input */}
                <div className="bg-white rounded-2xl border border-champagne/60 p-6 shadow-subtle space-y-3">
                  <h3 className="font-semibold text-xs text-charcoal">Completed Payment?</h3>
                  <p className="text-[11px] text-dark-brown/60 leading-relaxed">
                    Our system checks automatically. You can also enter the 12-digit UTR number from your payment receipt for instant verification:
                  </p>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="e.g. 428912345678 (UTR Ref)"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      className="text-xs h-9.5"
                    />

                    <Button
                      type="button"
                      onClick={handleVerifyUpi}
                      disabled={verifying}
                      className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs py-2.5 cursor-pointer shadow-subtle"
                    >
                      {verifying ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying with Bank...</span>
                        </span>
                      ) : (
                        <span>I Have Completed Payment →</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Flow: Razorpay Sandbox Mode */}
        {order.paymentMethod === "RAZORPAY" && (
          <div className="bg-white rounded-2xl border border-champagne/60 p-7 shadow-subtle space-y-5 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-lg text-charcoal">Online Payment Gateway (Razorpay)</h2>
              <p className="text-xs text-dark-brown/70 leading-relaxed">
                Development Sandbox Mode active. In production, this launches the Razorpay card/netbanking checkout popup.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary-bg/60 border border-champagne/60 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-dark-brown/60">Payable Amount:</span>
                <span className="font-bold text-charcoal">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-brown/60">Gateway Status:</span>
                <span className="text-emerald-700 font-semibold">Test Sandbox Ready</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAuthorizeSandboxRazorpay}
              disabled={verifying}
              className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs py-3.5 cursor-pointer shadow-subtle transition-colors"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing Test Payment...</span>
                </span>
              ) : (
                <span>Authorize & Confirm Payment (₹{Number(order.totalAmount).toLocaleString("en-IN")})</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-dark-brown/60 space-y-3">
          <div className="w-7 h-7 border-2 border-muted-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading secure payment gateway...</p>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

