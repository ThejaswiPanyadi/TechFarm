// pages/farmer/index.tsx
import { useEffect, useState } from "react";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { ClipboardList, ShoppingBasket, Tractor, Plus, Store } from "lucide-react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getFarmerStats, getFarmerBookings } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

export default function FarmerDashboard() {
  useAuthGuard("farmer");
  const { user } = useAuth();

  const [stats, setStats] = useState({ activeBookings: 0, myListings: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [s, bookings] = await Promise.all([
        getFarmerStats(user!.id),
        getFarmerBookings(user!.id),
      ]);
      setStats(s);
      setRecentBookings(bookings.slice(0, 3));
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <FarmerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Farmer! 👋</h1>
          <p className="text-muted-foreground mt-1">Manage your machine rentals and crop listings from here.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                  <ClipboardList className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeBookings}</p>
                  <p className="text-muted-foreground">Active Bookings</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                  <ShoppingBasket className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.myListings}</p>
                  <p className="text-muted-foreground">My Listings</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/farmer/machines">
                <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center">
                      <Tractor className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Rent a Machine</p>
                      <p className="text-sm text-muted-foreground">Browse available farm machinery</p>
                    </div>
                  </div>
                  <span>→</span>
                </div>
              </Link>
              <Link href="/farmer/add-listing">
                <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                      <Plus className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Add Listing</p>
                      <p className="text-sm text-muted-foreground">Sell your crops, seeds, or plants</p>
                    </div>
                  </div>
                  <span>→</span>
                </div>
              </Link>
              <Link href="/marketplace">
                <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center">
                      <Store className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Browse Marketplace</p>
                      <p className="text-sm text-muted-foreground">Find crops from other farmers</p>
                    </div>
                  </div>
                  <span>→</span>
                </div>
              </Link>
            </div>

            {/* Recent Bookings */}
            <div className="bg-card rounded-2xl shadow-sm">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Recent Bookings</h2>
                <Link href="/farmer/bookings" className="text-sm text-muted-foreground hover:text-foreground">View All →</Link>
              </div>
              <div className="divide-y">
                {recentBookings.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No bookings yet.</p>
                ) : recentBookings.map((b) => (
                  <div key={b.id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{b.machines?.name ?? "Machine"}</p>
                      <p className="text-sm text-muted-foreground">{b.from_date} – {b.to_date}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${b.status === "Approved" ? "bg-green-100 text-green-700"
                        : b.status === "Pending" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </FarmerLayout>
  );
}
