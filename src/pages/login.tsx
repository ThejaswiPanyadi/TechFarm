import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("farmer");

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();

  // store role
  localStorage.setItem("role", role);

  // redirect based on role
  if (role === "admin") {
    router.push("/admin");
  } else {
    router.push("/farmer");
  }
};

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Login to TechFarm
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Login As
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="farmer">Farmer</option>
                <option value="admin">Admin (Shop Owner)</option>
              </select>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
