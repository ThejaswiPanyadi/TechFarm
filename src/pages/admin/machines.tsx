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
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>("");

  const [newMachine, setNewMachine] = useState({
    name: "",
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newMachine.name || !newMachine.price_per_day) {
      setError("Please fill out all required fields.");
      return;
    }
    setSaving(true);
    setError(null);
    setDebugLog("Starting base64 compilation...");
    try {
      // 1. Compile previews into base64 payload array
      const previewsBase64 = [];
      for (const { file } of previews) {
        setDebugLog(prev => prev + ` | Processing ${file.name}...`);
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("File reader failed"));
          reader.readAsDataURL(file);
        });
        
        const fileData = await base64Promise;
        previewsBase64.push({ fileName: file.name, fileData, contentType: file.type });
      }

      setDebugLog(prev => prev + ` | POSTing to database with bypass bundle...`);

      // 2. Submit ONE grand payload. Next.js machines.ts handles both File Uploads and the Postgres Insertion.
      const m = await adminFetch("POST", {
        ...newMachine,
        price_per_day: Number(newMachine.price_per_day),
        previewsBase64 
      });

      setDebugLog(prev => prev + ` | Success! Resetting form...`);
      setMachines([m, ...machines]);
      setShowForm(false);
      setNewMachine({ name: "", location: "", price_per_day: "", status: "Available" });
      setPreviews([]);
      setDebugLog(""); // clear on success
    } catch (err: any) {
      console.error("addMachine error:", err);
      setError(err.message || "Failed to add machine");
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
    if (!confirm(`${t("common.remove")}?`)) return;
    await adminFetch("DELETE", { id });
    setMachines((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("machines.manageMachines")}</h1>
          <p className="text-gray-600">{t("machines.manageMachinesDesc")}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          {t("machines.addMachine")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}
      
      {debugLog && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded-lg px-4 py-3 mb-4 break-words">
          <strong>Debug Trace:</strong> {debugLog}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="font-semibold text-lg mb-4">{t("machines.newMachine")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <input type="text" required placeholder={t("machines.machineName") + " *"} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newMachine.name} onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })} />
              <input type="text" placeholder={t("marketplace.locationPlaceholder")} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newMachine.location} onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })} />
              <input type="number" required placeholder={t("machines.pricePerDay") + " *"} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newMachine.price_per_day} onChange={(e) => setNewMachine({ ...newMachine, price_per_day: e.target.value })} />
              <select className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={newMachine.status}
                onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}>
                <option value="Available">{t("machines.available")}</option>
                <option value="Unavailable">{t("machines.unavailable")}</option>
              </select>
            </div>

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] bg-gray-50/30">
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border bg-white group flex items-center justify-center">
                    <img src={p.previewUrl} className="max-w-full max-h-full object-contain" />
                    <button type="button" onClick={() => removePreview(i)} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition">
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
              <p className="text-xs text-gray-500 text-center">{t("machines.addMachine")} Image(s)</p>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>

          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60 flex items-center gap-2 transition shadow-sm">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? t("machines.saving") : t("machines.saveMachine")}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50 transition">
              {t("machines.cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Machine Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">{t("machines.loading")}</div>
      ) : machines.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{t("machines.noMachines")}</div>
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
                      <span className="text-sm">{t("machines.noImage")}</span>
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${machine.status === "Available" ? "bg-green-600" : "bg-red-600"
                    }`}>
                    {machine.status === "Available" ? t("machines.available") : t("machines.unavailable")}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-800">{machine.name}</h3>
                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📍</span>
                      <span>{machine.location || t("machines.noLocation")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl text-green-700">₹{machine.price_per_day} <span className="text-xs text-gray-400 font-normal">{t("machines.perDay")}</span></p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleToggle(machine.id, machine.status)}
                        className="flex-1 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        {t("machines.toggleStatus")}
                      </button>
                      <button onClick={() => handleDelete(machine.id)}
                        className="border border-red-100 text-red-500 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                        {t("common.remove")}
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
