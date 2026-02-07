// File: AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties, fetchActivityLogs } from "../../../features/Properties/PropertiesSlice";
import type { AppDispatch, RootState } from "../../../store";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { getAccessToken, refreshToken, logout } from "@/features/Auth/authSlice";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-family='Arial' font-size='18'>No image</text></svg>`
  );

function timeAgo(isoOrDate) {
  if (!isoOrDate) return "—";
  const date = typeof isoOrDate === "string" || typeof isoOrDate === "number" ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(date.getTime())) return String(isoOrDate);

  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 5) return "just now";
  if (diff < 60) return `${diff} second${diff === 1 ? "" : "s"} ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function extractEmail(text) {
  if (!text || typeof text !== "string") return null;
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w-.]+/);
  return m ? m[0] : null;
}

function formatAgentDisplay(agent, details) {
  if (agent && typeof agent === "string" && agent.trim()) return agent;
  if (agent && typeof agent === "object") {
    if (agent.name) return String(agent.name);
    if (agent.full_name) return String(agent.full_name);
    if (agent.email) return String(agent.email);
  }
  // try to extract email from details text
  const e = extractEmail(details);
  if (e) return e;
  return "System";
}

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // UI toggles and visible counts
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // visible counts for progressive load
  const [propertiesVisibleCount, setPropertiesVisibleCount] = useState(5);
  const [activityVisibleCount, setActivityVisibleCount] = useState(5);

  // Role verification state
  const [roleVerified, setRoleVerified] = useState(false);
  const [verifyingRole, setVerifyingRole] = useState(true);

  // handlers for toggles
  const handleViewAllProperties = () => {
    if (!showAllProperties) {
      setShowAllProperties(true);
      setPropertiesVisibleCount(30);
    } else {
      setShowAllProperties(false);
      setPropertiesVisibleCount(5);
    }
  };

  const handleViewAllActivity = () => {
    if (!showAllActivity) {
      setShowAllActivity(true);
      setActivityVisibleCount(30);
    } else {
      setShowAllActivity(false);
      setActivityVisibleCount(5);
    }
  };

  // progressive "view more" handlers
  const loadMoreProperties = (total) => {
    setPropertiesVisibleCount((cur) => Math.min(total, cur + 10));
  };

  const loadMoreActivity = (total) => {
    setActivityVisibleCount((cur) => Math.min(total, cur + 10));
  };

  // collapse helpers
  const collapseProperties = () => {
    setShowAllProperties(false);
    setPropertiesVisibleCount(5);
  };

  const collapseActivity = () => {
    setShowAllActivity(false);
    setActivityVisibleCount(5);
  };

  // Redux state
  const properties = useSelector((s: RootState) => s.propertyBooking.properties) ?? [];
  const propertiesLoading = useSelector((s: RootState) => s.propertyBooking.loading);
  const propertiesError = useSelector((s: RootState) => s.propertyBooking.error);

  const activityLogs = useSelector((s: RootState) => s.propertyBooking.activityLogs) ?? [];
  const activityLoading = useSelector((s: RootState) => s.propertyBooking.loading);
  const activityError = useSelector((s: RootState) => s.propertyBooking.error);

  // Local agents state
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState(null);
  const [open, setOpen] = useState(false);

  // Function to verify user role from API
  const verifyUserRole = async () => {
    try {
      setVerifyingRole(true);
      
      // Get token
      const token = getAccessToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get API base URL
      const baseUrl = import.meta.env.VITE_API_BASE || "https://api.eastmondvillas.com";
      const apiUrl = `${baseUrl.replace(/\/$/, "")}/auth/user/`;

      console.log("Verifying user role from:", apiUrl);

      // Fetch current user from API
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // If unauthorized, try refresh token
      if (response.status === 401) {
        console.log("Token expired, trying refresh...");
        const refreshResult = await dispatch(refreshToken());
        
        if (refreshToken.fulfilled.match(refreshResult)) {
          const newToken = getAccessToken();
          const retryResponse = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            throw new Error("Refresh failed");
          }
          
          const userData = await retryResponse.json();
          await checkUserRole(userData);
        } else {
          throw new Error("Token refresh failed");
        }
      } 
      // If response is OK
      else if (response.ok) {
        const userData = await response.json();
        await checkUserRole(userData);
      } 
      // Any other error
      else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Role verification failed:", error.message);
      
      // Show error message
      await Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Failed to verify your permissions. Please login again.",
        timer: 3000,
        showConfirmButton: true,
      });

      // Logout user
      await dispatch(logout());
      navigate("/login");
    } finally {
      setVerifyingRole(false);
    }
  };

  // Function to check if user has admin role
  const checkUserRole = async (userData) => {
    console.log("User data from API:", userData);
    
    // Extract role from user data
    const userRole = userData.role || userData.user_type || userData.groups?.[0] || "user";
    const userName = userData.name || userData.full_name || userData.username || "User";
    
    console.log("User role detected:", userRole);
    
    // Check if user is admin
    if (userRole !== "admin") {
      console.warn(`User role is '${userRole}', admin required.`);
      
      // Show access denied message
      await Swal.fire({
        icon: "warning",
        title: "Access Denied",
        html: `Only administrators can access this page.<br><br>
               <small><strong>Your Role:</strong> ${userRole}<br>
               <strong>Your Name:</strong> ${userName}</small>`,
        timer: 4000,
        showConfirmButton: true,
      });

      // Logout and redirect
      await dispatch(logout());
      navigate("/login");
    } else {
      // Role verified, allow access
      console.log("Admin role verified successfully");
      setRoleVerified(true);
      
      // Save user data to localStorage for future reference
      localStorage.setItem("current_user", JSON.stringify(userData));
    }
  };

  // Verify user role on component mount
  useEffect(() => {
    verifyUserRole();
  }, []);

  // Authentication helper function
  const doFetchWithRefresh = React.useCallback(
    async (input: RequestInfo, init: RequestInit = {}, allowRetry = true): Promise<Response> => {
      const token = getAccessToken();
      const baseHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(init.headers ? (init.headers as Record<string, string>) : {}),
      };
      if (token) baseHeaders.Authorization = `Bearer ${token}`;

      const res = await fetch(input, { ...init, headers: baseHeaders });

      if (res.status !== 401) return res;

      if (!allowRetry) return res;

      try {
        const refreshResult = await dispatch(refreshToken());
        if (refreshToken.fulfilled.match(refreshResult)) {
          const newToken = getAccessToken();
          const retryHeaders = { ...baseHeaders, Authorization: newToken ? `Bearer ${newToken}` : undefined };
          const retryRes = await fetch(input, { ...init, headers: retryHeaders });
          return retryRes;
        }
        return res;
      } catch (e) {
        return res;
      }
    },
    [dispatch]
  );

  // Fetch API data on mount (only after role verification)
  useEffect(() => {
    if (!roleVerified) return;

    const fetchData = async () => {
      try {
        await dispatch(fetchProperties());
        await dispatch(fetchActivityLogs());
      } catch (error) {
        if (error?.status === 401) {
          try {
            const refreshResult = await dispatch(refreshToken());
            if (refreshToken.fulfilled.match(refreshResult)) {
              await dispatch(fetchProperties());
              await dispatch(fetchActivityLogs());
            } else {
              await Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Your session has expired. Please login again.",
              });
              navigate("/login");
            }
          } catch (refreshError) {
            await Swal.fire({
              icon: "warning",
              title: "Session Expired",
              text: "Your session has expired. Please login again.",
            });
            navigate("/login");
          }
        }
      }
    };

    fetchData();
  }, [roleVerified, dispatch, navigate]);

  // Helper: make candidate agent URLs robust
  const buildAgentUrlCandidates = () => {
    const rawBase = import.meta.env.VITE_API_BASE || "https://api.eastmondvillas.com";
    const b = String(rawBase).replace(/\/+$/, "");
    const candidates = [];
    
    if (b.toLowerCase().includes("/api")) {
      candidates.push(`${b}/agents/`);
      candidates.push(`${b.replace(/\/api.*$/i, "")}/api/agents/`);
    } else {
      candidates.push(`${b}/api/agents/`);
      candidates.push(`${b}/agents/`);
    }
    
    return Array.from(new Set(candidates));
  };

  // Fetch agents list from API
  useEffect(() => {
    if (!roleVerified) return;

    let mounted = true;
    const controller = new AbortController();

    const candidates = buildAgentUrlCandidates();

    const fetchAgents = async () => {
      setAgentsLoading(true);
      setAgentsError(null);
      try {
        let success = false;
        let lastErr = null;

        for (const url of candidates) {
          if (!mounted) break;
          try {
            const res = await doFetchWithRefresh(url, { 
              signal: controller.signal,
              method: "GET"
            });
            
            if (!res.ok) {
              const txt = await res.text().catch(() => "");
              lastErr = `Attempt ${url} → HTTP ${res.status} ${txt ? `: ${txt}` : ""}`;
              console.warn("[agents fetch] candidate failed:", url, res.status, txt);
              continue;
            }

            const json = await res.json();
            const list = Array.isArray(json) ? json : (Array.isArray(json.results) ? json.results : []);
            if (mounted) setAgents(list);
            success = true;
            break;
          } catch (err) {
            lastErr = err;
            if (err && err.name === "AbortError") {
              break;
            }
            console.warn("[agents fetch] candidate threw:", url, err);
            continue;
          }
        }

        if (!success) {
          const message = typeof lastErr === "string" ? lastErr : (lastErr && lastErr.message) ? lastErr.message : "Failed to fetch agents";
          if (mounted) setAgentsError(message);
          console.error("[agents fetch] all candidates failed:", candidates, lastErr);
        }
      } catch (err) {
        if (err && err.name !== "AbortError") {
          console.error("[agents fetch] unexpected error:", err);
          if (mounted) setAgentsError(String(err.message || err));
        }
      } finally {
        if (mounted) setAgentsLoading(false);
      }
    };

    fetchAgents();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [doFetchWithRefresh, roleVerified]);

  // Normalize properties
  const normalizedProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    const extractUrl = (m) => {
      if (!m) return null;
      if (typeof m === "string") return m;
      if (m.image) return m.image;
      if (m.url) return m.url;
      if (m.file) return m.file;
      return null;
    };

    return properties.map((p) => {
      let image = null;
      if (Array.isArray(p.media_images) && p.media_images.length > 0) {
        image = extractUrl(p.media_images[0]);
      }
      if (!image && Array.isArray(p.bedrooms_images) && p.bedrooms_images.length > 0) {
        image = extractUrl(p.bedrooms_images[0]);
      }

      image = image || p.main_image_url || p.image || p.thumbnail || null;

      let status = p.status ?? p.state ?? (p.published ? "Published" : "Draft");
      if (typeof status === "string") {
        status = status.replace(/_/g, " ");
        if (status.toLowerCase() === "pending review" || status.toLowerCase() === "pending_review") {
          status = "Pending Review";
        } else {
          status = status.split(" ").map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(" ");
        }
      }

      return {
        id: p.id ?? p.pk ?? Math.random(),
        image,
        title: p.title ?? p.name ?? p.address ?? `Property ${p.id ?? ""}`,
        price: (typeof p.price === "number" ? `$${p.price}` : p.price) ?? p.price_display ?? "—",
        status: status || "Draft",
        created_at: p.created_at ?? p.created ?? null,
        agent: p.created_by_name ?? p.agent_name ?? null,
      };
    });
  }, [properties]);

  // Activity normalized
  const normalizedActivity = useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) return [];

    return activityLogs.map((a, idx) => {
      const rawDetails = a.detials ?? a.details ?? a.changes_text ?? a.object_repr ?? "";
      const timestamp = a.timestamp ?? a.created_at ?? a.time ?? "—";
      const agentDisplay = formatAgentDisplay(a.user ?? a.created_by_name ?? a.agent, rawDetails);

      const status = a.status ?? (a.is_read === false ? "Pending" : "Live");

      return {
        id: a.id ?? idx,
        type: a.type ?? a.action ?? a.object_repr ?? "Activity",
        propertyName:
          (a.changes && a.changes.title && a.changes.title[1]) ??
          a.target_object ??
          a.object_repr ??
          (a.property_name ?? a.property_title) ??
          "—",
        agent: agentDisplay,
        time: timestamp,
        status,
        details: rawDetails,
        raw: a,
      };
    });
  }, [activityLogs]);

  // Totals calculations
  const totalsFromPropertiesFallback = useMemo(() => {
    const all = normalizedProperties;
    const totalProperties = all.length;
    const activeListings = all.filter((p) => String(p.status).toLowerCase().includes("publish")).length;
    const pendingReviews = all.filter((p) => String(p.status).toLowerCase().includes("pending")).length;
    const agentsSet = new Set(all.map((p) => (p.agent ? String(p.agent).trim() : null)).filter(Boolean));
    const activeAgentsFallback = agentsSet.size || 0;
    return { totalProperties, activeListings, pendingReviews, activeAgentsFallback };
  }, [normalizedProperties]);

  const activeAgentsCount = useMemo(() => {
    if (Array.isArray(agents) && agents.length > 0) {
      return agents.filter((a) => {
        if (!a) return false;
        if (a.is_active === true) return true;
        if (a.active === true) return true;
        if (typeof a.is_active === "string" && a.is_active.toLowerCase() === "true") return true;
        if (typeof a.active === "string" && a.active.toLowerCase() === "true") return true;
        return false;
      }).length;
    }
    
    return totalsFromPropertiesFallback.activeAgentsFallback;
  }, [agents, totalsFromPropertiesFallback]);

  const totals = useMemo(() => {
    return {
      totalProperties: totalsFromPropertiesFallback.totalProperties,
      activeListings: totalsFromPropertiesFallback.activeListings,
      pendingReviews: totalsFromPropertiesFallback.pendingReviews,
      activeAgents: activeAgentsCount,
    };
  }, [totalsFromPropertiesFallback, activeAgentsCount]);

  // Recent properties
  const recentProperties = useMemo(() => {
    const copy = [...normalizedProperties];
    copy.sort((a, b) => {
      const ad = a.created_at ? Date.parse(a.created_at) : 0;
      const bd = b.created_at ? Date.parse(b.created_at) : 0;
      return bd - ad;
    });
    return copy;
  }, [normalizedProperties]);

  useEffect(() => {
    const total = recentProperties.length;
    if (showAllProperties) {
      setPropertiesVisibleCount((cur) => Math.min(Math.max(cur, 30), total));
    } else {
      setPropertiesVisibleCount(5);
    }
  }, [showAllProperties, recentProperties.length]);

  const recentToShow = recentProperties.slice(0, Math.min(propertiesVisibleCount, recentProperties.length));

  // Recent activity
  const recentActivity = useMemo(() => {
    const copy = [...normalizedActivity];
    copy.sort((a, b) => {
      const at = a.time ? Date.parse(a.time) || 0 : 0;
      const bt = b.time ? Date.parse(b.time) || 0 : 0;
      return bt - at;
    });
    return copy;
  }, [normalizedActivity]);

  useEffect(() => {
    const total = recentActivity.length;
    if (showAllActivity) {
      setActivityVisibleCount((cur) => Math.min(Math.max(cur, 30), total));
    } else {
      setActivityVisibleCount(5);
    }
  }, [showAllActivity, recentActivity.length]);

  const recentActivityToShow = recentActivity.slice(0, Math.min(activityVisibleCount, recentActivity.length));

  // helper classes
  const getPropertyStatusClass = (status) => {
    const normalizedStatus = String(status ?? "").toLowerCase();
    return normalizedStatus === "published"
      ? "border bg-green-50 text-green-600 border-green-500"
      : normalizedStatus === "pending review"
      ? "border bg-orange-50 text-orange-600 border-orange-500"
      : normalizedStatus === "draft"
      ? "border border-gray-400"
      : normalizedStatus === "sold"
      ? "border border-red-500"
      : "border border-blue-500";
  };

  const getActivityStatusClass = (status) => {
    const normalizedStatus = String(status ?? "").toLowerCase();
    return normalizedStatus === "live"
      ? "border bg-teal-50 text-teal-600 border-teal-500"
      : normalizedStatus === "pending"
      ? "border bg-orange-50 text-orange-600 border-orange-500"
      : normalizedStatus === "updated"
      ? "border bg-blue-50 text-blue-600 border-blue-500"
      : "border border-gray-400";
  };

  // Show loading while verifying role
  if (verifyingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Verifying Permissions</h3>
          <p className="text-gray-600">Checking if you have admin access...</p>
        </div>
      </div>
    );
  }

  // If role not verified (should redirect to login)
  if (!roleVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-9a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Main dashboard content (only shown if role verified)
  return (
    <div>
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 py-6 p-2">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="bg-white cursor-pointer text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
          >
            <img
              src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_36_ptz5ii.png"
              alt="Create Property"
              className="cursor-pointer"
            />
            Create Property
          </button>

          {open && (
            <div className="absolute left-3 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <Link
                to="/dashboard/rentals/admin-create-property-rentals"
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Rentals
              </Link>

              <Link
                to="/dashboard/sales/admin-create-property-sales"
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Sales
              </Link>
            </div>
          )}
        </div>
        <Link to="/dashboard/admin-agent" className="bg-white text-gray-700 border w-36 border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
          <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_38_h9ps9e.png" alt="Add Agent" /> Add Agent
        </Link>
      </div>

      {/* Dashboard cards */}
     <div className="mb-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
    <div
      className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center sm:items-start shadow-sm"
      style={{ minHeight: "120px" }}
    >
      <div className="mb-3">
        <img
          className="bg-[#00968915] p-3 rounded-lg"
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760834371/Icon_4_vocxhj.png"
          alt="Total Properties"
        />
      </div>
      <div className="text-3xl font-semibold text-gray-800 mb-1">
        {totals.totalProperties}
      </div>
      <div className="text-gray-500 text-sm">Total Properties</div>
    </div>

    <div
      className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center sm:items-start shadow-sm"
      style={{ minHeight: "120px" }}
    >
      <div className="mb-3">
        <img
          className="bg-[#00968915] rounded-lg"
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_1_hspyww.png"
          alt="Active Listings"
        />
      </div>
      <div className="text-3xl font-semibold text-gray-800 mb-1">
        {totals.activeListings}
      </div>
      <div className="text-gray-500 text-sm">Active Listings</div>
    </div>

    <div
      className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center sm:items-start shadow-sm"
      style={{ minHeight: "120px" }}
    >
      <div className="mb-3">
        <img
          className="bg-[#00968915] rounded-lg"
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_2_j5n7q7.png"
          alt="Pending Reviews"
        />
      </div>
      <div className="text-3xl font-semibold text-gray-800 mb-1">
        {totals.pendingReviews}
      </div>
      <div className="text-gray-500 text-sm">Pending Reviews</div>
    </div>

    <div
      className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center sm:items-start shadow-sm"
      style={{ minHeight: "120px" }}
    >
      <div className="mb-3">
        <img
          className="bg-[#00968915] rounded-lg"
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997599/DashboardView_3_pfflqc.png"
          alt="Active Agents"
        />
      </div>

      <div className="text-3xl font-semibold text-gray-800 mb-1">
        {agentsLoading ? "…" : totals.activeAgents}
      </div>

      <div className="text-gray-500 text-sm">Active Agents</div>

      {agentsLoading && (
        <div className="mt-2 w-full">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>


      {/* Recent Properties & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Properties</h2>
            {normalizedProperties.length > 5 && (
              <Button onClick={handleViewAllProperties} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
                {showAllProperties ? "View Less" : "View All"}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {propertiesLoading && normalizedProperties.length === 0 ? (
              <div className="text-sm text-gray-500">Loading properties...</div>
            ) : (
              recentToShow.map((property) => (
                <div key={property.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                  <img src={property.image || PLACEHOLDER_IMG} alt={property.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-grow">
                    <h3 className="text-base font-medium text-gray-800 line-clamp-1">{property.title}</h3>
                    <p className="text-gray-600 text-sm">${property.price}</p>
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium rounded-full ${getPropertyStatusClass(property.status)}`}>
                    {property.status && property.status.charAt(0).toUpperCase() + property.status.slice(1).toLowerCase()}
                  </div>
                </div>
              ))
            )}

            {!propertiesLoading && normalizedProperties.length === 0 && (
              <div className="mt-3 flex justify-center">
                <div className="w-full max-w-xs border border-gray-200 rounded-md p-3 text-center bg-white">
                  <p className="text-xs font-medium text-gray-700">
                    No properties found
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Please log out and log in again.
                  </p>
                </div>
              </div>
            )}

            {!properties?.length && !propertiesError && (
              <div className="mt-4 flex justify-center">
                <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">
                    No Properties Found
                  </h3>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            {showAllProperties && recentProperties.length > 0 && propertiesVisibleCount < recentProperties.length ? (
              <Button onClick={() => loadMoreProperties(recentProperties.length)} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
                View more
              </Button>
            ) : showAllProperties && recentProperties.length > 0 && propertiesVisibleCount >= recentProperties.length ? (
              <Button onClick={collapseProperties} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
                View Less
              </Button>
            ) : null}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <p className="text-gray-500 text-sm">Latest updates from your team</p>
            </div>
            {normalizedActivity.length > 4 && (
              <Button onClick={handleViewAllActivity} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
                {showAllActivity ? "View Less" : "View All"}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {activityLoading && normalizedActivity.length === 0 ? (
              <div className="mt-3 flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              </div>
            ) : (
              recentActivityToShow.map((activity) => (
                <div key={activity.id} className="flex justify-between items-start bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3 flex-grow">
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 ${activity.status.toLowerCase() === "live" ? "bg-teal-500" : activity.status.toLowerCase() === "pending" ? "bg-orange-500" : "bg-blue-500"}`} />
                    <div>
                      <p className="text-base font-medium text-gray-800">{activity.details}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        By <span className="font-medium text-gray-700">{activity.propertyName}</span>
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">Last activity: {timeAgo(activity.time)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getActivityStatusClass(activity.status)}`}>
                    {activity.status}
                  </div>
                </div>
              ))
            )}

            {!activityLoading && normalizedActivity.length === 0 && (
              <div className="mt-3 flex justify-center">
                <div className="w-full max-w-xs bg-white border border-gray-200 rounded-md p-3 text-center">
                  <div className="mt-3 flex justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                  </div>
                </div>
              </div>
            )}

            {activityError && (
              <div className="mt-3 flex justify-center">
                <div className="w-full max-w-xs bg-white border border-gray-200 rounded-md p-3 text-center">
                  <p className="text-xs font-semibold text-gray-800 mb-1">
                    User not found
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Please log out and log in again.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            {showAllActivity && recentActivity.length > 0 && activityVisibleCount < recentActivity.length ? (
              <Button onClick={() => loadMoreActivity(recentActivity.length)} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
                View more
              </Button>
            ) : showAllActivity && recentActivity.length > 0 && activityVisibleCount >= recentActivity.length ? (
              <Button onClick={collapseActivity} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
                View Less
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;






















// // File: AdminDashboard.jsx

// import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, UploadCloud } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProperties, fetchActivityLogs } from "../../../features/Properties/PropertiesSlice";
// import type { AppDispatch, RootState } from "../../../store";
// import { Link, useNavigate } from "react-router";
// import Swal from "sweetalert2";
// import { getAccessToken, refreshToken } from "@/features/Auth/authSlice";

// const PLACEHOLDER_IMG =
//   "data:image/svg+xml;utf8," +
//   encodeURIComponent(
//     `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-family='Arial' font-size='18'>No image</text></svg>`
//   );


// function timeAgo(isoOrDate) {
//   if (!isoOrDate) return "—";
//   const date = typeof isoOrDate === "string" || typeof isoOrDate === "number" ? new Date(isoOrDate) : isoOrDate;
//   if (isNaN(date.getTime())) return String(isoOrDate);

//   const now = new Date();
//   const diff = Math.floor((now - date) / 1000); // seconds

//   if (diff < 5) return "just now";
//   if (diff < 60) return `${diff} second${diff === 1 ? "" : "s"} ago`;
//   const mins = Math.floor(diff / 60);
//   if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
//   const days = Math.floor(hrs / 24);
//   if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
//   const months = Math.floor(days / 30);
//   if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
//   const years = Math.floor(months / 12);
//   return `${years} year${years === 1 ? "" : "s"} ago`;
// }


// function extractEmail(text) {
//   if (!text || typeof text !== "string") return null;
//   const m = text.match(/[\w.+-]+@[\w-]+\.[\w-.]+/);
//   return m ? m[0] : null;
// }
// function formatAgentDisplay(agent, details) {
//   if (agent && typeof agent === "string" && agent.trim()) return agent;
//   if (agent && typeof agent === "object") {
//     if (agent.name) return String(agent.name);
//     if (agent.full_name) return String(agent.full_name);
//     if (agent.email) return String(agent.email);
//   }
//   // try to extract email from details text
//   const e = extractEmail(details);
//   if (e) return e;
//   return "System";
// }

// const AdminDashboard = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   // UI toggles and visible counts
//   const [showAllProperties, setShowAllProperties] = useState(false);
//   const [showAllActivity, setShowAllActivity] = useState(false);

//   // visible counts for progressive load
//   const [propertiesVisibleCount, setPropertiesVisibleCount] = useState(5); // collapsed initial
//   const [activityVisibleCount, setActivityVisibleCount] = useState(5); // collapsed initial

//   // handlers for toggles
//   const handleViewAllProperties = () => {
//     if (!showAllProperties) {
//       setShowAllProperties(true);
//       setPropertiesVisibleCount(30); // initial expansion to 30
//     } else {
//       setShowAllProperties(false);
//       setPropertiesVisibleCount(5); // collapse
//     }
//   };
//   const handleViewAllActivity = () => {
//     if (!showAllActivity) {
//       setShowAllActivity(true);
//       setActivityVisibleCount(30); // initial expansion to 30
//     } else {
//       setShowAllActivity(false);
//       setActivityVisibleCount(5); // collapse
//     }
//   };

//   // progressive "view more" handlers (add +10)
//   const loadMoreProperties = (total) => {
//     setPropertiesVisibleCount((cur) => Math.min(total, cur + 10));
//   };
//   const loadMoreActivity = (total) => {
//     setActivityVisibleCount((cur) => Math.min(total, cur + 10));
//   };

//   // collapse helpers (used when "View Less" pressed at bottom)
//   const collapseProperties = () => {
//     setShowAllProperties(false);
//     setPropertiesVisibleCount(5);
//   };
//   const collapseActivity = () => {
//     setShowAllActivity(false);
//     setActivityVisibleCount(5);
//   };

//   // Redux state
//   const properties = useSelector((s: RootState) => s.propertyBooking.properties) ?? [];
//   const propertiesLoading = useSelector((s: RootState) => s.propertyBooking.loading);
//   const propertiesError = useSelector((s: RootState) => s.propertyBooking.error);

//   const activityLogs = useSelector((s: RootState) => s.propertyBooking.activityLogs) ?? [];
//   const activityLoading = useSelector((s: RootState) => s.propertyBooking.loading);
//   const activityError = useSelector((s: RootState) => s.propertyBooking.error);

//   // Local agents state (NEW)
//   const [agents, setAgents] = useState([]);
//   const [agentsLoading, setAgentsLoading] = useState(false);
//   const [agentsError, setAgentsError] = useState(null);
//   const [open, setOpen] = useState(false);

//   // Authentication helper function (same as AllReview)
//   const doFetchWithRefresh = React.useCallback(
//     async (input: RequestInfo, init: RequestInit = {}, allowRetry = true): Promise<Response> => {
//       const token = getAccessToken();
//       const baseHeaders: Record<string, string> = {
//         Accept: "application/json",
//         ...(init.headers ? (init.headers as Record<string, string>) : {}),
//       };
//       if (token) baseHeaders.Authorization = `Bearer ${token}`;

//       const res = await fetch(input, { ...init, headers: baseHeaders });

//       if (res.status !== 401) return res;

//       if (!allowRetry) return res;

//       try {
//         // @ts-ignore
//         const refreshResult = await dispatch(refreshToken());
//         if (refreshToken.fulfilled.match(refreshResult)) {
//           const newToken = getAccessToken();
//           const retryHeaders = { ...baseHeaders, Authorization: newToken ? `Bearer ${newToken}` : undefined };
//           const retryRes = await fetch(input, { ...init, headers: retryHeaders });
//           return retryRes;
//         }
//         return res;
//       } catch (e) {
//         return res;
//       }
//     },
//     [dispatch]
//   );

//   // Fetch API data on mount with authentication
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await dispatch(fetchProperties());
//         await dispatch(fetchActivityLogs());
//       } catch (error) {
//         if (error?.status === 401) {
//           try {
//             // @ts-ignore
//             const refreshResult = await dispatch(refreshToken());
//             if (refreshToken.fulfilled.match(refreshResult)) {
//               await dispatch(fetchProperties());
//               await dispatch(fetchActivityLogs());
//             } else {
//               await Swal.fire({
//                 icon: "warning",
//                 title: "Session Expired",
//                 text: "Your session has expired. Please login again.",
//               });
//               navigate("/login");
//             }
//           } catch (refreshError) {
//             await Swal.fire({
//               icon: "warning",
//               title: "Session Expired",
//               text: "Your session has expired. Please login again.",
//             });
//             navigate("/login");
//           }
//         }
//       }
//     };

//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Helper: make candidate agent URLs robust (try both /api/agents/ and /agents/)
//   const buildAgentUrlCandidates = () => {
//     const rawBase = import.meta.env.VITE_API_BASE || "https://api.eastmondvillas.com";
//     const b = String(rawBase).replace(/\/+$/, ""); // trim trailing slash
//     const candidates = [];
//     // If base already contains "/api", add both b + "/agents/" and b + "/api/agents/"
//     if (b.toLowerCase().includes("/api")) {
//       candidates.push(`${b}/agents/`);
//       candidates.push(`${b.replace(/\/api.*$/i, "")}/api/agents/`); // fallback to base root + /api/agents/
//     } else {
//       // base has no /api: try both b + '/api/agents/' and b + '/agents/'
//       candidates.push(`${b}/api/agents/`);
//       candidates.push(`${b}/agents/`);
//     }
//     // make unique and return
//     return Array.from(new Set(candidates));
//   };

//   // Fetch agents list from API (NEW — robust, tries candidates) with authentication
//   useEffect(() => {
//     let mounted = true;
//     const controller = new AbortController();
//     const token = getAccessToken();

//     const candidates = buildAgentUrlCandidates();

//     const fetchAgents = async () => {
//       setAgentsLoading(true);
//       setAgentsError(null);
//       try {
//         let success = false;
//         let lastErr = null;

//         for (const url of candidates) {
//           if (!mounted) break;
//           try {
//             const res = await doFetchWithRefresh(url, { 
//               signal: controller.signal,
//               method: "GET"
//             });
            
//             if (!res.ok) {
//               const txt = await res.text().catch(() => "");
//               lastErr = `Attempt ${url} → HTTP ${res.status} ${txt ? `: ${txt}` : ""}`;
//               console.warn("[agents fetch] candidate failed:", url, res.status, txt);
//               continue;
//             }

//             const json = await res.json();
//             const list = Array.isArray(json) ? json : (Array.isArray(json.results) ? json.results : []);
//             if (mounted) setAgents(list);
//             success = true;
//             break;
//           } catch (err) {
//             lastErr = err;
//             if (err && err.name === "AbortError") {
//               break;
//             }
//             console.warn("[agents fetch] candidate threw:", url, err);
//             continue;
//           }
//         }

//         if (!success) {
//           const message = typeof lastErr === "string" ? lastErr : (lastErr && lastErr.message) ? lastErr.message : "Failed to fetch agents";
//           if (mounted) setAgentsError(message);
//           console.error("[agents fetch] all candidates failed:", candidates, lastErr);
//         }
//       } catch (err) {
//         if (err && err.name !== "AbortError") {
//           console.error("[agents fetch] unexpected error:", err);
//           if (mounted) setAgentsError(String(err.message || err));
//         }
//       } finally {
//         if (mounted) setAgentsLoading(false);
//       }
//     };

//     fetchAgents();

//     return () => {
//       mounted = false;
//       controller.abort();
//     };
//   }, [doFetchWithRefresh]);

//   // Normalize properties (API-driven) and extract first image
//   const normalizedProperties = useMemo(() => {
//     if (!properties || properties.length === 0) return [];

//     const extractUrl = (m) => {
//       if (!m) return null;
//       if (typeof m === "string") return m;
//       if (m.image) return m.image;
//       if (m.url) return m.url;
//       if (m.file) return m.file;
//       return null;
//     };

//     return properties.map((p) => {
//       let image = null;
//       if (Array.isArray(p.media_images) && p.media_images.length > 0) {
//         image = extractUrl(p.media_images[0]);
//       }
//       if (!image && Array.isArray(p.bedrooms_images) && p.bedrooms_images.length > 0) {
//         image = extractUrl(p.bedrooms_images[0]);
//       }

//       image = image || p.main_image_url || p.image || p.thumbnail || null;

//       // Fix: Change "Pending Review" to "Pending Review" (capitalized properly)
//       let status = p.status ?? p.state ?? (p.published ? "Published" : "Draft");
//       if (typeof status === "string") {
//         status = status.replace(/_/g, " "); // Replace underscores with spaces
//         if (status.toLowerCase() === "pending review" || status.toLowerCase() === "pending_review") {
//           status = "Pending Review";
//         } else {
//           // Capitalize first letter of each word
//           status = status.split(" ").map(word => 
//             word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//           ).join(" ");
//         }
//       }

//       return {
//         id: p.id ?? p.pk ?? Math.random(),
//         image,
//         title: p.title ?? p.name ?? p.address ?? `Property ${p.id ?? ""}`,
//         price: (typeof p.price === "number" ? `$${p.price}` : p.price) ?? p.price_display ?? "—",
//         status: status || "Draft",
//         created_at: p.created_at ?? p.created ?? null,
//         agent: p.created_by_name ?? p.agent_name ?? null,
//       };
//     });
//   }, [properties]);

//   // Activity normalized
//   const normalizedActivity = useMemo(() => {
//     if (!activityLogs || activityLogs.length === 0) return [];

//     return activityLogs.map((a, idx) => {
//       const rawDetails = a.detials ?? a.details ?? a.changes_text ?? a.object_repr ?? "";
//       const timestamp = a.timestamp ?? a.created_at ?? a.time ?? "—";
//       const agentDisplay = formatAgentDisplay(a.user ?? a.created_by_name ?? a.agent, rawDetails);

//       // status mapping: prefer explicit field else fallback
//       const status = a.status ?? (a.is_read === false ? "Pending" : "Live");

//       return {
//         id: a.id ?? idx,
//         type: a.type ?? a.action ?? a.object_repr ?? "Activity",
//         propertyName:
//           (a.changes && a.changes.title && a.changes.title[1]) ??
//           a.target_object ??
//           a.object_repr ??
//           (a.property_name ?? a.property_title) ??
//           "—",
//         agent: agentDisplay,
//         time: timestamp,
//         status,
//         details: rawDetails,
//         raw: a,
//       };
//     });
//   }, [activityLogs]);

//   // Dashboard counters - compute totalsFromPropertiesFallback first
//   const totalsFromPropertiesFallback = useMemo(() => {
//     const all = normalizedProperties;
//     const totalProperties = all.length;
//     const activeListings = all.filter((p) => String(p.status).toLowerCase().includes("publish")).length;
//     const pendingReviews = all.filter((p) => String(p.status).toLowerCase().includes("pending")).length;
//     const agentsSet = new Set(all.map((p) => (p.agent ? String(p.agent).trim() : null)).filter(Boolean));
//     const activeAgentsFallback = agentsSet.size || 0;
//     return { totalProperties, activeListings, pendingReviews, activeAgentsFallback };
//   }, [normalizedProperties]);

//   // Compute active agents using fetched agents list if available (NEW)
//   const activeAgentsCount = useMemo(() => {
//     if (Array.isArray(agents) && agents.length > 0) {
//       // Accept both boolean and string "true" forms, also accept `active` field
//       return agents.filter((a) => {
//         if (!a) return false;
//         if (a.is_active === true) return true;
//         if (a.active === true) return true;
//         if (typeof a.is_active === "string" && a.is_active.toLowerCase() === "true") return true;
//         if (typeof a.active === "string" && a.active.toLowerCase() === "true") return true;
//         return false;
//       }).length;
//     }
//     // fallback to property-derived estimate
//     return totalsFromPropertiesFallback.activeAgentsFallback;
//   }, [agents, totalsFromPropertiesFallback]);

//   // Use totals object but replace activeAgents with activeAgentsCount
//   const totals = useMemo(() => {
//     return {
//       totalProperties: totalsFromPropertiesFallback.totalProperties,
//       activeListings: totalsFromPropertiesFallback.activeListings,
//       pendingReviews: totalsFromPropertiesFallback.pendingReviews,
//       activeAgents: activeAgentsCount,
//     };
//   }, [totalsFromPropertiesFallback, activeAgentsCount]);

//   // recent items (sorted)
//   const recentProperties = useMemo(() => {
//     const copy = [...normalizedProperties];
//     copy.sort((a, b) => {
//       const ad = a.created_at ? Date.parse(a.created_at) : 0;
//       const bd = b.created_at ? Date.parse(b.created_at) : 0;
//       return bd - ad;
//     });
//     return copy;
//   }, [normalizedProperties]);

//   // ensure propertiesVisibleCount does not exceed total, keep behavior when toggling
//   useEffect(() => {
//     const total = recentProperties.length;
//     if (showAllProperties) {
//       setPropertiesVisibleCount((cur) => Math.min(Math.max(cur, 30), total));
//     } else {
//       setPropertiesVisibleCount(5);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showAllProperties, recentProperties.length]);

//   const recentToShow = recentProperties.slice(0, Math.min(propertiesVisibleCount, recentProperties.length));

//   // activity
//   const recentActivity = useMemo(() => {
//     const copy = [...normalizedActivity];
//     // sort by time if available (newest first)
//     copy.sort((a, b) => {
//       const at = a.time ? Date.parse(a.time) || 0 : 0;
//       const bt = b.time ? Date.parse(b.time) || 0 : 0;
//       return bt - at;
//     });
//     return copy;
//   }, [normalizedActivity]);

//   useEffect(() => {
//     const total = recentActivity.length;
//     if (showAllActivity) {
//       setActivityVisibleCount((cur) => Math.min(Math.max(cur, 30), total));
//     } else {
//       setActivityVisibleCount(5);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showAllActivity, recentActivity.length]);

//   const recentActivityToShow = recentActivity.slice(0, Math.min(activityVisibleCount, recentActivity.length));

//   // helper classes
//   const getPropertyStatusClass = (status) => {
//     const normalizedStatus = String(status ?? "").toLowerCase();
//     return normalizedStatus === "published"
//       ? "border bg-green-50 text-green-600 border-green-500"
//       : normalizedStatus === "pending review"
//       ? "border bg-orange-50  text-orange-600 border-orange-500"
//       : normalizedStatus === "draft"
//       ? "border border-gray-400"
//       : normalizedStatus === "sold"
//       ? "border border-red-500"
//       : "border border-blue-500";
//   };

//   const getActivityStatusClass = (status) => {
//     const normalizedStatus = String(status ?? "").toLowerCase();
//     return normalizedStatus === "live"
//       ? "border bg-teal-50 text-teal-600 border-teal-500"
//       : normalizedStatus === "pending"
//       ? "border bg-orange-50 text-orange-600 border-orange-500"
//       : normalizedStatus === "updated"
//       ? "border bg-blue-50 text-blue-600 border-blue-500"
//       : "border border-gray-400";
//   };

//   return (
//     <div>
//       {/* Action buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 py-6 p-2 ">
//        <div className="relative inline-block">
//       {/* Main Button */}
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
//       >
//         <img
//           src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_36_ptz5ii.png"
//           alt=""
//         />
//         Create Property
//       </button>

//       {/* Dropdown */}
//       {open && (
//         <div className="absolute left-3 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//           <Link
//             to="/dashboard/rentals/admin-create-property-rentals"
//             className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
//             onClick={() => setOpen(false)}
//           >
//             Rentals
//           </Link>
        

//           <Link
//             to="/dashboard/sales/admin-create-property-sales"
//             className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
//             onClick={() => setOpen(false)}
//           >
//             Sales
//           </Link>
//         </div>
//       )}
//     </div>
//         <Link to="/dashboard/admin-agent" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
//           <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_38_h9ps9e.png" alt="" /> Add Agent
//         </Link>
//         {/* <Link to="/dashboard/admin-dashboard" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
//           <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_37_ajwrle.png" alt="" /> Bulk Upload
//         </Link> */}
//       </div>

//       {/* Dashboard cards */}
//       <div className="mb-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
//           <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
//             <div className="mb-3">
//               <img className=" bg-[#00968915] p-3 rounded-lg " src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760834371/Icon_4_vocxhj.png" alt="" />
//             </div>
//             <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.totalProperties}</div>
//             <div className="text-gray-500 text-sm">Total Properties</div>
//           </div>

//           <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
//             <div className="mb-3">
//               <img className="bg-[#00968915]  rounded-lg" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_1_hspyww.png" alt="" />
//             </div>
//             <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.activeListings}</div>
//             <div className="text-gray-500 text-sm">Active Listings</div>
//           </div>

//           <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
//             <div className="mb-3">
//               <img className="bg-[#00968915]  rounded-lg" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_2_j5n7q7.png" alt="" />
//             </div>
//             <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.pendingReviews}</div>
//             <div className="text-gray-500 text-sm">Pending Reviews</div>
//           </div>

//           <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
//             <div className="mb-3">
//               <img className="bg-[#00968915] rounded-lg" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997599/DashboardView_3_pfflqc.png" alt="" />
//             </div>

//             {/* Show loading state briefly if agents are being fetched */}
//             <div className="text-3xl font-semibold text-gray-800 mb-1">
//               {agentsLoading ? "…" : totals.activeAgents}
//             </div>

//             <div className="text-gray-500 text-sm">Active Agents</div>

//             {/* show fetch error if exists (small) */}
//             {agentsLoading && (
//   <div className="">
//     <div className="" />
//   </div>
// )}

//           </div>
//         </div>
//       </div>

//       {/* Recent Properties & Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
//         {/* Recent Properties */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold text-gray-800">Recent Properties</h2>
//             {normalizedProperties.length > 5 && (
//               <Button onClick={handleViewAllProperties} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                 {showAllProperties ? "View Less" : "View All"}
//               </Button>
//             )}
//           </div>

//           <div className="space-y-4">
//             {propertiesLoading && normalizedProperties.length === 0 ? (
//               <div className="text-sm text-gray-500">Loading properties...</div>
//             ) : (
//               recentToShow.map((property) => (
//                 <div key={property.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
//                   <img src={property.image || PLACEHOLDER_IMG} alt={property.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
//                   <div className="flex-grow">
//                     <h3 className="text-base font-medium text-gray-800 line-clamp-1">{property.title}</h3>
//                     <p className="text-gray-600 text-sm">${property.price}</p>
//                   </div>
//                   <div className={`px-3 py-1 text-xs font-medium rounded-full ${getPropertyStatusClass(property.status)}`}>
//                    {property.status &&
//   property.status.charAt(0).toUpperCase() + property.status.slice(1).toLowerCase()}

//                   </div>
//                 </div>
//               ))
//             )}

//            {!propertiesLoading && normalizedProperties.length === 0 && (
//   <div className="mt-3 flex justify-center">
//     <div className="w-full max-w-xs border border-gray-200 rounded-md p-3 text-center bg-white">
//       <p className="text-xs font-medium text-gray-700">
//         No properties found
//       </p>
//       <p className="text-[11px] text-gray-500 mt-1">
//         Please log out and log in again.
//       </p>
//     </div>
//   </div>
// )}


// {!properties?.length && !propertiesError && (
//   <div className="mt-4 flex justify-center">
//     <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-4 text-center">
//       <h3 className="text-sm font-semibold text-gray-800 mb-1">
//         No Properties Found
//       </h3>

     
//     </div>
//   </div>
// )}

//           </div>

//           {/* BOTTOM controls for progressive load (below the list) */}
//           <div className="mt-4 flex justify-center">
//             {showAllProperties && recentProperties.length > 0 && propertiesVisibleCount < recentProperties.length ? (
//               <Button onClick={() => loadMoreProperties(recentProperties.length)} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                 View more
//               </Button>
//             ) : showAllProperties && recentProperties.length > 0 && propertiesVisibleCount >= recentProperties.length ? (
//               <Button onClick={collapseProperties} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                 View Less
//               </Button>
//             ) : null}
//           </div>
//         </div>

//         {/* Recent Activity */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
//               <p className="text-gray-500 text-sm">Latest updates from your team</p>
//             </div>
//             {normalizedActivity.length > 4 && (
//               <Button onClick={handleViewAllActivity} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                 {showAllActivity ? "View Less" : "View All"}
//               </Button>
//             )}
//           </div>

//           <div className="space-y-4">
//             {activityLoading && normalizedActivity.length === 0 ? (
//                 <div className="mt-3 flex justify-center">
//     <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
//   </div>
//             ) : (
//               recentActivityToShow.map((activity) => (
//                 <div key={activity.id} className="flex justify-between items-start bg-white p-4 rounded-lg border border-gray-200">
//                   <div className="flex items-start gap-3 flex-grow">
//                     <div className={`w-2.5 h-2.5 rounded-full mt-2 ${activity.status.toLowerCase() === "live" ? "bg-teal-500" : activity.status.toLowerCase() === "pending" ? "bg-orange-500" : "bg-blue-500"}`} />
//                     <div>
//                       {/* property / subject */}
//                       <p className="text-base font-medium text-gray-800">{activity.details}</p>

//                       {/* By <agent> on first line, then Last activity (human-friendly) on next line */}
//                       <p className="text-gray-500 text-xs mt-1">
//                         By <span className="font-medium text-gray-700">{activity.propertyName}</span>
//                       </p>

//                       <p className="text-gray-400 text-xs mt-0.5">Last activity: {timeAgo(activity.time)}</p>
//                     </div>
//                   </div>
//                   <div className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getActivityStatusClass(activity.status)}`}>
//                     {activity.status}
//                   </div>
//                 </div>
//               ))
//             )}

//    {!activityLoading && normalizedActivity.length === 0 && (
//   <div className="mt-3 flex justify-center">
//     <div className="w-full max-w-xs bg-white border border-gray-200 rounded-md p-3 text-center">
//         <div className="mt-3 flex justify-center">
//     <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
//   </div>
//     </div>
//   </div>
// )}


// {activityError && (
//   <div className="mt-3 flex justify-center">
//     <div className="w-full max-w-xs bg-white border border-gray-200 rounded-md p-3 text-center">
//       <p className="text-xs font-semibold text-gray-800 mb-1">
//         User not found
//       </p>

//       <p className="text-[11px] text-gray-600">
//         Please log out and log in again.
//       </p>
//     </div>
//   </div>
// )}


//           </div>

//           {/* BOTTOM controls for progressive load (below the activity list) */}
//           <div className="mt-4 flex justify-center">
//             {showAllActivity && recentActivity.length > 0 && activityVisibleCount < recentActivity.length ? (
//               <Button onClick={() => loadMoreActivity(recentActivity.length)} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                 View more
//               </Button>
//             ) : showAllActivity && recentActivity.length > 0 && activityVisibleCount >= recentActivity.length ? (
//               <Button onClick={collapseActivity} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                 View Less
//               </Button>
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;