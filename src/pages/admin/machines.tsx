import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { ImagePlus, X } from "lucide-react";

// Helper: call admin API with the current session token
async function adminFetch(method: string, body?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch("/api/admin/machines", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

interface PreviewFile {
  file: File;
  previewUrl: string;
}

export default function ManageMachines() {
  useAuthGuard("admin");
  const { t } = useLanguage();

  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMachine, setNewMachine] = useState({
    name: "",
    description: "",
    location: "",
    price_per_day: "",
    status: "Available",
  });
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMachines();
  }, []);

  async function loadMachines() {
    try {
      setLoading(true);
      const data = await adminFetch("GET");
      setMachines(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPreviews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
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
      const { data: { session } } = await supabase.auth.getSession();

      for (const { file } of previews) {
        // 1. Get Signed URL from our API (bypasses RLS for upload)
        const res = await fetch("/api/admin/get-upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? ""}`,
          },
          body: JSON.stringify({ fileName: file.name }),
        });

        const { signedUrl, path, error: urlError } = await res.json();
        if (!res.ok) throw new Error(urlError || "Failed to get upload permission");

        // 2. Upload directly to Supabase using the signed URL
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) throw new Error("File upload failed via signed URL");

        // 3. Construct the public URL for display
        const { data } = supabase.storage.from("machine-images").getPublicUrl(path);
        if (data?.publicUrl) urls.push(data.publicUrl);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd() {
    if (!newMachine.name || !newMachine.price_per_day) return;
    setSaving(true);
    setError(null);
    try {
      const imageUrls = await uploadImages();

      const m = await adminFetch("POST", {
        ...newMachine,
        price_per_day: Number(newMachine.price_per_day),
        image_url: imageUrls[0] || "", // Set primary image
        images: imageUrls, // Store all images
      });

      setMachines([m, ...machines]);
      setShowForm(false);
      setNewMachine({ name: "", description: "", location: "", price_per_day: "", status: "Available" });
      setPreviews([]);
    } catch (e: any) {
      console.error("addMachine error:", e);
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, current: string) {
    const next = current === "Available" ? "Unavailable" : "Available";
    await adminFetch("PATCH", { id, status: next });
    setMachines((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
  }

  async function handleDelete(id: string) {
    if (!confirm(t("remove") + "?")) return;
    await adminFetch("DELETE", { id });
    setMachines((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("manageMachines")}</h1>
          <p className="text-gray-600">{t("manageMachinesDesc")}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          {t("addMachine")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="font-semibold text-lg mb-4">{t("newMachine")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <input type="text" placeholder={t("machineName") + " *"} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newMachine.name} onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })} />
              <input type="text" placeholder={t("cropLocation")} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newMachine.location} onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })} />
              <input type="number" placeholder={t("pricePerDay") + " *"} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newMachine.price_per_day} onChange={(e) => setNewMachine({ ...newMachine, price_per_day: e.target.value })} />
              <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={newMachine.status}
                onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}>
                <option value="Available">{t("available")}</option>
                <option value="Unavailable">{t("unavailable")}</option>
              </select>
            </div>

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] bg-gray-50/30">
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border bg-white group flex items-center justify-center">
                    <img src={p.previewUrl} className="max-w-full max-h-full object-contain" />
                    <button onClick={() => removePreview(i)} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-green-500 hover:bg-green-50 transition text-gray-400 hover:text-green-600"
                >
                  <ImagePlus className="w-6 h-6" />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">{t("addMachine")} Image(s)</p>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            <textarea placeholder={t("description")} className="border p-2 rounded-lg col-span-1 md:col-span-2 min-h-[100px] focus:ring-2 focus:ring-green-500 outline-none"
              value={newMachine.description} onChange={(e) => setNewMachine({ ...newMachine, description: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving || uploading}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60 flex items-center gap-2 transition shadow-sm">
              {(saving || uploading) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving || uploading ? t("saving") : t("saveMachine")}
            </button>
            <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50 transition">
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Machine Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">{t("loadingMachines")}</div>
      ) : machines.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{t("noMachines")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {machines.map((machine) => {
            const gallery = Array.isArray(machine.images) ? machine.images : [];
            const mainImg = gallery[0] || machine.image_url;

            return (
              <div key={machine.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition duration-200">
                <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b">
                  {mainImg ? (
                    <img src={mainImg} alt={machine.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-300">
                      <ImagePlus className="w-10 h-10 mb-2 opacity-20" />
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${machine.status === "Available" ? "bg-green-600" : "bg-red-600"
                    }`}>
                    {machine.status === "Available" ? t("available") : t("unavailable")}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-800">{machine.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mt-1 min-h-[2.5rem] leading-relaxed">
                    {machine.description || "No description provided."}
                  </p>
                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📍</span>
                      <span>{machine.location || "Location not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl text-green-700">₹{machine.price_per_day} <span className="text-xs text-gray-400 font-normal">/ day</span></p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleToggle(machine.id, machine.status)}
                        className="flex-1 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        {t("toggleStatus")}
                      </button>
                      <button onClick={() => handleDelete(machine.id)}
                        className="border border-red-100 text-red-500 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
