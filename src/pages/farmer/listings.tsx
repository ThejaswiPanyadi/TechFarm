import { useEffect, useState } from "react";
import Link from "next/link";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getFarmerListings, deleteListing } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

export default function MyListings() {
  useAuthGuard("farmer");
  const { user } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getFarmerListings(user.id)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this listing?")) return;
    await deleteListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <FarmerLayout>
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Crop & Seed Listings</h1>
          <Link href="/farmer/add-listing"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            + Add New Listing
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="mb-4">You have no listings yet.</p>
            <Link href="/farmer/add-listing" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">
              Add Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 bg-white shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-gray-600">Price: {item.price}</p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Location: {item.location}</p>
                    {item.type && (
                      <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {item.type}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`text-sm font-medium ${item.status === "Active" ? "text-green-600" : "text-gray-500"}`}>
                      {item.status}
                    </span>
                    <button onClick={() => handleDelete(item.id)}
                      className="border border-red-400 text-red-500 px-4 py-1 rounded hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
