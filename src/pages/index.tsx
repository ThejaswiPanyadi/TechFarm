import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/router";

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleRentClick = () => {
    router.push("/machines");
  };

  return (
    <Layout>
      <div className="bg-[#d99c4e]">
        {/* HERO */}
        <section
          className="relative w-full min-h-[60vh] sm:min-h-[65vh] bg-cover bg-center"
          style={{ backgroundImage: "url(/hero_2.jpg)" }}
        >
          <div className="absolute inset-0 bg-green-900/60"></div>

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-16 pt-20 sm:pt-24 pb-12 sm:pb-16">
            <div className="w-full max-w-none sm:max-w-xl text-white">
              <span className="inline-block bg-green-200 text-green-900 px-4 py-1 rounded-full text-xs sm:text-sm mb-4">
                {t("badge")}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                {t("heroLine1")}{" "}
                <span className="text-yellow-400">{t("heroLine2")}</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base leading-relaxed">
                {t("heroDesc")}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRentClick}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium"
                >
                  🚜 {t("rentBtn")}
                </button>

                <button
                  onClick={handleRentClick}
                  className="border border-white px-6 py-3 rounded-lg"
                >
                  🌱 {t("browseBtn")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="w-full px-4 sm:px-6 lg:px-16 py-16 bg-[#FBFAF7]">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            {t("servicesTitle")}
          </h2>

          <p className="text-center text-gray-600 mb-10 text-sm sm:text-base">
            {t("servicesSubtitle")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Rent Machines */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src="/machine-card.jpg"
                alt="Rent Machines"
                className="w-full h-52 sm:h-64 object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  🚜 {t("servicesRent")}
                </h3>

                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {t("servicesRentDesc")}
                </p>

                <button
                  onClick={handleRentClick}
                  className="text-green-700 font-medium"
                >
                  {t("learnMore")} →
                </button>
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src="/market-card.jpg"
                alt="Marketplace"
                className="w-full h-52 sm:h-64 object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  🌱 {t("servicesMarket")}
                </h3>

                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {t("servicesMarketDesc")}
                </p>

                <button
                  onClick={handleRentClick}
                  className="text-green-700 font-medium"
                >
                  {t("learnMore")} →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
