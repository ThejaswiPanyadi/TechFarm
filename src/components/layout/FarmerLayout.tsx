import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf,
  LayoutDashboard,
  Tractor,
  ClipboardList,
  ShoppingBasket,
  Plus,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

interface FarmerLayoutProps {
  children: React.ReactNode;
}

export default function FarmerLayout({ children }: FarmerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/farmer", icon: LayoutDashboard },
    { name: "Rent Machines", path: "/machines", icon: Tractor },
    { name: "My Bookings", path: "/farmer/bookings", icon: ClipboardList },
    { name: "My Listings", path: "/farmer/listings", icon: ShoppingBasket },
    { name: "Add Listing", path: "/farmer/add-listing", icon: Plus },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen flex bg-[#F5F4F1]">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 w-72 bg-[#1F5E34] text-white transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-900" />
              </div>
              <span className="text-xl font-bold">TechFarm</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X />
            </button>
          </div>

          {/* Farmer Info */}
          <div className="px-6 py-4 border-t border-white/20 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{profile?.full_name ?? "Farmer"}</p>
                <p className="text-sm text-white/70">Farmer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive(item.path)
                    ? "bg-yellow-500 text-black font-semibold"
                    : "hover:bg-green-700 text-white/90"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-green-700 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-6 py-4 flex items-center gap-4">

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu />
          </button>

          <h1 className="text-xl font-bold">Farmer Dashboard</h1>

          <div className="ml-auto">
            <Link
              href="/marketplace"
              className="border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-700 hover:text-white transition"
            >
              Marketplace
            </Link>
          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>

      </div>
    </div>
  );
}
