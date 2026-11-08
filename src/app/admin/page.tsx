import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { userRepository } from "@/repositories/user.repository";
import { Shield, Users, ShoppingBag, Package, Key, ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ADMIN_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER", "ORDER_MANAGER"];

async function AdminContent() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/admin");
  }

  const dbUser = await userRepository.findBySupabaseUid(authUser.id);

  if (!dbUser || !ADMIN_ROLES.includes(dbUser.role) || !dbUser.isActive || dbUser.deletedAt !== null) {
    redirect("/account?error=unauthorized_admin_access");
  }

  return (
    <div className="min-h-screen bg-stone-100/70 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Admin Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-900 text-amber-200 flex items-center justify-center font-serif text-xl font-bold">
              TW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl text-stone-900">
                  TiniWish Admin Management Suite
                </h1>
                <Badge className="bg-amber-800 text-amber-100 text-[10px] uppercase tracking-wider">
                  {dbUser.role}
                </Badge>
              </div>
              <p className="text-xs text-stone-500">
                Logged in as <span className="font-medium text-stone-700">{dbUser.email}</span> (Server-Side Verified)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs h-9 px-3 border border-stone-300 rounded-lg inline-flex items-center text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Boutique
            </Link>
            <Link
              href="/account"
              className="bg-stone-900 hover:bg-stone-800 text-amber-50 text-xs h-9 px-3.5 rounded-lg inline-flex items-center font-medium transition-colors"
            >
              Patron Suite
            </Link>
          </div>
        </div>

        {/* Security & Access Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <strong>RBAC Enforcement Active:</strong> Server-side authorization check confirmed role{" "}
            <code className="font-semibold">{dbUser.role}</code>. Customer roles are prevented from viewing or modifying administrative systems.
          </div>
        </div>

        {/* Admin Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Products</span>
              <ShoppingBag className="w-4 h-4 text-amber-800" />
            </div>
            <div className="font-serif text-2xl font-medium text-stone-900">Catalogue</div>
            <p className="text-[11px] text-stone-400 mt-1">Jewellery, Gifts & Home Décor</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Orders</span>
              <Package className="w-4 h-4 text-amber-800" />
            </div>
            <div className="font-serif text-2xl font-medium text-stone-900">Shipments</div>
            <p className="text-[11px] text-stone-400 mt-1">Shiprocket & Dispatch Tracker</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Customers</span>
              <Users className="w-4 h-4 text-amber-800" />
            </div>
            <div className="font-serif text-2xl font-medium text-stone-900">Patron Registry</div>
            <p className="text-[11px] text-stone-400 mt-1">Profiles & Delivery Addresses</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Security</span>
              <Key className="w-4 h-4 text-amber-800" />
            </div>
            <div className="font-serif text-2xl font-medium text-stone-900">Supabase Auth</div>
            <p className="text-[11px] text-stone-400 mt-1">HTTP-Only SSL Session Security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100/70 p-10 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-800 mb-3" />
          <p className="text-sm font-serif tracking-wider">Verifying administrative authorization...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
