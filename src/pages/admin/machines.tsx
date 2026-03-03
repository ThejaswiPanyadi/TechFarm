import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/lib/supabase";

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

export default function ManageMachines() {
  useAuthGuard("admin");

  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMachine, setNewMachine] = useState({
    name: "",
    description: "",
    location: "",
    price_per_day: "",
    image_url: "",
    status: "Available",
  });

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

  async function handleAdd() {
    if (!newMachine.name || !newMachine.price_per_day) return;
    setSaving(true);
    setError(null);
    try {
      const m = await adminFetch("POST", {
        ...newMachine,
        price_per_day: Number(newMachine.price_per_day),
      });
      setMachines([m, ...machines]);
      setShowForm(false);
      setNewMachine({ name: "", description: "", location: "", price_per_day: "", image_url: "", status: "Available" });
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
    if (!confirm("Delete this machine?")) return;
    await adminFetch("DELETE", { id });
    setMachines((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Machines</h1>
          <p className="text-gray-600">Add, edit, or remove rental machines from your inventory.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          + Add Machine
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="font-semibold text-lg mb-4">New Machine</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Machine Name *" className="border p-2 rounded-lg"
              value={newMachine.name} onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })} />
            <input type="text" placeholder="Location" className="border p-2 rounded-lg"
              value={newMachine.location} onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })} />
            <input type="number" placeholder="Price per day (₹) *" className="border p-2 rounded-lg"
              value={newMachine.price_per_day} onChange={(e) => setNewMachine({ ...newMachine, price_per_day: e.target.value })} />
            <input type="text" placeholder="Image URL" className="border p-2 rounded-lg"
              value={newMachine.image_url} onChange={(e) => setNewMachine({ ...newMachine, image_url: e.target.value })} />
            <select className="border p-2 rounded-lg" value={newMachine.status}
              onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}>
              <option>Available</option>
              <option>Unavailable</option>
            </select>
            <textarea placeholder="Description" className="border p-2 rounded-lg col-span-1 md:col-span-2"
              value={newMachine.description} onChange={(e) => setNewMachine({ ...newMachine, description: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60">
              {saving ? "Saving..." : "Save Machine"}
            </button>
            <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Machine Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading machines...</div>
      ) : machines.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No machines yet. Add your first machine above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <div key={machine.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="relative">
                {machine.image_url ? (
                  <img src={machine.image_url} alt={machine.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm text-white ${machine.status === "Available" ? "bg-green-600" : "bg-red-600"
                  }`}>
                  {machine.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{machine.name}</h3>
                <p className="text-gray-600 text-sm">{machine.description}</p>
                <p className="text-sm mt-2 text-gray-500">📍 {machine.location}</p>
                <p className="font-bold text-green-700 mt-2">₹ {machine.price_per_day} / day</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleToggle(machine.id, machine.status)}
                    className="border px-3 py-1 rounded text-sm hover:bg-gray-50">
                    Toggle Status
                  </button>
                  <button onClick={() => handleDelete(machine.id)}
                    className="border border-red-500 text-red-500 px-3 py-1 rounded text-sm hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
