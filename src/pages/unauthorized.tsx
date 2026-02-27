import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f6f2] px-4">
            <div className="text-center max-w-sm">
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldX className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-8">
                    You don&apos;t have permission to view this page.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
