"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Tractor, Leaf, LogIn, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="w-full bg-[#F8F6EF] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">

        {/* LEFT – LOGO */}
        <div className="flex items-center gap-2 w-1/4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg">TechFarm</span>
          </Link>
        </div>

        {/* CENTER – NAV */}
        <nav className="hidden md:flex items-center justify-center gap-8 w-1/2">
          <Link href="/">{t("home")}</Link>

          <Link href="/machines" className="flex items-center gap-1">
            <Tractor className="w-4 h-4" />
            {t("rentMachines")}
          </Link>

          <Link href="/marketplace" className="flex items-center gap-1">
            <Leaf className="w-4 h-4" />
            {t("cropsSeeds")}
          </Link>
        </nav>

        {/* RIGHT – ACTIONS */}
        <div className="hidden md:flex items-center justify-end gap-4 w-1/4">
          {/* ✅ REAL LANGUAGE SELECTOR */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="en">English</option>
            <option value="kn">Kannada</option>
            <option value="hi">Hindi</option>
            <option value="ml">Malayalam</option>
          </select>

          <Link href="/login">{t("login")}</Link>

          <Link
            href="/register"
            className="bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            {t("register")}
          </Link>
        </div>

        {/* MOBILE MENU ICON */}
        <div className="md:hidden ml-auto">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="bg-[#F8F6EF] w-full h-full p-5">

            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg">TechFarm</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-3">
              <Link href="/" onClick={() => setOpen(false)}
                className="block bg-green-100 px-4 py-3 rounded-lg">
                {t("home")}
              </Link>

              <Link href="/machines" onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg">
                🚜 {t("rentMachines")}
              </Link>

              <Link href="/marketplace" onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg">
                🌱 {t("cropsSeeds")}
              </Link>
            </nav>

            {/* ✅ MOBILE LANGUAGE */}
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

            <div className="mt-6 space-y-3">
              <Link href="/login">
                <button className="w-full border border-green-700 text-green-700 py-3 rounded-lg">
                  {t("login")}
                </button>
              </Link>

              <Link href="/register">
                <button className="w-full bg-green-700 text-white py-3 rounded-lg">
                  {t("register")}
                </button>
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
