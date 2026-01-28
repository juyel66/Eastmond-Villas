// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch } from "@/store";
// import { login, selectAuth } from "@/features/Auth/authSlice";
// import toast from "react-hot-toast";


// // Logo Component (same as before)
// const EastmondVillasLogo = () => (
//   <div className="flex items-center justify-center space-x-4 p-6 bg-white rounded-t-xl">
//     <img
//       className="h-20"
//       src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760303130/hd_svg_logo_1_rfsh4e.png"
//       alt="Eastmond Villas Logo"
//     />
//   </div>
// );

// const Login: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch | any>();
//   const navigate = useNavigate();
//   const auth = useSelector(selectAuth);

//   // form state
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const primaryColor = "bg-[#00A597] hover:bg-[#008f82]";

//   // --- handle submit ---
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setErrorMsg(null);

//     if (!email.trim() || !password.trim()) {
//       setErrorMsg("Please enter both email and password.");
//       return;
//     }

//     // Create API payload to match backend spec
//     const payload = {
//       email: email.trim(),
//       password: password.trim(),
//     };

//     try {
//       // login started (triggers login_started in slice)
//       const resultAction = await dispatch(login(payload));

//       if (login.fulfilled.match(resultAction)) {
//         // login succeeded
//         console.log("Login success:", resultAction.payload.user);
//         toast.success("Login successful!", {
//           position: "top-center",
//         });
//         navigate("/"); 
        
//       } else {
//         // login failed (show API error)
//         console.error("Login failed:", resultAction.payload || resultAction.error);
//         const errorData = resultAction.payload;

//         if (errorData?.non_field_errors) {
//           setErrorMsg(errorData.non_field_errors[0]);
//         } else if (errorData?.detail) {
//           setErrorMsg(errorData.detail);
//         } else {
//           setErrorMsg("Login failed. Please check your credentials.");
//         }
//       }
//     } catch (err: any) {
//       console.error("Unexpected login error:", err);
//       setErrorMsg("Unexpected error. Please try again.");
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 pb-10 rounded-xl shadow-lg border border-gray-200 mx-auto bg-cover bg-center bg-no-repeat"
//       style={{
//         backgroundImage:
//           "url('https://res.cloudinary.com/dqkczdjjs/image/upload/v1760812885/savba_k7kol1.png')",
//       }}
//     >
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <EastmondVillasLogo />

//         <div className="bg-white p-8 rounded-b-xl shadow-lg">
//           <div className="mb-6 p-0 rounded">
//             <h2 className="text-xl font-semibold text-gray-800 mb-1">
//               User Login
//             </h2>
//             <p className="text-sm text-gray-500">
//               Access your account to manage properties and agents
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="user@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-sm"
//               />
//             </div>

//             {/* Error */}
//             {errorMsg && (
//               <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
//             )}
//             {auth.error && !errorMsg && typeof auth.error === "string" && (
//               <p className="text-sm text-red-600 font-medium">{auth.error}</p>
//             )}

//             {/* Submit */}
//             <button
//               type="submit"
//               className={`w-full text-white font-medium py-3 rounded-md transition duration-150 ${primaryColor}`}
//               disabled={auth.loading}
//             >
//               {auth.loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           {/* Signup link */}
//           <div className="mt-6 text-center text-sm pt-4 border-t border-gray-200">
//             <p className="text-gray-600">
//               Don’t have an account?{" "}
//               <Link
//                 to="/register"
//                 className="font-semibold text-[#00A597] hover:text-[#008f82] transition duration-150"
//               >
//                 Sign up
//               </Link>
//             </p>
//           </div>

//           {/* Note */}
//           <p className="mt-4 text-center text-xs text-gray-500">
//             Login data will be sent securely to your backend API.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;







import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { login, selectAuth } from "@/features/Auth/authSlice";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ArrowLeftIcon } from "lucide-react";

// Logo Component (same as before)
const EastmondVillasLogo = () => (
  <div className="flex items-center justify-center space-x-4 p-6 bg-white rounded-t-xl">
    <img
      className="h-20"
      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760303130/hd_svg_logo_1_rfsh4e.png"
      alt="Eastmond Villas Logo"
    />
  </div>
);

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch | any>();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);

  // Redirect to appropriate page if already authenticated
  useEffect(() => {
    if (auth?.access && auth?.user) {
      const userRole = auth.user.role || auth.user.role_type || '';
      redirectBasedOnRole(userRole);
    }
  }, [auth, navigate]);

  // Function to redirect based on user role
  const redirectBasedOnRole = (role: string) => {
    role = role.toLowerCase();
    
    switch(role) {
      case 'admin':
        navigate("/dashboard/admin-dashboard", { replace: true });
        break;
      case 'agent':
        navigate("/dashboard/agent-properties-rentals", { replace: true });
        break;
      case 'customer':
      case 'user':
        navigate("/", { replace: true });
        break;
      default:
        // If role not recognized, redirect to home
        navigate("/", { replace: true });
    }
  };

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const primaryColor = "bg-[#00A597] hover:bg-[#008f82]";

  // Password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- handle submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    // Create API payload to match backend spec
    const payload = {
      email: email.trim(),
      password: password.trim(),
    };

    try {
      // login started (triggers login_started in slice)
      const resultAction = await dispatch(login(payload));

      if (login.fulfilled.match(resultAction)) {
        // login succeeded
        console.log("Login success:", resultAction.payload.user);
        
        // Get user role from response
        const userRole = resultAction.payload.user.role || 
                        resultAction.payload.user.role_type || 
                        '';
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Login successful!",
        });
        
        // Redirect based on role
        redirectBasedOnRole(userRole);
        
      } else {
        // login failed (show API error)
        console.error("Login failed:", resultAction.payload || resultAction.error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Login failed. Please check your credentials.",
        });
        const errorData = resultAction.payload;

        if (errorData?.non_field_errors) {
          setErrorMsg(errorData.non_field_errors[0]);
        } else if (errorData?.detail) {
          setErrorMsg(errorData.detail);
        } else {
          setErrorMsg("Login failed. Please check your credentials.");
        }
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setErrorMsg("Unexpected error. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 pb-10 rounded-xl shadow-lg border border-gray-200 mx-auto bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dqkczdjjs/image/upload/v1760812885/savba_k7kol1.png')",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <EastmondVillasLogo />

        <div className="bg-white p-8 rounded-b-xl shadow-lg">
          <div className="mb-6 p-0 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              User Login
            </h2>
            <p className="text-sm text-gray-500">
              Secure access to your personal Eastmond Villas account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm"
              />
            </div>

            {/* Password with eye icon */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 pt-3"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <img
                      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768420182/Vector_7_peacpf.png"
                      alt="Hide password"
                      className="h-5 w-5 mb-2 text-gray-500"
                    />
                  ) : (
                    <img
                      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768420130/Icon_28_zew7xb.png"
                      alt="Show password"
                      className="h-5 w-5 mb-2 text-gray-500"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
            )}
            {auth.error && !errorMsg && typeof auth.error === "string" && (
              <p className="text-sm text-red-600 font-medium">{auth.error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={`w-full text-white font-medium py-3 rounded-md transition duration-150 ${primaryColor}`}
              disabled={auth.loading}
            >
              {auth.loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Signup link */}
          <div className="mt-6 text-center text-sm pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#00A597] hover:text-[#008f82]"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-[#00A597] transition"
            >
              <div className="flex items-center text-center justify-center">
                <div className="">
                  <ArrowLeftIcon />
                </div>
                <p className="text-[17px]">Back to Home</p>
              </div>
            </Link>
          </div>

          {/* Note */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Register for authorised access to the world of Eastmond Villas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;