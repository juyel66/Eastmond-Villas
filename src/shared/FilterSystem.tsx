import React, { useState, useEffect } from "react";

type AnyObj = { [k: string]: any };

interface FilterSystemProps {
  data?: AnyObj[]; // master list coming from parent (API mapped items)
  onResults?: (items: AnyObj[]) => void;
  allowedType?: string | null; // "sale" | "rent" | null => if provided, only that type is considered
}

const formatNumber = (value: string) => {
  if (!value && value !== "0") return "";
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (s?: string | number) => {
  if (s === undefined || s === null) return NaN;
  if (typeof s === "number") return s;
  const raw = String(s).replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  if (raw === "") return NaN;
  return Number(raw);
};

export default function FilterSystem({
  data = [],
  onResults = () => {},
  allowedType = null,
}: FilterSystemProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [villaName, setVillaName] = useState("");
  const [minBeds, setMinBeds] = useState("Any");
  const [minBaths, setMinBaths] = useState("Any");
  const [guests, setGuests] = useState("Any");

  // When data changes, push initial results (filtered by allowedType if provided)
  useEffect(() => {
    const initial = (data || []).filter((it) => {
      if (!allowedType) return true;
      const lt = String(it.listing_type ?? it.rateType ?? "").toLowerCase();
      return lt === allowedType.toLowerCase();
    });
    onResults(initial);
  }, [data, allowedType]);

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const rawValue = e.target.value.replace(/,/g, "");
    // allow empty or digits
    if (rawValue === "" || /^-?\d*$/.test(rawValue)) {
      setter(formatNumber(rawValue));
    } else {
      // keep user input when not a number (same UX as before)
      setter(e.target.value);
    }
  };

  const runFilters = () => {
    const minPriceVal = parseNumber(minPrice);
    const maxPriceVal = parseNumber(maxPrice);
    const minBedsNum = minBeds === "Any" ? NaN : Number(minBeds.replace("+", ""));
    const minBathsNum = minBaths === "Any" ? NaN : Number(minBaths.replace("+", ""));
    const guestsNum = guests === "Any" ? NaN : Number(guests.replace("+", ""));

    const filtered = (data || []).filter((p) => {
      // only include items that match allowedType (if provided)
      if (allowedType) {
        const lt = String(p.listing_type ?? p.rateType ?? "").toLowerCase();
        if (lt !== allowedType.toLowerCase()) return false;
      }

      // name/title filter
      const title = String(p.title ?? p.name ?? "").toLowerCase();
      if (villaName && !title.includes(villaName.toLowerCase())) return false;

      // beds
      if (!Number.isNaN(minBedsNum)) {
        const b = Number(p.bedrooms ?? p.beds ?? p.bed ?? 0);
        if (Number.isNaN(b) || b < minBedsNum) return false;
      }

      // baths
      if (!Number.isNaN(minBathsNum)) {
        const b = Number(p.bathrooms ?? p.baths ?? 0);
        if (Number.isNaN(b) || b < minBathsNum) return false;
      }

      // guests
      if (!Number.isNaN(guestsNum)) {
        const g = Number(p.add_guest ?? p.guests ?? 0);
        if (Number.isNaN(g) || g < guestsNum) return false;
      }

      // price: try price_display then price
      const priceRaw = p.price_display ?? p.price ?? "";
      const priceNum = parseNumber(priceRaw);

      if (!Number.isNaN(minPriceVal) && !Number.isNaN(priceNum) && priceNum < minPriceVal) return false;
      if (!Number.isNaN(maxPriceVal) && !Number.isNaN(priceNum) && priceNum > maxPriceVal) return false;

      // Note: checkIn/checkOut not used for local filtering (availability needs server)
      return true;
    });

    onResults(filtered);
  };

  const handleReset = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setMinPrice("");
      setMaxPrice("");
      setCheckIn("");
      setCheckOut("");
      setVillaName("");
      setMinBeds("Any");
      setMinBaths("Any");
      setGuests("Any");

      // return initial dataset filtered by allowedType
      const initial = (data || []).filter((it) => {
        if (!allowedType) return true;
        const lt = String(it.listing_type ?? it.rateType ?? "").toLowerCase();
        return lt === allowedType.toLowerCase();
      });
      onResults(initial);
    }, 700);
  };

  return (
    <div className="pt-6 px-4">
      <div className="bg-white/60 container p-8 rounded-2xl shadow-xl border border-[#135E76] mx-auto mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Check-In */}
          <div>
            <label htmlFor="check-in" className="block text-sm font-semibold text-gray-800 mb-2">
              Check-In
            </label>
            <div className="relative">
              <input
                type="date"
                id="check-in"
                name="check-in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Check-Out */}
          <div>
            <label htmlFor="check-out" className="block text-sm font-semibold text-gray-800 mb-2">
              Check-Out
            </label>
            <div className="relative">
              <input
                type="date"
                id="check-out"
                name="check-out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Villa Name */}
          <div>
            <label htmlFor="villa-name" className="block text-sm font-semibold text-gray-800 mb-2">
              Villa Name
            </label>
            <input
              type="text"
              id="villa-name"
              name="villa-name"
              placeholder="Search by name"
              value={villaName}
              onChange={(e) => setVillaName(e.target.value)}
              className="w-full px-4 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          {/* Min Beds */}
          <div>
            <label htmlFor="min-beds" className="block text-sm font-semibold text-gray-800 mb-2">
              Min Beds
            </label>
            <select
              id="min-beds"
              name="min-beds"
              value={minBeds}
              onChange={(e) => setMinBeds(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            >
              <option>Any</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>
          </div>

          {/* Min Baths */}
          <div>
            <label htmlFor="min-baths" className="block text-sm font-semibold text-gray-800 mb-2">
              Min Baths
            </label>
            <select
              id="min-baths"
              name="min-baths"
              value={minBaths}
              onChange={(e) => setMinBaths(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            >
              <option>Any</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="block text-sm font-semibold text-gray-800 mb-2">
              Guests
            </label>
            <select
              id="guests"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            >
              <option>Any</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="min-price" className="block text-sm font-semibold text-gray-800 mb-2">
              Min Price (USD)
            </label>
            <input
              type="text"
              id="min-price"
              name="min-price"
              value={minPrice}
              onChange={(e) => handlePriceChange(e, setMinPrice)}
              placeholder="e.g., 1,000"
              className="w-full px-4 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          {/* Max Price */}
          <div>
            <label htmlFor="max-price" className="block text-sm font-semibold text-gray-800 mb-2">
              Max Price (USD)
            </label>
            <input
              type="text"
              id="max-price"
              name="max-price"
              value={maxPrice}
              onChange={(e) => handlePriceChange(e, setMaxPrice)}
              placeholder="e.g., 10,000"
              className="w-full px-4 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => runFilters()}
              className="flex items-center border-[#135E76] justify-center w-full px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 h-[42px]"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center w-full px-4 py-2 border border-[#009689] rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 h-[42px]"
            >
              <img className={`mr-2 h-5 w-5 ${isSpinning ? "animate-spin" : ""}`} src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760830343/Vector_fpsm2o.png" alt="reset-icon" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
