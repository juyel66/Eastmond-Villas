import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * PropertiesRentals.tsx
 * - Fetches rent properties from: ${API_BASE}/api/villas/agent/properties/?listing_type=rent
 * - Shows ONLY properties assigned to the current agent
 * - View Details links to: /dashboard/agent-property-rentals-details/:id
 * - Pagination support with page numbers
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
  status: 'published' | 'draft' | 'pending_review' | 'pending';
  imageUrl: string;
  description?: string | null;
  calendar_link?: string | null;
  _raw?: any;
  listing_type?: 'sale' | 'rent' | 'other';
  assigned_agent?: number | null;
  slug?: string | null; // Added slug field
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
      <p className="text-sm text-gray-600">Loading your rental properties…</p>
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
    ? 'Unable to load rentals'
    : hasSearch
      ? 'No Rentals match your search'
      : 'No Rentals properties assigned';

  const description = isError
    ? 'Something went wrong while contacting the server. Please try again in a moment.'
    : hasSearch
      ? 'Try adjusting your search term or clearing the search box to see all available rental properties.'
      : 'Once rentals properties are assigned to your account, they will appear here.';

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
            Retry loading rentals
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
          <strong>Technical details:</strong> {loadError}
        </div>
      )}
    </div>
  );
};

// --- PROPERTY CARD (same look, used for rentals) ---
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
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

  const StatusBadge = ({ status }: { status: Property['status'] }) => {
    let bgColor = 'bg-gray-100 text-gray-700';
    if (status.toLocaleLowerCase() === 'published') bgColor = 'bg-green-100 text-green-700';
    else if (status === 'draft') bgColor = 'bg-yellow-100 text-yellow-700';
    else if (status === 'pending_review' || status === 'pending') bgColor = 'bg-blue-100 text-blue-700';
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

  const downloadImage = async (imgUrl?: string | null) => {
    if (!imgUrl) {
      alert('No image available to download.');
      return;
    }
    try {
      const url =
        String(imgUrl).startsWith('http') || String(imgUrl).startsWith('//')
          ? String(imgUrl)
          : `${API_BASE.replace(/\/api\/?$/, '')}${
              imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl
            }`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = blob.type.split('/')[1] || 'jpg';
      a.download = `${
        title.replace(/\s+/g, '-').toLowerCase() || 'image'
      }.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image.');
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 
flex flex-col md:flex-row gap-5 mb-6 w-full">

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
            USD{formatPrice(price)}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-xs uppercase">Bedrooms</p>
          <p className="font-semibold text-gray-800">{bedrooms}</p>
        </div>

        <div>
          <p className="text-gray-500 text-xs uppercase">Bathrooms</p>
          <p className="font-semibold text-gray-800">{bathrooms}</p>
        </div>

        <div>
          <p className="text-gray-500 text-xs uppercase">Pools</p>
          <p className="font-semibold text-gray-800">{pool}</p>
        </div>
      </div>
    </div>

    {/* Buttons */}
    <div
      className="flex flex-col lg:flex-row items-stretch justify-between gap-3 mt-4 pt-4 border-t border-gray-100"
    >
      <Link
        to={`/dashboard/agent-property-rentals-details/${id}`}
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
        onClick={() => downloadImage(property.imageUrl)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium 
        text-gray-700 w-full bg-white border border-gray-300 rounded-lg 
        hover:bg-gray-50 transition"
      >
        <img
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_32_a4vr39.png"
          className="h-4 w-4"
        />
        Download Images
      </button>
    </div>
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
              {startPage > 2 && (
                <span className="px-2 text-gray-400">...</span>
              )}
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

// --- MAIN COMPONENT (Rentals) ---
type Props = {
  agentId?: number | null;
};

const PropertiesRentals: React.FC<Props> = ({ agentId: propAgentId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastFetchAt, setLastFetchAt] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const loadProperties = async (page: number = 1, opts?: {
    ignoreResults?: { current: boolean };
  }) => {
    setLoading(true);
    setLoadError(null);

    try {
      // ✅ FETCHING RENT PROPERTIES FROM AGENT SPECIFIC API WITH PAGINATION
      const url = `${API_BASE.replace(/\/+$/, '')}/villas/agent/properties/?listing_type=rent&page=${page}`;
      
      console.log('[Rentals] Fetching from URL:', url);
      
      // Add authorization headers
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      try {
        const token = localStorage.getItem('auth_access') || 
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

      console.log('[Rentals] API Response count:', list.length, 'Page:', page);

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
        if (p.media_images && Array.isArray(p.media_images) && p.media_images.length > 0) {
          img = p.media_images[0]?.image || PLACEHOLDER_IMAGE;
        }
        
        // Parse price - handle string like "751.00"
        const priceVal = parseFloat(p.price || p.price_display || "0") || 0;
        
        // Parse bedrooms and bathrooms - handle string like "76.0"
        const bedroomsVal = parseFloat(p.bedrooms || "0") || 0;
        const bathroomsVal = parseFloat(p.bathrooms || "0") || 0;
        
        // Pool as number
        const poolVal = parseInt(p.pool || "0", 10) || 0;
        
        // Address
        const address = p.address || p.city || 'No address provided';
        
        // Status normalization
        let statusVal: Property['status'] = 'draft';
        const rawStatus = (p.status || '').toLowerCase();
        if (rawStatus === 'published') statusVal = 'published';
        else if (rawStatus === 'pending_review') statusVal = 'pending_review';
        else if (rawStatus === 'pending') statusVal = 'pending';
        else statusVal = 'draft';
        
        // Listing type
        const listingTypeRaw = String(p.listing_type || '').toLowerCase();
        let listingType: Property['listing_type'] = 'other';
        if (listingTypeRaw === 'rent') listingType = 'rent';
        else if (listingTypeRaw === 'sale') listingType = 'sale';
        
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
          slug: slug, // Add slug to property object
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
            Properties - Rentals
          </h1>
          <p className="text-gray-600 text-sm">
            Access assigned rental properties and marketing materials.
          </p>
        </header>

        <div className="relative mb-8">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rental properties..."
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
              <PropertyCard key={property.id} property={property} />
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

export default PropertiesRentals;