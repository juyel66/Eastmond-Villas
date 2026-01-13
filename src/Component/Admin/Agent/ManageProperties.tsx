// File: ManageProperties.tsx
import React, { useEffect, useState, useMemo } from "react";
import { ChevronLeft, Check, Save, Home, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * ManageProperties.tsx
 * - Reads agent id from prop OR URL query (?agent=4 or ?agentId=4)
 * - Uses effectiveAgentId + viewAgentId for preselecting, optimistic updates and saves
 * - New API integration for property assignments
 * - Now ALL properties can be assigned to ALL agents regardless of current assignment
 */

// ---------- CONFIG ----------
const API_BASE = "https://api.eastmondvillas.com";
const PROPERTY_ASSIGNMENTS_API = (agentId: number | string) => 
  `${API_BASE.replace(/\/+$/, "")}/api/villas/property-assignments/?agent_id=${agentId}`;
const ASSIGN_PROPERTY_TO_AGENT_API = 
  `${API_BASE.replace(/\/+$/, "")}/api/villas/assign-property-to-agent/`;

// ---------- SMALL TYPES ----------
type NormalizedProperty = {
  id: number;
  name: string;
  location: string;
  status: string;
  type: string; // "sales" | "rentals" | any future type
  imageUrl: string;
  raw: any;
  assigned_agent: number | string | null | undefined;
  assigned_agent_name?: string | null;
  is_assigned?: boolean; // New field from assignments API
};

type ManagePropertiesProps = {
  agentId?: number; // optional; URL ?agent=4 will be used if prop not provided
  agentName?: string;

  // current logged-in user context (for access control)
  currentUserRole?: "admin" | "agent";
  currentUserAgentId?: number | null;
};

// ---------- SMALL UI HELPERS ----------
const PropertyStatusBadge = ({ status }: { status?: string }) => {
  let classes = "";
  const st = String(status ?? "").toLowerCase();
  switch (st) {
    case "published":
      classes = "bg-green-100 text-green-700";
      break;
    case "pending":
    case "pending review":
      classes = "bg-yellow-100 text-yellow-700";
      break;
    case "Published":
      classes = "bg-gray-100 text-gray-700";
      break;
    default:
      classes = "bg-gray-100 text-gray-700";
  }
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${classes} whitespace-nowrap capitalize`}
    >
      {status}
    </span>
  );
};

const PropertyListItem = ({
  property,
  isSelected,
  onToggle,
}: {
  property: NormalizedProperty;
  isSelected: boolean;
  onToggle: (id: number) => void;
}) => {
  // Get assigned status from new API field
  const isAssigned = property.is_assigned || false;

  const assignmentLabel = isAssigned ? "Assigned" : "Available";
  const assignmentClasses = isAssigned
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";

  const assignedAgentName = property.assigned_agent_name;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition duration-150 border w-full ${
        isSelected
          ? "border-gray-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
      onClick={() => onToggle(property.id)}
    >
      <div className="flex items-center flex-grow min-w-0">
        <div
          className={`w-5 h-5 mr-4 flex items-center justify-center border-2 rounded-full transition duration-150 ${
            isSelected
              ? "bg-gray-600 border-gray-600"
              : "bg-white border-gray-400"
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </div>

        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-28 h-20 object-cover rounded-md mr-4 flex-shrink-0"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              "https://placehold.co/120x80/cccccc/333333?text=N/A";
          }}
        />

        <div className="flex-grow min-w-0">
          <p className="text-lg font-semibold text-gray-800 truncate">
            {property.name}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {property.location}
          </p>

          {/* Assigned / Available under name + description */}
          <div className="mt-1 flex flex-col gap-0.5">
            <span
              className={`inline-flex w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${assignmentClasses}`}
            >
              {assignmentLabel}
            </span>

            {isAssigned && assignedAgentName && (
              <span className="text-xs text-gray-600">
                Assigned to {assignedAgentName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 ml-4">
        <PropertyStatusBadge status={property.status} />
      </div>
    </div>
  );
};

// ---------- MAIN COMPONENT ----------
export default function ManageProperties({
  agentId,
  agentName,
  currentUserRole = "admin",
  currentUserAgentId = null,
}: ManagePropertiesProps) {
  const location = useLocation();
  const [properties, setProperties] = useState<NormalizedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"sales" | "rentals">("sales");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
  const [initialAssignedIds, setInitialAssignedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  // parse agent from query (if present)
  const queryAgent = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      const v = params.get("agent") ?? params.get("agentId");
      if (!v) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    } catch {
      return undefined;
    }
  }, [location.search]);

  // effective agent: prop > query param
  const effectiveAgentId = agentId ?? queryAgent;

  useEffect(() => {
    // previously: console.log("Resolved effectiveAgentId", ...)
  }, [agentId, queryAgent, effectiveAgentId]);

  // try to get agentName from location.state if not passed via props
  const locationState = location.state as any;
  const displayAgentName: string =
    agentName ?? locationState?.agentName ?? "";

  // which agent's properties this screen is actually showing
  const viewAgentId = useMemo(() => {
    // If current user is an agent, they should only ever see *their own* set
    if (currentUserRole === "agent") {
      const forcedId = currentUserAgentId ?? effectiveAgentId ?? null;
      return forcedId;
    }

    // Admin: can view whatever is passed via prop/query
    return effectiveAgentId ?? null;
  }, [currentUserRole, currentUserAgentId, effectiveAgentId]);

  // --- helpers ---
  function authHeaders(): Record<string, string> {
    try {
      const token =
        localStorage.getItem("auth_access") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      if (token) return { Authorization: `Bearer ${token}` };
    } catch (e) {
      // previously logged warning
    }
    return {};
  }

  function normalizeProperty(p: any): NormalizedProperty {
    const assignedAgentId =
      typeof p.assigned_agent === "number"
        ? p.assigned_agent
        : p.assigned_agent?.id ?? null;

    const assignedAgentName: string | null =
      p.assigned_agent_name ??
      p.assigned_agent?.name ??
      p.assigned_agent?.full_name ??
      p.assigned_agent?.username ??
      null;

    // Get image from the new API format
    let imageUrl = "https://placehold.co/120x80/cccccc/333333?text=N/A";
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      // Take the first image from the images array
      imageUrl = p.images[0]?.image || imageUrl;
    } else if (p.media_images && Array.isArray(p.media_images) && p.media_images.length > 0) {
      // Fallback to media_images if images array is not present
      imageUrl = p.media_images[0]?.image || imageUrl;
    } else if (p.main_image_url) {
      // Fallback to main_image_url
      imageUrl = p.main_image_url;
    } else if (p.imageUrl) {
      // Fallback to imageUrl
      imageUrl = p.imageUrl;
    }

    const normalized: NormalizedProperty = {
      id: p.id,
      name: p.title ?? p.name ?? `Untitled #${p.id}`,
      location: p.address ?? p.city ?? "",
      status: p.status ?? "Published", // Default status since not in new API response
      type: (p.listing_type ?? p.type ?? "")
        .toString()
        .toLowerCase()
        .includes("rent")
        ? "rentals"
        : "sales",
      imageUrl: imageUrl,
      raw: p,
      assigned_agent: assignedAgentId,
      assigned_agent_name: assignedAgentName,
      is_assigned: p.is_assigned ?? false, // New field
    };
    return normalized;
  }

  async function fetchAllProperties() {
    if (!viewAgentId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch properties with agent assignments
      const res = await fetch(PROPERTY_ASSIGNMENTS_API(viewAgentId), { 
        headers: { ...authHeaders() } 
      });
      
      if (!res.ok)
        throw new Error(`Failed to fetch properties (${res.status})`);
      
      const json = await res.json();
      
      // Handle both response formats: array directly or with results/data field
      let list = [];
      if (Array.isArray(json)) {
        // Direct array response (like in your example)
        list = json;
      } else if (Array.isArray(json.results)) {
        // Results field response
        list = json.results;
      } else if (Array.isArray(json.data)) {
        // Data field response
        list = json.data;
      }
      
      console.log('[ManageProperties] Fetched properties:', list.length);

      const normalized = list.map(normalizeProperty);
      setProperties(normalized);

      // Preselect properties that are already assigned to this agent
      const preselected = normalized
        .filter((p) => p.is_assigned)
        .map((p) => p.id);

      setSelectedPropertyIds(preselected);
      setInitialAssignedIds(preselected);
    } catch (err: any) {
      console.error('[ManageProperties] Error fetching properties:', err);
      setError(err?.message || "Failed to load properties");
      setProperties([]);
      setSelectedPropertyIds([]);
      setInitialAssignedIds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAgentId]);

  // toggle selection — optimistic update
  const handleToggleProperty = (propertyId: number) => {
    // NEW LOGIC: Always allow toggling, no restrictions
    setSelectedPropertyIds((prev) => {
      const isSelected = prev.includes(propertyId);
      const next = isSelected
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];

      // Optimistic update
      setProperties((old) =>
        old.map((o) =>
          o.id === propertyId
            ? {
                ...o,
                is_assigned: !isSelected,
                // If assigning to this agent, update the assigned_agent info
                assigned_agent: !isSelected ? Number(viewAgentId) : null,
              }
            : o
        )
      );

      return next;
    });
  };

  // Save assignments using new bulk API
  async function handleSaveAssignments() {
    if (viewAgentId == null) {
      alert(
        "Cannot save: no agent specified. Pass agentId prop or use ?agent=ID in the URL."
      );
      return;
    }
    if (properties.length === 0) {
      alert("Cannot save: no properties loaded from API.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        agent: Number(viewAgentId),
        properties: selectedPropertyIds,
      };

      const response = await fetch(ASSIGN_PROPERTY_TO_AGENT_API, {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save assignments: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      Swal.fire({
        icon: "success",
        title: "Updated successfully",
        text: `Assigned ${selectedPropertyIds.length} properties to agent`,
        position: "center",
        showConfirmButton: true,
      });

      // Refresh the data
      await fetchAllProperties();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to save assignments",
        text: err?.message || "Unknown error occurred.",
        position: "center",
        showConfirmButton: true,
      });
      
      // Revert to initial state on error
      setSelectedPropertyIds([...initialAssignedIds]);
      fetchAllProperties();
    } finally {
      setSaving(false);
    }
  }

  const handleCancel = () => {
    setSelectedPropertyIds([...initialAssignedIds]);
    fetchAllProperties();
  };

  // 🔢 SUMMARY STATS: totals & available counts + total assigned
  const stats = useMemo(() => {
    let availableSales = 0;
    let availableRentals = 0;
    let totalAssigned = 0;

    properties.forEach((p) => {
      const isAvailable = !p.is_assigned;
      const type = (p.type ?? "").toLowerCase();

      if (isAvailable) {
        if (type === "sales") availableSales++;
        else if (type === "rentals") availableRentals++;
      } else {
        totalAssigned++;
      }
    });

    const totalProperties = properties.length;

    return {
      totalProperties,
      availableSales,
      availableRentals,
      totalAssigned,
    };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const result = properties.filter((p) => {
      const type = p.type ?? "sales";

      // Tab filter
      if (activeTab === "sales" && type !== "sales") return false;
      if (activeTab === "rentals" && type !== "rentals") return false;

      const hasViewAgent = viewAgentId != null;
      const currentAgent = hasViewAgent ? Number(viewAgentId) : null;

      // Agent: only own + available
      if (currentUserRole === "agent" && hasViewAgent && currentAgent !== null) {
        if (!p.is_assigned) return true; // available
        if (p.assigned_agent === currentAgent) return true; // belongs to this agent
        return false; // belongs to another agent → hide
      }

      // Admin or no agent context: show ALL properties in this tab
      return true;
    });

    return result;
  }, [properties, activeTab, viewAgentId, currentUserRole, currentUserAgentId]);

  const selectedCount = selectedPropertyIds.length;

  return (
    <div className="p-6 md:p-10 flex flex-col items-center">
      <div className="w-full bg-white rounded-xl p-6 md:p-8">
        <header className="mb-8 border-b border-gray-100 pb-4">
          <Link
            to="/dashboard/admin-agent"
            className="flex items-center text-gray-500 w-15 hover:text-gray-800 transition-colors mb-4"
            aria-label="Back to Agent List"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-800">
            Assign Properties to Agent
          </h1>
          <p className="text-xl font-medium text-gray-500 mt-1">
            {displayAgentName}
          </p>
        </header>

        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Select Properties
        </h2>

        {/* 🔢 SUMMARY BAR */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="px-4 py-2 rounded-lg bg-gray-50 border text-sm text-gray-700">
            <span className="font-semibold">{stats.totalProperties}</span>{" "}
            Total Properties
          </div>
          <div className="px-4 py-2 rounded-lg bg-gray-50 border text-sm text-gray-700">
            <span className="font-semibold">{stats.availableSales}</span>{" "}
            Sales Available
          </div>
          <div className="px-4 py-2 rounded-lg bg-gray-50 border text-sm text-gray-700">
            <span className="font-semibold">{stats.availableRentals}</span>{" "}
            Rentals Available
          </div>
          <div className="px-4 py-2 rounded-lg bg-gray-50 border text-sm text-gray-700">
            <span className="font-semibold">{stats.totalAssigned}</span>{" "}
            Total Assigned
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
              activeTab === "sales"
                ? "bg-[#009689] text-white border-[#009689]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("sales")}
          >
            <Home className="w-4 h-4" /> Properties Sales
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
              activeTab === "rentals"
                ? "bg-[#009689] text-white border-[#009689]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("rentals")}
          >
            <Building2 className="w-4 h-4" /> Properties Rentals
          </button>
        </div>

        <main className="space-y-4 mb-8">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {loading && (
              <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
                  <p className="text-sm text-gray-600">Loading properties…</p>
                </div>
              </div>
            )}
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            {!loading && filteredProperties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                isSelected={selectedPropertyIds.includes(property.id)}
                onToggle={handleToggleProperty}
              />
            ))}

            {!loading && filteredProperties.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                No properties available in this category.
              </p>
            )}
          </div>
        </main>

        <footer className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 font-medium">
              {selectedCount} property
              {selectedCount !== 1 ? "s" : ""} selected
            </p>
            {viewAgentId == null && (
              <p className="text-sm text-yellow-600">
                Note: pass <code>agentId</code> prop or use <code>?agent=ID</code>{" "}
                in URL to enable assignment on save.
              </p>
            )}
            {properties.length === 0 && !loading && (
              <p className="text-sm text-gray-500">
                No properties loaded from API.
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 flex items-center bg-teal-600 text-white rounded-lg font-medium shadow-md hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSaveAssignments}
              disabled={saving || properties.length === 0}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Saving..." : "Save Assignments"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}