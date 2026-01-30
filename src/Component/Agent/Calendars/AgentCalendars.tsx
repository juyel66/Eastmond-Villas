// src/features/Properties/Calendars.tsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

/**
 * Calendars.tsx
 * - View-only agent calendar
 * - Shows ONLY rent properties
 * - Horizontal scroll INSIDE each property row
 */

type BookingItem = {
  booking_id: number;
  full_name: string;
  check_in: string;
  check_out: string;
  status?: string;
  total_price?: string;
};

type BookingResponseItem = {
  property_id: number;
  property_title: string;
  city?: string;
  listing_type?: "rent" | "sale";
  total_bookings_this_month?: number;
  bookings: BookingItem[];
};

type BookingResponse = {
  agent: number;
  month: number;
  year: number;
  properties_count: number;
  data: BookingResponseItem[];
};

type Property = {
  id: number;
  name: string;
  city?: string;
  total_bookings_this_month?: number;
};

const API_BASE = "https://api.eastmondvillas.com";
const MONTHLY_PATH = "/api/villas/agent/bookings/monthly/";

function monthNames() {
  return [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
}

function daysForBooking(
  checkInIso: string,
  checkOutIso: string,
  month: number,
  year: number
) {
  const days: number[] = [];
  const start = new Date(checkInIso + "T00:00:00");
  const end = new Date(checkOutIso + "T00:00:00");
  const d = new Date(start);

  while (d < end) {
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      days.push(d.getDate());
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function Calendars() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Set initial state to current month/year - no previous dates allowed
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingsMap, setBookingsMap] = useState<Map<string, Set<number>>>(new Map());
  const [bookingsDetails, setBookingsDetails] =
    useState<Map<string, Map<number, BookingItem[]>>>(new Map());
  const [loading, setLoading] = useState(false);

  const daysInMonth = useMemo(
    () => new Date(selectedYear, selectedMonth, 0).getDate(),
    [selectedMonth, selectedYear]
  );

  const daysArray = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  // Generate available months based on current date
  const availableMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    
    // If selected year is current year, only show current and future months
    if (selectedYear === currentYear) {
      for (let i = currentMonth; i <= 12; i++) {
        months.push({
          value: i,
          name: monthNames()[i - 1],
          isCurrent: i === currentMonth
        });
      }
    } else {
      // For future years, show all months
      for (let i = 1; i <= 12; i++) {
        months.push({
          value: i,
          name: monthNames()[i - 1],
          isCurrent: false
        });
      }
    }
    
    return months;
  }, [selectedYear, currentYear, currentMonth]);

  // Generate available years (current year and future years only)
  const availableYears = useMemo(() => {
    const years = [];
    for (let y = currentYear; y <= currentYear + 5; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  function mapKey(propertyId: number) {
    return `${propertyId}-${selectedYear}-${selectedMonth}`;
  }

  function authHeaders(): Record<string, string> {
    const token =
      localStorage.getItem("auth_access") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function fetchMonthly(month: number, year: number) {
    // Prevent fetching past dates
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(
        `${API_BASE}${MONTHLY_PATH}?month=${month}&year=${year}`,
        { headers: authHeaders() }
      );

      if (!resp.ok) {
        if (resp.status !== 204 && resp.status !== 404) {
          Swal.fire({
            icon: "warning",
            title: "Could not load bookings",
            toast: true,
            position: "top-center",
            timer: 4000,
            showConfirmButton: false,
          });
        }
        setProperties([]);
        setBookingsMap(new Map());
        setBookingsDetails(new Map());
        return;
      }

      const data = (await resp.json()) as BookingResponse;
      const rentProperties = data.data.filter(
        (item) => item.listing_type === "rent"
      );

      setProperties(
        rentProperties.map((it) => ({
          id: it.property_id,
          name: it.property_title,
          city: it.city,
          total_bookings_this_month: it.total_bookings_this_month,
        }))
      );

      const nextMap = new Map<string, Set<number>>();
      const nextDetails = new Map<string, Map<number, BookingItem[]>>();

      rentProperties.forEach((item) => {
        const key = mapKey(item.property_id);
        nextMap.set(key, new Set());
        nextDetails.set(key, new Map());

        item.bookings.forEach((b) => {
          daysForBooking(b.check_in, b.check_out, month, year).forEach((d) => {
            nextMap.get(key)!.add(d);
            const arr = nextDetails.get(key)!.get(d) ?? [];
            arr.push(b);
            nextDetails.get(key)!.set(d, arr);
          });
        });
      });

      setBookingsMap(nextMap);
      setBookingsDetails(nextDetails);
    } catch (err: any) {
      console.error("fetchMonthly error:", err);
      Swal.fire({
        icon: "error",
        title: "Network error",
        text: err?.message ?? "Failed to fetch bookings",
        toast: true,
        position: "top-right",
        timer: 5000,
        showConfirmButton: false,
      });
      setProperties([]);
      setBookingsMap(new Map());
      setBookingsDetails(new Map());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonthly(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  function isBooked(propertyId: number, day: number) {
    return bookingsMap.get(mapKey(propertyId))?.has(day) ?? false;
  }

  function bookingDetailsFor(propertyId: number, day: number): BookingItem[] {
    const map = bookingsDetails.get(mapKey(propertyId));
    return map?.get(day) ?? [];
  }

  function bookedDaysText(propertyId: number) {
    const s = bookingsMap.get(mapKey(propertyId));
    if (!s || s.size === 0) return "No bookings";
    return `Booked: ${Array.from(s).sort((a, b) => a - b).join(", ")}`;
  }

  // Handle month change - prevent selecting past months
  const handleMonthChange = (value: string) => {
    const month = Number(value);
    // Only allow if selected year is current year and month is current or future
    // OR if selected year is future year (any month allowed)
    if (selectedYear === currentYear && month < currentMonth) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot select past month',
        text: `You can only view ${monthNames()[currentMonth - 1]} ${currentYear} and onwards`,
        toast: true,
        position: 'top-center',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }
    setSelectedMonth(month);
  };

  // Handle year change - prevent selecting past years
  const handleYearChange = (value: string) => {
    const year = Number(value);
    if (year < currentYear) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot select past year',
        text: `You can only view ${currentYear} and onwards`,
        toast: true,
        position: 'top-center',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }
    
    // If switching to current year, ensure month is not in the past
    if (year === currentYear && selectedMonth < currentMonth) {
      setSelectedMonth(currentMonth);
    }
    setSelectedYear(year);
  };

  return (
    <div className="p-2 ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Agent Calendars
          </h2>
         
          <p className="text-xs text-gray-400 mt-1">
            Showing: {monthNames()[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-gray-600">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {availableMonths.map((month) => (
              <option 
                key={month.value} 
                value={month.value}
                disabled={selectedYear === currentYear && month.value < currentMonth}
              >
                {month.name} {month.isCurrent ? "" : ""}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {availableYears.map((year) => (
              <option 
                key={year} 
                value={year}
                disabled={year < currentYear}
              >
                {year} {year === currentYear ? "" : ""}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchMonthly(selectedMonth, selectedYear)}
            className="px-3 py-1 rounded-md bg-white border text-sm  hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 mb-3">Loading bookings…</div>
      )}

      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-y-auto calendar-scroll"
        style={{ maxHeight: "72vh" }}
      >
        <div className="p-4 space-y-3">
          {properties.length === 0 && !loading ? (
           <div className="flex justify-center py-10">
  <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
    <div className="flex justify-center mb-4">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-6 4h6M7 9h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      No Properties Found
    </h3>

    <p className="text-sm text-gray-500">
      No rent properties found for the selected month and year.
    </p>
  </div>
</div>

          ) : null}

          {properties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-start gap-4 py-2 px-2 rounded-md "
            >
              {/* Property Info - Fixed width */}
              <div className="w-56 min-w-[12rem] pr-2">
                <div className="text-sm text-gray-700 font-medium">
                  {prop.name}
                </div>
                {prop.city && (
                  <div className="text-xs text-gray-500 mt-1">
                    {prop.city}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {bookedDaysText(prop.id)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Month: {monthNames()[selectedMonth - 1]} {selectedYear}
                </div>
              </div>

              {/* Calendar Days - Scrollable area */}
              <div className="flex-1">
                <div
                  className="overflow-x-auto horizontal-scroll"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="flex items-center gap-2 py-1" style={{ minWidth: "min-content" }}>
                    {daysArray.map((d) => {
                      const booked = isBooked(prop.id, d);
                      const details = bookingDetailsFor(prop.id, d);

                      const tooltip = booked
                        ? details
                            .map(
                              (b) =>
                                `#${b.booking_id} • ${b.full_name} • ${b.check_in} → ${b.check_out}`
                            )
                            .join("\n")
                        : `Available: ${d}/${selectedMonth}/${selectedYear}`;

                      return (
                        <div
                          key={`${prop.id}-${d}`}
                          title={tooltip}
                          className={`flex-shrink-0 flex items-center justify-center select-none transition-all cursor-default`}
                          style={{
                            minWidth: 44,
                            minHeight: 44,
                            maxWidth: 56,
                            maxHeight: 56,
                          }}
                        >
                          <div
                            className={`w-full h-full flex items-center justify-center rounded-lg  text-sm font-semibold ${
                              booked
                                ? " text-gray-300 line-through border-red-200"
                                : " text-gray-800  "
                            }`}
                            style={{ padding: 6 }}
                          >
                            {d}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Booked days are red; available days are green. Calendar is read-only for agents.
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Note: You can only view current and future dates. Past dates are not accessible.
      </p>

      <style>{`
        /* Main container vertical scrollbar */
        .calendar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .calendar-scroll::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 4px;
        }
        .calendar-scroll::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
          border: 2px solid #f9fafb;
        }
        .calendar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .calendar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f9fafb;
        }

        /* Horizontal scrollbar inside each property row */
        .horizontal-scroll::-webkit-scrollbar {
          height: 10px;
        }
        .horizontal-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 5px;
          margin: 0 4px;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb {
          background-color: #9ca3af;
          border-radius: 5px;
          border: 2px solid #f3f4f6;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
        .horizontal-scroll {
          scrollbar-width: thin;
          scrollbar-color: #9ca3af #f3f4f6;
        }

        /* Hide scrollbar when not scrolling (optional) */
        .horizontal-scroll {
          -ms-overflow-style: none;
        }
        .horizontal-scroll:hover::-webkit-scrollbar {
          display: block;
        }
      `}</style>
    </div>
  );
}