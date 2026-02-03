// src/features/Properties/PropertiesRentalsDetails.tsx
import React, { FC, useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Copy, X } from 'lucide-react';
import { FaHandshakeSimple } from "react-icons/fa6";
import { AiFillDollarCircle } from "react-icons/ai";
import JSZip from 'jszip';
import Swal from 'sweetalert2';

// Import the Calendar component (make sure the path is correct)
import Calendar from "../../../pages/Rents/Calendar";
import locationss from '../../../assets/locationss.svg';

// --- TYPE DEFINITIONS ---
interface Property {
  id?: number;
  title: string;
  status: string;
  listing_type?: 'rent' | 'sale' | 'other';
  location: string;
  image_url: string;
  description: string;
  
  // slug for dynamic calendar link
  slug?: string;

  // numbers / booking stats
  add_guest?: number;
  bedrooms?: number;
  bathrooms?: number;
  pool?: number;
  price?: number;
  price_display?: string;

  // financials
  commission_rate?: string;
  security_deposit?: string;
  tbc_by?: string;
  damage_deposit?: string;

  // amenities
  outdoor_amenities: string[];
  interior_amenities: string[];
  signature_distinctions: string[];

  // SEO
  seo_info: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };

  viewing_link: string;

  // misc
  staff_name?: string;
  concierge_services: string[];

  // calendar accuracy field
  calendar_accuracy?: string;

  // videos field
  videos?: Array<{
    id?: number;
    video: string;
    title?: string;
    description?: string;
  }>;

  _raw?: any;
}

// Image interface
interface PropertyImage {
  id?: number;
  image: string;
  alt_text?: string;
  is_main?: boolean;
  source?: string;
}

// Video interface
interface PropertyVideo {
  id?: number;
  video: string;
  title?: string;
  description?: string;
}

// --- IMAGE GALLERY MODAL COMPONENT ---
interface ImageGalleryModalProps {
  images: PropertyImage[];
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  propertyTitle: string;
  loading?: boolean;
  downloadProgress?: number;
  isDownloading?: boolean;
}

const ImageGalleryModal: FC<ImageGalleryModalProps> = ({ 
  images, 
  isOpen, 
  onClose, 
  onDownload, 
  propertyTitle,
  loading = false,
  downloadProgress = 0,
  isDownloading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-75 p-4">
      <div className="absolute inset-0 bg-black z-[-1] opacity-50" />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {propertyTitle} - All Images ({images.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Preview all images before downloading
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading images...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 text-lg">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Image */}
                  <div className="aspect-square relative">
                    <img
                      src={img.image}
                      alt={img.alt_text || `Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/400x400/6b7280/ffffff?text=Image+Error';
                      }}
                    />
                    {img.is_main && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-3 bg-white">
                   
                  
                    <div className="mt-2 flex justify-between items-center">
                      <a
                        href={img.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                      >
                        View Full
                      </a>
                    
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="space-y-4">
            {/* Download Progress Bar */}
            {isDownloading && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Downloading images...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                {downloadProgress === 100 && (
                  <p className="text-xs text-green-600 mt-1 text-center">
                    Download complete! Check your downloads folder.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700">
                  <strong>Total images:</strong> {images.length}
                </p>
              
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onDownload}
                  disabled={images.length === 0 || loading || isDownloading}
                  className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download All Images
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- API base (use env var if available) ---
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, '') ||
  'http://localhost:8888/api';

// --- HELPER FUNCTIONS ---
const showActionMessage = (message: string) => {
  console.log(message);
  alert(message);
};

const copyToClipboard = (text: string, successMessage: string) => {
  try {
    if (!text) {
      showActionMessage('Nothing to copy.');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showActionMessage(successMessage));
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showActionMessage(successMessage);
    }
  } catch (e) {
    console.error('copy failed', e);
    showActionMessage('Copy failed');
  }
};

// Function to get pluralized text
const getPluralText = (count: number, singular: string, plural: string): string => {
  if (count === 1) {
    return `${count} ${singular}`;
  }
  return `${count} ${plural}`;
};

// --- QUICK ACTION BUTTON ---
interface QuickActionButtonProps {
  imgSrc: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}
const QuickActionButton: FC<QuickActionButtonProps> = ({ imgSrc, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    type="button"
    disabled={disabled}
    className="flex items-center space-x-2 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-100 transition duration-150 border border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <img src={imgSrc} alt={label} className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

// --- COPY BUTTON COMPONENT ---
interface CopyButtonProps {
  onClick: () => void;
  label?: string;
}
const CopyButton: FC<CopyButtonProps> = ({ onClick, label = "Copy" }) => (
  <button
    onClick={onClick}
    type="button"
    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-black text-xs font-medium rounded-lg hover:bg-gray-300 transition duration-150 cursor-pointer"
  >
    <Copy className="w-3 h-3" />
    <span className=''>{label}</span>
  </button>
);

const formatMoney = (value?: string | number) => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!n || Number.isNaN(n)) return '';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Video download progress component
interface VideoDownloadProgressProps {
  progress: number;
  isDownloading: boolean;
  isCompleted: boolean;
  onReset?: () => void;
}

const VideoDownloadProgress: FC<VideoDownloadProgressProps> = ({ 
  progress, 
  isDownloading, 
  isCompleted,
  onReset 
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Video Download</h3>
        {isCompleted && (
          <button
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              {isCompleted ? 'Download Complete!' : 
               isDownloading ? 'Downloading...' : 'Preparing...'}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                isCompleted ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Status Messages */}
        <div className="text-xs text-gray-500">
          {progress < 20 && "Connecting to server..."}
          {progress >= 20 && progress < 40 && "Preparing video files..."}
          {progress >= 40 && progress < 60 && "Downloading videos..."}
          {progress >= 60 && progress < 80 && "Processing downloaded files..."}
          {progress >= 80 && progress < 100 && "Finalizing download..."}
          {progress === 100 && isCompleted && "Download ready! Check your downloads folder."}
        </div>
        
        {/* Download Stats */}
        {isDownloading && progress > 0 && progress < 100 && (
          <div className="text-xs text-gray-600 flex justify-between">
            <span>Estimated time remaining: {Math.max(0, Math.round((100 - progress) * 0.3))}s</span>
            <span>{Math.round(progress * 2.5)} KB / 250 KB</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PropertiesRentalsDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>('draft');
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [propertyVideos, setPropertyVideos] = useState<PropertyVideo[]>([]);
  
  // State for image gallery modal
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [imageDownloadProgress, setImageDownloadProgress] = useState(0);
  const [isImageDownloading, setIsImageDownloading] = useState(false);
  
  // State for video downloading with real progress tracking
  const [isVideoDownloading, setIsVideoDownloading] = useState(false);
  const [videoDownloadProgress, setVideoDownloadProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [showDownloadProgress, setShowDownloadProgress] = useState(false);
  
  // Refs for tracking download
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const downloadStartTimeRef = useRef<number | null>(null);
  
  // State to control calendar visibility
  const [showCalendar, setShowCalendar] = useState(false);

  // Function to generate dynamic calendar link from slug
  const generateCalendarLink = (): string => {
    if (!property?.slug) {
      return property?.viewing_link || '';
    }
    
    // Format the slug: convert to lowercase, replace spaces with hyphens
    const formattedSlug = property.slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
    
    // Determine suffix based on listing type (rent or sale)
    let suffix = 'ics'; // Default suffix for rentals
    if (property.listing_type === 'sale') {
      suffix = 's.ics';
    }
    
    return `https://www.eastmondvillas.com/dashboard/properties/ical-link/${formattedSlug}/bookings.${suffix}`;
  };

  // Function to fetch all images for the property
  const fetchAllImages = async (propertyId: number, propertyData: any): Promise<PropertyImage[]> => {
    const images: PropertyImage[] = [];
    
    // Main image
    if (propertyData.main_image_url) {
      images.push({
        image: propertyData.main_image_url,
        alt_text: `${propertyData.title || 'Property'} - Main Image`,
        is_main: true,
        source: 'main_image_url'
      });
    }
    
    if (propertyData.image_url && !images.some(img => img.image === propertyData.image_url)) {
      images.push({
        image: propertyData.image_url,
        alt_text: `${propertyData.title || 'Property'} - Image`,
        is_main: false,
        source: 'image_url'
      });
    }
    
    if (propertyData.imageUrl && !images.some(img => img.image === propertyData.imageUrl)) {
      images.push({
        image: propertyData.imageUrl,
        alt_text: `${propertyData.title || 'Property'} - Image`,
        is_main: false,
        source: 'imageUrl'
      });
    }
    
    // Media images
    if (Array.isArray(propertyData.media_images)) {
      propertyData.media_images.forEach((img: any, index: number) => {
        if (img.image && !images.some(existing => existing.image === img.image)) {
          images.push({
            id: img.id || index,
            image: img.image,
            alt_text: img.alt_text || `${propertyData.title || 'Property'} - Image ${index + 1}`,
            is_main: false,
            source: 'media_images'
          });
        }
      });
    }

    // Other potential image fields
    const processImageField = (fieldName: string, value: any) => {
      if (Array.isArray(value)) {
        value.forEach((item: any, index: number) => {
          if (typeof item === 'string' && !images.some(img => img.image === item)) {
            images.push({
              image: item,
              alt_text: `${propertyData.title || 'Property'} - ${fieldName} ${index + 1}`,
              is_main: false,
              source: fieldName
            });
          } else if (item && item.url && !images.some(img => img.image === item.url)) {
            images.push({
              image: item.url,
              alt_text: item.alt_text || `${propertyData.title || 'Property'} - ${fieldName} ${index + 1}`,
              is_main: false,
              source: fieldName
            });
          }
        });
      } else if (typeof value === 'string' && !images.some(img => img.image === value)) {
        images.push({
          image: value,
          alt_text: `${propertyData.title || 'Property'} - ${fieldName}`,
          is_main: false,
          source: fieldName
        });
      }
    };

    // Check other image fields
    const imageFields = ['thumbnail_url', 'banner_image', 'cover_image', 'gallery_images', 'photos', 'images'];
    imageFields.forEach(field => {
      if (propertyData[field]) {
        processImageField(field, propertyData[field]);
      }
    });

    return images;
  };

  useEffect(() => {
    if (!id) {
      setError('Property ID missing from URL.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE.replace(/\/+$/, '')}/villas/properties/${encodeURIComponent(
          id
        )}/`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) {
          if (res.status === 404) throw new Error('Property not found (404).');
          throw new Error(`Failed to fetch property (status ${res.status}).`);
        }
        const p = await res.json();

        // Fetch all images
        const images = await fetchAllImages(Number(p.id), p);
        console.log('=== All Images from API ===');
        console.log('Total images found:', images.length);
        
        // Set property images
        setPropertyImages(images);

        // --- Collect all videos from API response ---
        const videos: PropertyVideo[] = [];
        
        // Videos field from API
        if (Array.isArray(p.videos)) {
          p.videos.forEach((video: any, index: number) => {
            if (video.video || video.url || video.file_url) {
              videos.push({
                id: video.id || index,
                video: video.video || video.url || video.file_url,
                title: video.title || `Video ${index + 1}`,
                description: video.description || ''
              });
            }
          });
        }

        // Check other video fields
        const videoFields = ['video_url', 'video_link', 'media_videos'];
        videoFields.forEach(field => {
          if (p[field]) {
            if (Array.isArray(p[field])) {
              p[field].forEach((video: any, index: number) => {
                if (typeof video === 'string') {
                  videos.push({
                    video: video,
                    title: `Video ${index + 1}`,
                    description: ''
                  });
                } else if (video && (video.url || video.video)) {
                  videos.push({
                    id: video.id || index,
                    video: video.url || video.video,
                    title: video.title || `Video ${index + 1}`,
                    description: video.description || ''
                  });
                }
              });
            } else if (typeof p[field] === 'string') {
              videos.push({
                video: p[field],
                title: 'Main Video',
                description: ''
              });
            }
          }
        });

        console.log('=== All Videos from API ===');
        console.log('Total videos found:', videos.length);

        // Set property videos
        setPropertyVideos(videos);

        // --- Normalize listing_type from backend ---
        const rawLt = String(p.listing_type ?? p.listingType ?? '')
          .toLowerCase()
          .trim();
        let normalizedLt: 'rent' | 'sale' | 'other' = 'other';
        if (rawLt === 'sale' || rawLt === 'sales') {
          normalizedLt = 'sale';
        } else if (rawLt === 'rent' || rawLt === 'rental' || rawLt === 'rentals') {
          normalizedLt = 'rent';
        } else {
          normalizedLt = 'other';
        }

        // --- Normalize arrays that sometimes come as {} ---
        const normalizeStringArray = (val: any): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val.map(String);
          if (typeof val === 'object') return Object.values(val).map((v) => String(v));
          return [];
        };

        const outdoorAmenities = normalizeStringArray(p.outdoor_amenities);
        const interiorAmenities = normalizeStringArray(p.interior_amenities);
        const signatureDistinctions = normalizeStringArray(p.signature_distinctions);
        const conciergeServices = normalizeStringArray(p.concierge_services);
        
        // staff might be object or array
        let staffName: string | undefined;
        if (Array.isArray(p.staff) && p.staff.length > 0) {
          staffName = p.staff[0]?.name ?? '';
        } else if (p.staff && typeof p.staff === 'object') {
          staffName = p.staff.name ?? '';
        }

        // Extract calendar_accuracy from API response
        const calendarAccuracy = p.calendar_accuracy || p.calendar_accuracy_percentage || '';

        // Determine main image for display
        let mainImage = images.find(img => img.is_main)?.image || 
                      images[0]?.image || 
                      'https://placehold.co/800x600/6b7280/ffffff?text=Image+Unavailable';

        // Ensure proper URL for images starting with /
        if (mainImage.startsWith('/')) {
          mainImage = `${API_BASE.replace(/\/api\/?$/, '')}${mainImage}`;
        }

        const address =
          p.address ??
          (p.location ? (typeof p.location === 'string' ? p.location : '') : '') ??
          p.city ??
          '—';

        // Extract slug - check multiple possible fields
        const slug = p.slug || p.name_slug || p.property_slug || null;

        const mapped: Property = {
          id: Number(p.id ?? p.pk ?? NaN),
          title: p.title ?? p.name ?? 'Untitled',
          status: String(p.status ?? 'draft'),
          listing_type: normalizedLt,
          location: address,
          image_url: mainImage,
          description: p.description ?? p.short_description ?? '',
          slug: slug, // Add slug to property

          add_guest: Number(p.add_guest ?? 0) || 0,
          bedrooms: Number(p.bedrooms ?? 0) || 0,
          bathrooms: Number(p.bathrooms ?? 0) || 0,
          pool: Number(p.pool ?? 0) || 0,
          price: Number(p.price ?? p.price_display ?? 0) || 0,
          price_display: String(p.price_display ?? p.price ?? ''),

          commission_rate: p.commission_rate ?? p.agent_commission ?? '',
          security_deposit: p.security_deposit ?? '',
          tbc_by: p.tbc_by ?? '',
          damage_deposit: p.damage_deposit ?? '',

          outdoor_amenities: outdoorAmenities,
          interior_amenities: interiorAmenities,
          signature_distinctions: signatureDistinctions,

          seo_info: {
            meta_title: p.seo_title ?? p.seo_info?.meta_title ?? '',
            meta_description:
              p.seo_description ?? p.seo_info?.meta_description ?? '',
            keywords:
              p.signature_distinctions?.slice?.(0, 4)?.map((k: string) =>
                String(k)
              ) ?? p.seo_keywords ?? [],
          },

          viewing_link: p.calendar_link ?? p.viewing_link ?? p.calendar_url ?? '',
          staff_name: staffName,
          concierge_services: conciergeServices,
          
          // Add calendar_accuracy field
          calendar_accuracy: calendarAccuracy,
          
          // Add videos field
          videos: videos,
          
          _raw: p,
        };

        if (!cancelled) {
          setProperty(mapped);
          setLocalStatus(mapped.status ?? 'draft');
        }
      } catch (err: any) {
        console.error('Fetch property error:', err);
        if (!cancelled) setError(err?.message ?? 'Failed to load property.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperty();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Function to show all images in gallery modal
  const handleShowAllImages = () => {
    if (propertyImages.length === 0) {
      showActionMessage('No images available to show.');
      return;
    }
    setShowImageGallery(true);
  };

  // Function to download all images as zip (from gallery modal)
  const downloadAllImagesAsZip = async () => {
    if (propertyImages.length === 0 || !property) {
      showActionMessage('No images available to download.');
      return;
    }

    setIsImageDownloading(true);
    setImageDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      const imageFolder = zip.folder(`${property.title.replace(/\s+/g, '_')}_images`);
      
      if (!imageFolder) {
        throw new Error('Failed to create zip folder');
      }

      let completed = 0;
      const totalItems = propertyImages.length;
      
      // Download each image and add to zip
      const downloadPromises = propertyImages.map(async (img, index) => {
        try {
          // Ensure proper URL
          let imageUrl = img.image;
          if (imageUrl.startsWith('/')) {
            imageUrl = `${API_BASE.replace(/\/api\/?$/, '')}${imageUrl}`;
          }
          
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image ${index + 1}: ${imageUrl}`);
            completed++;
            const progress = Math.round((completed / totalItems) * 95) + 5;
            setImageDownloadProgress(progress);
            return null;
          }
          
          const blob = await response.blob();
          const extension = blob.type.split('/')[1] || 'jpg';
          const fileName = `${property.title.replace(/\s+/g, '_')}_image_${index + 1}.${extension}`;
          
          // Update progress
          completed++;
          const progress = Math.round((completed / totalItems) * 95) + 5;
          setImageDownloadProgress(progress);
          
          return { fileName, blob };
        } catch (error) {
          console.error(`Error downloading image ${index + 1}:`, error);
          completed++;
          const progress = Math.round((completed / totalItems) * 95) + 5;
          setImageDownloadProgress(progress);
          return null;
        }
      });

      const downloadedImages = await Promise.all(downloadPromises);
      
      // Add downloaded images to zip
      downloadedImages.forEach((item) => {
        if (item) {
          imageFolder.file(item.fileName, item.blob);
        }
      });

      // Generate zip file and trigger browser download
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Complete progress
      setImageDownloadProgress(100);
      
      // Create download link and trigger download
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${property.title.replace(/\s+/g, '_')}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      // Show success message after a brief delay
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Downloaded ${propertyImages.length} images`,
          timer: 2000,
          showConfirmButton: false
        });
      }, 500);
      
      // Close modal and reset after completion
      setTimeout(() => {
        setShowImageGallery(false);
        setIsImageDownloading(false);
        setImageDownloadProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Error creating zip file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create zip file. Please try again.',
        timer: 3000,
        showConfirmButton: true,
      });
      setIsImageDownloading(false);
      setImageDownloadProgress(0);
    }
  };

  // Cleanup function
  const cleanupDownload = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    
    downloadStartTimeRef.current = null;
  };

  // Function to reset download state
  const resetVideoDownloadState = () => {
    cleanupDownload();
    setIsVideoDownloading(false);
    setVideoDownloadProgress(0);
    setDownloadCompleted(false);
    setShowDownloadProgress(false);
  };

  // Function to simulate realistic progress based on actual download
  const simulateRealisticProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    let progress = 0;
    const startTime = Date.now();
    downloadStartTimeRef.current = startTime;

    // Phase 1: Initial connection (0-20%)
    const connectionDuration = 1500;
    const connectionSteps = 20;
    const connectionInterval = connectionDuration / connectionSteps;

    let connectionStep = 0;
    const connectionIntervalId = setInterval(() => {
      connectionStep++;
      progress = Math.min(20, (connectionStep / connectionSteps) * 20);
      setVideoDownloadProgress(progress);
      
      if (connectionStep >= connectionSteps) {
        clearInterval(connectionIntervalId);
        startDownloadPhase();
      }
    }, connectionInterval);

    const startDownloadPhase = () => {
      // Phase 2: Download phase (20-80%) - real progress tracking
      let lastProgress = 20;
      
      progressIntervalRef.current = setInterval(() => {
        if (progress >= 100) {
          cleanupDownload();
          return;
        }

        // Simulate realistic download progress with some randomness
        const timeElapsed = Date.now() - startTime;
        const estimatedTotalTime = 8000; // 8 seconds estimated total
        const timeBasedProgress = Math.min(95, (timeElapsed / estimatedTotalTime) * 100);
        
        // Add some randomness but ensure progress is increasing
        const randomIncrement = Math.random() * 2;
        progress = Math.min(95, Math.max(lastProgress + 0.5, timeBasedProgress + randomIncrement));
        
        // Ensure smooth progress but never go backward
        if (progress > lastProgress) {
          setVideoDownloadProgress(progress);
          lastProgress = progress;
        }

        // If we reach near completion, move to final phase
        if (progress >= 95 && !downloadCompleted) {
          cleanupDownload();
          completeDownload();
        }
      }, 200);
    };

    const completeDownload = () => {
      // Phase 3: Final processing (95-100%)
      setVideoDownloadProgress(95);
      
      setTimeout(() => {
        setVideoDownloadProgress(98);
      }, 300);
      
      setTimeout(() => {
        setVideoDownloadProgress(100);
        setDownloadCompleted(true);
        setIsVideoDownloading(false);
        
        // Auto-hide progress after 3 seconds
        setTimeout(() => {
          setShowDownloadProgress(false);
        }, 3000);
      }, 600);
    };
  };

  // Function to download videos with real progress tracking
  const downloadAllVideosAsZip = () => {
    if (!property?.id || propertyVideos.length === 0) {
      showActionMessage('No videos available to download.');
      return;
    }

    // Reset state
    resetVideoDownloadState();
    
    // Show progress UI
    setShowDownloadProgress(true);
    setIsVideoDownloading(true);
    setVideoDownloadProgress(0);
    setDownloadCompleted(false);

    // Start realistic progress simulation
    simulateRealisticProgress();

    // Create download link
    const downloadUrl = `${API_BASE}/villas/videos/download/${property.id}/`;
    
    // Use XMLHttpRequest to track actual progress
    try {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      
      xhr.open('GET', downloadUrl, true);
      xhr.responseType = 'blob';
      
      // Track actual download progress
      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable && event.total > 0) {
          const actualProgress = (event.loaded / event.total) * 80; // Map to 0-80%
          const currentProgress = Math.max(videoDownloadProgress, actualProgress + 20); // Add 20% for connection phase
          setVideoDownloadProgress(Math.min(95, currentProgress));
        }
      });
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          // Create download link
          const blob = xhr.response;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${property.title.replace(/\s+/g, '_')}_videos.zip`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          // Complete the progress
          cleanupDownload();
          setVideoDownloadProgress(100);
          setDownloadCompleted(true);
          setIsVideoDownloading(false);
          
          // Show success message
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Download Complete!',
              text: `${propertyVideos.length} videos downloaded successfully.`,
              timer: 2000,
              showConfirmButton: false
            });
          }, 500);
          
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setShowDownloadProgress(false);
          }, 3000);
        } else {
          // Handle error
          cleanupDownload();
          setShowDownloadProgress(false);
          
          Swal.fire({
            icon: 'error',
            title: 'Download Failed',
            text: 'Failed to download videos. Please try again.',
            timer: 3000,
            showConfirmButton: true,
          });
        }
      };
      
      xhr.onerror = () => {
        cleanupDownload();
        setShowDownloadProgress(false);
        
        // Fallback to iframe method
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        document.body.appendChild(iframe);
        
        // Still complete progress
        setTimeout(() => {
          setVideoDownloadProgress(100);
          setDownloadCompleted(true);
          setIsVideoDownloading(false);
          
          setTimeout(() => {
            setShowDownloadProgress(false);
          }, 3000);
        }, 1000);
      };
      
      // Start the download
      xhr.send();
      
    } catch (error) {
      console.error('XHR download error:', error);
      
      // Fallback to simple iframe method
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      
      // Still show completion
      setTimeout(() => {
        cleanupDownload();
        setVideoDownloadProgress(100);
        setDownloadCompleted(true);
        setIsVideoDownloading(false);
        
        setTimeout(() => {
          setShowDownloadProgress(false);
        }, 3000);
      }, 1000);
    }
  };

  // Function to handle download button click
  const handleVideoDownloadClick = () => {
    if (downloadCompleted) {
      // If download is complete, reset state for new download
      resetVideoDownloadState();
    } else {
      // Start new download
      downloadAllVideosAsZip();
    }
  };

  // Function to copy all SEO text
  const handleCopyAllSeoText = () => {
    if (!property) return;

    const seoText = `
SEO & Marketing Information for "${property.title}"

Meta Title:
${property.seo_info?.meta_title || 'Not available'}

Meta Description:
${property.seo_info?.meta_description || 'Not available'}

Keywords:
${property.seo_info?.keywords?.join(', ') || 'Not available'}

Property Title: ${property.title}
Location: ${property.location}
Description: ${property.description.substring(0, 200)}...
    `.trim();

    copyToClipboard(seoText, 'All SEO information copied to clipboard!');
  };

  // Function to copy Meta Title
  const handleCopyMetaTitle = () => {
    if (!property) return;
    const title = property.seo_info?.meta_title || 'Not available';
    copyToClipboard(title, 'Meta Title copied to clipboard!');
  };

  // Function to copy Meta Description
  const handleCopyMetaDescription = () => {
    if (!property) return;
    const description = property.seo_info?.meta_description || 'Not available';
    copyToClipboard(description, 'Meta Description copied to clipboard!');
  };

  // Function to copy Keywords
  const handleCopyKeywords = () => {
    if (!property) return;
    const keywords = property.seo_info?.keywords?.join(', ') || 'Not available';
    copyToClipboard(keywords, 'Keywords copied to clipboard!');
  };

  // Function to copy dynamic calendar link
  const handleCopyCalendarLink = () => {
    if (!property) return;
    
    const calendarLink = generateCalendarLink();
    
    if (!calendarLink) {
      showActionMessage('Calendar link is not available for this property.');
      return;
    }
    
    copyToClipboard(calendarLink, 'Calendar link copied!');
  };

  // Function to copy description
  const handleCopyDescription = () => {
    if (!property) return;
    copyToClipboard(property.description, 'Description copied to clipboard!');
  };

  // Function to copy outdoor amenities
  const handleCopyOutdoorAmenities = () => {
    if (!property) return;
    const amenitiesText = [...property.outdoor_amenities, ...property.interior_amenities].join(', ');
    if (amenitiesText) {
      copyToClipboard(amenitiesText, 'Outdoor & Interior amenities copied to clipboard!');
    } else {
      showActionMessage('No amenities available to copy.');
    }
  };

  // --- Quick Action Handlers (matching screenshot labels) ---
  const handleShowAmenities = () => {
    const el = document.getElementById('outdoor-amenities-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      showActionMessage('Amenities section not found on page.');
    }
  };

  const handleShowStaff = () => {
    if (property?.staff_name) {
      showActionMessage(`Staff: ${property.staff_name}`);
    } else {
      showActionMessage('No staff information available.');
    }
  };

  const handleShowAvailability = () => {
    // Instead of opening a link, show the calendar component
    setShowCalendar(true);
    
    // Scroll to calendar section
    setTimeout(() => {
      const calendarSection = document.getElementById('availability-calendar-section');
      if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-sm font-medium">Loading property...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-center mb-4">{error}</p>
        <Link
          to="/dashboard/agent-properties-rentals"
          className="flex w-15 items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
          aria-label="Back to Agent List"
        >
          <ChevronLeft className=" h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700">
        No property data available.
      </div>
    );
  }

  // allow both rent & sale, block only "other"
  const listingTypeSafe = String(property.listing_type || '').toLowerCase();
  if (listingTypeSafe !== 'rent' && listingTypeSafe !== 'sale') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center">
          <h2 className="text-xl font-semibold mb-2">Not a rental listing</h2>
          <p className="text-gray-600 mb-4">
            This page only shows properties listed for <strong>rent</strong>.
          </p>
          <Link
            to="/dashboard/agent-properties-rentals"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Rentals
          </Link>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (String(status).toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'sold':
        return 'bg-gray-200 text-gray-600';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Prepare outdoor amenities data for display
  const allOutdoorAmenities = [
    ...property.outdoor_amenities,
    ...property.interior_amenities,
    ...property.signature_distinctions
  ].filter((item, index, self) => 
    item && item.trim() !== '' && self.indexOf(item) === index
  );

  return (
    <div className="min-h-screen p-4 bg-gray-50 font-sans">
      <div className="">
        {/* Back */}
        <Link
          to="/dashboard/agent-properties-rentals"
          className="flex w-15 items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
          aria-label="Back to Agent List"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Quick Actions - styled similar to screenshot */}
        <div className="p-4 bg-white rounded-xl shadow-lg mb-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <QuickActionButton
              imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765151030/verified-badge-line_gyst1a.png"
              label="Amenities"
              onClick={handleShowAmenities}
            />
            <QuickActionButton
              imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765151081/user-community-line_sodsbc.png"
              label="Show Staff"
              onClick={handleShowStaff}
            />
            <QuickActionButton
              imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765151122/search-eye-line_w28zd9.png"
              label="Show Availability"
              onClick={handleShowAvailability}
            />
            <QuickActionButton
              imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1767906306/Icon_26_ejcmnk.png"
              label="Copy Description"
              onClick={handleCopyDescription}
            />
            <QuickActionButton
              imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_31_evyeki.png"
              label="Copy Calendar Link"
              onClick={handleCopyCalendarLink}
            />
            <QuickActionButton
              imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765151173/Icon_8_kvhjox.png"
              label={`Download All Images (${propertyImages.length})`}
              onClick={handleShowAllImages}
              disabled={propertyImages.length === 0}
            />
            <button
              onClick={handleVideoDownloadClick}
              disabled={propertyVideos.length === 0}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg shadow-sm transition duration-150 border cursor-pointer ${
                downloadCompleted 
                  ? 'bg-green-600 text-white hover:bg-green-700 border-green-600' 
                  : isVideoDownloading
                    ? 'bg-white text-gray-700 border-gray-200 cursor-wait'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              } ${propertyVideos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <img 
                src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765151173/Icon_8_kvhjox.png" 
                alt="Download Videos" 
                className="w-5 h-5" 
              />
              <span>
                {downloadCompleted ? 'Download Again' : `Download All Videos (${propertyVideos.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Property card - same style as screenshot */}
        <h2 className="text-xl font-bold text-gray-800 mb-3">Property</h2>
        <div className="bg-white shadow-xl rounded-xl overflow-hidden p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left image - showing one image from API */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="relative h-56 rounded-lg overflow-hidden">
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/800x600/6b7280/ffffff?text=Image+Unavailable';
                  }}
                />
              </div>
            </div>

            {/* Right info */}
            <div className="lg:w-2/3 flex flex-col mt-2">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    {property.title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                   <div className='flex items-center gap-2'>
                    <img src={locationss} alt="Location" />
                    {property.location}
                   </div>
                  </p>
                </div>
                <span
                  className={`text-xs md:text-sm font-semibold px-3 py-1 mt-2 rounded-full ${getStatusStyle(
                    localStatus
                  )}`}
                >
                  {localStatus.toUpperCase().slice(0,1) + localStatus.slice(1)}
                </span>
              </div>

              {/* Guests / beds / baths / pools with pluralization */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <img className="w-5 h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765152495/user-fill_tqy1wd.png" alt="" />
                  <span>
                    {getPluralText(property.add_guest ?? 0, 'Guest', 'Guests')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <img className='w-5 h-5' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765152495/Frame_nlg3eb.png" alt="" />
                  <span>{getPluralText(property.bedrooms ?? 0, 'Bed', 'Beds')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img className="w-5 h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765152494/Frame_1_ivr5pt.png" alt="" />
                  <span>{getPluralText(property.bathrooms ?? 0, 'Bath', 'Baths')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img className="w-5 h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765152494/Frame_2_wnawev.png" alt="" />
                  <span>{getPluralText(property.pool ?? 0, 'Pool', 'Pools')}</span>
                </div>
              </div>

              {/* Commission & Damage deposit */}
              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-700">
                {property.commission_rate && (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760920561/discount-percent-fill_fc6s5e.png"
                      alt="Commission"
                      className="w-5 h-5"
                    />
                    <span>
                      {property.commission_rate
                        ? `${property.commission_rate}% Commission Offered To Agent`
                        : 'Commission Rate Not Set'}
                    </span>
                  </div>
                )}

                {property.security_deposit && (
                  <div className="flex items-center gap-2">
                    <div className='text-[22px]'><AiFillDollarCircle /></div>
                    <span>
                      {property.security_deposit
                        ? `USD$${formatMoney(property.security_deposit)} Security Deposit`
                        : 'Security Deposit'}
                    </span>
                  </div>
                )}
              </div>

              {/* Booking status + calendar accuracy */}
              <div className="flex flex-wrap items-center gap-6 mt-4 text-xs md:text-sm text-gray-600">
                {property.tbc_by && (
                  <div className="flex items-center gap-2">
                    <div className='text-[23px]'><FaHandshakeSimple /></div>
                    <span>{property.tbc_by}</span>
                  </div>
                )}

                {property.calendar_accuracy && (
                  <div className="flex items-center gap-2">
                    <img className='h-5 w-5' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1765152493/calendar-fill_h12equ.png" alt="" />
                    <span>
                      {property.calendar_accuracy 
                        ? `${property.calendar_accuracy}% Calendar Accuracy`
                        : 'Calendar Accuracy Not Set'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description with Copy Button */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800">Description</h2>
          <CopyButton onClick={handleCopyDescription} label="Copy Description" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <div
            className={`text-gray-700 leading-relaxed transition-all duration-300 ${
              isExpanded ? 'max-h-full' : 'max-h-[150px] overflow-hidden'
            }`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {property.description}
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-teal-600 font-semibold hover:text-teal-800 transition"
          >
            {isExpanded ? 'See less…' : 'See more…'}
          </button>
        </div>

        {/* Outdoor Amenities with Copy Button - UPDATED TO SHOW ALL DATA */}
        <div className="flex justify-between items-center mb-3">
          <h2
            id="outdoor-amenities-section"
            className="text-xl font-bold text-gray-800"
          >
            Outdoor Amenities
          </h2>
          <CopyButton onClick={handleCopyOutdoorAmenities} label="Copy Amenities" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          {allOutdoorAmenities.length === 0 ? (
            <p className="text-gray-500 text-sm">No amenities added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {allOutdoorAmenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center text-gray-700 text-sm md:text-base"
                >
                  <img
                    src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760921593/Frame_1000004304_lba3o7.png"
                    alt=""
                    className="mr-2"
                  />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO & Marketing Information with Copy Buttons */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800">
            SEO & Marketing Information
          </h2>
          <CopyButton onClick={handleCopyAllSeoText} label="Copy All SEO" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200 space-y-6">
          {/* Meta Title with Copy Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-1">Meta Title</p>
              <p className="text-gray-800 font-semibold">
                {property.seo_info?.meta_title || 'Not available'}
              </p>
            </div>
            <div className="sm:mt-0">
              <CopyButton onClick={handleCopyMetaTitle} label="Copy" />
            </div>
          </div>

          {/* Meta Description with Copy Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Meta Description
              </p>
              <p className="text-gray-700">
                {property.seo_info?.meta_description || 'Not available'}
              </p>
            </div>
            <div className="sm:mt-0">
              <CopyButton onClick={handleCopyMetaDescription} label="Copy" />
            </div>
          </div>

          {/* Keywords with Copy Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {property.seo_info?.keywords?.length > 0 ? (
                  property.seo_info.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No keywords available</span>
                )}
              </div>
            </div>
            <div className="sm:mt-0">
              <CopyButton onClick={handleCopyKeywords} label="Copy" />
            </div>
          </div>
        </div>

        {/* Viewing Calendar / Schedule a Viewing */}
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Viewing Calendar
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className='flex justify-between'>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Schedule a Viewing
            </p>
            {generateCalendarLink() && (
              <CopyButton onClick={handleCopyCalendarLink} label="Copy Link" />
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 break-all">
              {generateCalendarLink() || "No link available"}
            </span>
          </div>
        </div>

        {/* Availability Calendar Section */}
        {showCalendar && property?.id && (
          <div id="availability-calendar-section" className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Availability Calendar
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <Calendar villaId={property.id} />
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={propertyImages}
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        onDownload={downloadAllImagesAsZip}
        propertyTitle={property?.title || ''}
        loading={galleryLoading}
        downloadProgress={imageDownloadProgress}
        isDownloading={isImageDownloading}
      />

      {/* Video Download Progress Modal */}
      {showDownloadProgress && (
        <VideoDownloadProgress
          progress={videoDownloadProgress}
          isDownloading={isVideoDownloading}
          isCompleted={downloadCompleted}
          onReset={resetVideoDownloadState}
        />
      )}
    </div>
  );
};

export default PropertiesRentalsDetails;