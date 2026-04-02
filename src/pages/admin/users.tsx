import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/lib/supabase";

interface UserRow {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    role: "farmer" | "admin";
    status: "active" | "blocked" | null;
    last_sign_in_at: string | null;
    created_at: string;
}

const ROLE_STYLE: Record<string, string> = {
    farmer: "bg-green-100 text-green-700",
    admin: "bg-purple-100 text-purple-700",
};

const STATUS_STYLE: Record<string, string> = {
    active: "bg-teal-100 text-teal-700",
    blocked: "bg-red-100 text-red-700",
};

async function usersApi(method: string, body?: object) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/users", {
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

export default function UserManagement() {
    useAuthGuard("admin");

    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "farmer" | "admin">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
    const [error, setError] = useState<string | null>(null);
    const [viewUser, setViewUser] = useState<UserRow | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setError(null);
            const data = await usersApi("GET");
            setUsers(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    async function handleToggleBlock(user: UserRow) {
        const newStatus = user.status === "blocked" ? "active" : "blocked";
        setActionLoading(user.id + "block");
        try {
            await usersApi("PATCH", { id: user.id, status: newStatus });
            setUsers((prev) =>
                prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u)
            );
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDelete(id: string) {
        setDeleteConfirm(null);
        setActionLoading(id + "delete");
        try {
            await usersApi("DELETE", { id });
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(null);
        }
    }

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            u.full_name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.location?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const matchStatus = statusFilter === "all" || (u.status ?? "active") === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const stats = {
        total: users.length,
        farmers: users.filter((u) => u.role === "farmer").length,
        admins: users.filter((u) => u.role === "admin").length,
        blocked: users.filter((u) => u.status === "blocked").length,
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-gray-500 mt-1">
                        Manage registered users, block/unblock accounts, and review activity.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        ⚠ {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total Users", value: stats.total, color: "bg-blue-50 text-blue-700" },
                        { label: "Farmers", value: stats.farmers, color: "bg-green-50 text-green-700" },
                        { label: "Admins", value: stats.admins, color: "bg-purple-50 text-purple-700" },
                        { label: "Blocked", value: stats.blocked, color: "bg-red-50 text-red-700" },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-4 border ${s.color} border-current/20`}>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-sm mt-0.5 opacity-80">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="🔍  Search by name, email, phone, village..."
                        className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="flex gap-2">
                        {(["all", "farmer", "admin"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                    roleFilter === r
                                        ? "bg-green-700 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {(["all", "active", "blocked"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                    statusFilter === s
                                        ? "bg-green-700 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading users...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No users found.</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        {["User", "Contact", "Village", "Role", "Status", "Last Login", "Actions"].map((h) => (
                                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filtered.map((user) => {
                                        const isBlocked = user.status === "blocked";
                                        const isActing = actionLoading?.startsWith(user.id);
                                        return (
                                            <tr
                                                key={user.id}
                                                className={`hover:bg-gray-50 transition ${isBlocked ? "bg-red-50/40" : ""}`}
                                            >
                                                {/* User */}
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">
                                                        {user.full_name || "—"}
                                                    </p>
                                                    <p className="text-gray-400 text-xs truncate max-w-[180px]">
                                                        {user.email ?? "—"}
                                                    </p>
                                                </td>
                                                {/* Contact */}
                                                <td className="px-4 py-3 text-gray-600">
                                                    {user.phone || "—"}
                                                </td>
                                                {/* Village */}
                                                <td className="px-4 py-3 text-gray-600">
                                                    {user.location || "—"}
                                                </td>
                                                {/* Role */}
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLE[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[user.status ?? "active"] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {user.status ?? "active"}
                                                    </span>
                                                </td>
                                                {/* Last Login */}
                                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                    {user.last_sign_in_at
                                                        ? new Date(user.last_sign_in_at).toLocaleDateString("en-IN", {
                                                            day: "2-digit", month: "short", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })
                                                        : "Never"}
                                                </td>
                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {/* View */}
                                                        <button
                                                            onClick={() => setViewUser(user)}
                                                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium hover:bg-blue-100 transition"
                                                        >
                                                            View
                                                        </button>
                                                        {/* Block / Unblock */}
                                                        {user.role !== "admin" && (
                                                            <button
                                                                disabled={isActing}
                                                                onClick={() => handleToggleBlock(user)}
                                                                className={`px-3 py-1 rounded-lg text-xs font-medium border transition disabled:opacity-50 ${
                                                                    isBlocked
                                                                        ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
                                                                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                                                }`}
                                                            >
                                                                {isActing ? "..." : isBlocked ? "Unblock" : "Block"}
                                                            </button>
                                                        )}
                                                        {/* Delete */}
                                                        {user.role !== "admin" && (
                                                            <>
                                                                {deleteConfirm === user.id ? (
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            disabled={isActing}
                                                                            onClick={() => handleDelete(user.id)}
                                                                            className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition"
                                                                        >
                                                                            {isActing ? "..." : "Confirm"}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeleteConfirm(null)}
                                                                            className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        disabled={isActing}
                                                                        onClick={() => setDeleteConfirm(user.id)}
                                                                        className="px-3 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t text-sm text-gray-500">
                            Showing {filtered.length} of {users.length} users
                        </div>
                    </div>
                )}
            </div>

            {/* View User Modal */}
            {viewUser && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewUser(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">User Details</h2>
                            <button
                                onClick={() => setViewUser(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold">
                                    {(viewUser.full_name ?? "?")[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-base">{viewUser.full_name ?? "—"}</p>
                                    <p className="text-gray-500 text-xs">{viewUser.email ?? "—"}</p>
                                </div>
                            </div>
                            {[
                                ["📞 Phone", viewUser.phone ?? "—"],
                                ["📍 Village", viewUser.location ?? "—"],
                                ["👤 Role", viewUser.role],
                                ["🔒 Status", viewUser.status ?? "active"],
                                ["📅 Joined", new Date(viewUser.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
                                ["🕐 Last Login", viewUser.last_sign_in_at ? new Date(viewUser.last_sign_in_at).toLocaleString("en-IN") : "Never"],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between py-2 border-b last:border-0">
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-medium text-gray-800">{value}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setViewUser(null)}
                            className="mt-5 w-full bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
