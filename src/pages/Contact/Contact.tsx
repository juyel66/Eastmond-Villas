import React, { useState } from "react";
import Swal from "sweetalert2";
import Affiliates from "../Home/Component/Affiliates";

// Define types for cleaner React code
interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const API_URL = `${import.meta.env.VITE_API_BASE}/list_vila/contect/`;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // <--- Sending JSON
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to send message");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Message sent successfully!",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 4000);
    }
  };

  return (
    <div
     style={{
          backgroundImage:
            "url('/images/shape1 2.png')",
        }}
    
    >
      <section className="py-16 md:py-24 lg:py-28 container mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Main Heading - Pixel Perfect */}
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-12 md:mb-16">
            Let's Connect
          </h2>

          <div 
          

           className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT COLUMN: Contact Form */}
            <div className="p-8 md:p-10 rounded-3xl    ">
              <p className="text-xl md:text-xl font-semibold text-gray-700 mb-8">
                Get In Touch
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Alex"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email and Phone Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="demo@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="01845756776"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <div className="absolute  top-4">
                 
                    </div>
                    <textarea
                      name="message"
                      rows={4}
                      className="block w-full pl-5 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Write Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Status Messages */}
                {loading && (
                  <p className="text-center text-green-600 font-semibold py-3">
                    Sending message...
                  </p>
                )}

                {success && (
                  <p className="text-center text-green-600 font-semibold bg-green-50 p-3 rounded-lg">
                    Message sent successfully!
                  </p>
                )}

                {error && (
                  <p className="text-center text-red-600 font-semibold bg-red-50 p-3 rounded-lg">
                    Failed to send: {error}
                  </p>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-lg text-lg font-semibold text-white cursor-pointer  bg-[#009689] hover:bg-[#007a6f]  transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl ">
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760835086/Frame_1000004224_1_zrb6bg.png"
                  alt="Contact illustration"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay for better text contrast */}
                <div className="absolute inset-0  from-black/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          {/* Affiliates component will be placed here */}
        </div>
      </section>

      <div>
        <Affiliates />
      </div>
    </div>
  );
};

export default Contact;