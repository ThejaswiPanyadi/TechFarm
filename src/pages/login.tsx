import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"farmer" | "admin">("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (router.query.registered === "1") {
      setJustRegistered(true);
    }
  }, [router.query]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch profile to get real role (maybeSingle won't error if row is missing)
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      setError("Could not fetch user profile. Please try again.");
      setLoading(false);
      return;
    }

    // Profile missing (user registered before DB trigger was set up) — create one now
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, role: "farmer", full_name: null })
        .select("role")
        .single();

      if (insertError || !newProfile) {
        setError("Could not load your profile. Please contact support.");
        setLoading(false);
        return;
      }
      profile = newProfile;
    }

    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/farmer");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6f2] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        {/* Logo */}
        <div className="w-16 h-16 mx-auto bg-green-700 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-white text-2xl">🌿</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-1">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-6">
          Login to your TechFarm account
        </p>

        {/* Role Toggle (visual only – actual role comes from DB) */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${role === "farmer"
              ? "bg-white shadow text-green-700"
              : "text-gray-500"
              }`}
          >
            👤 Farmer
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${role === "admin"
              ? "bg-white shadow text-green-700"
              : "text-gray-500"
              }`}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Success Message (post-registration) */}
        {justRegistered && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            ✅ Account created! Please check your email to confirm your account before logging in.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : `Login as ${role}`}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-green-700 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}