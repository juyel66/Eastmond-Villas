import React, { useState } from "react";
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
const LOCAL_FALLBACK =
  "/mnt/data/28e6a12e-2530-41c9-bdcc-03c9610049e3.png";

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

  // Compute scale to cover target
  const scale = Math.max(targetW / iw, targetH / ih);
  const sw = targetW / scale;
  const sh = targetH / scale;

  // Source top-left to crop (centered)
  const sx = Math.max(0, Math.floor((iw - sw) / 2));
  const sy = Math.max(0, Math.floor((ih - sh) / 2));

  // Make canvas sized to target pixels for higher quality
  canvas.width = targetW;
  canvas.height = targetH;

  // Clear and draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, targetW, targetH);
};

// --------- MAIN COMPONENT ----------
const ImageGallerySection = ({ villa }) => {
  if (!villa)
    return (
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="text-xl font-semibold text-teal-600">Loading…</div>
      </section>
    );

  console.log("🔎 Single Villa Data (Image Gallery Component):", villa);

  // -------- Extract Data Safely ----------
  const media_images =
    villa.media_images?.map((img) => ({
      id: img.id,
      url: img.image || img.file_url || LOCAL_FALLBACK,
    })) || [];

  // bedrooms_images now include name + description for each image
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

  // Concierge Services: read from concierge_services (API) with fallback
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

  // ✅ videos from API: villa.videos: [{ id, video }]
  const videos = Array.isArray(villa.videos)
    ? villa.videos.map((v) => ({
        id: v.id,
        url: v.video || v.file_url || v.url || "",
      }))
    : [];

  // ===== Build location object robustly
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
  const [selectedImage, setSelectedImage] = useState(null);

  // -------- DOWNLOAD RECORD + PDF EXPORT
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

      let resJson = null;
      try {
        resJson = await res.json().catch(() => null);
      } catch {
        resJson = null;
      }

      console.log(
        "Download recorded successfully for property:",
        villaId,
        resJson
      );

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const gap = 6;
      const cols = 3;
      const rows = 4;
      const perPage = cols * rows;

      const headerHeight = 26;
      const footerHeight = 12;
      const availableWidth =
        pageWidth - margin * 2 - gap * (cols - 1);
      const availableHeight =
        pageHeight -
        margin * 2 -
        headerHeight -
        footerHeight -
        gap * (rows - 1);

      const imgW = Number((availableWidth / cols).toFixed(2));
      const imgH = Number((availableHeight / rows).toFixed(2));
      const yStart = margin + headerHeight;

      const imgUrls = media_images.map((m) => m.url || LOCAL_FALLBACK);
      if (imgUrls.length === 0) imgUrls.push(LOCAL_FALLBACK);
      const totalPages = Math.ceil(imgUrls.length / perPage);

      const drawHeader = (pageIndex) => {
        pdf.setFontSize(18);
        pdf.setTextColor(20, 40, 40);
        const title = villaName || "Property Gallery";
        pdf.text(title, pageWidth / 2, margin + 8, {
          align: "center",
        });
        if (villa.price) {
          pdf.setFontSize(11);
          const priceText =
            typeof villa.price === "number"
              ? `Price: US$ ${villa.price.toLocaleString()}`
              : `Price: ${villa.price}`;
          pdf.text(priceText, pageWidth / 2, margin + 14, {
            align: "center",
          });
        }
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.4);
        pdf.line(
          margin,
          margin + 18,
          pageWidth - margin,
          margin + 18
        );
      };

      for (let p = 0; p < totalPages; p++) {
        drawHeader(p + 1);

        for (let i = 0; i < perPage; i++) {
          const currentIndex = p * perPage + i;
          if (currentIndex >= imgUrls.length) break;

          const col = i % cols;
          const row = Math.floor(i / cols);

          const x = margin + col * (imgW + gap);
          const y = yStart + row * (imgH + gap);

          const imgEl = await loadImageWithFallback(
            imgUrls[currentIndex]
          );
          if (!imgEl) continue;

          const pxPerMm = 3.78;
          const canvasWpx = Math.max(
            600,
            Math.round(imgW * pxPerMm)
          );
          const canvasHpx = Math.max(
            800,
            Math.round(imgH * pxPerMm)
          );

          const canvas = document.createElement("canvas");
          drawImageCoverToCanvas(
            imgEl,
            canvas,
            canvasWpx,
            canvasHpx
          );

          let imgData;
          try {
            imgData = canvas.toDataURL("image/jpeg", 0.92);
          } catch (err) {
            console.warn(
              "Canvas toDataURL failed, using fallback image src:",
              err
            );
            const fallbackCanvas =
              document.createElement("canvas");
            fallbackCanvas.width = 800;
            fallbackCanvas.height = 600;
            const fctx = fallbackCanvas.getContext("2d");
            const fallbackImg = await loadImageWithFallback(
              LOCAL_FALLBACK
            );
            if (fallbackImg)
              fctx.drawImage(
                fallbackImg,
                0,
                0,
                fallbackCanvas.width,
                fallbackCanvas.height
              );
            imgData = fallbackCanvas.toDataURL(
              "image/jpeg",
              0.9
            );
          }

          pdf.addImage(imgData, "JPEG", x, y, imgW, imgH);
        }

        pdf.setFontSize(9);
        pdf.setTextColor(120);
        const footerText = `Page ${p + 1} of ${totalPages}`;
        pdf.text(
          footerText,
          pageWidth / 2,
          pageHeight - margin + 2,
          { align: "center" }
        );

        if (p < totalPages - 1) pdf.addPage();
      }

      pdf.save(
        `${(villaName || "EV_Brochure")
          .replace(/\s+/g, "_")
          .trim()}.pdf`
      );
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Image Gallery - {media_images.length} photos
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {(showAll ? media_images : media_images.slice(0, 6)).map(
              (img) => (
                <div
                  key={img.id}
                  className="aspect-4/3 bg-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img
                    src={img.url}
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

            {/* ✅ VideoExperience now receives videos + full villa */}
            <VideoExperience videos={videos} villa={villa} />

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
                  <StaffItem
                    key={i}
                    name={s.name}
                    details={s.details}
                  />
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

              {/* Existing concierge items (if any) */}
              <ul>
                {concierge_service.map((item, i) => (
                  <AmenityItem key={i} name={item} />
                ))}

                {/* --- STATIC LINES REQUESTED --- */}
                <li className="flex items-start text-gray-700 text-sm mb-2 mt-4">
                  <img
                    src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
                    alt="icon"
                    className="w-4 h-4 mr-2 mt-0.5"
                  />
                  <span>
                    Our concierge team offers a bunch of luxury
                    services, making sure you enjoy every moment.
                  </span>
                </li>

                <li className="flex items-start text-gray-700 text-sm mb-2">
                  <img
                    src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
                    alt="icon"
                    className="w-4 h-4 mr-2 mt-0.5"
                  />
                  <span>
                    We handle your Arrival, Transfers, Car Rentals,
                    and Chauffeur Services.
                  </span>
                </li>

                <li className="flex items-start text-gray-700 text-sm mb-2">
                  <img
                    src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760828543/hd_svg_logo_2_hw4vsa.png"
                    alt="icon"
                    className="w-4 h-4 mr-2 mt-0.5"
                  />
                  <span>
                    We can stock your villa, help with menus,
                    provide household support, and spa services.
                  </span>
                </li>
              </ul>
            </>
          )}

          <h3 className="text-2xl font-bold mt-10 mb-4">
            Security Deposit
          </h3>

          <p className="text-3xl font-bold">
            {security_deposit || "US$ 10,000.00"}
          </p>

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
          <RatesBookingInformation
            booking_rate_start={booking_rate_start}
            price={villa.price}
          />
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

      <AddReviewForm />

      {selectedImage && (
        <div
          className="fixed inset-0 bg-opacity-80 flex justify-center items-center z-9999"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="w-full h-[80vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </section>
  );
};

export default ImageGallerySection;
