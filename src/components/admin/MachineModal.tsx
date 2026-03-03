import { useState } from "react";

export default function MachineModal({ machine, onClose, onSave }: any) {
  const [form, setForm] = useState(
    machine || {
      name: "",
      description: "",
      price: 0,
      location: "",
      image: "",
      available: true,
    }
  );

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6">

        <h3 className="text-xl font-semibold mb-4">
          {machine ? "Edit Machine" : "Add Machine"}
        </h3>

        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Machine Name"
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border p-2 rounded-lg"
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price per day"
            className="w-full border p-2 rounded-lg"
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-2 rounded-lg"
          />

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full border p-2 rounded-lg"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
            />
            Available
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-green-700 text-white rounded-lg"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
