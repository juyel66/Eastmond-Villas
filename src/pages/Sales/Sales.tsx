// File: Rents.tsx
import React, { useEffect, useState } from "react";

import FilterSystem from "@/shared/FilterSystem";
import SalesCard from "./SalesCard";

interface VillaType {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  beds: number;
  baths: number;
  pool: number;
  amenities: string[];
  rateType: string;
  imageUrl: string;
}

interface PaginationProps {
  totalResults: number;
  resultsPerPage: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalResults,
  resultsPerPage,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const start = (currentPage - 1) * resultsPerPage + 1;
  const end = Math.min(currentPage * resultsPerPage, totalResults);

  const pagesToShow: number[] = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 3);

  if (currentPage > totalPages - 3) startPage = Math.max(1, totalPages - 5);
  if (currentPage < 3) endPage = Math.min(totalPages, 6);

  for (let i = startPage; i <= endPage; i++) pagesToShow.push(i);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-6 container mx-auto">
      <div className="text-sm font-medium p-5 text-gray-600 mb-4 sm:mb-0">
        Showing {start} to {end} of {totalResults} results
      </div>
      <div className="flex items-center">
        <button
          className="px-4 py-2 mx-1 rounded-lg border hover:bg-gray-100 disabled:text-gray-500"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Previous
        </button>

        {pagesToShow.map((page) => (
          <button
            key={page}
            className={`w-10 h-10 mx-1 flex items-center justify-center rounded-lg text-sm font-semibold ${
              page === currentPage
                ? "bg-white text-gray-900 border shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(page)}
          >
            {String(page).padStart(2, "0")}
          </button>
        ))}

        <button
          className="px-4 py-2 mx-1 rounded-lg border hover:bg-gray-100 disabled:text-gray-500"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://10.10.13.60:8000/api";
const PLACEHOLDER_IMG =
  "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760924064/img_5_sd6ueh.png";

const Sales: React.FC = () => {
  const resultsPerPage = 2;

  // data & status
  const [villas, setVillas] = useState<VillaType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pagination UI
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const fetchVillas = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/villas/properties/`);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`API error: ${res.status} ${text}`);
        }
        const data = await res.json();

        // data might be an object with results or a plain array depending on your backend
        const items: any[] = Array.isArray(data) ? data : (data.results ?? data.items ?? []);

        // filter for rentals (server sample had listing_type: "rent")
        const rentals = items.filter((it) => (it.listing_type || "").toLowerCase() === "sale");

        // map server item to VillaType used by RentsCard
        const mapped: VillaType[] = rentals.map((it) => {
          const firstImage =
            (it.media_images && Array.isArray(it.media_images) && it.media_images[0]?.image) ||
            (it.bedrooms_images && Array.isArray(it.bedrooms_images) && it.bedrooms_images[0]?.image) ||
            PLACEHOLDER_IMG;

          const amenities: string[] = [];
          if (it.signature_distinctions && typeof it.signature_distinctions === "object") {
            // if server returns object, try to flatten values; otherwise if array, use it directly
            if (Array.isArray(it.signature_distinctions)) amenities.push(...it.signature_distinctions);
            else amenities.push(...Object.values(it.signature_distinctions || {}).map(String));
          }
          if (it.outdoor_amenities) {
            if (Array.isArray(it.outdoor_amenities)) amenities.push(...it.outdoor_amenities);
            else amenities.push(...Object.values(it.outdoor_amenities || {}).map(String));
          }
          if (it.interior_amenities) {
            if (Array.isArray(it.interior_amenities)) amenities.push(...it.interior_amenities);
            else amenities.push(...Object.values(it.interior_amenities || {}).map(String));
          }

          return {
            id: Number(it.id),
            title: it.title || it.slug || "Untitled",
            location: (it.city && it.city.replace(/(^"|"$)/g, "")) || it.address || "Unknown location",
            price: Number(it.price) || 0,
            rating: Number(it.property_stats?.average_rating) || 0,
            reviewCount: Number(it.property_stats?.total_bookings) || 0,
            beds: Number(it.bedrooms) || 0,
            baths: Number(it.bathrooms) || 0,
            pool: Number(it.pool) || 0,
            amenities: amenities.filter(Boolean),
            rateType: (it.listing_type === "rent" ? "per night" : "sale"),
            imageUrl: firstImage,
          } as VillaType;
        });

        if (!cancelled) {
          setVillas(mapped);
          setCurrentPage(1); // reset to first page after fresh load
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to fetch villas:", err);
          setError(err?.message || "Failed to load rentals");
          setVillas([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchVillas();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalResults = villas.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));

  // keep currentPage valid when data changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentVillas = villas.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div
      className="relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dqkczdjjs/image/upload/v1760812885/savba_k7kol1.png')",
        marginBottom: "620px",
      }}
    >
      <div className="container mx-auto mb-10">
        <FilterSystem />
      </div>

      {/* Top pagination */}
      <Pagination
        totalResults={totalResults}
        resultsPerPage={resultsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />

      <div className="space-y-8 container mx-auto">
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="text-gray-600">Loading rentals…</div>
          </div>
        )}

        {error && (
          <div className="py-6">
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded">
              <div className="font-semibold">Failed to load rentals</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && currentVillas.length === 0 && (
          <div className="py-12 flex justify-center">
            <div className="text-gray-600">No rentals found.</div>
          </div>
        )}

        {!loading &&
          !error &&
          currentVillas.map((villa) => (
            <div
              key={villa.id}
              className="pl-5 pr-5"
            >
              <SalesCard property={villa} />
            </div>
          ))}
      </div>

      {/* Bottom pagination */}
      <Pagination
        totalResults={totalResults}
        resultsPerPage={resultsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
};

export default Sales;
