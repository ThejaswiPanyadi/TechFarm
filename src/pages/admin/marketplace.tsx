import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Search, Eye, Trash2 } from "lucide-react";

interface Listing {
  id: string;
  product: string;
  type: string;
  seller: string;
  phone: string;
  location: string;
  price: string;
  quantity: string;
  posted: string;
  image: string;
}

export default function MarketplaceAdmin() {
  const [search, setSearch] = useState("");

  const listings: Listing[] = [
    {
      id: "1",
      product: "Organic Wheat Seeds",
      type: "Seed",
      seller: "Ramesh Kumar",
      phone: "+91 98765 43210",
      location: "Village Center",
      price: "₹45/kg",
      quantity: "50 kg",
      posted: "2 days ago",
      image: "/market-card.jpg",
    },
    {
      id: "2",
      product: "Fresh Tomatoes",
      type: "Crop",
      seller: "Suresh Patel",
      phone: "+91 87654 32109",
      location: "North District",
      price: "₹30/kg",
      quantity: "100 kg",
      posted: "1 day ago",
      image: "/market-card.jpg",
    },
    {
      id: "3",
      product: "Paddy Seeds (Basmati)",
      type: "Seed",
      seller: "Anjali Devi",
      phone: "+91 76543 21098",
      location: "South Block",
      price: "₹60/kg",
      quantity: "25 kg",
      posted: "3 hours ago",
      image: "/market-card.jpg",
    },
    {
      id: "4",
      product: "Mango Saplings",
      type: "Plant",
      seller: "Prakash Singh",
      phone: "+91 65432 10987",
      location: "East Zone",
      price: "₹150/kg",
      quantity: "20 plants",
      posted: "5 days ago",
      image: "/market-card.jpg",
    },
  ];

  const filteredListings = listings.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase()) ||
    item.seller.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">
          Marketplace Admin
        </h2>
        <p className="text-gray-600 mb-6">
          Monitor and manage crop/seed listings posted by farmers.
        </p>

        {/* Search */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search listings or sellers..."
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">4</p>
            <p className="text-gray-600">Total Listings</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">12</p>
            <p className="text-gray-600">Active Sellers</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">₹45K</p>
            <p className="text-gray-600">Listed Value</p>
          </div>

        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price</th>
                <th className="p-4">Posted</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredListings.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">

                  {/* Product */}
                  <td className="p-4 flex items-center gap-4">
                    <img
                      src={item.image}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold">{item.product}</p>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </div>
                  </td>

                  {/* Seller */}
                  <td className="p-4">
                    <p>{item.seller}</p>
                    <p className="text-sm text-gray-500">{item.phone}</p>
                  </td>

                  {/* Location */}
                  <td className="p-4">{item.location}</td>

                  {/* Price */}
                  <td className="p-4">
                    <p className="font-semibold">{item.price}</p>
                    <p className="text-sm text-gray-500">{item.quantity}</p>
                  </td>

                  {/* Posted */}
                  <td className="p-4">{item.posted}</td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">

                      <button className="p-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-100">
                        <Eye size={18} />
                      </button>

                      <button className="p-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-100">
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
