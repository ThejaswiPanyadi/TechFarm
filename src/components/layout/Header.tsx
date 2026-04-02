"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X, Tractor, Leaf, LayoutDashboard, LogOut, User, MapPin, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

interface ProfileInfo {
  full_name: string | null;
  email: string | null;
  location: string | null;
  role: string | null;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();

  const [session, setSession] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchProfile = async (userId: string, email: string | null) => {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name, location, phone")
      .eq("id", userId)
      .single();
    setProfile({
      full_name: data?.full_name ?? null,
      email,
      location: data?.location ?? null,
      role: data?.role ?? null,
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(!!s);
      if (s?.user) fetchProfile(s.user.id, s.user.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.email ?? null);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const dashboardHref = profile?.role === "admin" ? "/admin" : "/farmer";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    setProfileOpen(false);
    router.push("/");
  };

  // Initials avatar
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="w-full bg-[#F8F6EF] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

        {/* 🔹 LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-gray-900">
            Tech<span className="text-green-700">Farm</span>
          </span>
        </Link>

        {/* 🔹 CENTER NAV */}
        <nav className="hidden md:flex items-center gap-10 text-gray-700 font-medium">
          <Link href="/"
            className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
            {t("home")}
          </Link>

          <Link
            href={session ? "/machines" : "/login"}
            className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg"
          >
            <Tractor className="w-4 h-4" />
            {session ? t("rentMachines") : t("availableMachines")}
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
            <Leaf className="w-4 h-4" />
            {t("cropsSeeds")}
          </Link>
        </nav>

        {/* 🔹 RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-4">

          {/* Language */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-white"
          >
            <option value="en">English</option>
            <option value="kn">Kannada</option>
            <option value="hi">Hindi</option>
            <option value="ml">Malayalam</option>
          </select>

          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 text-gray-700 hover:text-green-700 font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {/* 🔹 PROFILE AVATAR + DROPDOWN */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center font-semibold text-sm hover:bg-green-800 transition shadow"
                  title="Your profile"
                >
                  {initials}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Avatar header */}
                    <div className="bg-green-700 px-5 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                        {initials}
                      </div>
                      <div className="text-white min-w-0">
                        <p className="font-semibold text-sm truncate">{profile?.full_name || "—"}</p>
                        <p className="text-green-200 text-xs capitalize">{profile?.role || "user"}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-5 py-4 space-y-3">
                      <div className="flex items-start gap-3 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="break-all">{profile?.email || "—"}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span>{profile?.location || <span className="text-gray-400 italic">Location not set</span>}</span>
                      </div>
                    </div>

                    <div className="border-t px-5 py-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-green-700">
                {t("login")}
              </Link>

              <Link
                href="/register"
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>

        {/* 🔹 MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden ml-auto"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 📱 MOBILE DRAWER */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="bg-[#F8F6EF] w-full h-full p-5 overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg">TechFarm</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile card (mobile) */}
            {session && profile && (
              <div className="bg-green-700 rounded-2xl p-4 mb-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{profile.full_name || "—"}</p>
                  <p className="text-green-200 text-xs truncate">{profile.email || "—"}</p>
                  {profile.location && (
                    <p className="text-green-200 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{profile.location}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            <nav className="space-y-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block bg-green-100 px-4 py-3 rounded-lg"
              >
                {t("home")}
              </Link>

              <Link
                href={session ? "/machines" : "/login"}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg"
              >
                🚜 {session ? t("rentMachines") : t("availableMachines")}
              </Link>

              <Link
                href="/marketplace"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg"
              >
                🌱 {t("cropsSeeds")}
              </Link>
            </nav>

            {/* Language */}
            <div className="mt-6 flex justify-center">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="border rounded px-3 py-2 w-44 text-center"
              >
                <option value="en">English</option>
                <option value="kn">Kannada</option>
                <option value="hi">Hindi</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>

            {/* Auth Buttons */}
            <div className="mt-6 space-y-3">
              {session ? (
                <>
                  <Link href={dashboardHref} onClick={() => setOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 border border-green-700 text-green-700 py-3 rounded-lg">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <button className="w-full border border-green-700 text-green-700 py-3 rounded-lg">
                      {t("login")}
                    </button>
                  </Link>

                  <Link href="/register" onClick={() => setOpen(false)}>
                    <button className="w-full bg-green-700 text-white py-3 rounded-lg">
                      {t("register")}
                    </button>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
