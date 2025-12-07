import React from "react";

const VideoExperience = ({ videos = [], villa }) => {
  // pick first video if exists
  const mainVideo = videos?.[0]?.url || null;

  return (
    <div>
      <div className="text-4xl font-semibold text-gray-900 mb-8 mt-15 items-center">
        The Video Experience
      </div>

      <div className="mt-10">
        {/* 🖥️ Desktop View */}
        <div className="lg:flex hidden">
          <iframe
            width="860"
            height="515"
            src={
              mainVideo
                ? mainVideo // API video URL
                : "https://www.youtube.com/embed/1dxrO79dbCg?si=i6rNvszkd1ffSQQ8" // fallback
            }
            title={villa?.title || "Villa Video Experience"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>

        {/* 📱 Mobile View */}
        <div className="flex lg:hidden">
          <iframe
            width="560"
            height="315"
            src={
              mainVideo
                ? mainVideo // API video URL
                : "https://www.youtube.com/embed/1dxrO79dbCg?si=i6rNvszkd1ffSQQ8" // fallback
            }
            title={villa?.title || "Villa Video Experience"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoExperience;
