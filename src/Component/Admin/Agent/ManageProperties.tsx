// File: ManageProperties.tsx
import React, { useEffect, useState, useMemo } from "react";
import { ChevronLeft, Check, Save, Home, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * ManageProperties.tsx
 * - Reads agent id from prop OR URL query (?agent=4 or ?agentId=4)
 * - Uses effectiveAgentId + viewAgentId for preselecting, optimistic updates and saves
 * - PATCH logic: try JSON first; if server returns 415, retry with FormData
 * - For a given agent (e.g. ?agent=30), admin screen shows:
 *     • All properties (sales/rentals per tab)
 *     • Assigned ones are selectable only for this agent, others blocked
 *     • Unassigned (AVAILABLE) properties visible to everyone
 * - Supports role-based view:
 *     • Admin: can view ALL properties in each tab
 *     • Agent: sees only their own assignments + available properties
 */

// ---------- CONFIG ----------
const API_BASE = "https://api.eastmondvillas.com";
const PROPERTIES_PATH = "/api/villas/properties/"; // used with ?page=1
const PROPERTY_PATCH = (id: number | string) =>
  `${API_BASE.replace(/\/+$/, "")}/api/villas/properties/${id}/`;

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
    case "draft":
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
  // normalize assigned flag for label
  const raw = property.assigned_agent;
  const isAssigned = !(
    raw === null ||
    typeof raw === "undefined" ||
    raw === "" ||
    raw === 0 ||
    raw === "0"
  );

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

    const normalized: NormalizedProperty = {
      id: p.id,
      name: p.title ?? p.name ?? `Untitled #${p.id}`,
      location: p.address ?? p.city ?? "",
      status: p.status ?? "draft",
      type: (p.listing_type ?? p.type ?? "")
        .toString()
        .toLowerCase()
        .includes("rent")
        ? "rentals"
        : "sales",
      imageUrl:
        (p.media_images && p.media_images[0] && p.media_images[0].image) ||
        p.main_image_url ||
        p.imageUrl ||
        "https://placehold.co/120x80/cccccc/333333?text=N/A",
      raw: p,
      assigned_agent: assignedAgentId,
      assigned_agent_name: assignedAgentName,
    };
    return normalized;
  }

  async function fetchAllPropertiesPages() {
    setLoading(true);
    setError(null);
    try {
      let url: string | null = `${API_BASE}${PROPERTIES_PATH}?page=1`;
      const acc: any[] = [];
      while (url) {
        const res = await fetch(url, { headers: { ...authHeaders() } });
        if (!res.ok)
          throw new Error(`Failed to fetch properties (${res.status})`);
        const json = await res.json();

        const list = Array.isArray(json.results)
          ? json.results
          : json.data ?? [];
        acc.push(...list);
        if (json.next)
          url = json.next.startsWith("http")
            ? json.next
            : `${API_BASE}${json.next}`;
        else url = null;
      }

      const normalized = acc.map(normalizeProperty);
      setProperties(normalized);

      if (viewAgentId != null) {
        const preselected = normalized
          .filter(
            (p) =>
              p.assigned_agent != null &&
              Number(p.assigned_agent) === Number(viewAgentId)
          )
          .map((p) => p.id);

        setSelectedPropertyIds(preselected);
        setInitialAssignedIds(preselected);
      } else {
        setSelectedPropertyIds([]);
        setInitialAssignedIds([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load properties");
      setProperties([]);
      setSelectedPropertyIds([]);
      setInitialAssignedIds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllPropertiesPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAgentId]);

  // toggle selection — optimistic assigned_agent update when we know viewAgentId
  const handleToggleProperty = (propertyId: number) => {
    const target = properties.find((p) => p.id === propertyId);
    if (!target) {
      return;
    }

    // HARD GUARD: if this property is already assigned to another agent,
    // do NOT allow assigning it here to a different agent.
    if (viewAgentId != null) {
      const raw = target.assigned_agent;
      let assigned: number | null;
      if (
        raw === null ||
        typeof raw === "undefined" ||
        raw === "" ||
        raw === 0 ||
        raw === "0"
      ) {
        assigned = null; // treat as AVAILABLE
      } else {
        assigned = Number(raw);
      }

      const currentAgent = Number(viewAgentId);

      if (assigned !== null && assigned !== currentAgent) {
        const assignedAgentNameFromRaw: string =
          target.assigned_agent_name ??
          target.raw?.assigned_agent_name ??
          target.raw?.assigned_agent?.name ??
          target.raw?.assigned_agent?.full_name ??
          target.raw?.assigned_agent?.username ??
          `Agent #${assigned}`;

        Swal.fire({
          icon: "warning",
          title: "Already assigned to another agent",
          text: `This property is already assigned to ${assignedAgentNameFromRaw}.`,
          position: "center",
          showConfirmButton: true,
        });
        return;
      }
    }

    setSelectedPropertyIds((prev) => {
      const isSelected = prev.includes(propertyId);
      const next = isSelected
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];

      if (viewAgentId != null) {
        setProperties((old) =>
          old.map((o) =>
            o.id === propertyId
              ? {
                  ...o,
                  assigned_agent: !isSelected ? Number(viewAgentId) : null,
                  // name is not changed here; backend will respond with fresh data on refetch
                }
              : o
          )
        );
      }

      return next;
    });
  };

  // PATCH helper (robust)
  async function patchAssignedAgent(
    propertyId: number,
    assignedValue: number | null
  ) {
    const tryJson = async () => {
      const payload = {
        assigned_agent: assignedValue === null ? null : Number(assignedValue),
      };
      const headers = { ...authHeaders(), "Content-Type": "application/json" };
      const res = await fetch(PROPERTY_PATCH(propertyId), {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      return { res, payloadMode: "json" as const, payload };
    };

    const tryForm = async () => {
      const fd = new FormData();
      fd.append(
        "assigned_agent",
        assignedValue === null ? "" : String(Number(assignedValue))
      );
      const headers = { ...authHeaders() };
      const res = await fetch(PROPERTY_PATCH(propertyId), {
        method: "PATCH",
        headers,
        body: fd,
      });
      return {
        res,
        payloadMode: "form" as const,
        payloadFormValue: fd.get("assigned_agent"),
      };
    };

    // 1) try JSON
    let attempt = await tryJson();
    let res = attempt.res;

    // 2) If JSON rejected due to unsupported media type, retry with form-data
    if (res.status === 415) {
      attempt = await tryForm();
      res = attempt.res;
    }

    const result: any = {
      propertyId,
      ok: res.ok,
      status: res.status,
      payloadMode: attempt.payloadMode,
    };
    try {
      const text = await res.text();
      try {
        result.bodyJson = JSON.parse(text);
        result.bodyText = JSON.stringify(result.bodyJson);
      } catch {
        result.bodyText = text;
      }
    } catch {
      result.bodyText = "";
    }

    if (!res.ok) {
      const err = new Error(`Patch ${propertyId} failed (${res.status})`);
      (err as any).detail = result;
      throw err;
    }

    return result;
  }

  // Save changes (batch)
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
      const before = new Set(initialAssignedIds);
      const after = new Set(selectedPropertyIds);
      const toAssign = Array.from(after).filter((id) => !before.has(id));
      const toUnassign = Array.from(before).filter((id) => !after.has(id));

      const requests: Promise<any>[] = [];
      for (const id of toAssign)
        requests.push(patchAssignedAgent(id, Number(viewAgentId)));
      for (const id of toUnassign)
        requests.push(patchAssignedAgent(id, null));

      if (requests.length === 0) {
        alert("No changes to save.");
        setSaving(false);
        return;
      }

      const settled = await Promise.allSettled(requests);
      const successes: any[] = [];
      const failures: any[] = [];
      settled.forEach((s) => {
        if (s.status === "fulfilled") successes.push(s.value);
        else {
          const reason = (s as PromiseRejectedResult).reason;
          if (reason && reason.detail) failures.push(reason.detail);
          else failures.push({ message: String(reason) });
        }
      });

      if (failures.length === 0) {
        Swal.fire({
          icon: "success",
          title: "Updated successfully",
          text: ``,
          position: "center",
          showConfirmButton: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Property assignment completed with errors",
          text: `${successes.length} succeeded, ${failures.length} failed. Check console for full details.`,
          position: "center",
          showConfirmButton: true,
        });
      }

      await fetchAllPropertiesPages();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to save assignments",
        text: err?.message || "Unknown error occurred.",
        position: "center",
        showConfirmButton: true,
      });
    } finally {
      setSaving(false);
    }
  }

  const handleCancel = () => {
    setSelectedPropertyIds([...initialAssignedIds]);
    fetchAllPropertiesPages();
  };

  // 🔢 SUMMARY STATS: totals & available counts + total assigned
  const stats = useMemo(() => {
    let availableSales = 0;
    let availableRentals = 0;
    let totalAssigned = 0;

    properties.forEach((p) => {
      const rawAssign = p.assigned_agent;
      const isAvailable =
        rawAssign === null ||
        typeof rawAssign === "undefined" ||
        rawAssign === "" ||
        rawAssign === 0 ||
        rawAssign === "0";

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

      // Normalize assigned_agent (treat 0, "0", "", null, undefined as AVAILABLE)
      const raw = p.assigned_agent;
      let assigned: number | null;
      if (
        raw === null ||
        typeof raw === "undefined" ||
        raw === "" ||
        raw === 0 ||
        raw === "0"
      ) {
        assigned = null; // AVAILABLE
      } else {
        assigned = Number(raw);
      }

      const hasViewAgent = viewAgentId != null;
      const currentAgent = hasViewAgent ? Number(viewAgentId) : null;

      // Agent: only own + available
      if (currentUserRole === "agent" && hasViewAgent && currentAgent !== null) {
        if (assigned === null) return true; // available
        if (assigned === currentAgent) return true; // belongs to this agent
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
              <div className="text-sm text-gray-500">
                Loading properties…
              </div>
            )}
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            {filteredProperties.map((property) => (
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
