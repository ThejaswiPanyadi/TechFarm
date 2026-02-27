import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { getAllListings } from "@/lib/db";

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    loadListings();
  }, [searchTerm, locationFilter]);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await getAllListings(searchTerm, locationFilter);
      setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchTerm(searchInput);
    setLocationFilter(locationInput);
  }

  return (
    <Layout>
      <div className="px-6 md:px-16 py-10">
        <h1 className="text-3xl font-bold mb-4">Crop & Seed Marketplace</h1>
        <p className="text-gray-600 mb-6">Search and connect with farmers selling crops and seeds.</p>

        {/* Search & Filter */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input type="text" placeholder="Search crop or seed name"
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="text" placeholder="Filter by location"
            value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button type="submit"
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition">
            Search
          </button>
        </form>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No listings found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name}
                    className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                    🌾 No Image
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  {item.type && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{item.type}</span>
                  )}
                </div>
                <p className="text-gray-700 mt-1 font-medium">{item.price}</p>
                {item.quantity && <p className="text-sm text-gray-600">Qty: {item.quantity}</p>}
                <p className="text-sm text-gray-600">📍 {item.location}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Seller: {item.profiles?.full_name ?? "Farmer"}
                </p>

                <Link href={`/marketplace/${item.id}`}
                  className="inline-block mt-4 text-green-600 font-medium hover:underline">
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
