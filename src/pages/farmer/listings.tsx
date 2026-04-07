import { useEffect, useState } from "react";
import Link from "next/link";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getFarmerListings, deleteListing } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MyListings() {
  const { t } = useLanguage();
  useAuthGuard("farmer");
  const { user } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getFarmerListings(user.id)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id: string) {
    if (!confirm(`${t("common.remove")}?`)) return;
    await deleteListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <FarmerLayout>
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t("dashboard.myListings")}</h1>
          <Link href="/farmer/add-listing"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            + {t("marketplace.addNewListing")}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">{t("marketplace.loading")}</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="mb-4">{t("marketplace.noListings")}</p>
            <Link href="/farmer/add-listing" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">
              {t("marketplace.addNewListing")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 bg-white shadow">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image Thumbnail */}
                  <div className="w-full md:w-32 h-32 shrink-0 bg-gray-50 rounded-lg overflow-hidden border flex items-center justify-center">
                    {(item.images?.[0] || item.image_url) ? (
                      <img
                        src={item.images?.[0] ?? item.image_url}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        🌾
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{item.name}</h2>
                      <p className="text-gray-600 font-medium">{item.price}</p>
                      <p className="text-gray-500 text-sm">{t("marketplace.quantity")}: {item.quantity}</p>
                      <p className="text-gray-500 text-sm">📍 {item.location}</p>
                      {item.type && (
                        <span className="inline-block mt-2 text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <span className={`text-sm font-medium px-2 py-1 rounded-lg text-center ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                        {t(`status.${item.status?.toLowerCase()}`) || item.status}
                      </span>
                      <button onClick={() => handleDelete(item.id)}
                        className="border border-red-200 text-red-500 px-4 py-1.5 rounded-lg hover:bg-red-50 transition text-sm">
                        {t("common.remove")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
