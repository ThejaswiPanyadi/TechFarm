import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Search, Eye, Trash2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/lib/supabase";
import { deleteListing } from "@/lib/db";

export default function MarketplaceAdmin() {
  useAuthGuard("admin");

  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*, profiles(full_name, phone)")
      .order("created_at", { ascending: false });
    if (!error) setListings(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this listing?")) return;
    await deleteListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  const filtered = listings.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = listings.reduce((sum, l) => {
    const num = parseFloat(l.price?.replace(/[^0-9.]/g, "") || "0");
    return sum + num;
  }, 0);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Marketplace Admin</h2>
        <p className="text-gray-600 mb-6">Monitor and manage crop/seed listings posted by farmers.</p>

        {/* Search */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" placeholder="Search listings or sellers..."
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">{listings.length}</p>
            <p className="text-gray-600">Total Listings</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">{listings.filter((l) => l.status === "Active").length}</p>
            <p className="text-gray-600">Active Listings</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">
              {new Set(listings.map((l) => l.farmer_id)).size}
            </p>
            <p className="text-gray-600">Unique Sellers</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading listings...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No listings found.</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </td>
                    <td className="p-4">
                      <p>{item.profiles?.full_name ?? "—"}</p>
                      <p className="text-sm text-gray-500">{item.profiles?.phone ?? ""}</p>
                    </td>
                    <td className="p-4">{item.location}</td>
                    <td className="p-4">
                      <p className="font-semibold">{item.price}</p>
                      <p className="text-sm text-gray-500">{item.quantity}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "Active" ? "bg-green-100 text-green-700"
                          : item.status === "Sold" ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>{item.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button className="p-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-100"
                          onClick={() => handleDelete(item.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
