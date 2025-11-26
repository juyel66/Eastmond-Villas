// src/features/Properties/PropertiesSalesDetails.tsx
import React, { FC, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Property {
  id?: number;
  title: string;
  status: string;
  listing_type?: 'rent' | 'sale' | 'other';
  location: string;
  image_url: string;
  main_details: { icon_url: string; value: string }[];
  description: string;
  amenities: string[];
  seo_info: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
  viewing_link: string;
  agent_commission?: string;
  contract_link?: string;
  _raw?: any;
}

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

const downloadImage = async (imgUrl?: string | null, title = 'image') => {
  if (!imgUrl) {
    showActionMessage('No image available to download.');
    return;
  }
  try {
    const url =
      String(imgUrl).startsWith('http') || String(imgUrl).startsWith('//')
        ? String(imgUrl)
        : `${API_BASE.replace(/\/api\/?$/, '')}${imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    const ext = blob.type.split('/')[1] || 'jpg';
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download error:', err);
    showActionMessage('Failed to download image.');
  }
};

// --- QUICK ACTION BUTTON ---
interface QuickActionButtonProps {
  imgSrc: string;
  label: string;
  onClick?: () => void;
}
const QuickActionButton: FC<QuickActionButtonProps> = ({ imgSrc, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-100 transition duration-150 border border-gray-200 cursor-pointer"
  >
    <img src={imgSrc} alt={label} className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const PropertiesSalesDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>('draft');

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
        const url = `${API_BASE.replace(/\/+$/, '')}/villas/properties/${encodeURIComponent(id)}/`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) {
          // give a clear error for 404 vs others
          if (res.status === 404) throw new Error('Property not found (404).');
          throw new Error(`Failed to fetch property (status ${res.status}).`);
        }
        const p = await res.json();

        // map server object to local Property shape (safe fallbacks)
        let img = p.main_image_url ?? p.image_url ?? p.imageUrl ?? null;
        if (!img && Array.isArray(p.media_images) && p.media_images.length > 0) {
          img = p.media_images[0]?.image ?? null;
        }
        if (img && img.startsWith('/')) {
          img = `${API_BASE.replace(/\/api\/?$/, '')}${img}`;
        }

        const priceVal = Number(p.price ?? p.price_display ?? p.total_price ?? 0) || 0;

        const address =
          p.address ??
          (p.location ? (typeof p.location === 'string' ? p.location : '') : '') ??
          p.city ??
          '—';

        const mapped: Property = {
          id: Number(p.id ?? p.pk ?? NaN),
          title: p.title ?? p.name ?? 'Untitled',
          status: String(p.status ?? 'draft'),
          listing_type: p.listing_type ?? p.listingType ?? 'sale',
          location: address,
          image_url: img || 'https://placehold.co/800x600/6b7280/ffffff?text=Image+Unavailable',
          main_details:
            p.main_details ??
            (Array.isArray(p.signature_distinctions)
              ? p.signature_distinctions.map((s: string) => ({ icon_url: '', value: s }))
              : []),
          description: p.description ?? p.short_description ?? '',
          amenities: Array.isArray(p.outdoor_amenities) || Array.isArray(p.interior_amenities)
            ? [...(p.outdoor_amenities ?? []), ...(p.interior_amenities ?? [])]
            : p.amenities ?? [],
          seo_info: {
            meta_title: p.seo_title ?? p.seo_info?.meta_title ?? '',
            meta_description: p.seo_description ?? p.seo_info?.meta_description ?? '',
            keywords:
              p.signature_distinctions?.slice?.(0, 4)?.map((k: string) => String(k)) ??
              p.seo_keywords ??
              [],
          },
          viewing_link: p.calendar_link ?? p.viewing_link ?? p.calendar_url ?? '',
          agent_commission: p.agent_commission ?? p.agentCommission ?? undefined,
          contract_link: p.contract_link ?? p.contractLink ?? undefined,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700 text-lg">
        Loading property...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-center mb-4">{error}</p>
        <Link to="/dashboard/agent-properties-sales" className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Sales List
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

  // Sales-only guard
  if ((property.listing_type ?? 'sale') !== 'sale') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center">
          <h2 className="text-xl font-semibold mb-2">Not a sales listing</h2>
          <p className="text-gray-600 mb-4">This page only shows properties listed for <strong>sale</strong>.</p>
          <Link to="/dashboard/agent-properties-sales" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Sales
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

  const handleViewOffer = () => showActionMessage('Open offer modal or route to offers page (placeholder).');
  const handleShowCommission = () => showActionMessage(`Agent commission: ${property.agent_commission ?? 'N/A'}`);
  const handleViewContract = () => {
    if (property.contract_link) window.open(property.contract_link, '_blank', 'noopener');
    else showActionMessage('No contract link available.');
  };
  const handleCopyListingLink = () => copyToClipboard(property.viewing_link, 'Listing link copied!');
  const handleMarkAsSold = () => {
    setLocalStatus('sold');
    showActionMessage('This property has been marked as SOLD (local state only).');
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 font-sans">
      <div className="">
        <Link to="/dashboard/agent-properties-sales"
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
          aria-label="Back to Agent List"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Quick Actions */}
        <div className="p-4 bg-white rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Sales Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <QuickActionButton imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760920013/search-eye-line_fbpuvn.png" label="View Offer" onClick={handleViewOffer} />
            <QuickActionButton imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760920561/discount-percent-fill_fc6s5e.png" label="Agent Commission" onClick={handleShowCommission} />
            <QuickActionButton imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_31_evyeki.png" label="View Contract" onClick={handleViewContract} />
            <QuickActionButton imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760920088/Icon_34_cgp4g7.png" label="Copy Listing Link" onClick={handleCopyListingLink} />
            <QuickActionButton imgSrc="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760920087/Icon_35_dskkg0.png" label="Mark as Sold" onClick={handleMarkAsSold} />
          </div>
        </div>

        {/* Property */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Property</h2>
        <div className="bg-white shadow-xl rounded-xl overflow-hidden p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600/6b7280/ffffff?text=Image+Unavailable"; }}
                />
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">{property.title}</h1>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusStyle(localStatus)}`}>
                  {localStatus}
                </span>
              </div>

              <p className="flex items-center text-lg text-gray-500 font-medium mb-4">
                {property.location}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-gray-700">
                {property.main_details?.map((item, index) => (
                  <div key={index} className="flex items-center whitespace-nowrap">
                    {item.icon_url ? <img src={item.icon_url} className="w-4 h-4 mr-2" alt={item.value} /> : null}
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <div className={`text-gray-700 leading-relaxed transition-all duration-300 ${isExpanded ? 'max-h-full' : 'max-h-[150px] overflow-hidden'}`} style={{ whiteSpace: 'pre-line' }}>
            {property.description}
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition">
            {isExpanded ? 'See less...' : 'See more...'}
          </button>
        </div>

        {/* Amenities */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {property.amenities?.map((amenity, index) => (
              <div key={index} className="flex items-center text-gray-700 text-base">
                <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760921593/Frame_1000004304_lba3o7.png" alt="" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">SEO & Marketing Information</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200 space-y-4">
          <div>
            <p className="text-gray-500 text-sm font-medium">Meta Title</p>
            <p className="text-gray-800 font-semibold">{property.seo_info?.meta_title}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Meta Description</p>
            <p className="text-gray-700">{property.seo_info?.meta_description}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {property.seo_info?.keywords?.map((keyword, i) => (
                <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">{keyword}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Listing Link */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Listing Link</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-500 text-sm font-medium">Open listing or booking link</p>
          <div className="flex items-center gap-2 mt-2">
            <a href={property.viewing_link} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-800 transition break-all cursor-pointer">
              <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760915210/Icon_31_evyeki.png" alt="Link Icon" className="w-4 h-4 mr-2" />
              {property.viewing_link || 'No link available'}
            </a>
            <button
              onClick={() => copyToClipboard(property.viewing_link, 'Listing link copied!')}
              className="px-3 py-1 bg-gray-100 rounded text-xs"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesSalesDetails;
