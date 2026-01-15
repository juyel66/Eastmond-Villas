// AgentCard.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  MoreVertical,
  Download,
  Edit,
  X,
  Trash2,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * AgentCard
 *
 * - Defensive: won't crash when fields missing.
 * - Shows last login formatted in Barbados time (America/Barbados) using Intl.DateTimeFormat.
 * - 3-dot menu: Edit / Manage Properties / Deactivate|Activate / Delete.
 * - Uses assigned_total_property to show Properties count.
 */

const safe = (v, fallback = "") =>
  v === null || v === undefined ? fallback : v;

const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

const getStatusClass = (status = "") => {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "active":
      return "bg-green-100 text-green-700";
    case "inactive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const validatePermission = (permission) => {
  const p = String(permission || "").trim().toLowerCase();
  if (p.includes("download")) return "Download";
  if (p.includes("full")) return "Full Access";
  if (p.includes("view")) return "Only View";
  return "Only View";
};

const formatLoginTime = (input) => {
  if (!input) return "—";
  try {
    const d =
      typeof input === "string" &&
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(input)
        ? new Date(input)
        : new Date(input);
    if (isNaN(d.getTime())) return String(input);

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Barbados",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return formatter.format(d);
  } catch (e) {
    return String(input);
  }
};

export default function AgentCard({
  agent = {},
  onEdit,
  onManageProperties,
  onToggleActive,
  onDelete,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenu(false);
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  // safe values
  const name = safe(agent.name, "Unknown");
  const email = safe(agent.email, "—");
  const phone = safe(agent.phone, "—");
  const role = String(safe(agent.role || "agent"));
  const permissions = safe(agent.permission ?? agent.permissions ?? "", "");

  // 🔥 Use assigned_total_property with fallbacks
  let assignedTotalRaw =
    agent.assigned_total_property ??
    agent.propertiesCount ??
    agent.properties ??
    0;

  let assigned_total_property = Number(assignedTotalRaw);
  if (isNaN(assigned_total_property)) assigned_total_property = 0;

  // 🔍 Debug log for you
  console.log(
    "AgentCard -> id:",
    agent.id,
    "name:",
    agent.name,
    "assigned_total_property (raw):",
    assignedTotalRaw,
    "=> (final):",
    assigned_total_property
  );

  console.log("Agent data:", agent);

  // determine active status
  const isActive =
    typeof agent.is_active === "boolean"
      ? agent.is_active
      : String(safe(agent.status, "inactive")).toLowerCase() === "active";

  const status = isActive ? "active" : "inactive";
  const lastLoginRaw = safe(
    agent.lastLogin ?? agent.last_login ?? agent.__raw?.last_login ?? "",
    ""
  );
  const lastLogin = formatLoginTime(lastLoginRaw);

  const initials = getInitials(name);
  const permissionLabel = validatePermission(permissions);
  const statusClass = getStatusClass(status);

  // handlers with safe fallbacks
  const handlers = {
    edit:
      typeof onEdit === "function" ? onEdit : (a) => console.log("Edit", a),
    manage:
      typeof onManageProperties === "function"
        ? onManageProperties
        : (a) => console.log("Manage props", a),
    toggle:
      typeof onToggleActive === "function"
        ? onToggleActive
        : (a) => console.log("Toggle active", a),
    delete:
      typeof onDelete === "function"
        ? onDelete
        : (a) => console.log("Delete", a),
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between w-full h-full relative">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold text-xl border border-gray-300">
              {initials || "A"}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="More options"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((s) => !s);
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpenMenu(false);
                    handlers.edit(agent);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Details
                </button>

                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpenMenu(false);
                    handlers.manage(agent);
                  }}
                >
                  <Building2 className="w-4 h-4 mr-2" /> Manage Properties
                </button>

                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpenMenu(false);
                    handlers.toggle(agent);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />{" "}
                  {isActive ? "Deactivate" : "Activate"}
                </button>

                <hr className="my-1" />

                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setOpenMenu(false);
                    handlers.delete(agent);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-semibold text-gray-800 truncate">
            {name}
          </h2>
        </div>

        <span className="inline-block px-3 py-1 text-sm font-medium rounded-md bg-[#ECEEF2] text-black mb-4 inline-flex items-center gap-2">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>

        {/* Contact Info */}
        <div className="space-y-3 mb-4 border-b border-gray-100 pb-4">
          <div className="flex items-center text-base text-gray-600">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center text-base text-gray-600">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <span>{phone}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-base">
          <div className="flex justify-between items-center text-gray-600">
            <span>Properties</span>
            <span className="font-medium text-gray-800">
              {assigned_total_property}
            </span>
          </div>

          <div className="flex justify-between items-center text-gray-600">
            <span>Permissions</span>
            <span className="flex items-center font-medium text-gray-800">
              <span className="mr-2">
                {permissionLabel === "Download" ? (
                  <Download className="w-4 h-4" />
                ) : null}
              </span>
              {permissionLabel}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-600">Access Level</span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
            >
              {status}
            </span>
          </div>

          {/* <div className="text-xs text-gray-400 pt-2">Last login: {lastLogin}</div> */}
        </div>
      </div>
    </div>
  );
}
