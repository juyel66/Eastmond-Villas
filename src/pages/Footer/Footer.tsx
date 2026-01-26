// Footer.jsx

import Swal from "sweetalert2";
import mapImg from "../../assets/map.svg";
import callImg from "../../assets/calll.svg";
import msgSvg from "../../assets/msg.svg";
import { Link } from "react-router";
import { FiMapPin } from "react-icons/fi";

const Footer = () => {
  const logoSrc =
    "https://res.cloudinary.com/dqkczdjjs/image/upload/v1762028421/lugo_ajzpp8.png";
  const bgImageSrc =
    "https://res.cloudinary.com/dqkczdjjs/image/upload/v1762022684/footer_image_jvdr23.jpg";

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();

    try {
      const raw =
        localStorage.getItem("auth_user") ||
        localStorage.getItem("user") ||
        null;

      if (!raw) {
        Swal.fire({
          icon: "warning",
          title: "Dashboard Access Restricted",
          text: "You are not logged in. Please sign in to access the Dashboard (Admin & Agent only).",
          showCancelButton: true,
          confirmButtonText: "Login",
          cancelButtonText: "Cancel",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            goToLogin();
          }
        });
        return;
      }

      let user;
      try {
        user = JSON.parse(raw);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Invalid Session",
          text: "We couldn't read your session. Please login again to continue.",
          showCancelButton: true,
          confirmButtonText: "Login",
          cancelButtonText: "Cancel",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            goToLogin();
          }
        });
        return;
      }

      const role = (
        user?.role ||
        user?.user?.role ||
        ""
      )
        .toString()
        .toLowerCase();

      if (role === "agent") {
        window.open(
          "https://www.eastmondvillas.com/dashboard/agent-properties-rentals",
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      if (role === "admin") {
        window.open(
          "https://www.eastmondvillas.com/dashboard/admin-dashboard",
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only Admin and Agent are allowed to access the Dashboard. If you believe this is a mistake, please contact support.",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("dashboard click error", err);

      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Could not open dashboard. Please try again later or log in.",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          goToLogin();
        }
      });
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full -z-[1000] text-white overflow-hidden shadow-2xl h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed h-full"
        style={{ backgroundImage: `url(${bgImageSrc})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 h-full flex flex-col justify-end">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Logo Section - For tablet: col-span-2, For desktop: col-span-1 */}
          <div className="flex justify-center md:justify-start items-center md:col-span-2 lg:col-span-1">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-3 md:mb-4">
                <img
                  src={logoSrc}
                  alt="Eastmond Villas Logo"
                  className="rounded-full "
                />
              </div>
              <div className="flex justify-center md:justify-start">
                <img
                  className="w-32 md:w-40 lg:w-48"
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760983755/Frame_1000004348_e4uzeb.png"
                  alt="Eastmond Villas"
                />
              </div>
            </div>
          </div>

          {/* Quick Links - For tablet: first row, second column */}
          <div className="text-center md:text-left">
            <h4 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <a href="/" className="hover:text-teal-400 transition-colors duration-200 text-xs md:text-sm lg:text-base">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-teal-400 transition-colors duration-200 text-xs md:text-sm lg:text-base">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="hover:text-teal-400 transition-colors duration-200 text-xs md:text-sm lg:text-base"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-and-conditions"
                  className="hover:text-teal-400 transition-colors duration-200 text-xs md:text-sm lg:text-base"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#dashboard"
                  className="hover:text-teal-400 transition-colors duration-200 text-xs md:text-sm lg:text-base cursor-pointer"
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Address - For tablet: second row, first column */}
          <div className="text-center md:text-left md:mt-4 lg:mt-0">
            <h4 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4">Address</h4>
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3">
              <div className="flex-shrink-0">
                <div className="text-xl md:text-2xl mt-1 md:mt-2">
                  <FiMapPin />
                </div>
              </div>
              <p className="text-xs md:text-sm lg:text-base md:mt-1">
                #65 Husbands Gardens,
                <br />
                St. James, Barbados BB 23042
              </p>
            </div>
          </div>

          {/* Contact - For tablet: second row, second column */}
          <div className="text-center md:text-left md:mt-4 lg:mt-0">
            <h4 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4">Contact</h4>
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3">
                <div className="flex-shrink-0">
                  <img src={callImg} alt="Phone icon" className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                </div>
                <p className="text-xs md:text-sm lg:text-base md:mt-1">+1 (246) 233-EAST</p>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3">
                <div className="flex-shrink-0">
                  <img src={msgSvg} alt="Email icon" className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                </div>
                <p className="text-xs md:text-sm lg:text-base md:mt-1">info@eastmondvillas.com</p>
              </div>
            </div>
          </div>

          {/* Social Links - For tablet: third row, spans both columns */}
          <div className="text-center md:text-left md:col-span-2 lg:col-span-1">
            <h4 className="text-base md:text-lg lg:text-xl font-semibold mb-3 md:mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-3 md:space-x-4">
              <a
                href="https://www.instagram.com/eastmondvillas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200"
              >
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760826820/Frame_dccruw.png"
                  alt="Facebook"
                  className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
                />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200"
              >
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760826937/Frame_1_m7bui5.png"
                  alt="Instagram"
                  className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
                />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200"
              >
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760826976/Frame_2_dmncqr.png"
                  alt="Twitter"
                  className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
                />
              </a>
            </div>
          </div>
        </div>

   
        <hr className="border-gray-500/50 my-4 md:my-6" />

    
        <div className="text-center text-gray-300  pb-3">
          &copy; {new Date().getFullYear()} Eastmond Villas. All Rights Reserved Worldwide.
        </div>
      </div>
    </footer>
  );
};

export default Footer;