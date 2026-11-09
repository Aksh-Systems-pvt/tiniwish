"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { OrderDTO } from "@/types/checkout";
import { CheckCircle2, Package, Truck, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/checkout/orders/${orderNumber}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setOrder(json.data);
          }
        }
      } catch {
        // Fallback
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
        {/* Celebration Header */}
        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-10 text-center space-y-4 shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[11px] uppercase tracking-widest text-muted-gold font-semibold">
            Order Confirmed & Reserved
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">
            Thank you for your purchase!
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 max-w-md mx-auto leading-relaxed">
            We are preparing your handcrafted treasures with care. A confirmation email and tracking link have been dispatched.
          </p>

          {/* Order Number Badge */}
          {orderNumber && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-bg/60 border border-champagne/60 text-xs font-semibold text-charcoal">
              <span>Order Ref:</span>
              <span className="font-mono text-muted-gold font-bold">{orderNumber}</span>
              <button
                type="button"
                onClick={copyOrderNumber}
                className="text-dark-brown/50 hover:text-charcoal transition-colors ml-1 cursor-pointer"
                title="Copy Order Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        {order && (
          <div className="bg-white rounded-2xl border border-champagne/60 p-6 sm:p-8 space-y-6 shadow-subtle text-xs">
            {/* Delivery Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-champagne/30">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-charcoal">
                  <Truck className="w-4 h-4 text-muted-gold" />
                  <span>Delivery Address</span>
                </div>
                <p className="font-medium">{order.shippingAddressSnapshot.fullName}</p>
                <p className="text-dark-brown/70 leading-relaxed">
                  {order.shippingAddressSnapshot.addressLine1}, {order.shippingAddressSnapshot.addressLine2}
                </p>
                <p className="text-dark-brown/70">
                  {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state} -{" "}
                  {order.shippingAddressSnapshot.pincode}
                </p>
                <p className="text-dark-brown/60">Phone: +91 {order.shippingAddressSnapshot.phone}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-charcoal">
                  <Package className="w-4 h-4 text-muted-gold" />
                  <span>Fulfillment & Payment</span>
                </div>
                <p className="text-dark-brown/70">
                  <strong className="text-charcoal">Payment Mode: </strong>
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay Online Payment"}
                </p>
                <p className="text-dark-brown/70">
                  <strong className="text-charcoal">Status: </strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {order.status}
                  </span>
                </p>
                <p className="text-dark-brown/70">
                  <strong className="text-charcoal">Estimated Arrival: </strong>
                  3-5 business days via Insured Express Air
                </p>
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-charcoal">Purchased Items ({order.items.length})</h3>
              <div className="divide-y divide-champagne/20">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-bg/50 border border-champagne/40 shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.productTitle}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-charcoal">{item.productTitle}</p>
                        <p className="text-[11px] text-dark-brown/60">
                          Qty: {item.quantity} • {item.variantTitle}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-charcoal">
                      ₹{item.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-champagne/30 space-y-1.5 text-right">
              <p className="text-dark-brown/70">
                Subtotal: <strong className="text-charcoal">₹{order.subtotal.toLocaleString("en-IN")}</strong>
              </p>
              {order.discountAmount > 0 && (
                <p className="text-emerald-700 font-medium">
                  Coupon Discount: -₹{order.discountAmount.toLocaleString("en-IN")}
                </p>
              )}
              <p className="text-dark-brown/70">
                Shipping Fee:{" "}
                <strong className="text-charcoal">
                  {order.shippingFee === 0 ? "Free" : `₹${order.shippingFee}`}
                </strong>
              </p>
              <p className="font-serif text-base font-semibold text-charcoal pt-1">
                Grand Total: <span className="text-muted-gold font-bold">₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/products" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-3 cursor-pointer">
              Continue Shopping
            </Button>
          </Link>

          <Link href="/track-order" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-champagne text-dark-brown hover:bg-secondary-bg text-xs px-6 py-3 cursor-pointer"
            >
              Track Order Status →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-dark-brown/60">
          Loading order confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

