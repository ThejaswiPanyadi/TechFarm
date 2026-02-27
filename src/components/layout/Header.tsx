"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Tractor, Leaf } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

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
            href="/machines"
            className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg"
          >
            <Tractor className="w-4 h-4" />
            {t("rentMachines")}
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg"          >
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

          <Link href="/login" className="text-gray-700 hover:text-green-700">
            {t("login")}
          </Link>

          <Link
            href="/register"
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
          >
            {t("register")}
          </Link>
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
          <div className="bg-[#F8F6EF] w-full h-full p-5">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg">TechFarm</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

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
                href="/machines"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg"
              >
                🚜 {t("rentMachines")}
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
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
