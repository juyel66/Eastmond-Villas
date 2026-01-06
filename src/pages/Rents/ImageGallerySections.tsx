// // ImageGallerySections.tsx
// import React, { useState, useEffect } from "react";
// import jsPDF from "jspdf";

// import VideoExperience from "./VideoExperience";
// import Description from "./Descriptions";
// import Locations from "./Locations";
// import Calendar from "./Calendar";
// import AddReviewForm from "./AddReviewForm";
// import BedRoomsSliders from "./BedRoomsSliders";
// import RatesBookingInformation from "./RatesBookingInformation";
// import Swal from "sweetalert2";

// const API_BASE =
//   import.meta.env.VITE_API_BASE || "https://api.eastmondvillas.com/api";
// const LOCAL_FALLBACK = "/mnt/data/28e6a12e-2530-41c9-bdcc-03c9610049e3.png";

// // --------- Sub-item Components ----------
// const AmenityItem = ({ name }) => (
//   <li className="flex items-start text-gray-700 text-sm mb-2">
//     <img
//       src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
//       alt="icon"
//       className="w-4 h-4 mr-2 mt-0.5"
//     />
//     {name}
//   </li>
// );

// const StaffItem = ({ name, details }) => (
//   <li className="flex items-start mb-4">
//     <img
//       src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
//       alt="icon"
//       className="w-4 h-4 mr-2 mt-0.5"
//     />
//     <div className="flex flex-col text-gray-700 text-sm">
//       <span className="font-semibold text-gray-800">{name}</span>
//       <span className="text-xs text-gray-600">{details}</span>
//     </div>
//   </li>
// );

// // Simple helper to load images with crossOrigin and fallback
// const loadImageWithFallback = (src) =>
//   new Promise((resolve) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = () => {
//       // try fallback
//       const f = new Image();
//       f.crossOrigin = "Anonymous";
//       f.onload = () => resolve(f);
//       f.onerror = () => resolve(null);
//       f.src = LOCAL_FALLBACK;
//     };
//     img.src = src || LOCAL_FALLBACK;
//   });

// // center-crop draw: draw image onto canvas sized cw x ch, cropping to cover
// const drawImageCoverToCanvas = (imgEl, canvas, targetW, targetH) => {
//   const ctx = canvas.getContext("2d");
//   const iw = imgEl.naturalWidth || imgEl.width;
//   const ih = imgEl.naturalHeight || imgEl.height;

//   const scale = Math.max(targetW / iw, targetH / ih);
//   const sw = targetW / scale;
//   const sh = targetH / scale;

//   const sx = Math.max(0, Math.floor((iw - sw) / 2));
//   const sy = Math.max(0, Math.floor((ih - sh) / 2));

//   canvas.width = targetW;
//   canvas.height = targetH;

//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, targetW, targetH);
// };

// // Image Modal Component
// const ImageModal = ({ images, currentIndex, onClose, onNext, onPrev }) => {
//   const [currentImgIndex, setCurrentImgIndex] = useState(currentIndex);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === 'ArrowRight') onNext();
//       if (e.key === 'ArrowLeft') onPrev();
//     };
    
//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [onClose, onNext, onPrev]);

//   useEffect(() => {
//     setCurrentImgIndex(currentIndex);
//   }, [currentIndex]);

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-9999"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 text-white text-3xl z-50 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center"
//       >
//         ×
//       </button>
      
//       <button
//         onClick={onPrev}
//         disabled={currentImgIndex === 0}
//         className="absolute left-4 text-white text-3xl z-50 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
//       >
//         ‹
//       </button>
      
//       <div className="relative max-w-4xl max-h-[80vh]">
//         <img
//           src={images[currentImgIndex]?.url}
//           alt={`Gallery image ${currentImgIndex + 1}`}
//           className="w-full h-full object-contain rounded-lg"
//         />
        
//         <div className="absolute bottom-4 left-0 right-0 flex justify-center">
//           <div className="flex space-x-2 overflow-x-auto max-w-full px-4">
//             {images.map((img, index) => (
//               <button
//                 key={img.id}
//                 onClick={() => setCurrentImgIndex(index)}
//                 className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden ${
//                   index === currentImgIndex ? 'border-2 border-teal-500' : 'border border-gray-300'
//                 }`}
//               >
//                 <img
//                   src={img.url}
//                   alt={`Thumbnail ${index + 1}`}
//                   className="w-full h-full object-cover"
//                 />
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
      
//       <button
//         onClick={onNext}
//         disabled={currentImgIndex === images.length - 1}
//         className="absolute right-4 text-white text-3xl z-50 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
//       >
//         ›
//       </button>
      
//       <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">
//         Image {currentImgIndex + 1} of {images.length}
//       </div>
//     </div>
//   );
// };

// // --------- MAIN COMPONENT ----------
// const ImageGallerySection = ({ villa }) => {
//   if (!villa)
//     return (
//       <section className="container mx-auto px-4 py-16 text-center">
//         <div className="text-xl font-semibold text-teal-600">Loading…</div>
//       </section>
//     );

//   console.log("🔎 Single Villa Data (Image Gallery Component):", villa);

//   // -------- Extract Data Safely ----------
//   const media_images =
//     villa.media_images?.map((img) => ({
//       id: img.id,
//       url: img.image || img.file_url || LOCAL_FALLBACK,
//     })) || [];

//   const bedrooms_images =
//     villa.bedrooms_images?.map((img) => ({
//       id: img.id,
//       url: img.image || img.file_url || LOCAL_FALLBACK,
//       name: img.name || "",
//       description: img.description || "",
//     })) || [];

//   const signature_distinctions = Array.isArray(villa.signature_distinctions)
//     ? villa.signature_distinctions
//     : [];

//   const interior_amenities = Array.isArray(villa.interior_amenities)
//     ? villa.interior_amenities
//     : [];

//   const outdoor_amenities = Array.isArray(villa.outdoor_amenities)
//     ? villa.outdoor_amenities
//     : [];

//   const rules_and_etiquette = Array.isArray(villa.rules_and_etiquette)
//     ? villa.rules_and_etiquette
//     : [];

//   // Accept both nested check_in_out_time or root-level check_in / check_out
//   const check_in_out_time = villa.check_in_out_time || {
//     check_in: villa.check_in || "",
//     check_out: villa.check_out || "",
//     description: villa.check_in_out_time?.description || "",
//   };

//   const staffArray = Array.isArray(villa.staff)
//     ? villa.staff
//     : villa.staff?.name
//     ? [{ name: villa.staff.name, details: villa.staff.details || "" }]
//     : [];

//   // Concierge Services (dynamic only)
//   const concierge_service = Array.isArray(villa.concierge_services)
//     ? villa.concierge_services
//     : Array.isArray(villa.concierge_service)
//     ? villa.concierge_service
//     : [];

//   const security_deposit = villa.security_deposit || "";

//   const description = villa.description || "";
//   const description_image_url =
//     villa.description_image_url || LOCAL_FALLBACK;

//   const booking_rate_start = villa.booking_rate_start || [];

//   // flat booking_rate array for RatesBookingInformation
//   const booking_rate = Array.isArray(villa.booking_rate)
//     ? villa.booking_rate
//     : [];

//   // ✅ videos from API: villa.videos: [{ id, video }]
//   const videos = Array.isArray(villa.videos)
//     ? villa.videos.map((v) => ({
//         id: v.id,
//         url: v.video || v.file_url || v.url || "",
//       }))
//     : [];

//   const location = {
//     lat:
//       typeof villa.latitude === "number"
//         ? villa.latitude
//         : villa.location_coords?.lat ?? null,
//     lng:
//       typeof villa.longitude === "number"
//         ? villa.longitude
//         : villa.location_coords?.lng ?? null,
//     address: villa.address || villa.city || "",
//   };

//   const villaName = villa.title || villa.name || "";
//   const listingType = String(villa.listing_type ?? "").toLowerCase();
//   const isRentType =
//     listingType === "rent" ||
//     listingType === "rental" ||
//     listingType === "rentals" ||
//     listingType === "let";

//   console.log("→ Location values:", {
//     lat: location.lat,
//     lng: location.lng,
//     address: location.address,
//     villaName,
//   });

//   const [showAll, setShowAll] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(null);

//   // Image Modal functions
//   const openImageModal = (index) => {
//     setSelectedImageIndex(index);
//     document.body.style.overflow = 'hidden';
//   };

//   const closeImageModal = () => {
//     setSelectedImageIndex(null);
//     document.body.style.overflow = 'auto';
//   };

//   const goToNextImage = () => {
//     if (selectedImageIndex < media_images.length - 1) {
//       setSelectedImageIndex(prev => prev + 1);
//     }
//   };

//   const goToPrevImage = () => {
//     if (selectedImageIndex > 0) {
//       setSelectedImageIndex(prev => prev - 1);
//     }
//   };

//   // Function to transform API booking_rate data to table format
//   const transformBookingRateData = () => {
//     if (!booking_rate || booking_rate.length === 0) {
//       return [];
//     }
    
//     // Check if the data is in the format you provided (flat array)
//     const sampleItem = booking_rate[0];
    
//     if (typeof sampleItem === 'string' || sampleItem === null) {
//       // Data is in flat array format: ["Jan 10 - Jan 20", "11 Nights", "80000", ...]
//       // Transform it into object format
//       const transformed = [];
//       for (let i = 0; i < booking_rate.length; i += 3) {
//         if (i + 2 < booking_rate.length) {
//           transformed.push({
//             rental_period: booking_rate[i] || "N/A",
//             minimum_stay: booking_rate[i + 1] || "N/A",
//             rate_per_night: booking_rate[i + 2] || "N/A"
//           });
//         }
//       }
//       return transformed;
//     } else if (typeof sampleItem === 'object') {
//       // Data is already in object format
//       return booking_rate.map(item => ({
//         rental_period: item.rental_period || item.period || "N/A",
//         minimum_stay: item.minimum_stay || item.stay || "N/A",
//         rate_per_night: item.rate_per_night || item.rate || item.price || "N/A"
//       }));
//     }
    
//     return [];
//   };

//   // Get transformed booking rate data
//   const transformedBookingRate = transformBookingRateData();
  
//   console.log("Transformed booking rate data:", transformedBookingRate);

//   // -------- ENHANCED PDF DOWNLOAD --------
//   const handleDownloadPDF = async () => {
//     const villaId = villa.id;
//     const token =
//       typeof window !== "undefined"
//         ? localStorage.getItem("auth_access")
//         : null;
//     const downloadEndpoint = `${API_BASE}/villas/properties/${villaId}/downloaded/`;

//     const tryRequest = async (method) => {
//       const headers = { "Content-Type": "application/json" };
//       if (token) headers.Authorization = `Bearer ${token}`;
//       const options = {
//         method,
//         headers,
//       };
//       const res = await fetch(downloadEndpoint, options);
//       return res;
//     };

//     try {
//       // Record download in API
//       let res;
//       try {
//         res = await tryRequest("POST");
//         if (res.status === 405) {
//           console.warn(
//             "Download POST returned 405; falling back to GET as backend expects GET."
//           );
//           res = await tryRequest("GET");
//         }
//       } catch (e) {
//         console.warn("POST failed, attempting GET as fallback:", e);
//         try {
//           res = await tryRequest("GET");
//         } catch (e2) {
//           throw e2;
//         }
//       }

//       if (!res || !res.ok) {
//         const text = await (res
//           ? res.text().catch(() => null)
//           : Promise.resolve(null));
//         console.error(
//           "Download recording failed:",
//           res ? res.status : "no-response",
//           text
//         );
//         Swal.fire({
//           icon: "error",
//           title: "Download record failed",
//           text:
//             (text && String(text).slice(0, 500)) ||
//             `Server responded with status ${
//               res ? res.status : "unknown"
//             }. Aborting download.`,
//         });
//         return;
//       }

//       console.log("Download recorded successfully for property:", villaId);

//       // Create PDF with all data in serial format
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();
//       const margin = 15;
//       let yPos = margin;

//       // Function to add text with page break check
//       const addText = (text, fontSize = 12, isBold = false, align = "left", color = null) => {
//         if (yPos > pageHeight - margin) {
//           pdf.addPage();
//           yPos = margin;
//         }
        
//         pdf.setFontSize(fontSize);
//         if (isBold) pdf.setFont(undefined, 'bold');
//         else pdf.setFont(undefined, 'normal');
        
//         if (color) pdf.setTextColor(color[0], color[1], color[2]);
//         else pdf.setTextColor(0, 0, 0);
        
//         const textX = align === "center" ? pageWidth / 2 : margin;
//         pdf.text(text, textX, yPos, { align });
//         yPos += fontSize / 3 + 2;
//       };

//       // Add main title
//       addText(villaName, 22, true, "center", [0, 105, 92]);
//       yPos += 10;

//       // Add 6 media images in 3x2 grid
//       if (media_images.length > 0) {
//         addText("Property Images", 16, true, "center", [0, 105, 92]);
//         yPos += 8;
        
//         // Take maximum 6 images
//         const imagesToUse = media_images.slice(0, 6);
//         const cols = 3;
//         const rows = Math.ceil(imagesToUse.length / cols);
        
//         const imgWidth = (pageWidth - margin * 2 - (cols - 1) * 5) / cols;
//         const imgHeight = imgWidth * 0.75; // 4:3 aspect ratio
        
//         // Check if we have enough space for images
//         if (yPos + (rows * (imgHeight + 5)) > pageHeight - margin) {
//           pdf.addPage();
//           yPos = margin;
//         }
        
//         for (let i = 0; i < imagesToUse.length; i++) {
//           const row = Math.floor(i / cols);
//           const col = i % cols;
          
//           const x = margin + col * (imgWidth + 5);
//           const y = yPos + row * (imgHeight + 5);
          
//           try {
//             const imgEl = await loadImageWithFallback(imagesToUse[i].url);
//             if (imgEl) {
//               const canvas = document.createElement("canvas");
//               drawImageCoverToCanvas(imgEl, canvas, 300, 225); // 300x225 pixels
//               const imgData = canvas.toDataURL("image/jpeg", 0.85);
//               pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
//             }
//           } catch (err) {
//             console.warn("Failed to load image for PDF:", err);
//           }
//         }
        
//         // Update yPos after images
//         yPos += rows * (imgHeight + 5);
//         yPos += 15;
//       }

//       // Add Signature Distinctions - BLACK COLOR
//       if (signature_distinctions.length > 0) {
//         addText("Signature Distinctions", 18, true, "left", [0, 0, 0]); // BLACK COLOR
//         yPos += 8;
//         signature_distinctions.forEach((item, i) => {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.text(`• ${item}`, margin, yPos);
//           yPos += 6;
//         });
//         yPos += 10;
//       }

//       // Add Finer Details - Interior Amenities
//       if (interior_amenities.length > 0) {
//         addText("Finer Details - Interior Amenities", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
//         interior_amenities.forEach((item, i) => {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.text(`• ${item}`, margin, yPos);
//           yPos += 6;
//         });
//         yPos += 10;
//       }

//       // Add Finer Details - Outdoor Amenities
//       if (outdoor_amenities.length > 0) {
//         addText("Finer Details - Outdoor Amenities", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
//         outdoor_amenities.forEach((item, i) => {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.text(`• ${item}`, margin, yPos);
//           yPos += 6;
//         });
//         yPos += 10;
//       }

//       // Add Rules & Etiquette (only for rent type)
//       if (isRentType && rules_and_etiquette.length > 0) {
//         addText("Rules & Etiquette", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
//         rules_and_etiquette.forEach((item, i) => {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.text(`• ${item}`, margin, yPos);
//           yPos += 6;
//         });
//         yPos += 10;
//       }

//       // Add Check-in/out
//       if (isRentType && (check_in_out_time.check_in || check_in_out_time.check_out)) {
//         addText("Check-in/out", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
        
//         if (check_in_out_time.check_in) {
//           pdf.setFontSize(11);
//           pdf.text(`Check-In: ${check_in_out_time.check_in}`, margin, yPos);
//           yPos += 6;
//         }
        
//         if (check_in_out_time.check_out) {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.text(`Check-Out: ${check_in_out_time.check_out}`, margin, yPos);
//           yPos += 6;
//         }
        
//         if (check_in_out_time.description) {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(10);
//           const descLines = pdf.splitTextToSize(check_in_out_time.description, pageWidth - margin * 2);
//           descLines.forEach(line => {
//             if (yPos > pageHeight - margin) {
//               pdf.addPage();
//               yPos = margin;
//             }
//             pdf.text(line, margin, yPos);
//             yPos += 5;
//           });
//         }
//         yPos += 10;
//       }

//       // Add Staff
//       if (isRentType && staffArray.length > 0) {
//         addText("Staff", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
        
//         staffArray.forEach((staff, i) => {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.setFont(undefined, 'bold');
//           pdf.text(staff.name, margin, yPos);
//           yPos += 5;
          
//           if (staff.details) {
//             pdf.setFont(undefined, 'normal');
//             const detailsLines = pdf.splitTextToSize(staff.details, pageWidth - margin * 2 - 10);
//             detailsLines.forEach(line => {
//               if (yPos > pageHeight - margin) {
//                 pdf.addPage();
//                 yPos = margin;
//               }
//               pdf.text(line, margin + 5, yPos);
//               yPos += 5;
//             });
//           }
//           yPos += 5;
//         });
//         yPos += 5;
//       }

//       // Add Concierge Service
//       if (isRentType && concierge_service.length > 0) {
//         addText("Concierge Service", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
//         concierge_service.forEach((item, i) => {
//           if (yPos > pageHeight - margin) {
//             pdf.addPage();
//             yPos = margin;
//           }
//           pdf.setFontSize(11);
//           pdf.text(`• ${item}`, margin, yPos);
//           yPos += 6;
//         });
//         yPos += 10;
//       }

//       // Add Security Deposit
//       if (isRentType && security_deposit) {
//         addText("Security Deposit", 16, true, "left", [0, 0, 0]);
//         yPos += 8;
//         pdf.setFontSize(12);
//         pdf.text(`US$ ${security_deposit}`, margin, yPos);
//         yPos += 12;
//       }

//       // Add Rental Rates Table with "Rates & Booking Information" heading
//       // Use transformedBookingRate instead of booking_rate
//       if (isRentType && transformedBookingRate.length > 0) {
//         addText("Rates & Booking Information", 18, true, "center", [0, 105, 92]);
//         yPos += 12;
        
//         // Check if we need new page for table
//         if (yPos > pageHeight - margin - 50) {
//           pdf.addPage();
//           yPos = margin;
//           addText("Rates & Booking Information", 18, true, "center", [0, 105, 92]);
//           yPos += 12;
//         }
        
//         // Prepare table data from transformedBookingRate
//         const tableData = transformedBookingRate.map(rate => {
//           // Format rate_per_night properly
//           let formattedRate = "N/A";
//           if (rate.rate_per_night && rate.rate_per_night !== "N/A") {
//             // Convert to number if possible
//             const rateNum = parseFloat(rate.rate_per_night);
//             if (!isNaN(rateNum)) {
//               formattedRate = `$${rateNum.toLocaleString('en-US', {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2
//               })}`;
//             } else {
//               formattedRate = rate.rate_per_night;
//             }
//           }
          
//           return [
//             rate.rental_period || "N/A",
//             rate.minimum_stay || "N/A",
//             formattedRate
//           ];
//         });
        
//         console.log("PDF Table Data:", tableData);
        
//         // Add table with proper headers as shown in screenshot
//         const headers = [["", "Minimum Stay", "Rate Per Night"]];
//         const startX = margin;
//         const columnWidths = [70, 40, 50];
//         const rowHeight = 8;
//         const headerHeight = 8;
        
//         // Draw table border
//         const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
//         const tableHeight = (tableData.length + 1) * rowHeight;
        
//         // Draw header background
//         pdf.setFillColor(0, 105, 92); // Teal background
//         pdf.rect(startX, yPos, tableWidth, headerHeight, 'F');
        
//         // Draw header text
//         pdf.setFontSize(10);
//         pdf.setFont(undefined, 'bold');
//         pdf.setTextColor(255, 255, 255);
        
//         let currentX = startX;
//         headers[0].forEach((header, i) => {
//           // For first column (Rental Period), we'll leave it empty in header as per screenshot
//           if (i === 0) {
//             pdf.text("Rental Period", currentX + 5, yPos + 5);
//           } else {
//             pdf.text(header, currentX + 5, yPos + 5);
//           }
//           currentX += columnWidths[i];
//         });
        
//         yPos += headerHeight;
        
//         // Draw table rows
//         pdf.setTextColor(0, 0, 0);
//         pdf.setFont(undefined, 'normal');
        
//         tableData.forEach((row, rowIndex) => {
//           if (yPos > pageHeight - margin - rowHeight) {
//             pdf.addPage();
//             yPos = margin;
//             // Redraw header on new page
//             pdf.setFillColor(0, 105, 92);
//             pdf.rect(startX, yPos, tableWidth, headerHeight, 'F');
//             pdf.setFontSize(10);
//             pdf.setFont(undefined, 'bold');
//             pdf.setTextColor(255, 255, 255);
//             currentX = startX;
//             headers[0].forEach((header, i) => {
//               if (i === 0) {
//                 pdf.text("Rental Period", currentX + 5, yPos + 5);
//               } else {
//                 pdf.text(header, currentX + 5, yPos + 5);
//               }
//               currentX += columnWidths[i];
//             });
//             yPos += headerHeight;
//             pdf.setTextColor(0, 0, 0);
//             pdf.setFont(undefined, 'normal');
//           }
          
//           currentX = startX;
          
//           // Draw row background (alternating colors)
//           if (rowIndex % 2 === 0) {
//             pdf.setFillColor(245, 245, 245);
//           } else {
//             pdf.setFillColor(255, 255, 255);
//           }
//           pdf.rect(startX, yPos, tableWidth, rowHeight, 'F');
          
//           // Draw cell borders
//           pdf.setDrawColor(200, 200, 200);
//           let borderX = startX;
//           for (let i = 0; i < columnWidths.length; i++) {
//             if (i < columnWidths.length - 1) {
//               pdf.line(borderX + columnWidths[i], yPos, borderX + columnWidths[i], yPos + rowHeight);
//             }
//             borderX += columnWidths[i];
//           }
          
//           // Draw cell content
//           row.forEach((cell, cellIndex) => {
//             pdf.setFontSize(9);
//             pdf.text(cell, currentX + 5, yPos + 5);
//             currentX += columnWidths[cellIndex];
//           });
          
//           yPos += rowHeight;
//         });
        
//         // Draw bottom border
//         pdf.setDrawColor(200, 200, 200);
//         pdf.line(startX, yPos, startX + tableWidth, yPos);
        
//         yPos += 15;
//       } else if (isRentType) {
//         // Show message if no rates available
//         addText("Rates & Booking Information", 18, true, "center", [0, 105, 92]);
//         yPos += 12;
//         addText("No rate information available", 12, false, "center");
//         yPos += 15;
//       }

//       // Add footer on all pages
//       const totalPages = pdf.internal.getNumberOfPages();
//       for (let i = 1; i <= totalPages; i++) {
//         pdf.setPage(i);
//         pdf.setFontSize(8);
//         pdf.setTextColor(150);
//         pdf.text(
//           `Page ${i} of ${totalPages} • Generated on ${new Date().toLocaleDateString()}`,
//           pageWidth / 2,
//           pageHeight - 10,
//           { align: "center" }
//         );
//       }

//       // Save PDF
//       pdf.save(
//         `${(villaName || "EV_Brochure")
//           .replace(/\s+/g, "_")
//           .trim()}_Brochure.pdf`
//       );
      
//       Swal.fire({
//         icon: "success",
//         title: "Brochure Downloaded",
//         text: "Property brochure has been generated successfully!",
//         timer: 2000
//       });

//     } catch (err) {
//       console.error("PDF/download flow error:", err);
//       Swal.fire({
//         icon: "error",
//         title: "Export failed",
//         text: "Could not record download or generate brochure. See console for details.",
//       });
//     }
//   };

//   const villaId = villa.id;

//   // -------- UI Rendering --------
//   return (
//     <section className="container mx-auto mb-[920px] px-4 py-16 relative">
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//         {/* LEFT */}
//         <div className="lg:col-span-7">
//           <h2 className="text-3xl text-center font-bold text-gray-900 mb-8">
//             Image Gallery - {media_images.length} photos
//           </h2>

//           <div className="grid grid-cols-3 gap-4">
//             {(showAll ? media_images : media_images.slice(0, 6)).map(
//               (img, index) => (
//                 <div
//                   key={img.id}
//                   className="aspect-4/3 bg-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-105"
//                   onClick={() => openImageModal(index)}
//                 >
//                   <img
//                     src={img.url}
//                     alt={`Gallery image ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               )
//             )}
//           </div>

//           <div className="mt-8 text-center">
//             {!showAll ? (
//               <button
//                 onClick={() => setShowAll(true)}
//                 className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
//               >
//                 View All Photos
//               </button>
//             ) : (
//               <button
//                 onClick={() => setShowAll(false)}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
//               >
//                 Show Less
//               </button>
//             )}

//             <VideoExperience videos={videos} villa={villa} />

//             <Description
//               descriptionData={description}
//               descriptionImage={
//                 media_images?.[1]?.url ||
//                 description_image_url ||
//                 LOCAL_FALLBACK
//               }
//             />
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="lg:col-span-5 border-l lg:pl-12 pl-0">
//           <h3 className="text-2xl font-bold mb-4">
//             Signature Distinctions
//           </h3>
//           <ul>
//             {signature_distinctions.map((item, i) => (
//               <AmenityItem key={i} name={item} />
//             ))}
//           </ul>

//           <h3 className="text-2xl font-bold mt-10 mb-4">
//             Finer Details
//           </h3>

//           <h4 className="font-semibold text-lg mb-2">
//             Interior Amenities
//           </h4>
//           <ul className="grid grid-cols-2 gap-x-6">
//             {interior_amenities.map((item, i) => (
//               <AmenityItem key={i} name={item} />
//             ))}
//           </ul>

//           <h4 className="font-semibold text-lg mt-6 mb-2">
//             Outdoor Amenities
//           </h4>
//           <ul>
//             {outdoor_amenities.map((item, i) => (
//               <AmenityItem key={i} name={item} />
//             ))}
//           </ul>

//           {/* Rules & Check-in/out & Staff: render only for rent-type */}
//           {isRentType && (
//             <>
//               <h3 className="text-2xl font-bold mt-10 mb-4">
//                 Rules & Etiquette
//               </h3>
//               <ul>
//                 {rules_and_etiquette.map((item, i) => (
//                   <AmenityItem key={i} name={item} />
//                 ))}
//               </ul>

//               <h3 className="text-2xl font-bold mt-10 mb-4">
//                 Check-in/out
//               </h3>
//               {check_in_out_time.check_in ? (
//                 <p>Check-In: {check_in_out_time.check_in}</p>
//               ) : (
//                 <p>Check-In: —</p>
//               )}
//               {check_in_out_time.check_out ? (
//                 <p>Check-Out: {check_in_out_time.check_out}</p>
//               ) : (
//                 <p>Check-Out: —</p>
//               )}
//               {check_in_out_time.description ? (
//                 <p>{check_in_out_time.description}</p>
//               ) : null}

//               <h3 className="text-2xl font-bold mt-10 mb-4">
//                 Staff
//               </h3>
//               <ul>
//                 {staffArray.map((s, i) => (
//                   <StaffItem key={i} name={s.name} details={s.details} />
//                 ))}
//               </ul>
//             </>
//           )}

//           {/* Bedrooms slider ALWAYS shown */}
//           <div className="mt-8">
//             <BedRoomsSliders bedrooms_images={bedrooms_images} />
//           </div>

//           {isRentType && (
//             <>
//               <h3 className="text-2xl font-bold mt-10 mb-4">
//                 Concierge Service
//               </h3>

//               {/* dynamic concierge items only */}
//               <ul>
//                 {concierge_service.map((item, i) => (
//                   <AmenityItem key={i} name={item} />
//                 ))}
//               </ul>
//             </>
//           )}

//           {/* 🔐 Security Deposit: ONLY for RENT properties now */}
//           {isRentType && (
//             <>
//               <h3 className="text-3xl font-bold mt-10 mb-4">
//                 Security Deposit
//               </h3>

//               <p className="text-2xl font-semibold">
//                 US$ {security_deposit || "US$ 10,000.00"}
//               </p>
//             </>
//           )}

//           <button
//             onClick={handleDownloadPDF}
//             className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-lg text-lg mt-8"
//           >
//             Download EV Brochure
//           </button>
//         </div>
//       </div>

//       {/* Rates & Calendar: only show for rent-type */}
//       {isRentType && (
//         <>
//           <RatesBookingInformation booking_rate={booking_rate} />
//           <div className="">
//             <Calendar villaId={villaId} />
//           </div>
//         </>
//       )}

//       <div className="mt-15 mb-20">
//         <Locations
//           lat={location.lat}
//           lng={location.lng}
//           text={location.address}
//           locationObj={location}
//           villaName={villaName}
//         />
//       </div>

//       <AddReviewForm propertyId={villaId} />

//       {/* Image Modal */}
//       {selectedImageIndex !== null && (
//         <ImageModal
//           images={media_images}
//           currentIndex={selectedImageIndex}
//           onClose={closeImageModal}
//           onNext={goToNextImage}
//           onPrev={goToPrevImage}
//         />
//       )}
//     </section>
//   );
// };

// export default ImageGallerySection;














// ImageGallerySections.tsx
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

import VideoExperience from "./VideoExperience";
import Description from "./Descriptions";
import Locations from "./Locations";
import Calendar from "./Calendar";
import AddReviewForm from "./AddReviewForm";
import BedRoomsSliders from "./BedRoomsSliders";
import RatesBookingInformation from "./RatesBookingInformation";
import Swal from "sweetalert2";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://api.eastmondvillas.com/api";
const LOCAL_FALLBACK = "/mnt/data/28e6a12e-2530-41c9-bdcc-03c9610049e3.png";

// --------- Sub-item Components ----------
const AmenityItem = ({ name }) => (
  <li className="flex items-start text-gray-700 text-sm mb-2">
    <img
      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
      alt="icon"
      className="w-4 h-4 mr-2 mt-0.5"
    />
    {name}
  </li>
);

const StaffItem = ({ name, details }) => (
  <li className="flex items-start mb-4">
    <img
      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
      alt="icon"
      className="w-4 h-4 mr-2 mt-0.5"
    />
    <div className="flex flex-col text-gray-700 text-sm">
      <span className="font-semibold text-gray-800">{name}</span>
      <span className="text-xs text-gray-600">{details}</span>
    </div>
  </li>
);




// Simple helper to load images with crossOrigin and fallback
const loadImageWithFallback = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // try fallback
      const f = new Image();
      f.crossOrigin = "Anonymous";
      f.onload = () => resolve(f);
      f.onerror = () => resolve(null);
      f.src = LOCAL_FALLBACK;
    };
    img.src = src || LOCAL_FALLBACK;
  });

// center-crop draw: draw image onto canvas sized cw x ch, cropping to cover
const drawImageCoverToCanvas = (imgEl, canvas, targetW, targetH) => {
  const ctx = canvas.getContext("2d");
  const iw = imgEl.naturalWidth || imgEl.width;
  const ih = imgEl.naturalHeight || imgEl.height;

  const scale = Math.max(targetW / iw, targetH / ih);
  const sw = targetW / scale;
  const sh = targetH / scale;

  const sx = Math.max(0, Math.floor((iw - sw) / 2));
  const sy = Math.max(0, Math.floor((ih - sh) / 2));

  canvas.width = targetW;
  canvas.height = targetH;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, targetW, targetH);
};

// Image Modal Component
const ImageModal = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    setCurrentImgIndex(currentIndex);
  }, [currentIndex]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-9999"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl z-50 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center"
      >
        ×
      </button>
      
      <button
        onClick={onPrev}
        disabled={currentImgIndex === 0}
        className="absolute left-4 text-white text-3xl z-50 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
      >
        ‹
      </button>
      
      <div className="relative max-w-4xl max-h-[80vh]">
        <img
          src={images[currentImgIndex]?.url}
          alt={`Gallery image ${currentImgIndex + 1}`}
          className="w-full h-full object-contain rounded-lg"
        />
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="flex space-x-2 overflow-x-auto max-w-full px-4">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentImgIndex(index)}
                className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden ${
                  index === currentImgIndex ? 'border-2 border-teal-500' : 'border border-gray-300'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={onNext}
        disabled={currentImgIndex === images.length - 1}
        className="absolute right-4 text-white text-3xl z-50 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
      >
        ›
      </button>
      
      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">
        Image {currentImgIndex + 1} of {images.length}
      </div>
    </div>
  );
};

// --------- MAIN COMPONENT ----------
const ImageGallerySection = ({ villa }) => {
  if (!villa)
    return (



     <div className="py-10 flex justify-center">
  <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-md p-6 overflow-hidden">
    {/* Shimmer wave */}
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT IMAGE */}
      <div className="h-[320px] w-full bg-gray-200 rounded-xl"></div>

      {/* RIGHT CONTENT */}
      <div className="flex flex-col justify-between">
        <div>
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>

          {/* Location */}
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>

          {/* Price */}
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>

          {/* Stats */}
          <div className="flex gap-6 mb-8">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Button */}
        <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
      </div>
    </div>
  </div>
</div>



      
    );

  console.log("🔎 Single Villa Data (Image Gallery Component):", villa);

  // -------- Extract Data Safely ----------
  const media_images =
    villa.media_images?.map((img) => ({
      id: img.id,
      url: img.image || img.file_url || LOCAL_FALLBACK,
    })) || [];

  const bedrooms_images =
    villa.bedrooms_images?.map((img) => ({
      id: img.id,
      url: img.image || img.file_url || LOCAL_FALLBACK,
      name: img.name || "",
      description: img.description || "",
    })) || [];

  const signature_distinctions = Array.isArray(villa.signature_distinctions)
    ? villa.signature_distinctions
    : [];

  const interior_amenities = Array.isArray(villa.interior_amenities)
    ? villa.interior_amenities
    : [];

  const outdoor_amenities = Array.isArray(villa.outdoor_amenities)
    ? villa.outdoor_amenities
    : [];

  const rules_and_etiquette = Array.isArray(villa.rules_and_etiquette)
    ? villa.rules_and_etiquette
    : [];

  // Accept both nested check_in_out_time or root-level check_in / check_out
  const check_in_out_time = villa.check_in_out_time || {
    check_in: villa.check_in || "",
    check_out: villa.check_out || "",
    description: villa.check_in_out_time?.description || "",
  };

  const staffArray = Array.isArray(villa.staff)
    ? villa.staff
    : villa.staff?.name
    ? [{ name: villa.staff.name, details: villa.staff.details || "" }]
    : [];

  // Concierge Services (dynamic only)
  const concierge_service = Array.isArray(villa.concierge_services)
    ? villa.concierge_services
    : Array.isArray(villa.concierge_service)
    ? villa.concierge_service
    : [];

  const security_deposit = villa.security_deposit || "";

  const description = villa.description || "";
  const description_image_url =
    villa.description_image_url || LOCAL_FALLBACK;

  const booking_rate_start = villa.booking_rate_start || [];

  // flat booking_rate array for RatesBookingInformation
  const booking_rate = Array.isArray(villa.booking_rate)
    ? villa.booking_rate
    : [];

  // ✅ videos from API: villa.videos: [{ id, video }]
  const videos = Array.isArray(villa.videos)
    ? villa.videos.map((v) => ({
        id: v.id,
        url: v.video || v.file_url || v.url || "",
      }))
    : [];

  const location = {
    lat:
      typeof villa.latitude === "number"
        ? villa.latitude
        : villa.location_coords?.lat ?? null,
    lng:
      typeof villa.longitude === "number"
        ? villa.longitude
        : villa.location_coords?.lng ?? null,
    address: villa.address || villa.city || "",
  };

  const villaName = villa.title || villa.name || "";
  const listingType = String(villa.listing_type ?? "").toLowerCase();
  const isRentType =
    listingType === "rent" ||
    listingType === "rental" ||
    listingType === "rentals" ||
    listingType === "let";

  console.log("→ Location values:", {
    lat: location.lat,
    lng: location.lng,
    address: location.address,
    villaName,
  });

  const [showAll, setShowAll] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Image Modal functions
  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const goToNextImage = () => {
    if (selectedImageIndex < media_images.length - 1) {
      setSelectedImageIndex(prev => prev + 1);
    }
  };

  const goToPrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
    }
  };

  // Function to transform API booking_rate data to table format
  const transformBookingRateData = () => {
    if (!booking_rate || booking_rate.length === 0) {
      return [];
    }
    
    // Check if the data is in the format you provided (flat array)
    const sampleItem = booking_rate[0];
    
    if (typeof sampleItem === 'string' || sampleItem === null) {
      // Data is in flat array format: ["Jan 10 - Jan 20", "11 Nights", "80000", ...]
      // Transform it into object format
      const transformed = [];
      for (let i = 0; i < booking_rate.length; i += 3) {
        if (i + 2 < booking_rate.length) {
          transformed.push({
            rental_period: booking_rate[i] || "N/A",
            minimum_stay: booking_rate[i + 1] || "N/A",
            rate_per_night: booking_rate[i + 2] || "N/A"
          });
        }
      }
      return transformed;
    } else if (typeof sampleItem === 'object') {
      // Data is already in object format
      return booking_rate.map(item => ({
        rental_period: item.rental_period || item.period || "N/A",
        minimum_stay: item.minimum_stay || item.stay || "N/A",
        rate_per_night: item.rate_per_night || item.rate || item.price || "N/A"
      }));
    }
    
    return [];
  };

  // Get transformed booking rate data
  const transformedBookingRate = transformBookingRateData();
  
  console.log("Transformed booking rate data:", transformedBookingRate);

  // -------- ENHANCED PDF DOWNLOAD --------
  const handleDownloadPDF = async () => {
    const villaId = villa.id;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_access")
        : null;
    const downloadEndpoint = `${API_BASE}/villas/properties/${villaId}/downloaded/`;

    const tryRequest = async (method) => {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const options = {
        method,
        headers,
      };
      const res = await fetch(downloadEndpoint, options);
      return res;
    };

    try {
      // Record download in API
      let res;
      try {
        res = await tryRequest("POST");
        if (res.status === 405) {
          console.warn(
            "Download POST returned 405; falling back to GET as backend expects GET."
          );
          res = await tryRequest("GET");
        }
      } catch (e) {
        console.warn("POST failed, attempting GET as fallback:", e);
        try {
          res = await tryRequest("GET");
        } catch (e2) {
          throw e2;
        }
      }

      if (!res || !res.ok) {
        const text = await (res
          ? res.text().catch(() => null)
          : Promise.resolve(null));
        console.error(
          "Download recording failed:",
          res ? res.status : "no-response",
          text
        );
        Swal.fire({
          icon: "error",
          title: "Download record failed",
          text:
            (text && String(text).slice(0, 500)) ||
            `Server responded with status ${
              res ? res.status : "unknown"
            }. Aborting download.`,
        });
        return;
      }

      

      console.log("Download recorded successfully for property:", villaId);

      // Create PDF with all data in serial format
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Function to add text with page break check
      const addText = (text, fontSize = 12, isBold = false, align = "left", color = null) => {
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont(undefined, 'bold');
        else pdf.setFont(undefined, 'normal');
        
        if (color) pdf.setTextColor(color[0], color[1], color[2]);
        else pdf.setTextColor(0, 0, 0);
        
        const textX = align === "center" ? pageWidth / 2 : margin;
        pdf.text(text, textX, yPos, { align });
        yPos += fontSize / 3 + 2;
      };

      // Add main title
      addText(villaName, 22, true, "center", [0, 105, 92]);
      yPos += 10;

      // Add 6 media images in 3x2 grid
      if (media_images.length > 0) {
        addText("Property Images", 16, true, "center", [0, 105, 92]);
        yPos += 8;
        
        // Take maximum 6 images
        const imagesToUse = media_images.slice(0, 6);
        const cols = 3;
        const rows = Math.ceil(imagesToUse.length / cols);
        
        const imgWidth = (pageWidth - margin * 2 - (cols - 1) * 5) / cols;
        const imgHeight = imgWidth * 0.75; // 4:3 aspect ratio
        
        // Check if we have enough space for images
        if (yPos + (rows * (imgHeight + 5)) > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        
        for (let i = 0; i < imagesToUse.length; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          
          const x = margin + col * (imgWidth + 5);
          const y = yPos + row * (imgHeight + 5);
          
          try {
            const imgEl = await loadImageWithFallback(imagesToUse[i].url);
            if (imgEl) {
              const canvas = document.createElement("canvas");
              drawImageCoverToCanvas(imgEl, canvas, 300, 225); // 300x225 pixels
              const imgData = canvas.toDataURL("image/jpeg", 0.85);
              pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
            }
          } catch (err) {
            console.warn("Failed to load image for PDF:", err);
          }
        }
        
        // Update yPos after images
        yPos += rows * (imgHeight + 5);
        yPos += 15;
      }

      // Add Description Section (image and text)
      if (description || description_image_url) {
        addText("About This Property", 18, true, "center", [0, 105, 92]);
        yPos += 12;
        
        // Add description image if available
        if (description_image_url && description_image_url !== LOCAL_FALLBACK) {
          if (yPos > pageHeight - margin - 100) {
            pdf.addPage();
            yPos = margin;
          }
          
          try {
            const imgEl = await loadImageWithFallback(description_image_url);
            if (imgEl) {
              const canvas = document.createElement("canvas");
              drawImageCoverToCanvas(imgEl, canvas, 400, 250);
              const imgData = canvas.toDataURL("image/jpeg", 0.85);
              
              // Calculate image dimensions
              const imgWidth = pageWidth - margin * 2;
              const imgHeight = imgWidth * 0.6;
              
              pdf.addImage(imgData, "JPEG", margin, yPos, imgWidth, imgHeight);
              yPos += imgHeight + 10;
            }
          } catch (err) {
            console.warn("Failed to load description image for PDF:", err);
          }
        }
        
        // Add description text
        if (description) {
          if (yPos > pageHeight - margin - 30) {
            pdf.addPage();
            yPos = margin;
          }
          
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          const maxLineWidth = pageWidth - margin * 2;
          const lines = pdf.splitTextToSize(description, maxLineWidth);
          
          lines.forEach(line => {
            if (yPos > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }
            pdf.text(line, margin, yPos);
            yPos += 6;
          });
          yPos += 10;
        }
      }

      // Add Signature Distinctions - BLACK COLOR
      if (signature_distinctions.length > 0) {
        addText("Signature Distinctions", 18, true, "left", [0, 0, 0]); // BLACK COLOR
        yPos += 8;
        signature_distinctions.forEach((item, i) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.text(`• ${item}`, margin, yPos);
          yPos += 6;
        });
        yPos += 10;
      }

      // Add Finer Details - Interior Amenities
      if (interior_amenities.length > 0) {
        addText("Finer Details - Interior Amenities", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        interior_amenities.forEach((item, i) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.text(`• ${item}`, margin, yPos);
          yPos += 6;
        });
        yPos += 10;
      }

      // Add Finer Details - Outdoor Amenities
      if (outdoor_amenities.length > 0) {
        addText("Finer Details - Outdoor Amenities", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        outdoor_amenities.forEach((item, i) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.text(`• ${item}`, margin, yPos);
          yPos += 6;
        });
        yPos += 10;
      }

      // Add Rules & Etiquette (only for rent type)
      if (isRentType && rules_and_etiquette.length > 0) {
        addText("Rules & Etiquette", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        rules_and_etiquette.forEach((item, i) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.text(`• ${item}`, margin, yPos);
          yPos += 6;
        });
        yPos += 10;
      }

      // Add Check-in/out
      if (isRentType && (check_in_out_time.check_in || check_in_out_time.check_out)) {
        addText("Check-in/out", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        
        if (check_in_out_time.check_in) {
          pdf.setFontSize(11);
          pdf.text(`Check-In: ${check_in_out_time.check_in}`, margin, yPos);
          yPos += 6;
        }
        
        if (check_in_out_time.check_out) {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.text(`Check-Out: ${check_in_out_time.check_out}`, margin, yPos);
          yPos += 6;
        }
        
        if (check_in_out_time.description) {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(10);
          const descLines = pdf.splitTextToSize(check_in_out_time.description, pageWidth - margin * 2);
          descLines.forEach(line => {
            if (yPos > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }
            pdf.text(line, margin, yPos);
            yPos += 5;
          });
        }
        yPos += 10;
      }

      // Add Staff
      if (isRentType && staffArray.length > 0) {
        addText("Staff", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        
        staffArray.forEach((staff, i) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(staff.name, margin, yPos);
          yPos += 5;
          
          if (staff.details) {
            pdf.setFont(undefined, 'normal');
            const detailsLines = pdf.splitTextToSize(staff.details, pageWidth - margin * 2 - 10);
            detailsLines.forEach(line => {
              if (yPos > pageHeight - margin) {
                pdf.addPage();
                yPos = margin;
              }
              pdf.text(line, margin + 5, yPos);
              yPos += 5;
            });
          }
          yPos += 5;
        });
        yPos += 5;
      }

      // Add Concierge Service
      if (isRentType && concierge_service.length > 0) {
        addText("Concierge Service", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        concierge_service.forEach((item, i) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.setFontSize(11);
          pdf.text(`• ${item}`, margin, yPos);
          yPos += 6;
        });
        yPos += 10;
      }

      // Add Security Deposit
      if (isRentType && security_deposit) {
        addText("Security Deposit", 16, true, "left", [0, 0, 0]);
        yPos += 8;
        pdf.setFontSize(12);
        pdf.text(`US$ ${security_deposit}`, margin, yPos);
        yPos += 12;
      }

      // Add Rental Rates Table with "Rates & Booking Information" heading
      // Use transformedBookingRate instead of booking_rate
      if (isRentType && transformedBookingRate.length > 0) {
        addText("Rates & Booking Information", 18, true, "center", [0, 105, 92]);
        yPos += 12;
        
        // Check if we need new page for table
        if (yPos > pageHeight - margin - 50) {
          pdf.addPage();
          yPos = margin;
          addText("Rates & Booking Information", 18, true, "center", [0, 105, 92]);
          yPos += 12;
        }
        
        // Prepare table data from transformedBookingRate
        const tableData = transformedBookingRate.map(rate => {
          // Format rate_per_night properly
          let formattedRate = "N/A";
          if (rate.rate_per_night && rate.rate_per_night !== "N/A") {
            // Convert to number if possible
            const rateNum = parseFloat(rate.rate_per_night);
            if (!isNaN(rateNum)) {
              formattedRate = `$${rateNum.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            } else {
              formattedRate = rate.rate_per_night;
            }
          }
          
          return [
            rate.rental_period || "N/A",
            rate.minimum_stay || "N/A",
            formattedRate
          ];
        });
        
        console.log("PDF Table Data:", tableData);
        
        // Add table with proper headers as shown in screenshot
        const headers = [["", "Minimum Stay", "Rate Per Night"]];
        const startX = margin;
        const columnWidths = [70, 40, 50];
        const rowHeight = 8;
        const headerHeight = 8;
        
        // Draw table border
        const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        const tableHeight = (tableData.length + 1) * rowHeight;
        
        // Draw header background
        pdf.setFillColor(0, 105, 92); // Teal background
        pdf.rect(startX, yPos, tableWidth, headerHeight, 'F');
        
        // Draw header text
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(255, 255, 255);
        
        let currentX = startX;
        headers[0].forEach((header, i) => {
          // For first column (Rental Period), we'll leave it empty in header as per screenshot
          if (i === 0) {
            pdf.text("Rental Period", currentX + 5, yPos + 5);
          } else {
            pdf.text(header, currentX + 5, yPos + 5);
          }
          currentX += columnWidths[i];
        });
        
        yPos += headerHeight;
        
        // Draw table rows
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        
        tableData.forEach((row, rowIndex) => {
          if (yPos > pageHeight - margin - rowHeight) {
            pdf.addPage();
            yPos = margin;
            // Redraw header on new page
            pdf.setFillColor(0, 105, 92);
            pdf.rect(startX, yPos, tableWidth, headerHeight, 'F');
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(255, 255, 255);
            currentX = startX;
            headers[0].forEach((header, i) => {
              if (i === 0) {
                pdf.text("Rental Period", currentX + 5, yPos + 5);
              } else {
                pdf.text(header, currentX + 5, yPos + 5);
              }
              currentX += columnWidths[i];
            });
            yPos += headerHeight;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'normal');
          }
          
          currentX = startX;
          
          // Draw row background (alternating colors)
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(245, 245, 245);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          pdf.rect(startX, yPos, tableWidth, rowHeight, 'F');
          
          // Draw cell borders
          pdf.setDrawColor(200, 200, 200);
          let borderX = startX;
          for (let i = 0; i < columnWidths.length; i++) {
            if (i < columnWidths.length - 1) {
              pdf.line(borderX + columnWidths[i], yPos, borderX + columnWidths[i], yPos + rowHeight);
            }
            borderX += columnWidths[i];
          }
          
          // Draw cell content
          row.forEach((cell, cellIndex) => {
            pdf.setFontSize(9);
            pdf.text(cell, currentX + 5, yPos + 5);
            currentX += columnWidths[cellIndex];
          });
          
          yPos += rowHeight;
        });
        
        // Draw bottom border
        pdf.setDrawColor(200, 200, 200);
        pdf.line(startX, yPos, startX + tableWidth, yPos);
        
        yPos += 15;
      } else if (isRentType) {
        // Show message if no rates available
        addText("Rates & Booking Information", 18, true, "center", [0, 105, 92]);
        yPos += 12;
        addText("No rate information available", 12, false, "center");
        yPos += 15;
      }

      // Add footer on all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(
          `Page ${i} of ${totalPages} • Generated on ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Save PDF
      pdf.save(
        `${(villaName || "EV_Brochure")
          .replace(/\s+/g, "_")
          .trim()}_Brochure.pdf`
      );
      
      Swal.fire({
        icon: "success",
        title: "Brochure Downloaded",
        text: "Property brochure has been generated successfully!",
        timer: 2000
      });

    } catch (err) {
      console.error("PDF/download flow error:", err);
      Swal.fire({
        icon: "error",
        title: "Export failed",
        text: "Could not record download or generate brochure. See console for details.",
      });
    }
  };

  const villaId = villa.id;

  // -------- UI Rendering --------
  return (
    <section className="container mx-auto mb-[920px] px-4 py-16 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-7">
          <h2 className="text-3xl text-center font-bold text-gray-900 mb-8">
            Image Gallery - {media_images.length} photos
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {(showAll ? media_images : media_images.slice(0, 6)).map(
              (img, index) => (
                <div
                  key={img.id}
                  className="aspect-4/3 bg-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-105"
                  onClick={() => openImageModal(index)}
                >
                  <img
                    src={img.url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
          </div>

          <div className="mt-8 text-center">
            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
              >
                View All Photos
              </button>
            ) : (
              <button
                onClick={() => setShowAll(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
              >
                Show Less
              </button>
            )}

            <VideoExperience videos={videos} villa={villa}  />

            <Description
              descriptionData={description}
              descriptionImage={
                media_images?.[1]?.url ||
                description_image_url ||
                LOCAL_FALLBACK
              }
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5 border-l lg:pl-12 pl-0">
          <h3 className="text-2xl font-bold mb-4">
            Signature Distinctions
          </h3>
          <ul>
            {signature_distinctions.map((item, i) => (
              <AmenityItem key={i} name={item} />
            ))}
          </ul>

          <h3 className="text-2xl font-bold mt-10 mb-4">
            Finer Details
          </h3>

          <h4 className="font-semibold text-lg mb-2">
            Interior Amenities
          </h4>
          <ul className="grid grid-cols-2 gap-x-6">
            {interior_amenities.map((item, i) => (
              <AmenityItem key={i} name={item} />
            ))}
          </ul>

          <h4 className="font-semibold text-lg mt-6 mb-2">
            Outdoor Amenities
          </h4>
          <ul>
            {outdoor_amenities.map((item, i) => (
              <AmenityItem key={i} name={item} />
            ))}
          </ul>

          {/* Rules & Check-in/out & Staff: render only for rent-type */}
          {isRentType && (
            <>
              <h3 className="text-2xl font-bold mt-10 mb-4">
                Rules & Etiquette
              </h3>
              <ul>
                {rules_and_etiquette.map((item, i) => (
                  <AmenityItem key={i} name={item} />
                ))}
              </ul>

              <h3 className="text-2xl font-bold mt-10 mb-4">
                Check-in/out
              </h3>
              {check_in_out_time.check_in ? (
                <p>Check-In: {check_in_out_time.check_in}</p>
              ) : (
                <p>Check-In: —</p>
              )}
              {check_in_out_time.check_out ? (
                <p>Check-Out: {check_in_out_time.check_out}</p>
              ) : (
                <p>Check-Out: —</p>
              )}
              {check_in_out_time.description ? (
                <p>{check_in_out_time.description}</p>
              ) : null}

              <h3 className="text-2xl font-bold mt-10 mb-4">
                Staff
              </h3>
              <ul>
                {staffArray.map((s, i) => (
                  <StaffItem key={i} name={s.name} details={s.details} />
                ))}
              </ul>
            </>
          )}

          {/* Bedrooms slider ALWAYS shown */}
          <div className="mt-8">
            <BedRoomsSliders bedrooms_images={bedrooms_images} />
          </div>

          {isRentType && (
            <>
              <h3 className="text-2xl font-bold mt-10 mb-4">
                Concierge Service
              </h3>

              {/* dynamic concierge items only */}
              <ul>
                {concierge_service.map((item, i) => (
                  <AmenityItem key={i} name={item} />
                ))}
              </ul>
            </>
          )}

          {/* 🔐 Security Deposit: ONLY for RENT properties now */}
          {isRentType && (
            <>
              <h3 className="text-3xl font-bold mt-10 mb-4">
                Security Deposit
              </h3>

              <p className="text-2xl font-semibold">
                US$ {security_deposit || "US$ 10,000.00"}
              </p>
            </>
          )}

          <button
            onClick={handleDownloadPDF}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-lg text-lg mt-8"
          >
            Download EV Brochure
          </button>
        </div>
      </div>

      {/* Rates & Calendar: only show for rent-type */}
      {isRentType && (
        <>
          <RatesBookingInformation booking_rate={booking_rate} />
          <div className="">
            <Calendar villaId={villaId} />
          </div>
        </>
      )}

      <div className="mt-15 mb-20">
        <Locations
          lat={location.lat}
          lng={location.lng}
          text={location.address}
          locationObj={location}
          villaName={villaName}
        />
      </div>

      <AddReviewForm propertyId={villaId} />

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          images={media_images}
          currentIndex={selectedImageIndex}
          onClose={closeImageModal}
          onNext={goToNextImage}
          onPrev={goToPrevImage}
        />
      )}
    </section>
  );
};

export default ImageGallerySection;