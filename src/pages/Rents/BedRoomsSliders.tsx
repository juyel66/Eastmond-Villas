// BedRoomsSliders.tsx
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import React, { useState } from "react";

interface BedroomImageIncoming {
  // backend may send different shapes — handle them all
  image_url?: string;
  image?: string;
  file_url?: string;
  url?: string;
  id?: number | string;
  [key: string]: any;
}

interface BedRoomsSlidersProps {
  bedrooms_images?: BedroomImageIncoming[] | null;
}

const FALLBACK_IMAGE = "/mnt/data/28e6a12e-2530-41c9-bdcc-03c9610049e3.png";

const normalizeImageUrl = (img: BedroomImageIncoming) => {
  if (!img) return FALLBACK_IMAGE;
  return (
    img.image_url ||
    img.image ||
    img.file_url ||
    img.url ||
    // some responses might wrap media object
    (img.media && (img.media.file_url || img.media.url)) ||
    FALLBACK_IMAGE
  );
};

const BedRoomsSliders: React.FC<BedRoomsSlidersProps> = ({ bedrooms_images }) => {
  const images = (Array.isArray(bedrooms_images) ? bedrooms_images : []).map(
    (b, idx) => ({
      id: b.id ?? idx,
      url: normalizeImageUrl(b),
    })
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    // show nothing if no images — keep behavior minimal
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mb-10 pt-4 border-t border-gray-200">
      <h3 className="text-2xl font-bold mb-4 flex justify-between items-center">
        Bedrooms
        <div className="flex space-x-2 text-gray-400">
          <button
            onClick={prevSlide}
            className="px-3 py-1 border bg-white rounded-[10px] hover:bg-gray-100 transition-colors"
            aria-label="Previous bedroom"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="px-3 py-1 border bg-white rounded-[10px] hover:bg-gray-100 transition-colors"
            aria-label="Next bedroom"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </h3>

      {/* Slider Container */}
      <div className="relative w-full overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((bed, index) => (
            <div key={bed.id} className="min-w-full flex-shrink-0">
              <button
                onClick={() => {
                  setCurrentIndex(index);
                  setLightboxOpen(true);
                }}
                className="w-full block"
                aria-label={`Open bedroom ${index + 1} image`}
              >
                <img
                  src={bed.url}
                  alt={`Bedroom ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    // fallback to local image if remote fails
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-teal-600" : "bg-gray-300"
            }`}
            aria-label={`Go to bedroom ${index + 1}`}
          />
        ))}
      </div>

      {/* Lightbox / Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 text-white text-3xl font-bold z-20"
              aria-label="Close image"
            >
              &times;
            </button>

            <div className="relative">
              <img
                src={images[currentIndex].url}
                alt={`Bedroom large ${currentIndex + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-black"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />

              {/* Prev / Next overlays */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30"
                    aria-label="Previous image"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30"
                    aria-label="Next image"
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedRoomsSliders;
