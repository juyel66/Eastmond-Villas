import { SidebarTrigger } from "@/components/ui/sidebar";

import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import NotificationBell from "../Notifications/NotificationBell";

const MOBILE_LOGO =
  "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png";

const extractPageName = (pathname: string, params: any): string => {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "dashboard";
  
  const isNumericId = /^\d+$/.test(lastSegment);
  
  if (isNumericId && segments.length >= 2) {
    const pageSegment = segments[segments.length - 2];
    return formatName(pageSegment);
  } else if (lastSegment === "update" && segments.length >= 3) {
    const pageSegment = segments[segments.length - 3];
    return `${formatName(pageSegment)} - Update`;
  } else if (lastSegment === "create" && segments.length >= 3) {
    const pageSegment = segments[segments.length - 3];
    return `${formatName(pageSegment)} - Create`;
  } else if (lastSegment === "create" && segments.length === 2) {
    return "Create";
  }

  if (params.slug) {
    const pageSegment = segments[segments.length - 1] || segments[segments.length - 2];
    return `${formatName(pageSegment)} - ${params.slug}`;
  }
  
  if (params.id && segments.length >= 2) {
    const pageSegment = segments[segments.length - 2];
    return `${formatName(pageSegment)} - Details`;
  }

  return formatName(lastSegment);
};

const formatName = (str: string): string => {
  if (!str) return "Dashboard";
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const params = useParams(); 
  const pageName = extractPageName(pathname, params);

  const currentUser = useSelector((state: any) => state?.auth?.user);
  const username = currentUser?.name || "User";
  const userRole = currentUser?.role || "No Role";

  return (
    <div className="navbar justify-between p-0 border-b-2">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <SidebarTrigger />
        </div>

        <img
          src={MOBILE_LOGO}
          alt="mobile-logo"
          className="h-10 w-auto md:hidden"
        />

        <div className="hidden md:block">
          <p className="text-xl font-bold">{pageName}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-2">
          <div className="md:hidden">
            <NotificationBell />
          </div>


            <div className="hidden md:block mr-2">
          <NotificationBell />
        </div>
          
          <div className="hidden md:block">
            <p className="text-lg font-semibold">
              {username.charAt(0).toUpperCase() + username.slice(1)}
            </p>
            <p className="text-sm ">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
          
          <div className="md:hidden text-sm border px-2 py-1 rounded-md bg-gray-100 ">
            <p className="font-semibold ">
              {username.charAt(0).toUpperCase() + username.slice(1)}
            </p>
              <p className="text-sm ">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
        </div>

       

       

        
      </div>
    </div>
  );
};

export default Navbar;