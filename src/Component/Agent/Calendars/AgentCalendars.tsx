// // File: AgentCalendar.tsx
// import React, { useEffect, useMemo, useState } from "react";

// /**
//  * AgentCalendar.tsx
//  *
//  * Fetches:
//  *  https://api.eastmondvillas.com/api/villas/agent/bookings/monthly/?month=<1-12>&year=<yyyy>
//  *
//  * Behavior:
//  * - Builds rows from response.data (property_id -> id, property_title -> name)
//  * - Booked days (inside any booking range) = YELLOW (disabled)
//  * - Available days = GREEN (clickable if you later want to add booking)
//  * - Month & Year selectors refetch data
//  *
//  * NOTE:
//  * - check_out is treated EXCLUSIVE (booking covers check_in .. day before check_out).
//  *   To treat check_out inclusive, change the while condition in parseBookingDays.
//  */

// type BookingItem = {
//   booking_id: number;
//   full_name: string;
//   check_in: string; // "YYYY-MM-DD"
//   check_out: string; // "YYYY-MM-DD"
//   status?: string;
//   total_price?: string;
// };

// type BookingResponseItem = {
//   property_id: number;
//   property_title: string;
//   city?: string;
//   total_bookings_this_month?: number;
//   bookings: BookingItem[];
// };

// type BookingResponse = {
//   agent: number;
//   month: number;
//   year: number;
//   properties_count: number;
//   data: BookingResponseItem[];
// };

// type Property = {
//   id: number;
//   name: string;
//   city?: string;
//   total_bookings_this_month?: number;
// };

// const API_BASE = "https://api.eastmondvillas.com"; // your base
// const MONTHLY_PATH = "/api/villas/agent/bookings/monthly/"; // appended with ?month=&year=

// function monthNames() {
//   return [
//     "January","February","March","April","May","June",
//     "July","August","September","October","November","December"
//   ];
// }

// export default function AgentCalendar() {
//   const today = new Date();
//   // default: current month/year
//   const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

//   const [properties, setProperties] = useState<Property[]>([]);
//   // map key: `${propertyId}-${year}-${month}`
//   const [bookingsMap, setBookingsMap] = useState<Map<string, Set<number>>>(() => new Map());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // days in selected month
//   const daysInMonth = useMemo(
//     () => new Date(selectedYear, selectedMonth, 0).getDate(),
//     [selectedMonth, selectedYear]
//   );
//   const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

//   function mapKey(propertyId: number, year = selectedYear, month = selectedMonth) {
//     return `${propertyId}-${year}-${month}`;
//   }

//   // parse booking range into list of day numbers inside selected month/year
//   function parseBookingDays(checkInIso: string, checkOutIso: string, month: number, year: number) {
//     // check_out exclusive
//     const days: number[] = [];
//     const start = new Date(checkInIso + "T00:00:00");
//     const end = new Date(checkOutIso + "T00:00:00"); // exclusive
//     const d = new Date(start);
//     while (d < end) {
//       if (d.getFullYear() === year && d.getMonth() + 1 === month) {
//         days.push(d.getDate());
//       }
//       d.setDate(d.getDate() + 1);
//     }
//     return days;
//   }

//   async function fetchMonthly(month: number, year: number) {
//     setLoading(true);
//     setError(null);
//     try {
//       const url = `${API_BASE}${MONTHLY_PATH}?month=${month}&year=${year}`;
//       const resp = await fetch(url);
//       if (!resp.ok) {
//         throw new Error(`API returned ${resp.status}`);
//       }
//       const data = (await resp.json()) as BookingResponse;

//       // build property list from response.data
//       const props: Property[] = Array.isArray(data.data)
//         ? data.data.map((it) => ({
//             id: it.property_id,
//             name: it.property_title,
//             city: it.city,
//             total_bookings_this_month: it.total_bookings_this_month,
//           }))
//         : [];
//       setProperties(props);

//       // build bookings map
//       const map = new Map<string, Set<number>>();
//       // ensure keys exist for all returned properties
//       props.forEach((p) => map.set(mapKey(p.id, data.year ?? year, data.month ?? month), new Set()));

//       (data.data || []).forEach((item) => {
//         const key = mapKey(item.property_id, data.year ?? year, data.month ?? month);
//         const setDays = new Set<number>(map.get(key) ? Array.from(map.get(key)!) : []);
//         (item.bookings || []).forEach((b) => {
//           try {
//             const days = parseBookingDays(b.check_in, b.check_out, data.month ?? month, data.year ?? year);
//             days.forEach((d) => setDays.add(d));
//           } catch (err) {
//             // ignore malformed date for single booking
//             console.warn("parse booking error", err, b);
//           }
//         });
//         map.set(key, setDays);
//       });

//       setBookingsMap(map);
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.message ?? "Failed to fetch bookings");
//       setProperties([]);
//       setBookingsMap(new Map());
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchMonthly(selectedMonth, selectedYear);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedMonth, selectedYear]);

//   function isBooked(propertyId: number, day: number) {
//     const key = mapKey(propertyId);
//     const s = bookingsMap.get(key);
//     return s ? s.has(day) : false;
//   }

//   // UI: keep simple, tailwind classes for visuals
//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-800">Agent Calendar</h1>
//           <p className="text-sm text-gray-500">Booked = yellow, Available = green</p>
//         </div>

//         <div className="flex items-center gap-3">
//           <label className="text-sm text-gray-600">Month</label>
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(Number(e.target.value))}
//             className="px-2 py-1 border rounded"
//           >
//             {monthNames().map((mn, idx) => (
//               <option key={mn} value={idx + 1}>{mn}</option>
//             ))}
//           </select>

//           <label className="text-sm text-gray-600">Year</label>
//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(Number(e.target.value))}
//             className="px-2 py-1 border rounded"
//           >
//             {/* show a reasonable year range: current-2 .. current+2 */}
//             {(() => {
//               const nowY = new Date().getFullYear();
//               const arr = [];
//               for (let y = nowY - 2; y <= nowY + 2; y++) arr.push(y);
//               return arr;
//             })().map((y) => <option key={y} value={y}>{y}</option>)}
//           </select>

//           <button
//             onClick={() => fetchMonthly(selectedMonth, selectedYear)}
//             className="px-3 py-1 rounded-md bg-white border text-sm shadow-sm"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {loading && <div className="text-sm text-gray-500 mb-3">Loading bookings…</div>}
//       {error && <div className="text-sm text-red-600 mb-3">Error: {error}</div>}

//       <div className="space-y-4">
//         {properties.length === 0 && !loading ? (
//           <div className="text-sm text-gray-500">No properties found for this month/year.</div>
//         ) : null}

//         {properties.map((p) => (
//           <div key={p.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-sm font-medium text-gray-800">{p.name}</div>
//                 {p.city && <div className="text-xs text-gray-500">{p.city}</div>}
//                 <div className="text-xs text-gray-400 mt-1">Total bookings: {p.total_bookings_this_month ?? 0}</div>
//               </div>
//               <div className="text-xs text-gray-500">{monthNames()[selectedMonth - 1]} {selectedYear}</div>
//             </div>

//             <div className="mt-3 overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
//               <div className="flex items-center gap-2 py-1">
//                 {daysArray.map((d) => {
//                   const booked = isBooked(p.id, d);
//                   return (
//                     <div
//                       key={`${p.id}-${d}`}
//                       className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium
//                         ${booked ? "bg-yellow-100 border-yellow-200 text-yellow-800" : "bg-green-50 border-green-100 text-green-700"}
//                       `}
//                       title={booked ? `Booked: ${d}/${selectedMonth}/${selectedYear}` : `Available: ${d}/${selectedMonth}/${selectedYear}`}
//                     >
//                       {d}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { height: 8px; display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// }









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

const MIN_YEAR = 2025;
const MAX_YEAR = 2030;

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
  const initialYear = Math.min(MAX_YEAR, Math.max(MIN_YEAR, now.getFullYear()));

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(initialYear);
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

  // Year options for dropdown
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) arr.push(y);
    return arr;
  }, []);

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
    if (year < MIN_YEAR || year > MAX_YEAR) return;

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

  // Handle year change with validation
  const handleYearChange = (value: string) => {
    const y = Number(value);
    if (!y || y < MIN_YEAR || y > MAX_YEAR) return;
    setSelectedYear(y);
  };

  return (
    <div className=" ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Agent Calendars
          </h2>
          <p className="text-sm text-gray-500">
            Booked = red, Available = green (view-only)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-gray-600">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            {monthNames().map((mn, idx) => (
              <option key={mn} value={idx + 1}>
                {mn}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchMonthly(selectedMonth, selectedYear)}
            className="px-3 py-1 rounded-md bg-white border text-sm shadow-sm hover:bg-gray-50"
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
            <div className="text-sm text-gray-500 text-center py-8">
              No rent properties found for the selected month/year.
            </div>
          ) : null}

          {properties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-start gap-4 py-2 px-2 rounded-md hover:bg-gray-50"
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
                            className={`w-full h-full flex items-center justify-center rounded-lg border text-sm font-semibold ${
                              booked
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-green-50 text-green-700 border-green-200"
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