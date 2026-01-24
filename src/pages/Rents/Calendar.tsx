// import React, { useCallback, useEffect, useMemo, useState } from 'react';

// type BookingRange = { start: string; end: string };

// const API_BASE =
//   import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com/api';

// function toISO(d: Date) {
//   return d.toISOString().slice(0, 10);
// }
// function parseISO(s: string) {
//   const [y, m, day] = s.split('-').map(Number);
//   return new Date(y, m - 1, day);
// }
// function eachDateStringBetween(startISO: string, endISO: string) {
//   const out: string[] = [];
//   let cur = parseISO(startISO);
//   const end = parseISO(endISO);
//   while (cur <= end) {
//     out.push(toISO(cur));
//     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
//   }
//   return out;
// }

// interface CalendarDay {
//   date: Date | null;
//   key: string;
//   isCurrentMonth: boolean;
// }

// const getCalendarDays = (date: Date): CalendarDay[] => {
//   const year = date.getFullYear();
//   const month = date.getMonth();
//   const firstDayOfMonth = new Date(year, month, 1);
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const startDayOfWeek = firstDayOfMonth.getDay();

//   const calendarDays: CalendarDay[] = [];
//   for (let i = 0; i < startDayOfWeek; i++)
//     calendarDays.push({ date: null, key: `pad-start-${i}`, isCurrentMonth: false });

//   for (let day = 1; day <= daysInMonth; day++)
//     calendarDays.push({
//       date: new Date(year, month, day),
//       key: `${year}-${month + 1}-${day}`,
//       isCurrentMonth: true,
//     });

//   const totalSlots = calendarDays.length;
//   const neededTrailingPadding = (7 - (totalSlots % 7)) % 7;
//   for (let i = 0; i < neededTrailingPadding; i++)
//     calendarDays.push({ date: null, key: `pad-end-${i}`, isCurrentMonth: false });

//   return calendarDays;
// };

// async function fetchAvailabilityFromApi(
//   villaId: number,
//   month: number,
//   year: number
// ) {
//   const url = new URL(`${API_BASE}/villas/properties/${villaId}/availability/`);
//   url.searchParams.set('month', String(month));
//   url.searchParams.set('year', String(year));
//   const res = await fetch(url.toString());
//   const data: BookingRange[] = await res.json();
//   return data;
// }

// interface Props {
//   villaId?: number;
//   initialDate?: Date;
// }

// const Calendar: React.FC<Props> = ({ villaId, initialDate }) => {
//   const [startMonthDate, setStartMonthDate] = useState<Date>(
//     initialDate
//       ? new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
//       : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
//   );

//   const secondMonthDate = useMemo(
//     () => new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + 1, 1),
//     [startMonthDate]
//   );

//   const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  





//   useEffect(() => {
//     if (!villaId) return;
//     (async () => {
//       const sets: string[] = [];
//       for (const d of [startMonthDate, secondMonthDate]) {
//         const ranges = await fetchAvailabilityFromApi(
//           villaId,
//           d.getMonth() + 1,
//           d.getFullYear()
//         );
//         ranges.forEach((r) =>
//           sets.push(...eachDateStringBetween(r.start, r.end))
//         );
//       }
//       setBookedDates(new Set(sets));
//     })();
//   }, [villaId, startMonthDate, secondMonthDate]);

//   const isDateBooked = useCallback(
//     (d: Date | null) => (d ? bookedDates.has(toISO(d)) : false),
//     [bookedDates]
//   );

//   const handlePrev = () => {
//     setStartMonthDate(new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() - 1, 1));
//   };

//   const handleNext = () => {
//     setStartMonthDate(new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + 1, 1));
//   };

//   const CalendarMonth: React.FC<{ monthDate: Date }> = ({ monthDate }) => {
//     const days = getCalendarDays(monthDate);
//     const monthName = monthDate.toLocaleString('en-US', {
//       month: 'long',
//       year: 'numeric',
//     });

//     return (
//       <div className="p-6 bg-white rounded-xl border flex-1">
//         <h3 className="text-lg font-semibold mb-4">{monthName}</h3>

//         <div className="grid grid-cols-7 text-sm text-gray-500 mb-3">
//           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
//             <div key={w} className="text-center">
//               {w}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-3">
//           {days.map(({ date, key, isCurrentMonth }) => {
//             if (!isCurrentMonth || !date)
//               return <div key={key} className="h-12 w-12" />;

//             const booked = isDateBooked(date);

//             const base =
//               'h-12 w-12 flex items-center justify-center text-sm font-semibold border rounded-lg';

//             const cls = booked
//               ? `${base} bg-red-50 text-red-600 border-red-200`
//               : `${base} bg-green-50 text-green-700 border-green-200`;

//             return (
//               <div key={key} className="flex justify-center">
//                 <div className={cls}>{date.getDate()}</div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="py-8">

//       <div className='text-center mt-15 mb-10'>
//        <p className='lg:text-4xl md:text-5xl text-2xl font-semibold text-center text-[#111827] mb-2'> Availability Calendar</p>
//         <p className='text-gray-500 '>View availability below and take a step closer to paradise. Green dates are available for booking, while red dates are already reserved.</p>
//       </div>
//       {/* Navigation header */}
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={handlePrev}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//         >
//          <img src="/public/images/left.svg" alt="" />
//           Previous
//         </button>
        
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 bg-green-400 border border-green-400 rounded-full"></div>
//             <span className="text-sm text-gray-600">Available</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 bg-red-400 border border-red-400 rounded-full"></div>
//             <span className="text-sm text-gray-600">Booked</span>
//           </div>
//         </div>

      
        
//         <button
//           onClick={handleNext}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//         >
//           Next
//           <img src="/public/images/right.svg" alt="" />
//         </button>
//       </div>

//       {/* Calendars */}
//       <div className="flex gap-6 flex-col lg:flex-row">
//         <CalendarMonth monthDate={startMonthDate} />
//         <CalendarMonth monthDate={secondMonthDate} />
//       </div>
//     </div>
//   );
// };

// export default Calendar;
















import React, { useCallback, useEffect, useMemo, useState } from 'react';
 
type BookingRange = { start: string; end: string };
 
const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com/api';
 
function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function parseISO(s: string) {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
}
function eachDateStringBetween(startISO: string, endISO: string) {
  const out: string[] = [];
  let cur = parseISO(startISO);
  const end = parseISO(endISO);
  while (cur <= end) {
    out.push(toISO(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
  return out;
}
 
interface CalendarDay {
  date: Date | null;
  key: string;
  isCurrentMonth: boolean;
}
 
const getCalendarDays = (date: Date): CalendarDay[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();
 
  const calendarDays: CalendarDay[] = [];
  for (let i = 0; i < startDayOfWeek; i++)
    calendarDays.push({ date: null, key: `pad-start-${i}`, isCurrentMonth: false });
 
  for (let day = 1; day <= daysInMonth; day++)
    calendarDays.push({
      date: new Date(year, month, day),
      key: `${year}-${month + 1}-${day}`,
      isCurrentMonth: true,
    });
 
  const totalSlots = calendarDays.length;
  const neededTrailingPadding = (7 - (totalSlots % 7)) % 7;
  for (let i = 0; i < neededTrailingPadding; i++)
    calendarDays.push({ date: null, key: `pad-end-${i}`, isCurrentMonth: false });
 
  return calendarDays;
};
 
async function fetchAvailabilityFromApi(
  villaId: number,
  month: number,
  year: number
) {
  const url = new URL(`${API_BASE}/villas/properties/${villaId}/availability/`);
  url.searchParams.set('month', String(month));
  url.searchParams.set('year', String(year));
  const res = await fetch(url.toString());
  const data: BookingRange[] = await res.json();
  return data;
}
 
interface Props {
  villaId?: number;
  initialDate?: Date;
}
 
const Calendar: React.FC<Props> = ({ villaId, initialDate }) => {
  const [startMonthDate, setStartMonthDate] = useState<Date>(
    initialDate
      ? new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
 
  const secondMonthDate = useMemo(
    () => new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + 1, 1),
    [startMonthDate]
  );
 
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
 
 
 
 
 
 
  useEffect(() => {
    if (!villaId) return;
    (async () => {
      const sets: string[] = [];
      for (const d of [startMonthDate, secondMonthDate]) {
        const ranges = await fetchAvailabilityFromApi(
          villaId,
          d.getMonth() + 1,
          d.getFullYear()
        );
        ranges.forEach((r) =>
          sets.push(...eachDateStringBetween(r.start, r.end))
        );
      }
      setBookedDates(new Set(sets));
    })();
  }, [villaId, startMonthDate, secondMonthDate]);
 
  const isDateBooked = useCallback(
    (d: Date | null) => (d ? bookedDates.has(toISO(d)) : false),
    [bookedDates]
  );
 
  const handlePrev = () => {
    setStartMonthDate(new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() - 1, 1));
  };
 
  const handleNext = () => {
    setStartMonthDate(new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + 1, 1));
  };
 
  const CalendarMonth: React.FC<{ monthDate: Date }> = ({ monthDate }) => {
    const days = getCalendarDays(monthDate);
    const monthName = monthDate.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });
 
    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {monthName}
        </h3>
        <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 pb-3 border-b border-gray-200 mb-3 tracking-wide">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w) => (
            <div key={w} className="text-center">
              {w}
            </div>
          ))}
        </div>
 
        <div className="grid grid-cols-7 gap-y-3 text-sm text-gray-800">
          {days.map(({ date, key, isCurrentMonth }) => {
            if (!isCurrentMonth || !date)
              return <div key={key} className="h-9 w-9" />;
 
            const booked = isDateBooked(date);
 
            const cls = booked
              ? 'h-9 w-9 mx-auto flex items-center justify-center text-gray-300 line-through'
              : 'h-9 w-9 mx-auto flex items-center justify-center';
 
            return (
              <div key={key} className="flex justify-center">
                <div className={cls}>{date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
 
  return (
    <div className="py-8">

      <div className='lg:text-4xl md:text-5xl text-2xl  font-semibold text-left text-[#111827] mb-2'>
        Availability 
      </div>
      <div className="bg-white border mt-10 border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">


        <div>
          
        </div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <button
            onClick={handlePrev}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Previous month"
          >
            &lt;
          </button>
 
          <button
            onClick={handleNext}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Next month"
          > 
            &gt;
          </button>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start text-center">
          <CalendarMonth monthDate={startMonthDate} />
          <CalendarMonth monthDate={secondMonthDate} />
        </div>
      </div>
    </div>
  );
};
 
export default Calendar;