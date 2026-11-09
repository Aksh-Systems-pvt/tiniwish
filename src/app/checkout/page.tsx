"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/store-context";
import { CheckoutStepsNav, CheckoutStep } from "@/components/checkout/checkout-steps-nav";
import { AddressForm } from "@/components/checkout/address-form";
import { SavedAddressesSelector } from "@/components/checkout/saved-addresses-selector";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import {
  CheckoutAddressDTO,
  PaymentMethodType,
  CheckoutCalculationDTO,
  OrderDTO,
} from "@/types/checkout";
import { toast } from "@/components/ui/toast";
import {
  Lock,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id?: string | null;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, isHydrated } = useStore();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CheckoutAddressDTO[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddressDTO | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Guest Customer Information
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});

  // Checkout Options
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("RAZORPAY");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [calculation, setCalculation] = useState<CheckoutCalculationDTO | null>(null);

  // Status & Retries
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const idempotencyKeyRef = React.useRef<string | null>(null);

  const getOrCreateIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    return idempotencyKeyRef.current;
  };

  // Fetch current authenticated user & saved addresses
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.data?.user) {
            const u = meData.data.user;
            setCurrentUser({
              id: u.id,
              email: u.email,
              name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email.split("@")[0],
            });

            // Fetch saved addresses
            const addrRes = await fetch("/api/v1/user/addresses");
            if (addrRes.ok) {
              const addrData = await addrRes.json();
              if (Array.isArray(addrData.data) && addrData.data.length > 0) {
                setSavedAddresses(addrData.data);
                setSelectedAddress(addrData.data[0]);
              } else {
                setIsAddingNewAddress(true);
              }
            }
          }
        }
      } catch {
        // Guest mode
      }
    };

    fetchUserData();
  }, []);

  // Recalculate financials whenever address pincode, coupon, gift options, or payment method changes
  useEffect(() => {
    const activePincode = selectedAddress?.pincode;
    if (!activePincode || activePincode.length !== 6) return;

    const runCalculation = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch("/api/v1/checkout/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pincode: activePincode,
            couponCode: appliedCouponCode || null,
            paymentMethod,
            isGiftWrapped,
            items: cart.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCalculation(json.data);
          }
        }
      } catch {
        // Ignore calculation network errors
      } finally {
        setIsCalculating(false);
      }
    };

    runCalculation();
  }, [selectedAddress?.pincode, appliedCouponCode, isGiftWrapped, paymentMethod, cart]);

  // Load Razorpay Checkout SDK Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleApplyCoupon = async (code: string) => {
    setAppliedCouponCode(code);
  };

  const handleRemoveCoupon = async () => {
    setAppliedCouponCode("");
  };

  const handleAddressSubmit = (address: CheckoutAddressDTO) => {
    setSelectedAddress(address);
    setIsAddingNewAddress(false);
    setStep("payment");
  };

  const validateGuestDetails = (): boolean => {
    if (currentUser) return true;
    const errors: Record<string, string> = {};

    if (!guestName.trim()) {
      errors.name = "Full name is required";
    }
    if (!guestEmail.trim() || !guestEmail.includes("@")) {
      errors.email = "Valid email is required for order confirmation";
    }
    if (!/^[6-9]\d{9}$/.test(guestPhone.trim())) {
      errors.phone = "Valid 10-digit mobile number is required";
    }

    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Missing Address", "Please specify a delivery address.");
      setStep("address");
      return;
    }

    if (!validateGuestDetails()) {
      toast.error("Contact Details Missing", "Please provide your contact information.");
      setStep("address");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const customer = currentUser
      ? {
          name: currentUser.name || selectedAddress.fullName,
          email: currentUser.email,
          phone: selectedAddress.phone,
        }
      : {
          name: guestName || selectedAddress.fullName,
          email: guestEmail,
          phone: guestPhone || selectedAddress.phone,
        };

    const orderPayload = {
      idempotencyKey: getOrCreateIdempotencyKey(),
      customer,
      shippingAddress: selectedAddress,
      billingAddress: selectedAddress,
      paymentMethod,
      couponCode: appliedCouponCode || null,
      isGiftWrapped,
      giftOptions: isGiftWrapped ? { message: giftMessage } : null,
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/v1/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to place order. Please review your cart.");
      }

      const createdOrder: OrderDTO = json.data;

      // Handle Cash on Delivery
      if (paymentMethod === "COD") {
        clearCart();
        toast.success("Order Confirmed!", `Order ${createdOrder.orderNumber} placed via COD.`);
        router.push(`/checkout/success?orderNumber=${createdOrder.orderNumber}`);
        return;
      }

      // Handle Razorpay Online Payment
      if (paymentMethod === "RAZORPAY") {
        const razorpayKey = createdOrder.razorpayKeyId || "rzp_test_placeholderKeyId";

        // Check if Razorpay JS SDK loaded
        if (typeof window !== "undefined" && window.Razorpay && !razorpayKey.includes("placeholder")) {
          const options = {
            key: razorpayKey,
            amount: Math.round(createdOrder.totalAmount * 100),
            currency: "INR",
            name: "TiniWish",
            description: `Order ${createdOrder.orderNumber}`,
            image: "/icons/logo.png",
            order_id: createdOrder.razorpayOrderId ?? null,
            handler: async (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              try {
                const verifyRes = await fetch(
                  `/api/v1/checkout/orders/${createdOrder.id}/verify-payment`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpaySignature: response.razorpay_signature,
                    }),
                  }
                );

                if (verifyRes.ok) {
                  clearCart();
                  router.push(`/checkout/success?orderNumber=${createdOrder.orderNumber}`);
                } else {
                  throw new Error("Payment verification failed");
                }
              } catch {
                toast.error("Verification Error", "Payment received but verification failed. Support notified.");
              }
            },
            prefill: {
              name: customer.name,
              email: customer.email,
              contact: customer.phone,
            },
            theme: { color: "#292522" },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          setIsLoading(false);
        } else {
          // Development sandbox / test fallback verification
          const simRes = await fetch(
            `/api/v1/checkout/orders/${createdOrder.id}/verify-payment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayPaymentId: `pay_sim_${Date.now()}`,
                razorpayOrderId: createdOrder.razorpayOrderId || "order_sim_123",
                razorpaySignature: "mock_signature_valid",
              }),
            }
          );

          if (simRes.ok) {
            clearCart();
            toast.success("Payment Received", "Your order has been confirmed.");
            router.push(`/checkout/success?orderNumber=${createdOrder.orderNumber}`);
          } else {
            throw new Error("Sandbox payment verification failed");
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while placing your order.";
      setErrorMessage(msg);
      toast.error("Checkout Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Empty cart guard
  if (isHydrated && cart.length === 0) {
    return (
      <div className="py-20 bg-primary-bg min-h-screen">
        <div className="container mx-auto px-4 max-w-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-champagne-light/70 text-muted-gold mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-charcoal">Your Shopping Bag is Empty</h1>
          <p className="text-xs text-dark-brown/70 leading-relaxed font-light">
            You don&apos;t have any items in your bag to checkout. Explore our artisanal jewellery and bespoke gift curations.
          </p>
          <Link href="/products" className="inline-block">
            <Button className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-3 cursor-pointer">
              Explore Collections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        {/* Checkout Header */}
        <div className="flex items-center justify-between pb-4 border-b border-champagne/40">
          <Link
            href="/cart"
            className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-gold font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Checkout</span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <CheckoutStepsNav currentStep={step} onStepClick={(s) => setStep(s)} />

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block">Checkout Interrupted:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Action Form (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Information (Guest or Logged In) */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne/60 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
                <h3 className="font-serif text-lg text-charcoal">1. Contact Information</h3>
                {currentUser ? (
                  <span className="text-[11px] text-muted-gold font-semibold">
                    Signed in as {currentUser.email}
                  </span>
                ) : (
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-xs font-medium text-muted-gold hover:underline"
                  >
                    Have an account? Sign in
                  </Link>
                )}
              </div>

              {currentUser ? (
                <div className="text-xs text-dark-brown/80 space-y-1">
                  <p className="font-semibold text-charcoal">{currentUser.name}</p>
                  <p>{currentUser.email}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Priyanshu Roy"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={`text-xs h-9.5 ${guestErrors.name ? "border-red-400" : ""}`}
                    />
                    {guestErrors.name && (
                      <p className="text-[10px] text-red-500 mt-0.5">{guestErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="you@domain.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className={`text-xs h-9.5 ${guestErrors.email ? "border-red-400" : ""}`}
                    />
                    {guestErrors.email && (
                      <p className="text-[10px] text-red-500 mt-0.5">{guestErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="10 Digits (e.g. 9876543210)"
                      value={guestPhone}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setGuestPhone(clean);
                      }}
                      className={`text-xs h-9.5 ${guestErrors.phone ? "border-red-400" : ""}`}
                    />
                    {guestErrors.phone && (
                      <p className="text-[10px] text-red-500 mt-0.5">{guestErrors.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 1: Address Selection / Form */}
            {step === "address" && (
              <div>
                {savedAddresses.length > 0 && !isAddingNewAddress ? (
                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne/60 shadow-subtle space-y-5">
                    <SavedAddressesSelector
                      addresses={savedAddresses}
                      selectedAddress={selectedAddress}
                      onSelect={(addr) => setSelectedAddress(addr)}
                      onAddNew={() => setIsAddingNewAddress(true)}
                    />

                    <div className="pt-3 border-t border-champagne/30 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!selectedAddress) {
                            toast.error("Selection Required", "Please select a delivery address.");
                            return;
                          }
                          setStep("payment");
                        }}
                        className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2.5 cursor-pointer shadow-subtle"
                      >
                        Proceed to Payment Method →
                      </Button>
                    </div>
                  </div>
                ) : (
                  <AddressForm
                    initialData={selectedAddress || {}}
                    isLoggedIn={!!currentUser}
                    onSubmit={handleAddressSubmit}
                    onCancel={savedAddresses.length > 0 ? () => setIsAddingNewAddress(false) : undefined}
                    submitButtonText="Save & Proceed to Payment →"
                  />
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === "payment" && (
              <div className="space-y-6">
                {/* Selected Address Summary Banner */}
                {selectedAddress && (
                  <div className="p-4 rounded-xl bg-champagne-light/30 border border-champagne/60 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-semibold text-charcoal">Delivering to: </span>
                      <span className="text-dark-brown/80 font-medium">
                        {selectedAddress.fullName} ({selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("address")}
                      className="text-xs font-semibold text-muted-gold hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelect={(m) => setPaymentMethod(m)}
                  isCodAvailable={calculation?.isCodAvailable ?? true}
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    className="text-xs font-medium text-dark-brown/70 hover:text-charcoal inline-flex items-center gap-1 cursor-pointer"
                  >
                    ← Edit Address
                  </button>

                  <Button
                    type="button"
                    onClick={() => setStep("review")}
                    className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2.5 cursor-pointer shadow-subtle"
                  >
                    Review Order & Place →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Final Review & Purchase Confirmation */}
            {step === "review" && (
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-champagne/60 shadow-subtle space-y-6">
                <div className="pb-3 border-b border-champagne/30 flex items-center justify-between">
                  <h3 className="font-serif text-lg text-charcoal">3. Final Order Review</h3>
                  <span className="text-[11px] font-semibold text-muted-gold uppercase tracking-wider">
                    Ready to Confirm
                  </span>
                </div>

                {/* Review Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-secondary-bg/30 border border-champagne/40 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-charcoal mb-1">
                      <span>Delivery Address</span>
                      <button
                        type="button"
                        onClick={() => setStep("address")}
                        className="text-muted-gold hover:underline text-[11px]"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-medium">{selectedAddress?.fullName}</p>
                    <p className="text-dark-brown/70">
                      {selectedAddress?.addressLine1}, {selectedAddress?.addressLine2}
                    </p>
                    <p className="text-dark-brown/70">
                      {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                    </p>
                    <p className="text-dark-brown/60">Phone: +91 {selectedAddress?.phone}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary-bg/30 border border-champagne/40 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-charcoal mb-1">
                      <span>Payment Method</span>
                      <button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="text-muted-gold hover:underline text-[11px]"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-medium text-charcoal">
                      {paymentMethod === "RAZORPAY" ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}
                    </p>
                    <p className="text-dark-brown/70 text-[11px]">
                      {paymentMethod === "RAZORPAY"
                        ? "UPI, Cards, RuPay, NetBanking"
                        : "Pay cash/UPI at doorstep upon delivery"}
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complimentary Shipping</span>
                    </div>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <div className="pt-4 border-t border-champagne/30 space-y-3">
                  <Button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || isCalculating}
                    className="w-full bg-charcoal hover:bg-muted-gold text-white font-medium text-sm py-4 rounded-xl cursor-pointer shadow-subtle transition-all duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Confirming & Placing Order...</span>
                      </span>
                    ) : (
                      <span>
                        Confirm & Place Order • ₹{calculation?.grandTotal.toLocaleString("en-IN") || ""}
                      </span>
                    )}
                  </Button>

                  <p className="text-[11px] text-center text-dark-brown/60">
                    By clicking Confirm, you agree to TiniWish&apos;s{" "}
                    <Link href="/terms" className="underline hover:text-muted-gold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/return-policy" className="underline hover:text-muted-gold">
                      Return Policy
                    </Link>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Order Summary Sidebar (5 Columns) */}
          <div className="lg:col-span-5 sticky top-24">
            <CheckoutOrderSummary
              items={cart}
              calculation={calculation}
              couponCode={appliedCouponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              isGiftWrapped={isGiftWrapped}
              onToggleGiftWrap={(w) => setIsGiftWrapped(w)}
              giftMessage={giftMessage}
              onGiftMessageChange={(m) => setGiftMessage(m)}
              isApplyingCoupon={isCalculating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
