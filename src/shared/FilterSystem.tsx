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
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [guests, setGuests] = useState("");

  // Determine if we're in For Sale section
  const isForSaleSection = allowedType?.toLowerCase() === "sale";
  
  // First filter by allowedType (sale/rent)
  const filteredByType = React.useMemo(() => {
    return (data || []).filter((it) => {
      if (!allowedType) return true;
      const lt = String(it.listing_type ?? it.rateType ?? "").toLowerCase();
      return lt === allowedType.toLowerCase();
    });
  }, [data, allowedType]);

  // When component mounts or data changes, show filteredByType data
  useEffect(() => {
    onResults(filteredByType);
  }, [filteredByType]);

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

  // Handle number input change for beds, baths, guests
  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    
    // Allow empty or valid positive integers
    if (value === "" || /^\d+$/.test(value)) {
      setter(value);
    }
    // If not a valid number, don't update (allow empty string)
  };

  // Parse a value to integer safely
  const safeParseInt = (value: any): number => {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === 'number') return Math.floor(value);
    
    const strValue = String(value).trim();
    if (strValue === "") return 0;
    
    const num = parseInt(strValue);
    return isNaN(num) ? 0 : Math.floor(num);
  };

  // Get guest count from villa data
  const getGuestCount = (villa: AnyObj): number => {
    // Try multiple possible guest fields
    const guestFields = ['add_guest', 'guests', 'max_guests', 'max_guest', 'guest_capacity'];
    
    for (const field of guestFields) {
      if (villa[field] !== undefined && villa[field] !== null && villa[field] !== "") {
        const count = safeParseInt(villa[field]);
        if (count > 0) return count;
      }
    }
    
    // If no guest field found, return 0
    return 0;
  };

  // Get bed count from villa data
  const getBedCount = (villa: AnyObj): number => {
    const bedFields = ['bedrooms', 'beds', 'bed', 'bed_count'];
    
    for (const field of bedFields) {
      if (villa[field] !== undefined && villa[field] !== null && villa[field] !== "") {
        const count = safeParseInt(villa[field]);
        if (count > 0) return count;
      }
    }
    
    return 0;
  };

  // Get bath count from villa data
  const getBathCount = (villa: AnyObj): number => {
    const bathFields = ['bathrooms', 'baths', 'bath', 'bath_count'];
    
    for (const field of bathFields) {
      if (villa[field] !== undefined && villa[field] !== null && villa[field] !== "") {
        const count = safeParseInt(villa[field]);
        if (count > 0) return count;
      }
    }
    
    return 0;
  };

  const runFilters = () => {
    const minPriceVal = minPrice ? parseFloat(minPrice.replace(/,/g, '')) : NaN;
    const maxPriceVal = maxPrice ? parseFloat(maxPrice.replace(/,/g, '')) : NaN;
    const minBedsNum = minBeds ? parseInt(minBeds) : NaN;
    const minBathsNum = minBaths ? parseInt(minBaths) : NaN;
    const guestsNum = guests ? parseInt(guests) : NaN;

    console.log("🔍 Filter values:", {
      villaName,
      minBedsNum,
      minBathsNum,
      guestsNum,
      minPriceVal,
      maxPriceVal,
      isForSaleSection,
      totalVillas: filteredByType.length
    });

    const filtered = filteredByType.filter((villa) => {
      // 1. First priority: Villa Name filter
      if (villaName) {
        const title = String(villa.title ?? villa.name ?? "").toLowerCase();
        const searchName = villaName.toLowerCase();
        if (!title.includes(searchName)) {
          return false;
        }
      }

      // 2. Guest filter (only for rentals)
      if (!isForSaleSection && !isNaN(guestsNum)) {
        const guestCount = getGuestCount(villa);
        console.log(`Villa: ${villa.title}, Guest Count: ${guestCount}, Required: ${guestsNum}`);
        if (guestCount < guestsNum) {
          console.log(`❌ Filtered out by guests: ${villa.title}`);
          return false;
        }
      }

      // 3. Bed filter
      if (!isNaN(minBedsNum)) {
        const bedCount = getBedCount(villa);
        if (bedCount < minBedsNum) {
          console.log(`❌ Filtered out by beds: ${villa.title}`);
          return false;
        }
      }

      // 4. Bath filter
      if (!isNaN(minBathsNum)) {
        const bathCount = getBathCount(villa);
        if (bathCount < minBathsNum) {
          console.log(`❌ Filtered out by baths: ${villa.title}`);
          return false;
        }
      }

      // 5. Price filter
      const priceRaw = villa.price_display ?? villa.price ?? "";
      const priceNum = parseNumber(priceRaw);

      if (!isNaN(minPriceVal) && !isNaN(priceNum) && priceNum < minPriceVal) {
        console.log(`❌ Filtered out by min price: ${villa.title}`);
        return false;
      }
      if (!isNaN(maxPriceVal) && !isNaN(priceNum) && priceNum > maxPriceVal) {
        console.log(`❌ Filtered out by max price: ${villa.title}`);
        return false;
      }

      console.log(`✅ Passed all filters: ${villa.title}`);
      return true;
    });

    console.log("📊 Final filtered results:", {
      total: filtered.length,
      original: filteredByType.length,
      filteredOut: filteredByType.length - filtered.length
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
      setMinBeds("");
      setMinBaths("");
      setGuests("");

      // Reset to initial data (filtered by type)
      onResults(filteredByType);
      console.log("🔄 Filters reset to initial state");
    }, 700);
  };

  // Get maximum values from data for input placeholder
  const getMaxValues = () => {
    let maxBeds = 0;
    let maxBaths = 0;
    let maxGuests = 0;

    filteredByType.forEach(item => {
      const beds = getBedCount(item);
      const baths = getBathCount(item);
      const guestCount = getGuestCount(item);
      
      if (beds > maxBeds) maxBeds = beds;
      if (baths > maxBaths) maxBaths = baths;
      if (guestCount > maxGuests) maxGuests = guestCount;
    });

    return { maxBeds, maxBaths, maxGuests };
  };

  const { maxBeds, maxBaths, maxGuests } = getMaxValues();

  return (
    <div className="pt-6 px-4">
      <div className="bg-white/60 container p-8 rounded-2xl shadow-xl border border-[#135E76] mx-auto mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Common Fields that always show */}
          
          {/* Villa Name - Always show at position 1 */}
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

          {/* Min Beds - Number Input at position 2 */}
          <div>
            <label htmlFor="min-beds" className="block text-sm font-semibold text-gray-800 mb-2">
              Min Beds
            </label>
            <div className="relative">
              <input
                type="text"
                id="min-beds"
                name="min-beds"
                value={minBeds}
                onChange={(e) => handleNumberInputChange(e, setMinBeds)}
                placeholder={`Enter min beds`}
                className="w-full px-4 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
              {minBeds && (
                <button
                  type="button"
                  onClick={() => setMinBeds("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Min Baths - Number Input at position 3 */}
          <div>
            <label htmlFor="min-baths" className="block text-sm font-semibold text-gray-800 mb-2">
              Min Baths
            </label>
            <div className="relative">
              <input
                type="text"
                id="min-baths"
                name="min-baths"
                value={minBaths}
                onChange={(e) => handleNumberInputChange(e, setMinBaths)}
                placeholder={`Enter min baths`}
                className="w-full px-4 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
              {minBaths && (
                <button
                  type="button"
                  onClick={() => setMinBaths("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conditionally render Check-In or Min Price */}
          {isForSaleSection ? (
            // For Sale: Min Price at position 4
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
          ) : (
            // Rentals: Check-In at position 4
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
          )}

          {/* Conditionally render Max Price or Check-Out */}
          {isForSaleSection ? (
            // For Sale: Max Price at position 5
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
          ) : (
            // Rentals: Check-Out at position 5
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
          )}

          {/* Row 2: Starting from position 6 */}

          {/* For Sale: Search Button at position 6 */}
          {isForSaleSection ? (
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
          ) : (
            // Rentals: Guests at position 6
            <div>
              <label htmlFor="guests" className="block text-sm font-semibold text-gray-800 mb-2">
                Guests
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="guests"
                  name="guests"
                  value={guests}
                  onChange={(e) => handleNumberInputChange(e, setGuests)}
                  placeholder={`Enter min guests`}
                  className="w-full px-4 py-2 border border-[#135E76] rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
                {guests && (
                  <button
                    type="button"
                    onClick={() => setGuests("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* For Sale: Reset Button at position 7 */}
          {isForSaleSection ? (
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
          ) : (
            // Rentals: Min Price at position 7
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
          )}

          {/* Rentals: Max Price at position 8 */}
          {!isForSaleSection && (
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
          )}

          {/* Rentals: Search Button at position 9 */}
          {!isForSaleSection && (
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
          )}

          

         
          {!isForSaleSection && (
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
          )}

          {/* Empty divs for Rentals to fill positions 11-13 */}
          {!isForSaleSection && (
            <>
              <div className="hidden lg:block"></div>
              <div className="hidden lg:block"></div>
              <div className="hidden lg:block"></div>
            </>
          )}
        </div>

        {/* Helper text */}
        
      </div>
    </div>
  );
}