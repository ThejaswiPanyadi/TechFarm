import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { getListingById } from "@/lib/db";
import { ChevronLeft, MapPin, Phone, User, Tag, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ListingDetails() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = router.query;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    getListingById(id)
      .then(setListing)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40 text-gray-400">
          {t("loadingListings")}
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="px-6 py-20 text-center">
          <p className="text-gray-500 mb-4">{t("noListings")}</p>
          <Link href="/marketplace" className="text-green-600 hover:underline">
            ← {t("marketplace")}
          </Link>
        </div>
      </Layout>
    );
  }

  const images: string[] = Array.isArray(listing.images) ? listing.images : [];
  const hasImages = images.length > 0;

  return (
    <Layout>
      <div className="px-4 md:px-16 py-8 max-w-3xl mx-auto">

        {/* Back link */}
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-6">
          <ChevronLeft className="w-4 h-4" /> {t("marketplace")}
        </Link>

        {/* Title row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h1 className="text-3xl font-bold flex-1">{listing.name}</h1>
          {listing.type && (
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              {listing.type}
            </span>
          )}
        </div>

        {/* Photo gallery */}
        {hasImages ? (
          <div className="mb-6">
            {/* Main image */}
            <div className="rounded-2xl overflow-hidden bg-gray-50 h-64 sm:h-96 mb-3 shadow-sm flex items-center justify-center border">
              <img
                src={images[activeImg]}
                alt={listing.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-gray-50 transition ${i === activeImg ? "border-green-500" : "border-transparent"
                      }`}
                  >
                    <img src={url} alt={`photo-${i}`} className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-60 bg-gray-100 rounded-2xl mb-6 flex flex-col items-center justify-center text-gray-400 gap-2">
            <span className="text-4xl">🌾</span>
            <span className="text-sm">{t("noListings")}</span>
          </div>
        )}

        {/* Key details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-green-700 font-bold text-sm">₹</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("price")}</p>
              <p className="font-semibold text-gray-800">{listing.price}</p>
            </div>
          </div>
          {listing.quantity && (
            <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("quantity")}</p>
                <p className="font-semibold text-gray-800">{listing.quantity}</p>
              </div>
            </div>
          )}
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("cropLocation")}</p>
              <p className="font-semibold text-gray-800">{listing.location}</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("cropType")}</p>
              <p className="font-semibold text-gray-800">{listing.type}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="bg-white border rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("aboutListing")}
            </h2>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Farmer / Seller info */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h2 className="text-base font-semibold mb-4 text-green-800">{t("sellerDetails")}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("fullName")}</p>
                <p className="font-semibold text-gray-800">
                  {listing.profiles?.full_name ?? t("farmer")}
                </p>
              </div>
            </div>

            {listing.phone && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-200 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t("userPhone")}</p>
                  <p className="font-semibold text-gray-800">{listing.phone}</p>
                </div>
              </div>
            )}
          </div>

          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              className="inline-flex items-center gap-2 mt-5 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition font-medium"
            >
              <Phone className="w-4 h-4" /> {t("callFarmer")}
            </a>
          )}
        </div>

      </div>
    </Layout>
  );
}
