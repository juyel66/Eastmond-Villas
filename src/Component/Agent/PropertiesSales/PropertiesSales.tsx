import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import Swal from 'sweetalert2';

/**
 * PropertiesSales.tsx
 * - Fetches sale properties from: ${API_BASE}/api/villas/agent/properties/?listing_type=sale
 * - Shows ONLY properties assigned to the current agent
 * - View Details links to: /dashboard/agent-property-sales-details/:id
 * - Pagination support with page numbers
 * - Image gallery modal with bulk download functionality
 */

// --- TYPE DEFINITIONS ---
interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  pool: number;
  status: 'Published' | 'draft' | 'pending_review' | 'pending';
  imageUrl: string;
  description?: string | null;
  calendar_link?: string | null;
  _raw?: any;
  listing_type?: 'sale' | 'rent' | 'other';
  assigned_agent?: number | null;
  slug?: string | null;
}

interface PropertyImage {
  image: string;
  alt_text?: string;
  is_main?: boolean;
  source?: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
  page_size: number;
}

// --- API base (defaults to your server) ---
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, '') ||
  'https://api.eastmondvillas.com';

// --- IMAGE GALLERY MODAL COMPONENT ---
interface ImageGalleryModalProps {
  images: PropertyImage[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: () => void;
  propertyTitle: string;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ 
  images, 
  isOpen, 
  onClose, 
  onConfirmDownload,
  propertyTitle 
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
              {propertyTitle} - Images ({images.length} images found)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div 
                key={index} 
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-100"
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Image {index + 1}
                  </p>
                  {img.source && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Source: {img.source}
                    </p>
                  )}
                  <div className="mt-2">
                    <a
                      href={img.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Open full image →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                <strong>Total images:</strong> {images.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                All images will be downloaded as a ZIP file
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
                onClick={() => {
                  onConfirmDownload();
                  onClose();
                }}
                className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All Images
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PRICE FORMATTER ---
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Placeholder image
const PLACEHOLDER_IMAGE =
  'https://placehold.co/400x300/D1D5DB/4B5563?text=NO+IMAGE';

// --- LOADING SPINNER (brand-style) ---
const LoadingState: React.FC = () => (
  <div className="flex justify-center items-center py-10">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
      <p className="text-sm text-gray-600">Loading your sales properties…</p>
    </div>
  </div>
);

// --- EMPTY / NO DATA CARD ---
interface EmptyStateCardProps {
  loadError: string | null;
  searchTerm: string;
  onRetry: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  loadError,
  searchTerm,
  onRetry,
}) => {
  const hasSearch = searchTerm.trim().length > 0;
  const isError = Boolean(loadError);

  const title = isError
    ? 'Unable to load sales'
    : hasSearch
      ? 'No sales match your search'
      : 'No sales properties assigned';

  const description = isError
    ? 'Something went wrong while contacting the server. Please try again in a moment.'
    : hasSearch
      ? 'Try adjusting your search term or clearing the search box to see all available sales properties.'
      : 'Once sales properties are assigned to your account, they will appear here.';

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-gray-500 text-xl">🏡</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isError && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Retry loading sales
          </button>
        )}

        {hasSearch && (
          <button
            onClick={() => (window.location.href = window.location.pathname)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Clear search
          </button>
        )}
      </div>

      {isError && (
        <div className="mt-4 text-xs text-gray-400 max-w-md mx-auto">
          <strong>Unauthorized Access</strong>   
          <Link to="" className="underline">
            {' '}
            Please Logout and login again.
          </Link>
        </div>
      )}
    </div>
  );
};

// --- PROPERTY CARD (same look, used for sales) ---
const PropertyCard: React.FC<{ 
  property: Property,
  onShowImages: (propertyId: number, title: string) => Promise<void>
}> = ({ property, onShowImages }) => {
  const {
    id,
    title,
    address,
    price,
    bedrooms,
    bathrooms,
    pool,
    status,
    imageUrl,
    slug,
  } = property;

  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const StatusBadge = ({ status }: { status: Property['status'] }) => {
    let bgColor = 'bg-gray-100 text-gray-700';
    if (status.toLocaleLowerCase() === 'published')
      bgColor = 'bg-green-100 text-green-700';
    else if (status === 'draft') bgColor = 'bg-yellow-100 text-yellow-700';
    else if (status === 'pending_review' || status === 'pending')
      bgColor = 'bg-blue-100 text-blue-700';
    return (
      <span
        className={`text-xs font-semibold py-1 px-3 rounded-full ${bgColor}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Function to generate dynamic calendar link from slug
  const generateCalendarLink = (): string => {
    if (slug) {
      // Format the slug: convert to lowercase, replace spaces with hyphens
      const formattedSlug = slug
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');

      return `https://www.eastmondvillas.com/dashboard/properties/ical-link/${formattedSlug}/bookings.ics`;
    }
    return '';
  };

  const copyToClipboard = async (text: string, action: string) => {
    try {
      if (!text || String(text).trim() === '') {
        alert(`${action} is not available for ${title}`);
        return;
      }
      await navigator.clipboard.writeText(String(text));
      alert(`${action} copied for ${title}`);
    } catch (err) {
      try {
        const el = document.createElement('textarea');
        el.value = String(text);
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert(`${action} copied for ${title}`);
      } catch {
        alert(`Failed to copy ${action}`);
      }
    }
  };

  // Function to fetch all images for a property
  const fetchAllImages = async (propertyId: number): Promise<PropertyImage[]> => {
    setIsLoadingImages(true);
    try {
      // Fetch property details to get all images
      const url = `${API_BASE.replace(/\/+$/, '')}/villas/properties/${encodeURIComponent(propertyId)}/`;
      
      const headers: HeadersInit = {
        Accept: 'application/json',
      };

      try {
        const token =
          localStorage.getItem('auth_access') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn('Token error:', e);
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Failed to fetch property details (status ${res.status}).`);
      
      const propertyData = await res.json();
      
      // Collect all images from API response
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
              image: img.image,
              alt_text: img.alt_text || `${propertyData.title || 'Property'} - Media Image ${index + 1}`,
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

      console.log(`=== All Images for ${title} ===`);
      console.log('Total images found:', images.length);
      images.forEach((img, index) => {
        console.log(`[${index + 1}] ${img.image}`);
        console.log(`    Source: ${img.source}`);
      });

      return images;
    } catch (error) {
      console.error('Error fetching property images:', error);
      throw error;
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Function to download all images as zip
  const downloadAllImagesAsZip = async (images: PropertyImage[]) => {
    if (images.length === 0) {
      alert('No images available to download.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Show progress bar immediately
    setTimeout(() => {
      if (downloadProgress === 0) {
        setDownloadProgress(5);
      }
    }, 100);

    try {
      const zip = new JSZip();
      const imageFolder = zip.folder(`${title.replace(/\s+/g, '_')}_images`);
      
      if (!imageFolder) {
        throw new Error('Failed to create zip folder');
      }

      let completed = 0;
      const totalItems = images.length;
      
      // Download each image and add to zip
      const downloadPromises = images.map(async (img, index) => {
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
            setDownloadProgress(progress);
            return null;
          }
          
          const blob = await response.blob();
          const extension = blob.type.split('/')[1] || 'jpg';
          const fileName = `${title.replace(/\s+/g, '_')}_image_${index + 1}.${extension}`;
          
          // Update progress
          completed++;
          const progress = Math.round((completed / totalItems) * 95) + 5;
          setDownloadProgress(progress);
          
          return { fileName, blob };
        } catch (error) {
          console.error(`Error downloading image ${index + 1}:`, error);
          completed++;
          const progress = Math.round((completed / totalItems) * 95) + 5;
          setDownloadProgress(progress);
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
      zip.generateAsync({ type: 'blob' }, (metadata) => {
        // Update progress based on zip generation
        if (metadata.percent) {
          const zipProgress = 5 + (metadata.percent * 0.95);
          setDownloadProgress(zipProgress);
        }
      }).then((content) => {
        // Complete progress
        setDownloadProgress(100);
        
        // Create download link and trigger download
        const blobUrl = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${title.replace(/\s+/g, '_')}_images.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        
        // Show success message
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Downloaded ${images.length} images`,
            timer: 2000,
            showConfirmButton: false
          });
        }, 500);
        
        // Reset progress after completion
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(0);
        }, 1000);
      });

    } catch (error) {
      console.error('Error creating zip file:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      alert('Failed to create zip file. Please try again.');
    }
  };

  // Handle show images button click
  const handleShowImages = async () => {
    try {
      setIsLoadingImages(true);
      const images = await fetchAllImages(id);
      
      // Check if images were found
      if (images.length === 0) {
        alert('No images found for this property.');
        return;
      }
      
      // Pass images to parent component to show in modal
      await onShowImages(id, title);
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Failed to load images. Please try again.');
    } finally {
      setIsLoadingImages(false);
    }
  };

  return (
    <div
      className="bg-white p-5 rounded-xl shadow-md border border-gray-100 
flex flex-col md:flex-row gap-5 mb-6 w-full"
    >
      {/* Image */}
      <div className="w-full md:w-48 lg:w-52 h-44 flex-shrink-0 mx-auto md:mx-0">
        <img
          src={imageUrl ?? PLACEHOLDER_IMAGE}
          alt={title}
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300/D1D5DB/4B5563?text=NO+IMAGE';
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div className="text-center md:text-left">
          {/* Title + Status */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-2">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {title}
            </h2>

            <div className="flex justify-center md:justify-end">
              <StatusBadge
                status={status.charAt(0).toUpperCase() + status.slice(1)}
              />
            </div>
          </div>

          {/* Address */}
          <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start mb-3">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            {address}
          </p>

          {/* Property Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase">Price</p>
              <p className="font-semibold text-gray-800">
                ${formatPrice(price)}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase">{bedrooms == 1 ? "Bedroom" : "Bedrooms"}</p>
              <p className="font-semibold text-gray-800">{bedrooms}</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase">{bathrooms == 1 ? "Bathroom" : "Bathrooms"}</p>
              <p className="font-semibold text-gray-800">{bathrooms}</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase">{pool ==1 ? "Pool" : "Pools"}</p>
              <p className="font-semibold text-gray-800">{pool}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/agent-property-sales-details/${id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium 
        text-gray-700 w-full bg-white border border-gray-300 rounded-lg 
        hover:bg-gray-50 transition"
          >
            <img
              src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_29_mqukty.png"
              className="h-4 w-4"
            />
            View Details
          </Link>

          <button
            onClick={() =>
              copyToClipboard(
                property.description ?? `${title} - ${address}`,
                'Description'
              )
            }
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium 
        text-gray-700 w-full bg-white border border-gray-300 rounded-lg 
        hover:bg-gray-50 transition"
          >
            <img
              src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_30_lfzqbf.png"
              className="h-4 w-4"
            />
            Copy Description
          </button>

          <button
            onClick={() => {
              const calendarLink = generateCalendarLink();
              if (calendarLink) {
                copyToClipboard(calendarLink, 'Calendar Link');
              } else {
                alert(`Calendar link is not available for ${title}.`);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium 
        text-gray-700 w-full bg-white border border-gray-300 rounded-lg 
        hover:bg-gray-50 transition"
          >
            <img
              src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_31_evyeki.png"
              className="h-4 w-4"
            />
            Copy Calendar Link
          </button>

          <button
            onClick={handleShowImages}
            disabled={isLoadingImages || isDownloading}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium 
        w-full border border-gray-300 rounded-lg transition relative ${
          isLoadingImages || isDownloading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
          >
            {isLoadingImages ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1"></div>
                <span>Loading...</span>
              </>
            ) : isDownloading ? (
              <>
                <div className="w-4 h-4 mr-1">
                  <div className="w-full h-full border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <img
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_32_a4vr39.png"
                  className="h-4 w-4"
                />
                <span>Download Images</span>
              </>
            )}
          </button>
        </div>
        
        {/* Download Progress Bar */}
        {isDownloading && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Downloading images...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PAGINATION COMPONENT ---
interface PaginationProps {
  pagination: PaginationInfo | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
  loading,
}) => {
  if (!pagination || pagination.total_pages <= 1) return null;

  const totalPages = pagination.total_pages;
  const pagesToShow = 5; // Show 5 page numbers at a time

  // Calculate which page numbers to show
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  // Adjust if we're near the end
  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {pagination.count > 0 ? (currentPage - 1) * 20 + 1 : 0} -{' '}
        {Math.min(currentPage * 20, pagination.count)} of {pagination.count}{' '}
        properties
      </div>

      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
            currentPage === 1 || loading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                  currentPage === 1
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                currentPage === page
                  ? 'bg-teal-600 text-white '
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                  currentPage === totalPages
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
            currentPage === totalPages || loading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT (Sales) ---
type Props = {
  agentId?: number | null;
};

const PropertiesSales: React.FC<Props> = ({
  agentId: propAgentId = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastFetchAt, setLastFetchAt] = useState<number | null>(null);

  // State for image gallery modal
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentPropertyImages, setCurrentPropertyImages] = useState<PropertyImage[]>([]);
  const [currentPropertyTitle, setCurrentPropertyTitle] = useState('');
  const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Function to fetch images for a property
  const fetchPropertyImages = async (propertyId: number, title: string): Promise<PropertyImage[]> => {
    try {
      const url = `${API_BASE.replace(/\/+$/, '')}/villas/properties/${encodeURIComponent(propertyId)}/`;
      
      const headers: HeadersInit = {
        Accept: 'application/json',
      };

      try {
        const token =
          localStorage.getItem('auth_access') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn('Token error:', e);
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Failed to fetch property details (status ${res.status}).`);
      
      const propertyData = await res.json();
      
      // Collect all images from API response
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
              image: img.image,
              alt_text: img.alt_text || `${propertyData.title || 'Property'} - Media Image ${index + 1}`,
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
    } catch (error) {
      console.error('Error fetching property images:', error);
      throw error;
    }
  };

  // Function to download images as zip
  const downloadImagesAsZip = async (images: PropertyImage[]) => {
    if (images.length === 0) {
      alert('No images available to download.');
      return;
    }

    try {
      const zip = new JSZip();
      const imageFolder = zip.folder(`${currentPropertyTitle.replace(/\s+/g, '_')}_images`);
      
      if (!imageFolder) {
        throw new Error('Failed to create zip folder');
      }

      let completed = 0;
      const totalItems = images.length;
      
      // Download each image and add to zip
      const downloadPromises = images.map(async (img, index) => {
        try {
          let imageUrl = img.image;
          if (imageUrl.startsWith('/')) {
            imageUrl = `${API_BASE.replace(/\/api\/?$/, '')}${imageUrl}`;
          }
          
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image ${index + 1}: ${imageUrl}`);
            completed++;
            return null;
          }
          
          const blob = await response.blob();
          const extension = blob.type.split('/')[1] || 'jpg';
          const fileName = `${currentPropertyTitle.replace(/\s+/g, '_')}_image_${index + 1}.${extension}`;
          
          completed++;
          return { fileName, blob };
        } catch (error) {
          console.error(`Error downloading image ${index + 1}:`, error);
          completed++;
          return null;
        }
      });

      const downloadedImages = await Promise.all(downloadPromises);
      
      downloadedImages.forEach((item) => {
        if (item) {
          imageFolder.file(item.fileName, item.blob);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create download link and trigger download
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${currentPropertyTitle.replace(/\s+/g, '_')}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Downloaded ${images.length} images`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Failed to create zip file. Please try again.');
    }
  };

  // Handle show images from property card
  const handleShowImages = async (propertyId: number, title: string) => {
    try {
      const images = await fetchPropertyImages(propertyId, title);
      
      if (images.length === 0) {
        alert('No images found for this property.');
        return;
      }
      
      setCurrentPropertyImages(images);
      setCurrentPropertyTitle(title);
      setCurrentPropertyId(propertyId);
      setShowImageGallery(true);
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Failed to load images. Please try again.');
    }
  };

  const loadProperties = async (
    page: number = 1,
    opts?: {
      ignoreResults?: { current: boolean };
    }
  ) => {
    setLoading(true);
    setLoadError(null);

    try {
      // ✅ FETCHING SALE PROPERTIES FROM AGENT SPECIFIC API WITH PAGINATION
      const url = `${API_BASE.replace(/\/+$/, '')}/villas/agent/properties/?listing_type=sale&page=${page}`;

      console.log('[Sales] Fetching from URL:', url);

      // Add authorization headers
      const headers: HeadersInit = {
        Accept: 'application/json',
      };

      try {
        const token =
          localStorage.getItem('auth_access') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn('Token error:', e);
      }

      const res = await fetch(url, {
        headers,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status} ${text}`.trim());
      }

      const data = await res.json();

      // Extract properties from results array
      const list = Array.isArray(data?.results) ? data.results : [];

      console.log('[Sales] API Response count:', list.length, 'Page:', page);

      // Set pagination info
      const paginationInfo: PaginationInfo = {
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        current_page: page,
        total_pages: Math.ceil((data.count || 0) / 20), // Assuming 20 items per page
        page_size: 20,
      };

      // Map API response to our Property interface
      const mapped: Property[] = list.map((p: any) => {
        // Get first media image
        let img = PLACEHOLDER_IMAGE;
        if (
          p.media_images &&
          Array.isArray(p.media_images) &&
          p.media_images.length > 0
        ) {
          img = p.media_images[0]?.image || PLACEHOLDER_IMAGE;
        }

        // Parse price - handle string like "751.00"
        const priceVal = parseFloat(p.price || p.price_display || '0') || 0;

        // Parse bedrooms and bathrooms - handle string like "76.0"
        const bedroomsVal = parseFloat(p.bedrooms || '0') || 0;
        const bathroomsVal = parseFloat(p.bathrooms || '0') || 0;

        // Pool as number
        const poolVal = parseInt(p.pool || '0', 10) || 0;

        // Address
        const address = p.address || p.city || 'No address provided';

        // Status normalization
        let statusVal: Property['status'] = 'draft';
        const rawStatus = (p.status || '').toLowerCase();
        if (rawStatus === 'published') statusVal = 'Published';
        else if (rawStatus === 'pending_review') statusVal = 'pending_review';
        else if (rawStatus === 'pending') statusVal = 'pending';
        else statusVal = 'draft';

        // Listing type
        const listingTypeRaw = String(p.listing_type || '').toLowerCase();
        let listingType: Property['listing_type'] = 'other';
        if (listingTypeRaw === 'sale') listingType = 'sale';
        else if (listingTypeRaw === 'rent') listingType = 'rent';

        // Extract slug - check multiple possible fields
        const slug = p.slug || p.name_slug || p.property_slug || null;

        return {
          id: Number(p.id || 0),
          title: p.title || 'Untitled Property',
          address: address,
          price: priceVal,
          bedrooms: bedroomsVal,
          bathrooms: bathroomsVal,
          pool: poolVal,
          status: statusVal,
          imageUrl: img,
          description: p.description || null,
          calendar_link: p.calendar_link || null,
          _raw: p,
          listing_type: listingType,
          assigned_agent: p.assigned_agent || null,
          slug: slug,
        };
      });

      if (opts?.ignoreResults?.current) return;

      setProperties(mapped);
      setPagination(paginationInfo);
      setCurrentPage(page);
      setLastFetchAt(Date.now());
    } catch (err: any) {
      console.error('Failed to load properties', err);
      if (opts?.ignoreResults?.current) return;
      setProperties([]);
      setPagination(null);
      setLoadError(err?.message ?? 'Failed to load properties.');
    } finally {
      if (!opts?.ignoreResults?.current) {
        setLoading(false);
      } else {
        try {
          setLoading(false);
        } catch {
          // ignore
        }
      }
    }
  };

  useEffect(() => {
    const ignore = { current: false };
    loadProperties(1, { ignoreResults: ignore });

    return () => {
      ignore.current = true;
    };
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.total_pages)) return;
    loadProperties(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    const ignore = { current: false };
    loadProperties(1, { ignoreResults: ignore });
  };

  // IMPORTANT: This API already returns ONLY properties assigned to the current agent
  // So no need to filter by agent ID in frontend
  const filteredProperties = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return properties.filter((p) => {
      // ✅ Already filtered by backend to show only agent's properties

      if (!lower) return true;

      return (
        p.title.toLowerCase().includes(lower) ||
        p.address.toLowerCase().includes(lower)
      );
    });
  }, [searchTerm, properties]);

  const shouldShowNoData =
    !loading &&
    ((Array.isArray(properties) && properties.length === 0) ||
      filteredProperties.length === 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Properties - Sales
          </h1>
          <p className="text-gray-600 text-sm">
            Access assigned sales properties and marketing materials.
          </p>
        </header>

        <div className="relative mb-8">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sales properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {loading && <LoadingState />}

        {!loading && shouldShowNoData && (
          <EmptyStateCard
            loadError={loadError}
            searchTerm={searchTerm}
            onRetry={handleRetry}
          />
        )}

        {!loading && filteredProperties.length > 0 && (
          <>
            {filteredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                onShowImages={handleShowImages}
              />
            ))}

            {/* Pagination Component */}
            <Pagination
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
        )}
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={currentPropertyImages}
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        onConfirmDownload={() => downloadImagesAsZip(currentPropertyImages)}
        propertyTitle={currentPropertyTitle}
      />

      {/* Responsive tweaks; keep design unchanged */}
      <style>
        {`
          @media (min-width: 1200px) and (max-width: 1450px) {
            .flex-wrap button,
            .flex-wrap a {
              padding: 0.5rem 0.7rem !important;
              font-size: 0.85rem !important;
            }
            .flex-wrap img {
              height: 14px !important;
              width: 14px !important;
            }
            .md\\:w-56, .lg\\:w-52 {
              width: 11rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PropertiesSales;