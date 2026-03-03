import Link from "next/link";
import { Leaf, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#165C2B] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">TechFarm</span>
            </Link>
            <p className="text-white/80 text-lg">
              <b>{t("footerDesc")}</b>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">{t("quickLinks")}</h3>
            <ul className="space-y-3 text-lg">
              <li>
                <Link
                  href="/machines"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {t("rentMachines")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {t("marketplace")}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {t("login")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Saya Enterprises */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">{t("contactTitle")}</h3>
            <ul className="space-y-3 text-lg">
              <li className="flex items-center gap-3 text-white/80">
                <Phone className="w-5 h-5 text-white" />
                <span>+91 9164996224</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <Mail className="w-5 h-5 text-white" />
                <span>info@sayaenterprises.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <MapPin className="w-5 h-5 text-white" />
                <span>Kadaba DK</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-base text-white/70">
            {t("rightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
