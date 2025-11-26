// import React, { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import {
//   CheckCircleIcon,
//   ClockIcon,
//   UsersIcon,
//   PlusCircle,
//   UploadCloud
// } from "lucide-react";

// const AdminDashboard = () => {
//     // --- STATE MANAGEMENT ---
//     const [showAllProperties, setShowAllProperties] = useState(false);
//     const handleViewAllProperties = () => setShowAllProperties(!showAllProperties);

//     const [showAllActivity, setShowAllActivity] = useState(false);
//     const handleViewAllActivity = () => setShowAllActivity(!showAllActivity);

//     // --- DATA ---
//     const propertiesData = [
//         { id: 1, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554174/Image_Luxury_Modern_Villa_with_Pool_sdpezo.png", title: "Luxury Modern Villa with Pool", price: "$2,850,000", status: "Published" },
//         { id: 2, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554255/Image_Downtown_Penthouse_with_City_Views_gfrhxe.png", title: "Downtown Penthouse with City Views", price: "$1,650,000", status: "Pending Review" },
//         { id: 3, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554174/Image_Luxury_Modern_Villa_with_Pool_sdpezo.png", title: "Elegant Suburban Estate", price: "$3,200,000", status: "Draft" },
//         { id: 4, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554255/Image_Downtown_Penthouse_with_City_Views_gfrhxe.png", title: "Ocean View Apartment", price: "$850,000", status: "Published" },
//         { id: 5, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554174/Image_Luxury_Modern_Villa_with_Pool_sdpezo.png", title: "Charming Lake House", price: "$1,200,000", status: "Draft" },
//         { id: 6, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554255/Image_Downtown_Penthouse_with_City_Views_gfrhxe.png", title: "Spacious Family Home", price: "$950,000", status: "Draft" },
//         { id: 7, image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760554174/Image_Luxury_Modern_Villa_with_Pool_sdpezo.png", title: "Cozy Studio Flat", price: "$450,000", status: "Pending Review" },
//     ];

//     const activityData = [
//         { id: 1, type: "Property Published", propertyName: "Casablanca Luxury Villa", agent: "Sarah Johnson", time: "2 hours ago", status: "Live" },
//         { id: 2, type: "New Property Added", propertyName: "Sunset Paradise Estate", agent: "Michael Chen", time: "5 hours ago", status: "Pending" },
//         { id: 3, type: "Agent Assigned", propertyName: "Marina Bay Residence", agent: "Emma Williams", time: "1 day ago", status: "Updated" },
//         { id: 4, type: "Media Updated", propertyName: "Palm Heights Villa", agent: "David Martinez", time: "1 day ago", status: "Updated" },
//         { id: 5, type: "Price Changed", propertyName: "Mountain Retreat Cabin", agent: "Alice Smith", time: "1 day ago", status: "Updated" },
//         { id: 6, type: "Status Changed", propertyName: "New York Apt", agent: "Bob Brown", time: "2 days ago", status: "Updated" },
//         { id: 7, type: "New Comment", propertyName: "Dallas Mansion", agent: "Charlie Davis", time: "2 days ago", status: "Live" },
//     ];

//     const propertiesToShow = showAllProperties ? propertiesData : propertiesData.slice(0, 5);
//     const activityToShow = showAllActivity ? activityData : activityData.slice(0, 4);

//     // --- STATUS BADGE CLASSES (border only, text color unchanged) ---
//     const getPropertyStatusClass = (status) => {
//         const normalizedStatus = status.toLowerCase();
//         return (
//             normalizedStatus === 'published' ? 'border bg-green-50 text-green-600 border-green-500' :
//             normalizedStatus === 'pending review' ? 'border bg-orange-50  text-orange-600 border-orange-500' :
//             normalizedStatus === 'draft' ? 'border border-gray-400' :
//             normalizedStatus === 'sold' ? 'border border-red-500' :
//             'border border-blue-500'
//         );
//     };

//     const getActivityStatusClass = (status) => {
//         const normalizedStatus = status.toLowerCase();
//         return (
//             normalizedStatus === 'live' ? 'border bg-teal-50 text-teal-600 border-teal-500' :
//             normalizedStatus === 'pending' ? 'border bg-orange-50 text-orange-600 border-orange-500' :
//             normalizedStatus === 'updated' ? 'border bg-blue-50 text-blue-600 border-blue-500' :
//             'border border-gray-400'
//         );
//     };

//     return (
//         <div className="">

//             {/* --- Action Buttons --- */}
//             <div className="flex flex-col sm:flex-row gap-4 py-6">
//                 <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors duration-150">
//                     <img className='' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_36_ptz5ii.png" alt="" /> Create Property
//                 </Button>
//                 <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors duration-150">
//                     <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_38_h9ps9e.png" alt="" />  Add Agent
//                 </Button>
//                 <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors duration-150">
//                    <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_37_ajwrle.png" alt="" /> Bulk Upload
//                 </Button>
//             </div>

//             {/* --- Dashboard Cards --- */}
//             <div className="mb-8">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: '120px' }}>
//                         <div className="mb-3"><img className=" bg-[#00968915] p-3 rounded-lg " src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760834371/Icon_4_vocxhj.png" alt="" /> </div>
//                         <div className="text-3xl font-semibold text-gray-800 mb-1">24</div>
//                         <div className="text-gray-500 text-sm">Total Properties</div>
//                     </div>
//                     <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: '120px' }}>
//                         <div className="mb-3"><img className='bg-[#00968915]  rounded-lg' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_1_hspyww.png" alt="" /></div>
//                         <div className="text-3xl font-semibold text-gray-800 mb-1">18</div>
//                         <div className="text-gray-500 text-sm">Active Listings</div>
//                     </div>
//                     <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: '120px' }}>
//                         <div className="mb-3"><img className='bg-[#00968915]  rounded-lg' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_2_j5n7q7.png" alt="" /></div>
//                         <div className="text-3xl font-semibold text-gray-800 mb-1">4</div>
//                         <div className="text-gray-500 text-sm">Pending Reviews</div>
//                     </div>
//                     <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: '120px' }}>
//                         <div className="mb-3"><img className='bg-[#00968915] rounded-lg' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997599/DashboardView_3_pfflqc.png" alt="" /></div>
//                         <div className="text-3xl font-semibold text-gray-800 mb-1">8</div>
//                         <div className="text-gray-500 text-sm">Active Agents</div>
//                     </div>
//                 </div>
//             </div>
 
//             {/* --- Recent Properties & Activity --- */}
//             <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'>

//                 {/* Recent Properties */}
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                     <div className="flex justify-between items-center mb-6">
//                         <h2 className="text-xl font-semibold text-gray-800">Recent Properties</h2>
//                         {propertiesData.length > 5 && (
//                             <Button onClick={handleViewAllProperties} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                                 {showAllProperties ? 'View Less' : 'View All'}
//                             </Button>
//                         )}
//                     </div>
//                     <div className="space-y-4">
//                         {propertiesToShow.map((property) => (
//                             <div key={property.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
//                                 <img src={property.image} alt={property.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0"/>
//                                 <div className="flex-grow">
//                                     <h3 className="text-base font-medium text-gray-800 line-clamp-1">{property.title}</h3>
//                                     <p className="text-gray-600 text-sm">{property.price}</p>
//                                 </div>
//                                 <div className={`px-3 py-1 text-xs font-medium rounded-full  ${getPropertyStatusClass(property.status)}`}>
//                                     {property.status}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Recent Activity */}
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                     <div className="flex justify-between items-center mb-6">
//                         <div>
//                             <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
//                             <p className="text-gray-500 text-sm">Latest updates from your team</p>
//                         </div>
//                         {activityData.length > 4 && (
//                             <Button onClick={handleViewAllActivity} variant="outline" className="text-gray-600 border-gray-400 hover:bg-blue-50">
//                                 {showAllActivity ? 'View Less' : 'View All'}
//                             </Button>
//                         )}
//                     </div>
//                     <div className="space-y-4">
//                         {activityToShow.map((activity) => (
//                             <div key={activity.id} className="flex justify-between items-start bg-white p-4 rounded-lg border border-gray-200">
//                                 <div className="flex items-start gap-3 flex-grow">
//                                     <div className={`w-2.5 h-2.5 rounded-full mt-2 ${activity.status.toLowerCase() === 'live' ? 'bg-teal-500' : activity.status.toLowerCase() === 'pending' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
//                                     <div>
//                                         <h3 className="text-base font-medium text-gray-800">{activity.type}</h3>
//                                         <p className="text-gray-700 text-sm font-medium">{activity.propertyName}</p>
//                                         <p className="text-gray-500 text-xs">By {activity.agent} • {activity.time}</p>
//                                     </div>
//                                 </div>
//                                 <div className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getActivityStatusClass(activity.status)}`}>
//                                     {activity.status}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;

























// File: AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, UploadCloud } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties, fetchActivityLogs } from "../../../features/Properties/PropertiesSlice";
import type { AppDispatch, RootState } from "../../../store";
import { Link } from "react-router";

/**
 * AdminDashboard
 * - Uses API data only (no fake data).
 * - Shows first image from media_images (or bedrooms_images) for each property.
 * - Formats activity time to human-friendly relative strings (e.g. "5 hours ago").
 *
 * Design and layout unchanged.
 */

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-family='Arial' font-size='18'>No image</text></svg>`
  );

/* ---------------------------
   Small helpers: timeAgo + agent formatting
   ---------------------------*/
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

/**
 * Format agent display:
 * - Keep simple: show provided name, or "System" if none.
 */
function formatAgentDisplay(agent) {
  if (!agent && agent !== 0) return "System";
  const s = String(agent).trim();
  return s || "System";
}

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  // UI toggles
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const handleViewAllProperties = () => setShowAllProperties((v) => !v);
  const handleViewAllActivity = () => setShowAllActivity((v) => !v);

  // Redux state
  const properties = useSelector((s: RootState) => s.propertyBooking.properties) ?? [];
  const propertiesLoading = useSelector((s: RootState) => s.propertyBooking.loading);
  const propertiesError = useSelector((s: RootState) => s.propertyBooking.error);

  const activityLogs = useSelector((s: RootState) => s.propertyBooking.activityLogs) ?? [];
  const activityLoading = useSelector((s: RootState) => s.propertyBooking.loading);
  const activityError = useSelector((s: RootState) => s.propertyBooking.error);

  // Fetch API data on mount
  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchActivityLogs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize properties (API-driven) and extract first image
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

      return {
        id: p.id ?? p.pk ?? Math.random(),
        image,
        title: p.title ?? p.name ?? p.address ?? `Property ${p.id ?? ""}`,
        price: (typeof p.price === "number" ? `$${p.price}` : p.price) ?? p.price_display ?? "—",
        status: (p.status ?? p.state ?? (p.published ? "Published" : "Draft")) || "Draft",
        created_at: p.created_at ?? p.created ?? null,
        agent: p.created_by_name ?? p.agent_name ?? null,
      };
    });
  }, [properties]);

  // Activity normalized
  const normalizedActivity = useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) return [];
    return activityLogs.map((a, idx) => ({

      id: a.id ?? idx,
      type: a.object_repr ?? a.action_display ?? "Activity",
      propertyName:
        (a.changes && a.changes.title && a.changes.title[1]) ??
        a.target_object ??
        a.object_repr ??
        "—",
      // prefer explicit user fields if present; fallback to parsed changes.user
      agent:
        (a.changes && a.changes.user && (Array.isArray(a.changes.user) ? a.changes.user[1] : a.changes.user)) ??
        a.user_name ??
        a.created_by_name ??
        "System",
      time: a.created_at ?? a.timestamp ?? "—",
      status: a.is_read === false ? "Pending" : "Live",
    }));
  }, [activityLogs]);

  // Dashboard counters
  const totals = useMemo(() => {
    const all = normalizedProperties;
    const totalProperties = all.length;
    const activeListings = all.filter((p) => String(p.status).toLowerCase().includes("publish")).length;
    const pendingReviews = all.filter((p) => String(p.status).toLowerCase().includes("pending")).length;
    const agentsSet = new Set(all.map((p) => (p.agent ? String(p.agent).trim() : null)).filter(Boolean));
    const activeAgents = agentsSet.size || 0;
    return { totalProperties, activeListings, pendingReviews, activeAgents };
  }, [normalizedProperties]);

  // recent items (sorted)
  const recentProperties = useMemo(() => {
    const copy = [...normalizedProperties];
    copy.sort((a, b) => {
      const ad = a.created_at ? Date.parse(a.created_at) : 0;
      const bd = b.created_at ? Date.parse(b.created_at) : 0;
      return bd - ad;
    });
    return copy;
  }, [normalizedProperties]);

  const recentToShow = showAllProperties ? recentProperties : recentProperties.slice(0, 5);
  const recentActivityToShow = showAllActivity ? normalizedActivity : normalizedActivity.slice(0, 4);

  // helper classes
  const getPropertyStatusClass = (status) => {
    const normalizedStatus = String(status ?? "").toLowerCase();
    return normalizedStatus === "published"
      ? "border bg-green-50 text-green-600 border-green-500"
      : normalizedStatus === "pending review"
      ? "border bg-orange-50  text-orange-600 border-orange-500"
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

  return (
    <div>
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 py-6">
        <Link to="/dashboard/rentals/admin-create-property" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
          <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_36_ptz5ii.png" alt="" /> Create Property
        </Link>
        <Link to="/dashboard/admin-agent" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
          <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_38_h9ps9e.png" alt="" /> Add Agent
        </Link>
        <Link to="/dashboard/admin-dashboard" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm">
          <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760922664/Icon_37_ajwrle.png" alt="" /> Bulk Upload
        </Link>
      </div>

      {/* Dashboard cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
            <div className="mb-3">
              <img className=" bg-[#00968915] p-3 rounded-lg " src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760834371/Icon_4_vocxhj.png" alt="" />
            </div>
            <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.totalProperties}</div>
            <div className="text-gray-500 text-sm">Total Properties</div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
            <div className="mb-3">
              <img className="bg-[#00968915]  rounded-lg" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_1_hspyww.png" alt="" />
            </div>
            <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.activeListings}</div>
            <div className="text-gray-500 text-sm">Active Listings</div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
            <div className="mb-3">
              <img className="bg-[#00968915]  rounded-lg" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997613/DashboardView_2_j5n7q7.png" alt="" />
            </div>
            <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.pendingReviews}</div>
            <div className="text-gray-500 text-sm">Pending Reviews</div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-start shadow-sm" style={{ minHeight: "120px" }}>
            <div className="mb-3">
              <img className="bg-[#00968915] rounded-lg" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760997599/DashboardView_3_pfflqc.png" alt="" />
            </div>
            <div className="text-3xl font-semibold text-gray-800 mb-1">{totals.activeAgents}</div>
            <div className="text-gray-500 text-sm">Active Agents</div>
            
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
                    {/* {property.agent && <p className="text-gray-500 text-xs mt-1">Agent: {property.agent}</p>} */}
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium rounded-full ${getPropertyStatusClass(property.status)}`}>
                    {property.status}
                  </div>
                </div>
              ))
            )}

            {!propertiesLoading && normalizedProperties.length === 0 && (
              <div className="text-sm text-gray-500">No properties found.</div>
            )}

            {propertiesError && <div className="mt-3 text-sm text-red-600">Error loading properties: {String(propertiesError)}</div>}
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
              <div className="text-sm text-gray-500">Loading activity...</div>
            ) : (
              recentActivityToShow.map((activity) => (
                <div key={activity.id} className="flex justify-between items-start bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3 flex-grow">
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 ${activity.status.toLowerCase() === "live" ? "bg-teal-500" : activity.status.toLowerCase() === "pending" ? "bg-orange-500" : "bg-blue-500"}`} />
                    <div>
                      <h3 className="text-base font-medium text-gray-800">{activity.type}</h3>
                      <p className="text-gray-700 text-sm font-medium">{activity.propertyName}</p>

                      {/* By <agent> on first line, then Last activity (human-friendly) on next line */}
                      <p className="text-gray-500 text-xs mt-1">
                        By {formatAgentDisplay(activity.agent)}
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
              <div className="text-sm text-gray-500">No activity found.</div>
            )}

            {activityError && <div className="mt-3 text-sm text-red-600">Error loading activity: {String(activityError)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
