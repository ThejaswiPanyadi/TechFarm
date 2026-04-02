import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";

export default function BlockedPage() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6f2] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-5">
          <span className="text-4xl">🚫</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Restricted
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Your account has been restricted by the administrator.<br />
          If you believe this is a mistake, please contact the admin for assistance.
        </p>

        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
          🔒 <strong>Access Denied</strong> — You cannot use TechFarm until your account is restored.
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition mb-3"
        >
          Sign Out
        </button>

        <Link
          href="/"
          className="block text-center text-sm text-gray-500 hover:text-green-700 transition"
        >
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}
