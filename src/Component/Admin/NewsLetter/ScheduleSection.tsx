// ScheduleSection.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Props {
  value: "immediate" | "weekly" | "monthly";
  onChange: (v: "immediate" | "weekly" | "monthly") => void;
  scheduledDay: number;
  setScheduledDay: (v: number) => void;
  scheduledDate: number;
  setScheduledDate: (v: number) => void;
  scheduledTime: string;
  setScheduledTime: (v: string) => void;
}

const ScheduleSection: React.FC<Props> = ({
  value,
  onChange,
  scheduledDay,
  setScheduledDay,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
}) => {
  const [timezone, setTimezone] = useState("America/Barbados");
  const [utcTime, setUtcTime] = useState("");

  
  
  const weekDays = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    
  ];

  const monthDates = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Generate time slots (every 30 minutes from 00:00 to 23:30)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  // Function to convert Barbados time to UTC
  const convertBarbadosToUTC = (localTime: string): string => {
    try {
      // Barbados is UTC-4 (no daylight saving)
      const [hours, minutes] = localTime.split(':').map(Number);
      
      // Convert to UTC (add 4 hours)
      let utcHours = hours + 4;
      if (utcHours >= 24) {
        utcHours -= 24;
      }
      
      return `${utcHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error converting time:", error);
      return localTime; // Fallback to original time
    }
  };

  // Function to convert UTC to Barbados time
  const convertUTCToBarbados = (utcTime: string): string => {
    try {
      const [hours, minutes] = utcTime.split(':').map(Number);
      
      // Convert to Barbados time (subtract 4 hours)
      let barbadosHours = hours - 4;
      if (barbadosHours < 0) {
        barbadosHours += 24;
      }
      
      return `${barbadosHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error converting UTC time:", error);
      return utcTime; // Fallback to original time
    }
  };

  // Update UTC time when scheduledTime changes
  useEffect(() => {
    if (scheduledTime) {
      const utc = convertBarbadosToUTC(scheduledTime);
      setUtcTime(utc);
    }
  }, [scheduledTime]);

  // Initialize UTC time when component mounts
  useEffect(() => {
    const utc = convertBarbadosToUTC(scheduledTime);
    setUtcTime(utc);
  }, []);

  // Handle time change from Barbados time input
  const handleTimeChange = (localTime: string) => {
    setScheduledTime(localTime);
    const utc = convertBarbadosToUTC(localTime);
    setUtcTime(utc);
  };

  // Handle direct UTC time change (if needed)
  const handleUTCTimeChange = (utcTime: string) => {
    setUtcTime(utcTime);
    const barbadosTime = convertUTCToBarbados(utcTime);
    setScheduledTime(barbadosTime);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Send Schedule</h3>
        <div className="flex items-center gap-2">
          {/* Timezone display only */}
          <div className="text-sm text-gray-500">
            Timezone: <span className="font-medium">{timezone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREQUENCY SELECTION */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Frequency</p>
          <div className="space-y-2">
            {([
              { value: "immediate", label: "  Immediate Delivery" },
              { value: "weekly", label: " Weekly Delivery" },
              { value: "monthly", label: " Monthly Delivery" },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  value === option.value
                    ? "border-teal-600 bg-teal-50 text-teal-700 font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* SCHEDULE OPTIONS */}
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Schedule Details</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WEEKLY OPTIONS */}
            {value === "weekly" && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Day of Week</label>
                  <select
                    value={scheduledDay}
                    onChange={(e) => setScheduledDay(parseInt(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {weekDays.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Time (Barbados)
                    <span className="text-gray-400 ml-1">(UTC-4)</span>
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {/* <p className="text-xs text-gray-500 mt-1">
                    UTC: {utcTime}
                  </p> */}
                </div>
                
                <div className="flex items-end mt-3">
                  <div className="bg-blue-50 p-3 rounded-lg w-full">
                    <p className="text-xs text-blue-600">
                      Will be sent every {weekDays.find(d => d.value === scheduledDay)?.label} at {scheduledTime} ({timezone})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      UTC: {utcTime} 
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* MONTHLY OPTIONS */}
            {value === "monthly" && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date of Month</label>
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(parseInt(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {monthDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Time (Barbados)
                    <span className="text-gray-400 ml-1">(UTC-4)</span>
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {/* <p className="text-xs text-gray-500 mt-1">
                    UTC: {utcTime}
                  </p> */}
                </div>
                
                <div className="flex items-end">
                  <div className="bg-blue-50 p-3 rounded-lg w-full">
                    <p className="text-xs text-blue-600">
                      Will be sent on {scheduledDate}th of every month at {scheduledTime} ({timezone})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      UTC: {utcTime}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* IMMEDIATE OPTION */}
            {value === "immediate" && (
              <div className="md:col-span-3">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Ready to Send Immediately</p>
                      <p className="text-sm text-green-600">Newsletter will be sent as soon as you click "Send Newsletter"</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Timezone: {timezone} (UTC-4)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;