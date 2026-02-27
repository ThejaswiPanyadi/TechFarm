import { useState } from "react";
import { useRouter } from "next/router";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { addListing } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

export default function AddListing() {
  useAuthGuard("farmer");
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "Crop",
    price: "",
    quantity: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await addListing({ ...form, farmer_id: user.id });
      router.push("/farmer/listings");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FarmerLayout>
      <div className="max-w-xl bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Add New Crop / Seed Listing</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Crop / Seed Name *</label>
            <input type="text" required className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter crop or seed name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full border rounded-lg px-3 py-2"
              value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Crop</option>
              <option>Seed</option>
              <option>Plant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input type="text" required className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. ₹50 per plant"
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. 500 plants / 200 kg"
              value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input type="text" required className="w-full border rounded-lg px-3 py-2"
              placeholder="Village / Place"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border rounded-lg px-3 py-2" rows={3}
              placeholder="Brief description about crop/seed"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60">
            {loading ? "Submitting..." : "Submit Listing"}
          </button>
        </form>
      </div>
    </FarmerLayout>
  );
}
