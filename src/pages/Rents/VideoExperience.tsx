import React, { useMemo, useState } from 'react';
import youtubeImg from '../../assets/youtube.svg';

type VideoItem = {
  url: string;
};

type Villa = {
  title?: string;
  cover_image?: string;
  youtube_link?: string;
};

interface VideoExperienceProps {
  videos?: VideoItem[];
  villa?: Villa;
}


const toYoutubeEmbed = (url: string): string => {
  if (!url) return '';

  if (url.includes('youtube.com/embed')) return url;

  // watch?
  const watchMatch = url.match(/v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return url;
};

const isYoutube = (url: string) => /youtube\.com|youtu\.be/.test(url);

const VideoExperience: React.FC<VideoExperienceProps> = ({
  videos = [],
  villa,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // only use provided video/link — do NOT fall back to a default video
  const rawVideo = videos?.[0]?.url || villa?.youtube_link || '';

  // if there's no video or link, render nothing
  if (!rawVideo || !rawVideo.trim()) return null;

  const video = useMemo(() => {
    if (isYoutube(rawVideo)) {
      return {
        type: 'youtube' as const,
        src: toYoutubeEmbed(rawVideo),
      };
    }

    return {
      type: 'mp4' as const,
      src: rawVideo,
    };
  }, [rawVideo]);

  const thumbnail =
    villa?.cover_image ||
    'https://res.cloudinary.com/dqkczdjjs/image/upload/v1769899735/vecteezy_ai-generated-luxury-house-with-swimming-pool-at-night_35995925_jofve0.jpg';

  return (
    <div className="w-full mt-10">
      <h2 className="text-4xl font-semibold text-gray-900 mb-8">
        The Video Experience
      </h2>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        {!isPlaying ? (
          <>
            <img
              src={thumbnail}
              alt={villa?.title || 'Villa Video Thumbnail'}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-24 h-24 rounded-full flex items-center justify-center hover:scale-105 transition"
              >
                <img src={youtubeImg} alt="Play" className="w-full h-full" />
              </button>
            </div>
          </>
        ) : video.type === 'youtube' ? (
          <iframe
            src={`${video.src}?autoplay=1`}
            title={villa?.title || 'Villa Video Experience'}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <video
            src={video.src}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default VideoExperience;
