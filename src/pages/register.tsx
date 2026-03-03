import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const role: UserRole = "farmer"; // Admin accounts are created via Supabase dashboard only
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up with Supabase Auth (role & full_name stored in user metadata)
        //    The DB trigger on auth.users will auto-create the profile using this metadata.
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role, phone, location },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (!data.user) {
            setError("Registration failed. Please try again.");
            setLoading(false);
            return;
        }

        // 2. If no session, email confirmation is required — profile will be
        //    created by the DB trigger when the user confirms their email.
        if (!data.session) {
            setLoading(false);
            router.push("/login?registered=1");
            return;
        }

        // 3. Session exists (email confirmation disabled) — upsert profile to
        //    ensure role is set correctly (in case trigger used a default).
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: data.user.id,
                role,
                full_name: fullName,
                phone: phone || null,
                location: location || null,
            });

        if (profileError) {
            console.error("Profile upsert error:", profileError.message);
            // Don't block the user — the trigger should have already created
            // the profile. Attempt to continue to the dashboard.
        }

        // 4. Redirect to the correct dashboard
        if (role === "admin") {
            router.push("/admin");
        } else {
            router.push("/farmer");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f6f2] px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

                {/* Logo */}
                <div className="w-16 h-16 mx-auto bg-green-700 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">🌿</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center mb-1">Create Account</h1>
                <p className="text-center text-gray-500 mb-6">
                    Join TechFarm today
                </p>



                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            placeholder="Ramesh Kumar"
                            className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
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
                            placeholder="Min 6 characters"
                            className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Location</label>
                        <input
                            type="text"
                            placeholder="Village, District, State"
                            className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-green-700 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
