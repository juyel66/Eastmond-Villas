import { SidebarTrigger } from "@/components/ui/sidebar";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineNotifications, MdSearch } from "react-icons/md";
import { useLocation } from "react-router-dom";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { pathname } = useLocation();

  // ------------------------------
  // GET CURRENT USER FROM REDUX
  // ------------------------------
  const currentUser = useSelector((state: any) => state?.auth?.user);

  const displayName = currentUser?.name || "Unknown User";
  const displayRole = currentUser?.role || "No Role";

  // ------------------------------
  // DROPDOWN
  // ------------------------------
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------------------

  return (
    <div>
      <div className="navbar p-0 border-b-2">
        <div className="navbar-start">
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>

          <div className="relative w-full">
            <MdSearch className="absolute left-3 top-1/2 w-7 h-7 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              placeholder="Search properties, agents, or listings..."
              type="text"
              className="w-full h-10 pl-10 pr-5 rounded-[10px] border-2 border-gray-300"
            />
          </div>
        </div>

        <div className="navbar-end">
          <div className="flex items-center gap-4 pb-2 pt-2" ref={dropdownRef}>
            <div
              className="relative text-4xl mb-2 cursor-pointer"
              onClick={toggleDropdown}
            >
              <img
                className="h-12 w-12"
                src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761005969/Button_2_hee1qa.png"
                alt="avatar"
              />
            </div>

            {/* ------------------------------
                SHOW REAL USER NAME + ROLE
            ------------------------------ */}
            <div>
              <p className="text-xl font-semibold">{displayName}</p>
              <p className="text-gray-500">{displayRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CgProfile className="text-xl lg:flex md:flex hidden text-white" />
          </div>
          <IoSettingsOutline className="text-xl ml-2 text-white lg:flex md:flex hidden" />
          <MdOutlineNotifications className="text-xl ml-2 lg:flex md:flex hidden text-white" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
