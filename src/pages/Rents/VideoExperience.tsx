import React, { useState } from "react";

const VideoExperience = ({ videos = [], villa }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Pick first video
  const mainVideo = videos?.[0]?.url || null;

  // Default video fallback
  const videoSrc = mainVideo
    ? mainVideo
    : "https://www.youtube.com/embed/1dxrO79dbCg";

  // Default thumbnail image
  const thumbnail =
    villa?.cover_image ||
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511";

  return (
    <div className="w-full mt-10">
      <h2 className="text-4xl font-semibold text-gray-900 mb-8">
        The Video Experience
      </h2>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        {!isPlaying ? (
          <>
            {/* Thumbnail Image */}
            <img
              src={thumbnail}
              alt={villa?.title || "Villa Video Thumbnail"}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 rounded-full bg-white text-black text-3xl flex items-center justify-center hover:scale-110 transition"
              >
                ▶
              </button>
            </div>
          </>
        ) : (
          <iframe
            src={`${videoSrc}?autoplay=1`}
            title={villa?.title || "Villa Video Experience"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default VideoExperience;
