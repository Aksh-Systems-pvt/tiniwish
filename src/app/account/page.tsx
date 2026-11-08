"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

interface OrderItem {
  id: string;
  title: string;
  price: number | string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number | string;
  createdAt: string;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: string;
  createdAt: string;
  addresses: Address[];
  orders: Order[];
  stats: {
    totalOrders: number;
    totalReviews: number;
  };
}

const ADMIN_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER", "ORDER_MANAGER"];

function AccountDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses" | "settings">("overview");

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          router.push("/login?redirectTo=/account");
          return;
        }
        const data = await res.json();
        if (data.success && data.data) {
          setProfile(data.data);
          setFirstName(data.data.firstName || "");
          setLastName(data.data.lastName || "");
          setPhone(data.data.phone || "");
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || undefined,
          phone: phone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfileMessage({ text: data.message || "Failed to update profile", type: "error" });
        setSavingProfile(false);
        return;
      }

      setProfileMessage({ text: "Profile updated successfully.", type: "success" });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              phone: data.data.phone,
            }
          : null
      );
      setIsEditing(false);
    } catch {
      setProfileMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-800 mb-3" />
        <p className="text-sm font-serif tracking-wider">Accessing your luxury suite...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center">
        <AlertCircle className="w-10 h-10 text-amber-700 mx-auto mb-3" />
        <h2 className="text-lg font-serif mb-2">Session Required</h2>
        <p className="text-xs text-stone-500 mb-4">Please log in to review your customer account.</p>
        <Link
          href="/login"
          className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 h-10 rounded-xl inline-flex items-center justify-center text-sm font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const isStaff = ADMIN_ROLES.includes(profile.role);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Access alert if forbidden from admin */}
      {errorParam === "unauthorized_admin_access" && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Staff Only Area:</strong> Your account does not currently hold administrative permissions. You have been redirected to your personal concierge suite.
          </div>
        </div>
      )}

      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl shadow-stone-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-200 font-serif text-2xl font-semibold">
              {profile.firstName ? profile.firstName[0].toUpperCase() : "T"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl text-amber-50 tracking-tight">
                  {profile.firstName ? `${profile.firstName} ${profile.lastName || ""}` : "Honored Guest"}
                </h1>
                <Badge className="bg-amber-800/80 hover:bg-amber-800 text-amber-100 text-[10px] tracking-widest uppercase border border-amber-500/30">
                  {profile.role}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 font-light">
                {profile.email} {profile.phone && `• +91 ${profile.phone}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isStaff && (
              <Link
                href="/admin"
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium text-xs px-3.5 py-2 rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-stone-700 bg-stone-800/60 hover:bg-stone-800 text-stone-200 hover:text-white text-xs rounded-xl cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800/80 text-stone-300">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Orders Placed</span>
            <span className="font-serif text-xl text-amber-200">{profile.stats.totalOrders}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Saved Addresses</span>
            <span className="font-serif text-xl text-amber-200">{profile.addresses.length}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Member Since</span>
            <span className="text-xs text-stone-300">
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Tier Status</span>
            <span className="text-xs text-amber-400 font-medium inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gold Privileges
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-8 mb-8 text-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 font-medium transition-colors cursor-pointer ${
            activeTab === "overview"
              ? "border-b-2 border-stone-900 text-stone-900"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Overview & Profile
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 font-medium transition-colors cursor-pointer ${
            activeTab === "orders"
              ? "border-b-2 border-stone-900 text-stone-900"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          My Orders ({profile.orders.length})
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`pb-3 font-medium transition-colors cursor-pointer ${
            activeTab === "addresses"
              ? "border-b-2 border-stone-900 text-stone-900"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Saved Addresses ({profile.addresses.length})
        </button>
      </div>

      {/* Tab 1: Overview & Profile Edit */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-amber-800" />
                  <h2 className="font-serif text-lg text-stone-900">Personal Details</h2>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="h-8 px-3 text-xs border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 mr-1.5" /> Edit Details
                  </Button>
                )}
              </div>

              {profileMessage && (
                <div
                  className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                        First Name
                      </label>
                      <Input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-9 text-sm"
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
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                      Mobile Number (+91)
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-stone-900 text-amber-50 h-9 px-4 text-xs font-medium cursor-pointer"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      className="h-9 px-3 text-xs text-stone-600 cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <dt className="text-stone-400 uppercase text-[10px] tracking-wider mb-0.5">Full Name</dt>
                    <dd className="font-medium text-stone-800">
                      {profile.firstName || profile.lastName
                        ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
                        : "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-400 uppercase text-[10px] tracking-wider mb-0.5">Primary Email</dt>
                    <dd className="font-medium text-stone-800">{profile.email}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400 uppercase text-[10px] tracking-wider mb-0.5">Mobile Contact</dt>
                    <dd className="font-medium text-stone-800">
                      {profile.phone ? `+91 ${profile.phone}` : "No phone linked"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-400 uppercase text-[10px] tracking-wider mb-0.5">Account Role</dt>
                    <dd className="font-medium text-stone-800">{profile.role}</dd>
                  </div>
                </dl>
              )}
            </div>

            {/* Recent Orders Sneak Peek */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-800" />
                  <h2 className="font-serif text-lg text-stone-900">Recent Orders</h2>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-amber-800 font-medium hover:underline cursor-pointer"
                >
                  View all ({profile.orders.length})
                </button>
              </div>

              {profile.orders.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>You have not placed any orders yet.</p>
                  <Link
                    href="/products"
                    className="mt-3 bg-stone-900 hover:bg-stone-800 text-amber-50 text-xs h-8 px-3 rounded-lg inline-flex items-center justify-center font-medium transition-colors"
                  >
                    Discover Treasures
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-stone-900 block">#{order.orderNumber}</span>
                        <span className="text-stone-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-stone-900 block">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                        <Badge variant="outline" className="text-[10px] font-normal uppercase">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Concierge Perks Card */}
          <div className="space-y-6">
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200/70 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <h3 className="font-serif text-base text-amber-950 font-medium">Bespoke Concierge</h3>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed mb-4">
                As a valued patron of TiniWish, you are entitled to personalized gifting assistance, custom packaging requests, and insured domestic delivery.
              </p>
              <div className="text-xs space-y-2 text-amber-900">
                <p><strong>Hotline:</strong> +91 8000 123 456</p>
                <p><strong>Email:</strong> care@tiniwish.com</p>
                <p><strong>Hours:</strong> Mon - Sat, 10 AM - 7 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders List */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900 mb-4">Order History</h2>
          {profile.orders.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40 text-stone-600" />
              <p className="text-sm font-medium text-stone-600 mb-1">No Orders Recorded</p>
              <p className="text-xs text-stone-400 mb-4">Your handcrafted wishes will appear here once placed.</p>
              <Link
                href="/products"
                className="bg-stone-900 hover:bg-stone-800 text-amber-50 text-xs px-3 py-1.5 rounded-lg inline-flex items-center justify-center font-medium transition-colors"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {profile.orders.map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-stone-900 text-sm">Order #{order.orderNumber}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-normal">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </p>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-sm font-medium text-stone-900 block">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-stone-400">{order.items.length} item(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === "addresses" && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-stone-900">Saved Addresses</h2>
            <Button variant="outline" className="text-xs h-8 border-stone-200">
              <MapPin className="w-3.5 h-3.5 mr-1" /> Add New Address
            </Button>
          </div>

          {profile.addresses.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40 text-stone-600" />
              <p className="text-sm font-medium text-stone-600 mb-1">No Addresses Saved</p>
              <p className="text-xs text-stone-400">Save delivery locations for rapid express checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 rounded-xl border ${
                    address.isDefaultShipping ? "border-amber-300 bg-amber-50/20" : "border-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-stone-900">{address.fullName}</span>
                    {address.isDefaultShipping && (
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] border-amber-200">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    <br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-xs text-stone-500">Contact: +91 {address.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-800 mb-3" />
          <p className="text-sm font-serif tracking-wider">Accessing your luxury suite...</p>
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
