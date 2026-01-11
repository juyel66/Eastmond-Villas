import React from "react";
// import { ScheduleType } from "../types/newsletter.types";

interface Props {
  value: ScheduleType;
  onChange: (v: ScheduleType) => void;
}

const ScheduleSection: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-600">Send Schedule</h3>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ScheduleType)}
        className="w-full border rounded-lg px-4 py-3 bg-gray-50"
      >
        <option value="immediate">🚀 Immediate Delivery</option>
        <option value="weekly">📅 Weekly Delivery</option>
        <option value="monthly">🗓 Monthly Delivery</option>
      </select>

      {value === "weekly" && (
        <select className="w-full border rounded-lg px-4 py-3 bg-gray-50">
          <option>Friday</option>
          <option>Saturday</option>
          <option>Sunday</option>
        </select>
      )}

      {value === "monthly" && (
        <select className="w-full border rounded-lg px-4 py-3 bg-gray-50">
          <option>12 Jan</option>
          <option>15 Jan</option>
          <option>20 Jan</option>
        </select>
      )}
    </div>
  );
};

export default ScheduleSection;
