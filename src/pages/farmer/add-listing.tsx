import { useState, useRef } from "react";
import { useRouter } from "next/router";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { addListing } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PreviewFile {
  file: File;
  previewUrl: string;
}

export default function AddListing() {
  const { t } = useLanguage();
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
  const [phone, setPhone] = useState("");
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPreviews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    // Reset input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadImages(): Promise<string[]> {
    if (previews.length === 0) return [];
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const { file } of previews) {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, file, { upsert: false });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}. Make sure you created the 'listing-images' bucket in Supabase Storage and set it to Public.`);
        }

        const { data } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);
        if (data?.publicUrl) urls.push(data.publicUrl);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // 10-digit phone validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageUrls = await uploadImages();
      await addListing({
        ...form,
        farmer_id: user.id,
        phone: phone || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      router.push("/farmer/listings");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FarmerLayout>
      {/* Centered container */}
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-1">{t("addNewListing")}</h1>
          <p className="text-sm text-gray-500 mb-6">{t("listingFormDesc")}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Crop Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("cropName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="e.g. Arecanut Seedlings, Paddy Seeds"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("cropType")}</label>
              <select
                className="w-full border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Crop">Crop</option>
                <option value="Seed">Seed</option>
                <option value="Plant">Plant</option>
              </select>
            </div>

            {/* Price & Quantity — side by side on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t("price")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="e.g. ₹50"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("quantity")}</label>
                <input
                  type="text"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="e.g. 500"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("cropLocation")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Village / Town"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            {/* Farmer Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("farmerPhone")} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              <p className="text-xs text-gray-500 mt-1">{t("phoneHint")}</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("description")}</label>
              <textarea
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
                rows={3}
                placeholder={t("descPlaceholder")}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("photos")}</label>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {previews.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border shadow-sm">
                      <img src={p.previewUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 w-full text-sm text-gray-500 hover:border-green-500 hover:text-green-600 transition"
              >
                <ImagePlus className="w-5 h-5" />
                <span>
                  {previews.length === 0
                    ? t("tapToAdd")
                    : `${previews.length} photo${previews.length > 1 ? "s" : ""} selected — tap to add more`}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-gray-500 mt-1">You can upload multiple photos at once.</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-60"
            >
              {uploading ? t("uploadingPhotos") : loading ? t("submitting") : t("submitListing")}
            </button>
          </form>
        </div>
      </div>
    </FarmerLayout>
  );
}
