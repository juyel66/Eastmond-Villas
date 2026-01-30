import { SidebarTrigger } from "@/components/ui/sidebar";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import NotificationBell from "../Notifications/NotificationBell";

const MOBILE_LOGO =
  "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png";

// Function to extract page name from URL with ID/slug handling
const extractPageName = (pathname: string, params: any): string => {
  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean);
  
  // Get the last segment
  const lastSegment = segments[segments.length - 1] || "dashboard";
  
  // Check if the last segment is a numeric ID (like "123") or a slug
  const isNumericId = /^\d+$/.test(lastSegment);
  
  if (isNumericId && segments.length >= 2) {
    // If it's an ID, get the segment before it (the page name)
    const pageSegment = segments[segments.length - 2];
    return formatName(pageSegment);
  } else if (lastSegment === "update" && segments.length >= 3) {
    // Handle update pages (e.g., /dashboard/agent-properties-sales/123/update)
    const pageSegment = segments[segments.length - 3];
    return `${formatName(pageSegment)} - Update`;
  } else if (lastSegment === "create" && segments.length >= 3) {
    // Handle create pages
    const pageSegment = segments[segments.length - 3];
    return `${formatName(pageSegment)} - Create`;
  } else if (lastSegment === "create" && segments.length === 2) {
    // Handle simple create pages (e.g., /dashboard/create)
    return "Create";
  }
  
  // Check if we have a slug parameter from useParams
  if (params.slug) {
    const pageSegment = segments[segments.length - 1] || segments[segments.length - 2];
    return `${formatName(pageSegment)} - ${params.slug}`;
  }
  
  // Check if we have an id parameter from useParams
  if (params.id && segments.length >= 2) {
    const pageSegment = segments[segments.length - 2];
    return `${formatName(pageSegment)} - Details`;
  }
  
  // Default: format the last segment
  return formatName(lastSegment);
};

// Helper function to format name
const formatName = (str: string): string => {
  if (!str) return "Dashboard";
  
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const params = useParams(); // Get route parameters (id, slug, etc.)

  // Get page name with ID/slug handling
  const pageName = extractPageName(pathname, params);

  // CURRENT USER
  const currentUser = useSelector((state: any) => state?.auth?.user);
  const username = currentUser?.name || "User";
  const userRole = currentUser?.role || "No Role";

  // DROPDOWN HANDLER
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const check = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", check);
    return () => document.removeEventListener("mousedown", check);
  }, []);

  return (
    <div>
      <div className="navbar p-0 border-b-2">

        {/* LEFT SIDE */}
        <div className="navbar-start flex items-center gap-3">

          {/* Sidebar trigger (mobile only) */}
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>

          {/* MOBILE LOGO */}
          <img
            src={MOBILE_LOGO}
            alt="mobile-logo"
            className="h-10 w-auto block md:hidden"
          />

          {/* PAGE TITLE (desktop only) */}
          <div className="ml-3 hidden md:block">
            <p className="text-black">
              Pages <span className="text-black"> / {pageName}</span>
            </p>
            <p className="text-xl text-black font-semibold">{pageName}</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
      <div
  className="navbar-end w-full flex flex-col md:flex-row items-center md:justify-end gap-3 md:gap-4 pr-4"
  ref={dropdownRef}
>
  {/* Mobile layout */}
  <div className="w-full flex justify-between items-center md:hidden">
    {/* Notification left */}
    <NotificationBell />

    {/* Name & Role right */}
    <div className="flex flex-col text-right">
      <p className="text-lg font-semibold">
        {username.charAt(0).toUpperCase() + username.slice(1)}
      </p>
      <p className="text-gray-500 text-sm">
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
      </p>
    </div>
  </div>

  {/* Desktop layout */}
  <div className="hidden md:flex items-center gap-4">
    <NotificationBell />

    <div className="flex flex-col text-left">
      <p className="text-lg font-semibold">
        {username.charAt(0).toUpperCase() + username.slice(1)}
      </p>
      <p className="text-gray-500 text-sm">
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
      </p>
    </div>

    <CgProfile className="text-xl text-white" />
    <IoSettingsOutline className="text-xl ml-2 text-white" />
  </div>
</div>

      </div>
    </div>
  );
};

export default Navbar;