import React, { useMemo } from "react";
import { Info } from "lucide-react";

/* ================= HELPERS ================= */

// Currency formatter (NOW WITH DECIMALS)
const formatCurrency = (amount: number) => {
  return `USD$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

interface Rate {
  id: number;
  period: string;
  min_stay: string;
  rate: number;
}

interface RatesBookingInformationProps {
  booking_rate_start?: Rate[];
  booking_rate?: (string | number)[];
  price?: string | number;
  security_deposit?: string | number;
  damage_deposit?: string | number;
}

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dqkczdjjs/image/upload/v1761084681/img_6_wyf01m.png";

const TAX_RATE = 0.125;

const toNumber = (value: unknown) => {
  const cleaned =
    typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
};

/* ================= TOOLTIP ================= */

const InfoTooltip = () => {
  return (
    <div className="relative group inline-block ml-2">
      <Info className="w-4 h-4 text-gray-500 cursor-pointer hover:text-teal-600" />

      <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-white shadow-xl border rounded-lg p-4 w-64 z-50 text-gray-700 text-sm">
        <p className="font-semibold text-gray-900 mb-1">Price Breakdown</p>

        <ul className="space-y-1 text-[13px]">
          <li>• 10% Government Tax</li>
          <li>• 2.5% Booking Fee</li>
          <li className="font-semibold pt-1 text-gray-800">
            Total Added: 12.5% Extra
          </li>
        </ul>
      </div>
    </div>
  );
};

/* ================= RATE GENERATION ================= */

const generateDynamicRates = (price?: string | number): Rate[] => {
  const stays = [7, 10, 14, 20, 30];
  const today = new Date();

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

  const base = Number(price) || 0;
  const perNightWithTax = base * (1 + TAX_RATE);

  return stays.map((nights, i) => {
    const end = new Date(today);
    end.setDate(today.getDate() + nights);

    return {
      id: i + 1,
      period: `${formatDateShort(today)} - ${formatDateShort(end)}`,
      min_stay: `${nights} Nights`,
      rate: perNightWithTax,
    };
  });
};

/* ================= PARSER ================= */

const parseFlatBookingRate = (arr: (string | number)[]): Rate[] => {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const rows: Rate[] = [];
  for (let i = 0; i < arr.length; i += 3) {
    const period = String(arr[i] ?? "");
    const minStay = String(arr[i + 1] ?? "");
    const rateNum = Number(arr[i + 2]) || 0;

    if (!period && !minStay && !rateNum) continue;

    rows.push({
      id: rows.length + 1,
      period,
      min_stay: minStay,
      rate: rateNum,
    });
  }

  return rows;
};

/* ================= COMPONENT ================= */

const RatesBookingInformation: React.FC<RatesBookingInformationProps> = ({
  booking_rate_start = [],
  booking_rate = [],
  price,
  security_deposit,
  damage_deposit,
}) => {
  const rows = useMemo(() => {
    if (booking_rate.length > 0) {
      return parseFlatBookingRate(booking_rate);
    }

    if (booking_rate_start.length > 0) {
      return booking_rate_start.map((r, idx) => ({
        ...r,
        id: r.id ?? idx + 1,
        rate: Number(r.rate) || 0,
      }));
    }

    return generateDynamicRates(price);
  }, [booking_rate, booking_rate_start, price]);

  return (
    <div className="mt-20 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full">
        <h1 className="lg:text-4xl md:text-5xl text-2xl  font-semibold text-left text-[#111827] mb-2">
          Nightly Rates
        </h1>

        <p className="text-gray-500 text-start mt-5 mb-5 text-lg flex items-center">
          All rental rates are subject to 10% government tax & 2.5% booking fee.
          <InfoTooltip />
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-3 bg-teal-600 text-white font-semibold text-lg p-4">
              <div className="p-2">Rental Period</div>
              <div className="p-2 text-center">Minimum Stay</div>
              <div className="p-2 text-right">Rate Per Night</div>
            </div>

            {rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-3 p-4 border-t border-gray-200 hover:bg-teal-50"
              >
                <div className="p-2 font-medium">{r.period}</div>
                <div className="p-2 text-center text-gray-600">
                  {r.min_stay}
                </div>
                <div className="p-2 text-right font-bold">
                  {formatCurrency(r.rate)}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 bg-white shadow-xl rounded-xl overflow-hidden">
            <img
              src={FALLBACK_IMAGE}
              alt="Luxury sunset view"
              className="w-full h-full object-cover"
              style={{ minHeight: "300px" }}
            />
          </div>
        </div>

        <div className="mt-10 bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Security &amp;/Or Damages Deposit
            </h3>
            <span className="inline-flex items-center rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-slate-600">
              Swift Post-Stay Refund Process
            </span>
          </div>

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
          <div className="">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_5px_18px_-12px_rgba(0,0,0,0.35)]">
              <p className="text-sm text-slate-500 mb-1">Security Deposit</p>
              <p className="text-lg font-semibold text-slate-900">
                {security_deposit !== undefined && security_deposit !== null
                  ? formatCurrency(toNumber(security_deposit))
                  : "Not provided"}
              </p>
            </div>

            {/* <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_5px_18px_-12px_rgba(0,0,0,0.35)]">
              <p className="text-sm text-slate-500 mb-1">Damage Deposit</p>
              <p className="text-lg font-semibold text-slate-900">
                {damage_deposit !== undefined && damage_deposit !== null
                  ? formatCurrency(toNumber(damage_deposit))
                  : "Not provided"}
              </p>
            </div> */}
          </div>

          {/* <p className="text-slate-600 text-sm mt-4">
            Collected prior to stay to cover potential damages or incidentals; fully refundable per
            property terms.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default RatesBookingInformation;
