import React, { useState, useRef, useEffect } from 'react';
import { User, UploadCloud, X, Save, ChevronLeft, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import LocationCreateProperty from './../PropertiesRentals/LocationCreateProperty';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com/api';

// Image Preview Component
const ImagePreview = ({
  image,
  index,
  onRemove,
  onSetPrimary,
  isPrimary,
  type = 'media',
  isExisting = false,
  existingId = null,
}) => {
  return (
    <div className="relative border rounded-xl overflow-hidden h-32 group bg-gray-100">
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={image.url}
          alt={`preview-${index}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load preview image:', image.url);
            e.target.src =
              'https://via.placeholder.com/300x200?text=Image+Not+Found';
            e.target.className = 'w-full h-full object-contain p-2';
          }}
        />
      </div>

      {/* Remove button - for both new and existing images */}
      <button
        onClick={() => onRemove(image.id, existingId)}
        type="button"
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 text-white transition-colors"
        title="Remove image"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Primary badge */}
      {isPrimary && (
        <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">
          Primary
        </span>
      )}

      {/* Set primary button */}
      {!isPrimary && (
        <button
          type="button"
          onClick={() => onSetPrimary(image.id, type)}
          className="absolute left-2 bottom-2 bg-white/80 hover:bg-white text-gray-800 text-xs px-2 py-1 rounded transition-colors"
          title="Set as primary"
        >
          Set Primary
        </button>
      )}

      {/* Existing image badge */}
      {isExisting && (
        <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
          Existing
        </span>
      )}
    </div>
  );
};

// Bedroom Image Preview Component
const BedroomImagePreview = ({
  image,
  index,
  onRemove,
  onSetPrimary,
  isPrimary,
  onNameChange,
  onDescriptionChange,
  isExisting = false,
  existingId = null,
}) => {
  return (
    <div className="space-y-2">
      <div className="relative border rounded-xl overflow-hidden h-32 group bg-gray-100">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={image.url}
            alt={`bedroom-${index}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load bedroom image:', image.url);
              e.target.src =
                'https://via.placeholder.com/300x200?text=Image+Not+Found';
              e.target.className = 'w-full h-full object-contain p-2';
            }}
          />
        </div>

        {/* Remove button - for both new and existing images */}
        <button
          onClick={() => onRemove(image.id, existingId)}
          type="button"
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 text-white transition-colors"
          title="Remove image"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        {/* Primary badge */}
        {isPrimary && (
          <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">
            Primary
          </span>
        )}

        {/* Set primary button */}
        {!isPrimary && (
          <button
            type="button"
            onClick={() => onSetPrimary(image.id, 'bedroom')}
            className="absolute left-2 bottom-2 bg-white/80 hover:bg-white text-gray-800 text-xs px-2 py-1 rounded transition-colors"
            title="Set as primary"
          >
            Set Primary
          </button>
        )}

        {/* Existing image badge */}
        {isExisting && (
          <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
            Existing
          </span>
        )}
      </div>

      <input
        data-bedroom-name-index={index}
        value={image.name || ''}
        onChange={(e) => onNameChange(image.id, e.target.value)}
        placeholder="Bedroom name"
        className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
      />

      <input
        value={image.description || ''}
        onChange={(e) => onDescriptionChange(image.id, e.target.value)}
        placeholder="Bedroom description"
        className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
      />
    </div>
  );
};

const UpdateRentals = ({ editData = null, onClose = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = id || editData?.id;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    getValues,
    watch,
  } = useForm({ mode: 'onTouched' });

  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: '',
  });

  const [mediaImages, setMediaImages] = useState([]);
  const [bedroomImages, setBedroomImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  
  // Store IDs to delete
  const [mediaImagesToDelete, setMediaImagesToDelete] = useState([]);
  const [bedroomImagesToDelete, setBedroomImagesToDelete] = useState([]);
  const [videosToDelete, setVideosToDelete] = useState([]);

  const [signatureList, setSignatureList] = useState(['']);
  const [interiorAmenities, setInteriorAmenities] = useState(['']);
  const [outdoorAmenities, setOutdoorAmenities] = useState(['']);
  const [rules, setRules] = useState(['']);
  const [conciergeRows, setConciergeRows] = useState(['']);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [staffRows, setStaffRows] = useState([{ name: '', details: '' }]);
  const [spotlightRows, setSpotlightRows] = useState([{ title: '', description: '' }]);
  const [bookingRateRows, setBookingRateRows] = useState([
    { rentalPeriod: '', minimumStay: '', ratePerNight: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState('');

  const interiorRefs = useRef([]);
  const outdoorRefs = useRef([]);
  const rulesRefs = useRef([]);
  const signatureRefs = useRef([]);
  const staffNameRefs = useRef([]);
  const spotlightTitleRefs = useRef([]);
  const conciergeRefs = useRef([]);

  // Function to ensure URL is absolute
  const getAbsoluteUrl = (url) => {
    if (!url) return '';

    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('blob:')
    ) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${API_BASE.replace('/api', '')}${url}`;
    }

    return `${API_BASE.replace('/api', '')}/${url}`;
  };

  // Fetch property data on component mount
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) {
        toast.error('Property not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching property data for ID: ${propertyId}`);
        
        const access = localStorage.getItem('auth_access');
        const headers = {
          'Authorization': `Bearer ${access}`,
          'Content-Type': 'application/json',
        };

        const res = await fetch(
          `${API_BASE}/villas/properties/${propertyId}/`,
          { headers }
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch property: ${res.status}`);
        }

        const propertyData = await res.json();
        console.log('Property data received:', propertyData);
        populateFormWithData(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        toast.error(`Failed to load property data: ${err.message}`);
        setTimeout(() => {
          navigate('/dashboard/admin-properties-rentals');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId, navigate]);

  // If editData is passed as prop (from modal), use it
  useEffect(() => {
    if (editData) {
      populateFormWithData(editData);
    }
  }, [editData]);

  // New function to process array fields with empty object handling
  const processArrayField = (fieldData) => {
    if (!fieldData) {
      return [''];
    }
    
    if (Array.isArray(fieldData)) {
      // If array has items, return them, otherwise return empty field
      return fieldData.length > 0 ? fieldData : [''];
    }
    
    if (typeof fieldData === 'object') {
      // If it's an empty object, return empty field
      if (Object.keys(fieldData).length === 0) {
        return [''];
      }
      // If it's an object with values, convert to array
      return Object.values(fieldData).filter(Boolean);
    }
    
    // Default fallback
    return [''];
  };

  const populateFormWithData = (propertyData) => {
    console.log('Populating form with data:', propertyData);
    
    // Populate form fields including youtube_link and calendar_accuracy
    const formData = {
      title: propertyData.title || '',
      description: propertyData.description || '',
      price: propertyData.price || propertyData.price_display || '',
      property_type: propertyData.property_type || 'rentals',
      status: propertyData.status || 'draft',
      priority: propertyData.priority || 'medium',
      add_guest: propertyData.add_guest || '',
      bedrooms: propertyData.bedrooms || '',
      bathrooms: propertyData.bathrooms || '',
      pool: propertyData.pool || '',
      address: propertyData.address || '',
      city: propertyData.city || '',
      calendar_link: propertyData.calendar_link || '',
      seo_title: propertyData.seo_title || '',
      seo_description: propertyData.seo_description || '',
      security_deposit: propertyData.security_deposit || '',
      damage_deposit: propertyData.damage_deposit || '',
      commission_rate: propertyData.commission_rate || '',
      tbc_by: propertyData.tbc_by || '',
      concierge_description: propertyData.concierge_description || '',
      check_in_check_out_policy: propertyData.check_in_check_out_policy || '',
      youtube_link: propertyData.youtube_link || '',
      calendar_accuracy: propertyData.calendar_accuracy || '',
    };
    reset(formData);

    // Populate location
    if (propertyData.latitude && propertyData.longitude) {
      setLocation({
        lat: parseFloat(propertyData.latitude),
        lng: parseFloat(propertyData.longitude),
        address: propertyData.address || '',
      });
    }

    // Populate arrays using the new function
    setSignatureList(processArrayField(propertyData.signature_distinctions));
    setInteriorAmenities(processArrayField(propertyData.interior_amenities));
    setOutdoorAmenities(processArrayField(propertyData.outdoor_amenities));
    setRules(processArrayField(propertyData.rules_and_etiquette));
    setConciergeRows(processArrayField(propertyData.concierge_services));

    setCheckIn(propertyData.check_in || '');
    setCheckOut(propertyData.check_out || '');

    // Staff - ensure at least one empty row
    if (
      propertyData.staff &&
      Array.isArray(propertyData.staff) &&
      propertyData.staff.length > 0
    ) {
      const staffData = propertyData.staff.map((s) => ({
        name: s.name || '',
        details: s.details || '',
      }));
      setStaffRows(staffData.length > 0 ? staffData : [{ name: '', details: '' }]);
    } else {
      setStaffRows([{ name: '', details: '' }]);
    }

    // Spotlight details - ensure at least one empty row
    if (
      propertyData.spotlight_details &&
      Array.isArray(propertyData.spotlight_details) &&
      propertyData.spotlight_details.length > 0
    ) {
      const spotlightData = propertyData.spotlight_details.map((s) => ({
        title: s.title || '',
        description: s.description || '',
      }));
      setSpotlightRows(spotlightData.length > 0 ? spotlightData : [{ title: '', description: '' }]);
    } else {
      setSpotlightRows([{ title: '', description: '' }]);
    }

    // Booking rate - ensure at least one empty row
    if (propertyData.booking_rate && Array.isArray(propertyData.booking_rate)) {
      const rows = [];
      for (let i = 0; i < propertyData.booking_rate.length; i += 3) {
        rows.push({
          rentalPeriod: propertyData.booking_rate[i] || '',
          minimumStay: propertyData.booking_rate[i + 1] || '',
          ratePerNight: propertyData.booking_rate[i + 2] || '',
        });
      }
      setBookingRateRows(
        rows.length > 0
          ? rows
          : [{ rentalPeriod: '', minimumStay: '', ratePerNight: '' }]
      );
    } else {
      setBookingRateRows([{ rentalPeriod: '', minimumStay: '', ratePerNight: '' }]);
    }

    // Handle media images
    const processMediaImages = () => {
      let mediaImgs = [];

      if (propertyData.media_images && Array.isArray(propertyData.media_images)) {
        mediaImgs = propertyData.media_images.map((img, i) => {
          const imageUrl =
            typeof img === 'string' ? img : img.image || img.url || img.file_url;
          const isPrimary =
            typeof img === 'object'
              ? img.is_primary || img.isPrimary || i === 0
              : i === 0;

          return {
            id: `existing-media-${i}`,
            url: getAbsoluteUrl(imageUrl),
            file: null,
            isPrimary: isPrimary,
            originalData: img,
            isExisting: true,
            existingId: img.id || null,
          };
        });
      }

      if (mediaImgs.length === 0 && propertyData.image) {
        mediaImgs.push({
          id: `existing-media-main`,
          url: getAbsoluteUrl(propertyData.image),
          file: null,
          isPrimary: true,
          originalData: { url: propertyData.image, is_primary: true },
          isExisting: true,
          existingId: null,
        });
      }

      setMediaImages(mediaImgs);
    };

    // Handle bedroom images
    const processBedroomImages = () => {
      let bedroomImgs = [];

      if (
        propertyData.bedrooms_images &&
        Array.isArray(propertyData.bedrooms_images)
      ) {
        bedroomImgs = propertyData.bedrooms_images.map((img, i) => {
          const imageUrl =
            typeof img === 'string' ? img : img.image || img.url || img.file_url;
          const isPrimary =
            typeof img === 'object'
              ? img.is_primary || img.isPrimary || i === 0
              : i === 0;
          const name =
            typeof img === 'object'
              ? img.name || img.title || `Bedroom ${i + 1}`
              : `Bedroom ${i + 1}`;
          const description =
            typeof img === 'object'
              ? img.description || img.caption || ''
              : '';

          return {
            id: `existing-bedroom-${i}`,
            url: getAbsoluteUrl(imageUrl),
            file: null,
            isPrimary: isPrimary,
            name: name,
            description: description,
            originalData: img,
            isExisting: true,
            existingId: img.id || null,
          };
        });
      }

      setBedroomImages(bedroomImgs);
    };

    // Handle existing videos
    const processVideos = () => {
      if (propertyData.videos && Array.isArray(propertyData.videos)) {
        const videoUrls = propertyData.videos.map(video => {
          if (typeof video === 'string') return { url: video, id: null };
          return { 
            url: video.video || video.url || video.video_url || '', 
            id: video.id || null 
          };
        }).filter(v => v.url);
        
        setExistingVideos(videoUrls);
      }
    };

    processMediaImages();
    processBedroomImages();
    processVideos();
  };

  const setPrimaryImage = (id, imageType = 'media') => {
    if (imageType === 'media') {
      setMediaImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === id }))
      );
      toast.success('Primary media image set');
    } else {
      setBedroomImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === id }))
      );
      toast.success('Primary bedroom image set');
    }
  };

  const handleMediaImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImgs = files.map((file, i) => {
      const url = URL.createObjectURL(file);
      return {
        id: `new-media-${Date.now()}-${i}`,
        url: url,
        file,
        isPrimary: mediaImages.length === 0, // Set as primary if first image
        isExisting: false,
        existingId: null,
      };
    });

    setMediaImages((prev) => [...prev, ...newImgs]);
    e.target.value = null;
    setMediaError('');
    toast.success(`Added ${files.length} new media image(s)`);
  };

  const handleBedroomImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImgs = files.map((file, i) => {
      const url = URL.createObjectURL(file);
      return {
        id: `new-bedroom-${Date.now()}-${i}`,
        url: url,
        file,
        isPrimary: bedroomImages.length === 0,
        name: `Bedroom ${bedroomImages.length + i + 1}`,
        description: '',
        isExisting: false,
        existingId: null,
      };
    });

    setBedroomImages((prev) => [...prev, ...newImgs]);
    e.target.value = null;
    toast.success(`Added ${files.length} new bedroom image(s)`);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideos(prev => [...prev, ...files]);
    e.target.value = null;
    toast.success(`Added ${files.length} new video file(s)`);
  };

  const removeImage = (id, existingId, setState, type = 'media') => {
    setState((prev) => {
      const filtered = prev.filter((i) => i.id !== id);

      // If we removed the primary image, set the first image as primary
      const removedImage = prev.find((i) => i.id === id);
      if (removedImage?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }

      return filtered;
    });

    // If it's an existing image, add to delete list
    if (existingId) {
      if (type === 'media') {
        setMediaImagesToDelete(prev => [...prev, existingId]);
        toast.success('Media image marked for deletion');
      } else if (type === 'bedroom') {
        setBedroomImagesToDelete(prev => [...prev, existingId]);
        toast.success('Bedroom image marked for deletion');
      }
    } else {
      toast.success(`Removed ${type} image`);
    }
  };

  const removeExistingVideo = (index, videoId) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
    
    // If it's an existing video with ID, add to delete list
    if (videoId) {
      setVideosToDelete(prev => [...prev, videoId]);
      toast.success('Video marked for deletion');
    } else {
      toast.success('Removed video');
    }
  };

  const updateArray = (setter, arr, idx, value) => {
    const copy = [...arr];
    copy[idx] = value;
    setter(copy);
  };

  const addArrayItem = (setter, arr, refs, placeholder = '') => {
    setter((prev) => {
      const next = [...prev, placeholder];
      setTimeout(() => {
        const i = next.length - 1;
        if (refs && refs.current[i]) refs.current[i].focus();
      }, 60);
      return next;
    });
  };

  const removeArrayItem = (setter, arr, idx) => {
    if (arr.length === 1) {
      // If only one item remains, clear it but keep the field
      setter(['']);
      return;
    }
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateStaffRow = (idx, key, value) => {
    setStaffRows((prev) => {
      const copy = prev.map((r) => ({ ...r }));
      copy[idx][key] = value;
      return copy;
    });
  };

  const addStaffRow = () => {
    setStaffRows((prev) => {
      const next = [...prev, { name: '', details: '' }];
      setTimeout(() => {
        const i = next.length - 1;
        if (staffNameRefs.current[i]) staffNameRefs.current[i].focus();
      }, 60);
      return next;
    });
  };

  const removeStaffRow = (idx) => {
    if (staffRows.length === 1) {
      // If only one row remains, clear it but keep the fields
      setStaffRows([{ name: '', details: '' }]);
      return;
    }
    setStaffRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSpotlightRow = (idx, key, value) => {
    setSpotlightRows((prev) => {
      const copy = prev.map((r) => ({ ...r }));
      copy[idx][key] = value;
      return copy;
    });
  };

  const addSpotlightRow = () => {
    setSpotlightRows((prev) => {
      const next = [...prev, { title: '', description: '' }];
      setTimeout(() => {
        const i = next.length - 1;
        if (spotlightTitleRefs.current[i]) spotlightTitleRefs.current[i].focus();
      }, 60);
      return next;
    });
  };

  const removeSpotlightRow = (idx) => {
    if (spotlightRows.length === 1) {
      // If only one row remains, clear it but keep the fields
      setSpotlightRows([{ title: '', description: '' }]);
      return;
    }
    setSpotlightRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildStaffArray = (rows) =>
    rows
      .filter(
        (r) => (r.name && r.name.trim()) || (r.details && r.details.trim())
      )
      .map((r) => ({
        name: r.name?.trim() || '',
        details: r.details?.trim() || '',
      }));

  const buildSpotlightArray = (rows) =>
    rows
      .filter(
        (r) => (r.title && r.title.trim()) || (r.description && r.description.trim())
      )
      .map((r) => ({
        title: r.title?.trim() || '',
        description: r.description?.trim() || '',
      }));

  const handleBookingRateChange = (idx, key, value) => {
    setBookingRateRows((prev) => {
      const copy = prev.map((r) => ({ ...r }));
      copy[idx][key] = value;
      return copy;
    });
  };

  const addBookingRateRow = () => {
    setBookingRateRows((prev) => [
      ...prev,
      { rentalPeriod: '', minimumStay: '', ratePerNight: '' },
    ]);
  };

  const removeBookingRateRow = (idx) => {
    if (bookingRateRows.length === 1) {
      // If only one row remains, clear it but keep the fields
      setBookingRateRows([
        { rentalPeriod: '', minimumStay: '', ratePerNight: '' },
      ]);
      return;
    }
    setBookingRateRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildBookingRateArray = (rows) => {
    return rows
      .filter(
        (r) =>
          (r.rentalPeriod && r.rentalPeriod.trim()) ||
          (r.minimumStay && r.minimumStay.trim()) ||
          (r.ratePerNight && String(r.ratePerNight).trim())
      )
      .flatMap((r) => [
        r.rentalPeriod?.trim() || '',
        r.minimumStay?.trim() || '',
        String(r.ratePerNight).trim() || '',
      ]);
  };

  const buildMediaMetadata = (imgs, category, startOrder = 0) =>
    imgs.map((img, idx) => ({
      category,
      caption: `${category} image ${startOrder + idx + 1}`,
      is_primary: !!img.isPrimary,
      order: startOrder + idx,
    }));

  // কোন validation নেই - সব field optional
  const validateBeforeSubmit = () => {
    clearErrors();
    setMediaError('');
    // কোন validation নেই - সব field optional
    return true;
  };

  const onSubmit = async (values) => {
    // শুধু errors clear করুন, কোন validation নেই
    clearErrors();
    setMediaError('');
    
    // Validate function call করুন (এখন কোন validation নেই)
    if (!validateBeforeSubmit()) return;

    setSubmitting(true);
    try {
      const processed = {
        title: values.title || '',
        description: values.description || '',
        price: values.price ? String(values.price) : '0.00',
        price_display: values.price ? String(values.price) : '0.00',
        property_type: values.property_type || 'rentals',
        listing_type: 'rent',
        status: (values.status || 'draft').toLowerCase().replace(/\s+/g, '_'),
        priority: values.priority || 'medium',
        address: values.address || location.address,
        city: values.city || '',
        add_guest: Number(values.add_guest) || 1,
        bedrooms: Number(values.bedrooms) || 0,
        bathrooms: Number(values.bathrooms) || 0,
        pool: Number(values.pool) || 0,
        signature_distinctions: signatureList.filter(Boolean),
        interior_amenities: interiorAmenities.filter(Boolean),
        outdoor_amenities: outdoorAmenities.filter(Boolean),
        rules_and_etiquette: rules.filter(Boolean),
        check_in: checkIn || '',
        check_out: checkOut || '',
        staff: buildStaffArray(staffRows),
        spotlight_details: buildSpotlightArray(spotlightRows),
        booking_rate: buildBookingRateArray(bookingRateRows),
        calendar_link: values.calendar_link || '',
        seo_title: values.seo_title || '',
        seo_description: values.seo_description || '',
        latitude: location.lat ?? null,
        longitude: location.lng ?? null,
        security_deposit: values.security_deposit
          ? String(values.security_deposit)
          : '',
        damage_deposit: values.damage_deposit
          ? String(values.damage_deposit)
          : '',
        commission_rate: values.commission_rate
          ? String(values.commission_rate)
          : '',
        tbc_by: values.tbc_by
          ? String(values.tbc_by)
          : '',
        concierge_description: values.concierge_description
          ? String(values.concierge_description)
          : '',
        check_in_check_out_policy: values.check_in_check_out_policy
          ? String(values.check_in_check_out_policy)
          : '',
        concierge_services: conciergeRows.filter(Boolean),
        youtube_link: values.youtube_link || '',
        calendar_accuracy: values.calendar_accuracy || '',
      };

      console.log('--- Update payload for ID:', propertyId, '---');
      console.log(JSON.stringify(processed, null, 2));

      const fd = new FormData();
      const append = (k, v) => {
        if (v === undefined || v === null) return;
        if (
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean'
        ) {
          fd.append(k, String(v));
        } else {
          fd.append(k, JSON.stringify(v));
        }
      };

      // Append all processed data including youtube_link and calendar_accuracy
      Object.entries(processed).forEach(([key, value]) => {
        append(key, value);
      });

      // Append delete arrays if they exist
      if (mediaImagesToDelete.length > 0) {
        fd.append('delete_media_image_ids', JSON.stringify(mediaImagesToDelete));
      }
      
      if (bedroomImagesToDelete.length > 0) {
        fd.append('delete_bedroom_image_ids', JSON.stringify(bedroomImagesToDelete));
      }
      
      if (videosToDelete.length > 0) {
        fd.append('delete_video_ids', JSON.stringify(videosToDelete));
      }

      // Build bedroom metadata for existing and new images
      const bedroomsMeta = bedroomImages.map((img, idx) => ({
        index: idx,
        name: img.name || `Bedroom ${idx + 1}`,
        description: img.description || '',
        id: img.existingId || null,
      }));
      
      // Separate update and create metadata
      const updateBedroomMeta = bedroomsMeta.filter(meta => meta.id);
      const newBedroomMeta = bedroomsMeta.filter(meta => !meta.id);
      
      if (updateBedroomMeta.length > 0) {
        fd.append('update_bedroom_meta', JSON.stringify(updateBedroomMeta));
      }
      
      if (newBedroomMeta.length > 0) {
        fd.append('bedrooms_meta', JSON.stringify(newBedroomMeta));
      }

      // Append only new files (not existing ones)
      const newMediaImages = mediaImages.filter(img => !img.isExisting);
      const newBedroomImages = bedroomImages.filter(img => !img.isExisting);

      newMediaImages.forEach((img) => {
        if (img.file) {
          fd.append('media_images', img.file);
        }
      });

      newBedroomImages.forEach((img) => {
        if (img.file) {
          fd.append('bedrooms_images', img.file);
        }
      });

      videos.forEach((file) => {
        fd.append('videos', file);
      });

      // Append existing video URLs
      existingVideos.forEach((video) => {
        if (video.url) {
          fd.append('existing_videos', video.url);
        }
      });

      console.log('--- FormData entries for update ---');
      for (const [k, v] of fd.entries()) {
        if (v instanceof File) {
          console.log(k, 'File:', v.name);
        } else {
          console.log(
            k,
            typeof v === 'string' && v.length > 200
              ? v.slice(0, 200) + '...'
              : v
          );
        }
      }

      const access = localStorage.getItem('auth_access');
      const headers = {};
      if (access) headers['Authorization'] = `Bearer ${access}`;

      // Use PATCH method for update
      const res = await fetch(
        `${API_BASE}/villas/properties/${propertyId}/`,
        {
          method: 'PATCH',
          headers,
          body: fd,
        }
      );
      
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        console.error('Update failed:', res.status, body);
        const message =
          body && (body.error || body.detail || JSON.stringify(body))
            ? body.error || body.detail || JSON.stringify(body)
            : `HTTP ${res.status}`;
        Swal.fire({ 
          title: 'Update Error!', 
          text: message, 
          icon: 'error' 
        });
        setSubmitting(false);
        return;
      }

      console.log('Update successful:', body);
      
      Swal.fire({
        title: 'Updated Successfully!',
        text: `Property has been updated.`,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        setSubmitting(false);
        if (onClose) {
          onClose();
        } else {
          // Redirect back to properties list
          navigate('/dashboard/admin-properties-rentals');
        }
      });
    } catch (err) {
      console.error('Update error', err);
      toast.error(`Update error: ${err.message}`);
      setSubmitting(false);
    }
  };

  const updateBedroomImageName = (id, name) => {
    setBedroomImages((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name } : b))
    );
  };

  const updateBedroomImageDescription = (id, description) => {
    setBedroomImages((prev) =>
      prev.map((b) => (b.id === id ? { ...b, description } : b))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen w-full">
      <div className="w-15">
        <Link
          to="/dashboard/admin-properties-rentals"
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      <div className="lg:flex space-x-10 justify-between items-center mb-6 mt-2 w-full">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Update Property for Rentals
          </h1>
          <p className="text-gray-500 mt-2">
            Update the details of property title ID: {propertyId}
          </p>
        </div>
        <div className="flex mt-2 items-center gap-4">
    
        </div>
      </div>

      {/* Location Section */}
      <div>
        <div className="text-2xl mt-2 font-semibold mb-2">Update Location</div>
        <div className="mb-5">
          <LocationCreateProperty
            lat={location.lat}
            lng={location.lng}
            text={location.address}
            onLocationAdd={(villaData) =>
              setLocation({
                lat: villaData.lat,
                lng: villaData.lng,
                address: villaData.name,
                description: villaData.description,
              })
            }
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-full mx-auto space-y-6"
      >
        {/* Basic Info */}
    <div className="grid grid-cols-12 gap-6">


  <div className="col-span-12">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Property Title
    </label>
    <input
      {...register("title")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Enter property title"
    />
  </div>

  
  <div className="col-span-12">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Description
    </label>
    <textarea
      {...register("description")}
      rows={3}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Enter property description"
    />
  </div>


  <div className="col-span-12 sm:col-span-6 md:col-span-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Price
    </label>
    <input
      step="any"
      type="number"
      {...register("price")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Enter price"
    />
  </div>

  <div className="col-span-12 sm:col-span-6 md:col-span-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Property Type
    </label>
    <input
      type="text"
      disabled
      value="rentals"
      className="w-full border rounded-lg p-3 bg-gray-50 cursor-not-allowed text-gray-500"
    />
  </div>

  <div className="col-span-12 sm:col-span-6 md:col-span-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Status
    </label>
    <div className="relative">
      <select
        {...register("status")}
        className="w-full appearance-none border rounded-lg p-3 pr-[44px] bg-gray-50"
      >
        <option value="draft">Draft</option>
        <option value="pending_review">Pending Review</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
        
      </select>
      <span className="pointer-events-none absolute right-[20px] top-1/2 -translate-y-1/2 text-gray-500">
        ▼
      </span>
    </div>
  </div>


  <div className="col-span-12 sm:col-span-6 md:col-span-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Priority
    </label>
    <div className="relative">
      <select
        {...register("priority")}
        className="w-full appearance-none border rounded-lg p-3 pr-[44px] bg-gray-50"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <span className="pointer-events-none absolute right-[20px] top-1/2 -translate-y-1/2 text-gray-500">
        ▼
      </span>
    </div>
  </div>

  <div className="col-span-12 sm:col-span-6 md:col-span-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Add Guest
    </label>
    <input
      type="number"
      {...register("add_guest")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Number of guests"
    />
  </div>

  <div className="col-span-12 sm:col-span-6 md:col-span-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Bedrooms
    </label>
    <input
      type="number"
      step="0.1"
      {...register("bedrooms")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Number of bedrooms"
    />
  </div>

 
  <div className="col-span-12 sm:col-span-6 md:col-span-3">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Bathrooms
    </label>
    <input
      type="number"
      step="0.1"
      {...register("bathrooms")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Number of bathrooms"
    />
  </div>

  <div className="col-span-12 sm:col-span-6 md:col-span-3">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Pools
    </label>
    <input
      type="number"
      {...register("pool")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Number of pools"
    />
  </div>


  <div className="col-span-12 md:col-span-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Address
    </label>
    <input
      {...register("address")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Enter property address"
    />
  </div>

  <div className="col-span-12 md:col-span-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      City
    </label>
    <input
      {...register("city")}
      className="w-full border rounded-lg p-3 bg-gray-50"
      placeholder="Enter city"
    />
  </div>

</div>

        {/* Media Images Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Property Media Images
            </label>
            <div className="text-sm text-gray-500">
              {mediaImages.length} image(s) total
              <span className="ml-2 text-blue-500">
                ({mediaImages.filter(img => img.isExisting).length} existing)
              </span>
              {mediaImagesToDelete.length > 0 && (
                <span className="ml-2 text-red-500">
                  ({mediaImagesToDelete.length} marked for deletion)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mediaImages.map((img, index) => (
              <ImagePreview
                key={img.id}
                image={img}
                index={index}
                onRemove={(id, existingId) => removeImage(id, existingId, setMediaImages, 'media')}
                onSetPrimary={setPrimaryImage}
                isPrimary={img.isPrimary}
                type="media"
                isExisting={img.isExisting}
                existingId={img.existingId}
              />
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32 bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Add More Images</p>
              <p className="text-xs text-gray-400 mt-1">
                Click or drag & drop
              </p>
              <input
                name="media_files"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMediaImageUpload}
              />
            </label>
          </div>

          {mediaError && (
            <p className="text-sm text-red-600 mt-2">{mediaError}</p>
          )}

          {mediaImages.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              No media images uploaded yet.
            </p>
          ) : (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{mediaImages.length}</span> media
              image(s) total.
              {mediaImages.filter((img) => img.isPrimary).length > 0 ? (
                <span className="ml-2 text-teal-600">
                  Primary image is set.
                </span>
              ) : (
                <span className="ml-2 text-amber-600">
                  Please set a primary image.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bedrooms Images Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Bedroom Images
            </label>
            <div className="text-sm text-gray-500">
              {bedroomImages.length} image(s) total
              <span className="ml-2 text-blue-500">
                ({bedroomImages.filter(img => img.isExisting).length} existing)
              </span>
              {bedroomImagesToDelete.length > 0 && (
                <span className="ml-2 text-red-500">
                  ({bedroomImagesToDelete.length} marked for deletion)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {bedroomImages.map((img, index) => (
              <BedroomImagePreview
                key={img.id}
                image={img}
                index={index}
                onRemove={(id, existingId) =>
                  removeImage(id, existingId, setBedroomImages, 'bedroom')
                }
                onSetPrimary={setPrimaryImage}
                isPrimary={img.isPrimary}
                onNameChange={updateBedroomImageName}
                onDescriptionChange={updateBedroomImageDescription}
                isExisting={img.isExisting}
                existingId={img.existingId}
              />
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32 bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Add More Bedroom Images</p>
              <p className="text-xs text-gray-400 mt-1">
                Click or drag & drop
              </p>
              <input
                name="bedrooms_images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleBedroomImageUpload}
              />
            </label>
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Videos
          </label>
          
          {/* Existing Videos */}
          {existingVideos.length > 0 && (
            <div className="mb-4 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-3">
                Existing Videos:
              </h4>

              <div className="flex flex-wrap gap-3">
                {existingVideos.map((video, idx) => (
                  <div
                    key={idx}
                    className="relative w-56 h-56 bg-white border rounded-lg flex items-center justify-center"
                  >
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => removeExistingVideo(idx, video.id)}
                      className="absolute -top-2 -right-2 bg-white border rounded-full p-1 text-red-500 hover:text-red-700 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Videos Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32 bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Add New Videos</p>
              <p className="text-xs text-gray-400 mt-1">
                Click or drag & drop
              </p>
              <input
                name="videos"
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideoUpload}
              />
            </label>

            {videos.length > 0 && (
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{videos.length}</span> new video file(s) selected:
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {videos.map((video, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="truncate">{video.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVideos((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          toast.success('Removed video file');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* YouTube Link Field - Added below Videos section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Link
          </label>
          <input
            name="youtube_link"
            {...register('youtube_link')}
            className="w-full border rounded-lg p-3 bg-gray-50"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* Calendar Link */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calendar Link
          </label>
          <input
            name="calendar_link"
            {...register('calendar_link')}
            className="w-full border rounded-lg p-3 bg-gray-50"
            placeholder="https://calendly.com/..."
          />
        </div>

        {/* Calendar Accuracy Field - Added below Calendar Link */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calendar Accuracy
          </label>
          <input
            name="calendar_accuracy"
            {...register('calendar_accuracy')}
            className="w-full border rounded-lg p-3 bg-gray-50"
            placeholder="Enter calendar accuracy information"
          />
        </div>

        {/* Signature Distinctions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signature Distinctions
          </label>
          <div className="space-y-2">
            {signatureList.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  ref={(el) => (signatureRefs.current[i] = el)}
                  value={s}
                  onChange={(e) =>
                    updateArray(
                      setSignatureList,
                      signatureList,
                      i,
                      e.target.value
                    )
                  }
                  placeholder="e.g. Ocean view, Mountain view, Private beach"
                  className="flex-1 border rounded-lg p-2 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(
                        setSignatureList,
                        signatureList,
                        signatureRefs,
                        ''
                      )
                    }
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add
                  </button>
                  {signatureList.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem(setSignatureList, signatureList, i)
                      }
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Add signature distinctions for this property. At least one field will always be available.
          </p>
        </div>

        {/* Indoor / Outdoor Amenities */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interior Amenities
            </label>
            <div className="space-y-3">
              {interiorAmenities.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    ref={(el) => (interiorRefs.current[i] = el)}
                    value={v}
                    onChange={(e) =>
                      updateArray(
                        setInteriorAmenities,
                        interiorAmenities,
                        i,
                        e.target.value
                      )
                    }
                    placeholder="e.g. WiFi, Air conditioning, Smart TV"
                    className="flex-1 border rounded-lg p-2 bg-gray-50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem(
                          setInteriorAmenities,
                          interiorAmenities,
                          interiorRefs,
                          ''
                        )
                      }
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Add
                    </button>
                    {interiorAmenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayItem(
                            setInteriorAmenities,
                            interiorAmenities,
                            i
                          )
                        }
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Add Interior amenities. At least one field will always be available.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outdoor Amenities
            </label>
            <div className="space-y-3">
              {outdoorAmenities.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    ref={(el) => (outdoorRefs.current[i] = el)}
                    value={v}
                    onChange={(e) =>
                      updateArray(
                        setOutdoorAmenities,
                        outdoorAmenities,
                        i,
                        e.target.value
                      )
                    }
                    placeholder="e.g. Parking, Swimming pool, Garden"
                    className="flex-1 border rounded-lg p-2 bg-gray-50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem(
                          setOutdoorAmenities,
                          outdoorAmenities,
                          outdoorRefs,
                          ''
                        )
                      }
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Add
                    </button>
                    {outdoorAmenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayItem(
                            setOutdoorAmenities,
                            outdoorAmenities,
                            i
                          )
                        }
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Add outdoor amenities. At least one field will always be available.
            </p>
          </div>
        </div>

        {/* Rules (one per field) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rules (one per field)
          </label>
          <div className="space-y-3">
            {rules.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  ref={(el) => (rulesRefs.current[i] = el)}
                  value={v}
                  onChange={(e) =>
                    updateArray(setRules, rules, i, e.target.value)
                  }
                  placeholder="e.g. No Smoking Indoors, No Pets Allowed, Quiet Hours 10PM-8AM"
                  className="flex-1 border rounded-lg p-2 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addArrayItem(setRules, rules, rulesRefs, '')}
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add
                  </button>
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(setRules, rules, i)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Add rules and etiquette. At least one field will always be available.
          </p>
        </div>

        {/* Check-in / out + deposits */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-In Time
            </label>
            <input
              name="check_in"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              placeholder="e.g. 15:00 (3:00 PM)"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-Out Time
            </label>
            <input
              name="check_out"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder="e.g. 11:00 (11:00 AM)"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 ">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check In / Check Out Description
            </label>
            <input
              name="check_in_check_out_policy"
              type="text"
              step="0.01"
              {...register('check_in_check_out_policy')}
              placeholder="Add Check In / Check Out Description"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Deposit
            </label>
            <input
              name="security_deposit"
              type="number"
              {...register('security_deposit')}
              placeholder="10000.00"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <input
              name="commission_rate"
              type="number"
              step="0.01"
              {...register('commission_rate')}
              placeholder="20.00"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 ">
            <label className="block text-sm font-medium text-gray-700 mb-1">
             Booking Approval Process
            </label>
            <input
              name="tbc_by"
              type="text"
              step="0.01"
              {...register('tbc_by')}
              placeholder="Add Booking Details"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 ">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concierge Description
            </label>
            <input
              name="concierge_description"
              type="text"
              step="0.01"
              {...register('concierge_description')}
              placeholder="Add Concierge Description"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>
        </div>

        {/* Concierge services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Concierge Services
          </label>
          <div className="space-y-3">
            {conciergeRows.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  ref={(el) => (conciergeRefs.current[i] = el)}
                  value={v}
                  onChange={(e) =>
                    updateArray(
                      setConciergeRows,
                      conciergeRows,
                      i,
                      e.target.value
                    )
                  }
                  placeholder='e.g. "24/7 Concierge", "Airport Pickup", "Restaurant Reservations"'
                  className="flex-1 border rounded-lg p-2 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(
                        setConciergeRows,
                        conciergeRows,
                        conciergeRefs,
                        ''
                      )
                    }
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add
                  </button>
                  {conciergeRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem(setConciergeRows, conciergeRows, i)
                      }
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Add concierge services. At least one field will always be available.
          </p>
        </div>

        {/* Staff rows */}
       <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Staff (add rows: name + details)
  </label>

  <div className="space-y-2">
    {staffRows.map((r, idx) => (
      <div
        key={idx}
        className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start"
      >
        <input
          ref={(el) => (staffNameRefs.current[idx] = el)}
          value={r.name}
          onChange={(e) => updateStaffRow(idx, 'name', e.target.value)}
          placeholder="Staff Name"
          className="w-full sm:flex-1 border rounded-lg p-2 bg-gray-50"
        />

        <input
          value={r.details}
          onChange={(e) =>
            updateStaffRow(idx, 'details', e.target.value)
          }
          placeholder="Details (role, phone, email)"
          className="w-full sm:flex-1 border rounded-lg p-2 bg-gray-50"
        />

        <div className="flex flex-row sm:flex-col gap-2">
          <button
            type="button"
            onClick={addStaffRow}
            className="w-full sm:w-auto px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Add
          </button>

          {staffRows.length > 1 && (
            <button
              type="button"
              onClick={() => removeStaffRow(idx)}
              className="w-full sm:w-auto px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    ))}
  </div>

  <p className="text-sm text-gray-500 mt-2">
    Add staff information. At least one row will always be available.
  </p>
</div>


        {/* Spotlight Details Section */}
       <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Spotlight Details (add rows: title + description)
  </label>

  <div className="space-y-2">
    {spotlightRows.map((r, idx) => (
      <div
        key={idx}
        className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start"
      >
        <input
          ref={(el) => (spotlightTitleRefs.current[idx] = el)}
          value={r.title}
          onChange={(e) => updateSpotlightRow(idx, 'title', e.target.value)}
          placeholder="Spotlight Title"
          className="w-full sm:flex-1 border rounded-lg p-2 bg-gray-50"
        />

        <input
          value={r.description}
          onChange={(e) =>
            updateSpotlightRow(idx, 'description', e.target.value)
          }
          placeholder="Spotlight Description"
          className="w-full sm:flex-1 border rounded-lg p-2 bg-gray-50"
        />

        <div className="flex flex-row sm:flex-col gap-2">
          <button
            type="button"
            onClick={addSpotlightRow}
            className="w-full sm:w-auto px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Add
          </button>

          {spotlightRows.length > 1 && (
            <button
              type="button"
              onClick={() => removeSpotlightRow(idx)}
              className="w-full sm:w-auto px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    ))}
  </div>

  <p className="text-sm text-gray-500 mt-2">
    Add spotlight details. At least one row will always be available.
  </p>
</div>


        {/* Booking Rate Section */}
        <div className="border rounded-lg p-4 bg-white shadow mt-4">
  <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
    Booking Rate
  </h3>

  {bookingRateRows.map((row, idx) => (
    <div
      key={idx}
      className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3 items-stretch sm:items-center"
    >
      <input
        value={row.rentalPeriod}
        onChange={(e) =>
          handleBookingRateChange(idx, 'rentalPeriod', e.target.value)
        }
        className="sm:col-span-4 border rounded-lg p-2 text-sm bg-gray-50"
        placeholder="Rental Period (e.g. Jan 20 - Jan 30)"
      />

      <input
        value={row.minimumStay}
        onChange={(e) =>
          handleBookingRateChange(idx, 'minimumStay', e.target.value)
        }
        className="sm:col-span-4 border rounded-lg p-2 text-sm bg-gray-50"
        placeholder="Minimum Stay (e.g. 10 Nights)"
      />

      <input
        value={row.ratePerNight}
        onChange={(e) =>
          handleBookingRateChange(idx, 'ratePerNight', e.target.value)
        }
        className="sm:col-span-3 border rounded-lg p-2 text-sm bg-gray-50"
        placeholder="Rate Per Night (e.g. 5600)"
        type="number"
      />

      {bookingRateRows.length > 1 && (
        <button
          type="button"
          onClick={() => removeBookingRateRow(idx)}
          className="sm:col-span-1 bg-red-100 text-red-600 rounded-lg px-3 py-2 text-sm hover:bg-red-200"
        >
          Remove
        </button>
      )}
    </div>
  ))}

  <button
    type="button"
    onClick={addBookingRateRow}
    className="mt-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
  >
    Add Booking Rate
  </button>

  <p className="text-sm text-gray-500 mt-2">
    Add booking rate information. At least one row will always be available.
  </p>
</div>


        {/* SEO */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Title
            </label>
            <input
              name="seo_title"
              {...register('seo_title')}
              placeholder="SEO title for search engines"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Description
            </label>
            <textarea
              name="seo_description"
              {...register('seo_description')}
              placeholder="SEO description for search engines"
              className="w-full border rounded-lg p-3 bg-gray-50"
              rows="2"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex flex-col gap-3 mt-6 w-full mb-10">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center cursor-pointer justify-center w-full px-4 py-3 text-white rounded-lg transition shadow-md bg-teal-600 border border-teal-700 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating Property...
              </>
            ) : (
              <>
                <img
                  className="mr-2 w-5 h-5 cursor-pointer"
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760999922/Icon_41_fxo3ap.png"
                  alt="icon"
                />{' '}
                Update Property 
              </>
            )}
          </button>

          <Link
            to="/dashboard/admin-properties-rentals"
            className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm text-center"
          >
            Back to Properties List
          </Link>
        </div>
      </form>
    </div>
  );
};

export default UpdateRentals;