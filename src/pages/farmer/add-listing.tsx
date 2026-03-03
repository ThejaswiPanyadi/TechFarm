import FarmerLayout from "@/components/layout/FarmerLayout";

export default function AddListing() {
  return (
    <FarmerLayout>
      <div className="max-w-xl bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">
          Add New Crop / Seed Listing
        </h1>

        <form className="space-y-4">
          {/* Crop Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Crop / Seed Name
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter crop or seed name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Price
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. ₹50 per plant"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. 500 plants / 200 kg"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Plantation Location
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Village / Place"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder="Brief description about crop/seed"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Crop / Seed Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Submit Listing
          </button>
        </form>
      </div>
    </FarmerLayout>
  );
}
