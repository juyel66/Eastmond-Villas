// // src/pages/Register.tsx
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { register, selectAuth } from "@/features/Auth/authSlice";
// import toast from "react-hot-toast";
// import Swal from "sweetalert2";

// // Reusable logo component
// const EastmondVillasLogo = () => (
//   <div className="flex items-center justify-center space-x-4 p-6 bg-white rounded-t-xl">
//     <img
//       className="h-20"
//       src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760303130/hd_svg_logo_1_rfsh4e.png"
//       alt="Eastmond Villas Logo"
//     />
//   </div>
// );

// // Assuming AppDispatch is imported or defined elsewhere
// // type AppDispatch = any; 

// const Register: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch | any>();
//   const authState = useSelector(selectAuth);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password1, setPassword1] = useState("");
//   const [password2, setPassword2] = useState("");

//   const [localError, setLocalError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   const primaryColor = "bg-[#00A597] hover:bg-[#008f82]";

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLocalError(null);

//     // Client-side validation + toast
//     if (!name.trim() || !email.trim() || !password1 || !password2) {
//       setLocalError("Please fill all required fields.");
//       toast.error("Please fill all required fields.");
//       return;
//     }
//     if (password1 !== password2) {
//       setLocalError("Passwords do not match.");
//       toast.error("Passwords do not match.");
//       return;
//     }

//     const payload = {
//       email: email.trim(),
//       name: name.trim(),
//       phone: phone.trim(),
//       password1: password1,
//       password2: password2,
//     };

//     // Optionally show a loading toast (uncomment if you want)
//     // const loadingToastId = toast.loading("Registering...");

//     const resultAction = await dispatch(register(payload));

//     // dismiss loading toast if used
//     // toast.dismiss(loadingToastId);

//     if (register.fulfilled.match(resultAction)) {
//       console.log("Registration successful:", resultAction.payload);

//     Swal.fire({
//       icon: "success",
//       title: "Registration Successful",
//       text: "Please login",
//     });

//       navigate("/login");
//     } else {
//       console.error("Registration failed:", resultAction.payload || resultAction.error);

//       // Derive a user-friendly message from the payload or error
//       let errorMessage = "Registration failed";
//       if (resultAction.payload && typeof resultAction.payload === "object") {
//         const payloadErr = resultAction.payload as Record<string, any>; // Type assertion for safety
//         const firstKey = Object.keys(payloadErr)[0];
//         const firstMsg = payloadErr[firstKey];
//         errorMessage =
//           typeof firstMsg === "string"
//             ? firstMsg
//             : Array.isArray(firstMsg)
//             ? String(firstMsg[0])
//             : "Registration failed";
//       } else {
//         errorMessage = resultAction.error?.message || "Registration failed";
//       }

//       // 🚩 SweetAlert2 (Swal.fire) কে এখন ডাইনামিক এরর মেসেজ দেখানো হবে
//       Swal.fire({
//         icon: "error",
//         title: "Registration Failed",
//         text: errorMessage, // <-- পরিবর্তিত লাইন
//       });

//       setLocalError(errorMessage);
//       toast.error(errorMessage, 
//         { position: "top-center" });
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
//         <EastmondVillasLogo />

//         <div className="bg-white p-8 rounded-b-xl shadow-lg">
//           <div className="mb-6 p-0 rounded">
//             <h2 className="text-xl font-semibold text-gray-800 mb-1">User</h2>
//             <p className="text-sm text-gray-500">Create your new account to access the dashboard</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4" noValidate>
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 placeholder="John Doe"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="user@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 placeholder="+1 246 1234567"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm"
//               />
//             </div>

//             <div>
//               <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 id="password1"
//                 type="password"
//                 placeholder="••••••••"
//                 value={password1}
//                 onChange={(e) => setPassword1(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-sm"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm Password
//               </label>
//               <input
//                 id="password2"
//                 type="password"
//                 placeholder="••••••••"
//                 value={password2}
//                 onChange={(e) => setPassword2(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-sm"
//                 required
//               />
//             </div>

//             {localError && <p className="text-sm text-red-600">{localError}</p>}
//             {authState.error && typeof authState.error === "string" && (
//               <p className="text-sm text-red-600">{authState.error}</p>
//             )}

//             <button
//               type="submit"
//               className={`w-full text-white font-medium py-3 rounded-md transition duration-150 ${primaryColor}`}
//               disabled={authState.loading}
//             >
//               {authState.loading ? "Registering..." : "Register Account"}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-sm pt-4 border-t border-gray-200">
//             <p className="text-gray-600">
//               Already have an account?{" "}
//               <Link to="/login" className="font-semibold text-[#00A597] hover:text-[#008f82] transition duration-150">
//                 Login here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;






// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, selectAuth } from "@/features/Auth/authSlice";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ArrowLeftIcon } from "lucide-react";

// Reusable logo component
const EastmondVillasLogo = () => (
  <div className="flex items-center justify-center space-x-4 p-6 bg-white rounded-t-xl">
    <img
      className="h-20"
      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760303130/hd_svg_logo_1_rfsh4e.png"
      alt="Eastmond Villas Logo"
    />
  </div>
);

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch | any>();
  const authState = useSelector(selectAuth);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string[];
    email?: string[];
    name?: string[];
    phone?: string[];
    non_field_errors?: string[];
  }>({});

  const primaryColor = "bg-[#00A597] hover:bg-[#008f82]";

  // Redirect to home if already authenticated
  useEffect(() => {
    if (authState?.access && authState?.user) {
      navigate("/", { replace: true });
    }
  }, [authState, navigate]);

  // Password visibility toggles
  const togglePassword1Visibility = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePassword2Visibility = () => {
    setShowPassword2(!showPassword2);
  };

  // Function to validate name (only letters, spaces, hyphens, and apostrophes)
  const validateName = (input: string): { isValid: boolean; message?: string } => {
    if (!input.trim()) {
      return { isValid: false, message: "Name is required" };
    }
    
    // Regex: Only letters (including international characters), spaces, hyphens, and apostrophes
    const nameRegex = /^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
    
    if (!nameRegex.test(input)) {
      return { 
        isValid: false, 
        message: "Name can only contain letters, spaces, hyphens (-), and apostrophes (')" 
      };
    }
    
    // Check minimum length (at least 2 characters)
    if (input.trim().length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters long" };
    }
    
    // Check maximum length
    if (input.trim().length > 100) {
      return { isValid: false, message: "Name is too long (max 100 characters)" };
    }
    
    return { isValid: true };
  };

  // Function to validate phone number
  const validatePhone = (input: string): { isValid: boolean; message?: string } => {
    if (!input.trim()) {
      return { isValid: true }; // Phone is optional
    }
    
    // Basic phone validation (allows numbers, spaces, plus sign, parentheses, hyphens)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]{8,20}$/;
    
    if (!phoneRegex.test(input)) {
      return { 
        isValid: false, 
        message: "Please enter a valid phone number (8-20 digits, may include +, spaces, or hyphens)" 
      };
    }
    
    // Remove all non-digit characters and check length
    const digitsOnly = input.replace(/\D/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return { isValid: false, message: "Phone number should be 8-15 digits" };
    }
    
    return { isValid: true };
  };

  // Function to display password validation criteria
  const getPasswordCriteria = () => {
    return {
      minLength: password1.length >= 8,
      hasUppercase: /[A-Z]/.test(password1),
      hasLowercase: /[a-z]/.test(password1),
      hasNumber: /\d/.test(password1),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password1),
      notCommon: !["password", "123456", "qwerty", "admin", "letmein"].includes(password1.toLowerCase()),
    };
  };

  const passwordCriteria = getPasswordCriteria();
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const nameValidation = validateName(name);
  const phoneValidation = validatePhone(phone);

  // Handle name input with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  // Handle phone input with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setValidationErrors({});

    // Client-side validation
    const nameValidationResult = validateName(name);
    if (!nameValidationResult.isValid) {
      setLocalError(nameValidationResult.message || "Please enter a valid name.");
      toast.error(nameValidationResult.message || "Please enter a valid name.");
      return;
    }

    if (!email.trim()) {
      setLocalError("Please enter your email.");
      toast.error("Please enter your email.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password1) {
      setLocalError("Please enter a password.");
      toast.error("Please enter a password.");
      return;
    }

    if (!password2) {
      setLocalError("Please confirm your password.");
      toast.error("Please confirm your password.");
      return;
    }

    if (password1 !== password2) {
      setLocalError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    // Client-side password validation
    if (!isPasswordValid) {
      setLocalError("Password does not meet the requirements.");
      toast.error("Please check password requirements.");
      return;
    }

    // Phone validation (optional)
    const phoneValidationResult = validatePhone(phone);
    if (!phoneValidationResult.isValid) {
      setLocalError(phoneValidationResult.message || "Please enter a valid phone number.");
      toast.error(phoneValidationResult.message || "Please enter a valid phone number.");
      return;
    }

    const payload = {
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      password1: password1,
      password2: password2,
    };

    const resultAction = await dispatch(register(payload));

    if (register.fulfilled.match(resultAction)) {
      console.log("Registration successful:", resultAction.payload);

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Please login to your account",
        confirmButtonColor: "#00A597",
      });

      navigate("/login", { replace: true });
    } else {
      console.error("Registration failed:", resultAction.payload || resultAction.error);

      // Handle backend validation errors
      if (resultAction.payload && typeof resultAction.payload === "object") {
        const errorData = resultAction.payload as Record<string, any>;
        setValidationErrors(errorData);

        // Extract error messages for display
        let errorMessages: string[] = [];
        
        if (errorData.password) {
          errorMessages = errorMessages.concat(errorData.password);
        }
        if (errorData.email) {
          errorMessages = errorMessages.concat(errorData.email);
        }
        if (errorData.non_field_errors) {
          errorMessages = errorMessages.concat(errorData.non_field_errors);
        }

        // Show specific error messages
        if (errorMessages.length > 0) {
          const errorMessage = errorMessages.join(" ");
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: errorMessage,
            confirmButtonColor: "#00A597",
          });
          setLocalError(errorMessage);
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: "Please check your information and try again.",
            confirmButtonColor: "#00A597",
          });
          setLocalError("Registration failed. Please try again.");
        }
      } else {
        const errorMessage = resultAction.error?.message || "Registration failed";
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: errorMessage,
          confirmButtonColor: "#00A597",
        });
        setLocalError(errorMessage);
      }
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
        <EastmondVillasLogo />

        <div className="bg-white p-8 rounded-b-xl shadow-lg">
          <div className="mb-6 p-0 rounded">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">User Registration</h2>
            <p className="text-sm text-gray-500">Create your new account to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={handleNameChange}
                className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm ${
                  (validationErrors.name || !nameValidation.isValid) ? "border-red-500" : name.trim() && nameValidation.isValid ? "border-green-500" : "border-gray-300"
                }`}
                required
              />
              {!nameValidation.isValid && name.trim() && (
                <p className="mt-1 text-xs text-red-600">{nameValidation.message}</p>
              )}
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name[0]}</p>
              )}
              {name.trim() && nameValidation.isValid && (
                <p className="mt-1 text-xs text-green-600">✓ Valid name format</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Only letters, spaces, hyphens (-), and apostrophes (') are allowed
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.email[0]}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 246 1234567"
                value={phone}
                onChange={handlePhoneChange}
                className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 text-gray-700 text-sm ${
                  (validationErrors.phone || (phone.trim() && !phoneValidation.isValid)) ? "border-red-500" : phone.trim() && phoneValidation.isValid ? "border-green-500" : "border-gray-300"
                }`}
              />
              {phone.trim() && !phoneValidation.isValid && (
                <p className="mt-1 text-xs text-red-600">{phoneValidation.message}</p>
              )}
              {validationErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.phone[0]}</p>
              )}
              {phone.trim() && phoneValidation.isValid && (
                <p className="mt-1 text-xs text-green-600">✓ Valid phone number</p>
              )}
            </div>

            {/* Password 1 with eye icon */}
            <div>
              <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password1"
                  type={showPassword1 ? "text" : "password"}
                  placeholder="Enter a strong password"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-sm pr-10 ${
                    validationErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword1Visibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 pt-3"
                  aria-label={showPassword1 ? "Hide password" : "Show password"}
                >
                  {showPassword1 ? (
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
              
              {/* Password validation criteria */}
              {password1 && (
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium mb-1">Password must include:</p>
                  <ul className="space-y-1 ml-4">
                    <li className={`flex items-center ${passwordCriteria.minLength ? "text-green-600" : "text-red-600"}`}>
                      <span className="mr-2">{passwordCriteria.minLength ? "✓" : "✗"}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordCriteria.hasUppercase ? "text-green-600" : "text-red-600"}`}>
                      <span className="mr-2">{passwordCriteria.hasUppercase ? "✓" : "✗"}</span>
                      One uppercase letter (A-Z)
                    </li>
                    <li className={`flex items-center ${passwordCriteria.hasLowercase ? "text-green-600" : "text-red-600"}`}>
                      <span className="mr-2">{passwordCriteria.hasLowercase ? "✓" : "✗"}</span>
                      One lowercase letter (a-z)
                    </li>
                    <li className={`flex items-center ${passwordCriteria.hasNumber ? "text-green-600" : "text-red-600"}`}>
                      <span className="mr-2">{passwordCriteria.hasNumber ? "✓" : "✗"}</span>
                      One number (0-9)
                    </li>
                    <li className={`flex items-center ${passwordCriteria.hasSpecialChar ? "text-green-600" : "text-red-600"}`}>
                      <span className="mr-2">{passwordCriteria.hasSpecialChar ? "✓" : "✗"}</span>
                      One special character (!@#$%^&* etc.)
                    </li>
                    <li className={`flex items-center ${passwordCriteria.notCommon ? "text-green-600" : "text-red-600"}`}>
                      <span className="mr-2">{passwordCriteria.notCommon ? "✓" : "✗"}</span>
                      Not a common password
                    </li>
                  </ul>
                </div>
              )}
              
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.password.join(" ")}</p>
              )}
            </div>

            {/* Password 2 (Confirm) with eye icon */}
            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="password2"
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-700 text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword2Visibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 pt-3"
                  aria-label={showPassword2 ? "Hide password" : "Show password"}
                >
                  {showPassword2 ? (
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
              {password2 && password1 !== password2 && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Display backend validation errors */}
            {validationErrors.non_field_errors && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">Registration Error:</p>
                <p className="text-xs text-red-600">{validationErrors.non_field_errors.join(" ")}</p>
              </div>
            )}

            {/* Local error display */}
            {localError && !validationErrors.non_field_errors && (
              <p className="text-sm text-red-600">{localError}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className={`w-full text-white font-medium py-3 rounded-md transition duration-150 ${primaryColor} ${
                !isPasswordValid || !nameValidation.isValid || (phone.trim() && !phoneValidation.isValid) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={authState.loading || !isPasswordValid || !nameValidation.isValid || (phone.trim() && !phoneValidation.isValid)}
            >
              {authState.loading ? "Registering..." : "Register Account"}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#00A597] hover:text-[#008f82] transition duration-150"
              >
                Login here
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
        </div>
      </div>
    </div>
  );
};

export default Register;