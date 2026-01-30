import React, { useState } from "react";
import Swal from "sweetalert2";

// Define types for cleaner React code
interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactHomePage = () => {
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
    <div>
      <section className="py-16 md:py-24 lg:py-28 container mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12 md:mb-16">
            Let's Connect
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT COLUMN: Contact Form */}
            <div className="p-8 md:p-10 rounded-3xl">
              <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-8">
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
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M10 10C12.3012 10 14.1667 8.1345 14.1667 5.83333C14.1667 3.53215 12.3012 1.66667 10 1.66667C7.69881 1.66667 5.83333 3.53215 5.83333 5.83333C5.83333 8.1345 7.69881 10 10 10Z" 
                            stroke="#9CA3AF" 
                            strokeWidth="1.5"
                          />
                          <path 
                            d="M17.1583 18.3333C17.1583 14.9208 13.9075 12.1667 10 12.1667C6.0925 12.1667 2.84167 14.9208 2.84167 18.3333" 
                            stroke="#9CA3AF" 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="name"
                      className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter Your Name"
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
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 20 20" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M2.5 6.66667L8.08525 10.5485C8.96359 11.1627 10.0364 11.1627 10.9148 10.5485L16.5 6.66667M4.16667 15.8333H15.8333C16.7538 15.8333 17.5 15.0871 17.5 14.1667V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V14.1667C2.5 15.0871 3.24619 15.8333 4.16667 15.8333Z" 
                              stroke="#9CA3AF" 
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="email"
                        name="email"
                        className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter Your Email"
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
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 20 20" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M5.83333 2.5H7.5L8.33333 6.66667L7.08333 7.91667C8.03171 9.72827 9.60507 11.3016 11.4167 12.25L12.6667 11L16.6667 11.8333V13.5C16.6667 14.4205 15.9205 15.1667 15 15.1667C10.165 15.1667 6.16667 11.1683 6.16667 6.33333C6.16667 5.41286 5.91286 4.66667 5.83333 2.5Z" 
                              stroke="#9CA3AF" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        className="block w-full pl-12 pr-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter Your Phone Number"
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
                    <div className="absolute left-4 top-4">
                      <div className="w-5 h-5 flex items-center justify-center">
                    
                      </div>
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
                  <p className="text-center text-blue-600 font-semibold py-3">
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
                    className="w-full px-6 py-4 rounded-lg text-lg font-semibold text-white bg-[#009689] hover:bg-[#007a6f] cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-20"></div>
      </section>
    </div>
  );
};

export default ContactHomePage;