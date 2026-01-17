// Footer.jsx

import Swal from "sweetalert2";
import mapImg from "../../assets/map.svg"
import callImg from "../../assets/calll.svg"
import msgSvg from "../../assets/msg.svg"
import { Link } from "react-router";

const Footer = () => {
  const logoSrc =
    "https://res.cloudinary.com/dqkczdjjs/image/upload/v1762028421/lugo_ajzpp8.png";
  const bgImageSrc =
    "https://res.cloudinary.com/dqkczdjjs/image/upload/v1762022684/footer_image_jvdr23.jpg";

  const goToLogin = () => {
    // Use location replace so back button doesn't return to protected page
    window.location.href = "/login";
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();

    try {
      const raw =
        localStorage.getItem("auth_user") ||
        localStorage.getItem("user") ||
        null;

      // --- USER NOT LOGGED IN ---
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
        // malformed session -> prompt to login (non-blocking)
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

      // --- AGENT ---
      if (role === "agent") {
        window.open(
          "https://www.eastmondvillas.com/dashboard/agent-properties-rentals",
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      // --- ADMIN ---
      if (role === "admin") {
        window.open(
          "https://www.eastmondvillas.com/dashboard/admin-dashboard",
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      // --- ANY OTHER ROLE (customer/user/guest) ---
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 h-full flex flex-col justify-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 md:gap-y-12 lg:gap-8">
          {/* Logo */}
          <div className="flex lg:ml-0   ml-8 items-center sm:justify-center md:justify-start lg:items-start lg:justify-start -mb-11 ">
            <div>
              <img src={logoSrc} alt="Eastmond Villas Logo" className="rounded-full" />
              <img
                className=""
                src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760983755/Frame_1000004348_e4uzeb.png"
                alt=""
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left md:text-left ">
            <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Quick Links</h4>
            <ul className="space-y-2 md:space-y-3">
              <li><a href="/" className="hover:text-teal-400 transition-colors duration-200">Home</a></li>
              <li><a href="/about" className="hover:text-teal-400 transition-colors duration-200">About Us</a></li>
              {/* <li><a href="/list-with-us" className="hover:text-teal-400 transition-colors duration-200">List With Us</a></li> */}
              <li><a href="/contact" className="hover:text-teal-400 transition-colors duration-200 ">Contact</a></li>
              <li><Link to="/privacy-policy" className="hover:text-teal-400 transition-colors duration-200 ">Privacy Policy</Link></li>
              <li>
           
                <a
                  href="#dashboard"
                  className="hover:text-teal-400 transition-colors duration-200 cursor-pointer"
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className="text-center sm:text-left md:text-left">
            <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Address</h4>
            <div className="flex items-start justify-center sm:justify-start md:justify-start space-x-3">
           <img src={mapImg} alt=""  className="lg:mt-4"/>
              <p className="text-sm md:text-base">
                #65 Husbands Gardens,<br />St. James, Barbados BB 23042
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left md:text-left -mt-5">
            <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6  lg:mt-4">Contact</h4>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-center sm:justify-start md:justify-start space-x-3">
                <img src={callImg} alt="" />
                <p className="text-sm md:text-base">+1 (246) 233-EAST</p>
              </div>

              <div className="flex items-center justify-center sm:justify-start md:justify-start space-x-3">
                <img src={msgSvg} alt="" />
                <p className="text-sm md:text-base">info@eastmondvillas.com</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center sm:text-left md:text-left ">
            <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Follow Us</h4>
            <div className="flex items-center justify-center sm:justify-start md:justify-start space-x-4">
              <a href="https://www.instagram.com/eastmondvillas" target="_blank" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760826820/Frame_dccruw.png" alt="Facebook" />
              </a>
              <a href="https://x.com/" target="_blank" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760826937/Frame_1_m7bui5.png" alt="Instagram" />
              </a>
              <a href="https://www.facebook.com/" target="_blank" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760826976/Frame_2_dmncqr.png" alt="Twitter" />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-gray-400 my-4" />

        <div className="text-center mt-5 text-gray-200 text-sm md:text-base">
          &copy; {new Date().getFullYear()} Eastmond Villas. All Rights Reserved Worldwide.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
