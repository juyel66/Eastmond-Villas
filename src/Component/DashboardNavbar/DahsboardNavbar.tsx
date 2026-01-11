import { SidebarTrigger } from "@/components/ui/sidebar";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import NotificationBell from "../Notifications/NotificationBell";

const MOBILE_LOGO =
  "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760303130/hd_svg_logo_1_rfsh4e.png";

const Navbar: React.FC = () => {
  const { pathname } = useLocation();

  // PAGE TITLE
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "dashboard";

  const formatName = (str: string) =>
    str
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const pageName = formatName(last);

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
        <div className="navbar-end flex items-center gap-4 pr-4" ref={dropdownRef}>
          
          {/* Notification Bell (all devices) */}
          <NotificationBell />

          {/* USER INFO — Name ABOVE Role */}
          <div className="flex flex-col text-left">
            <p className="text-lg font-semibold">{username}</p>
            <p className="text-gray-500 text-sm">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>

          {/* Profile Icon + Settings (desktop only) */}
          <CgProfile className="text-xl text-white hidden md:flex" />
          <IoSettingsOutline className="text-xl ml-2 text-white hidden md:flex" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
