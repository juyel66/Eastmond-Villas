import React, { useState, useRef, useEffect } from 'react';
import { User, UploadCloud, X, Save, ChevronLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import LocationCreateProperty from './LocationCreateProperty';
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

      {/* Remove button */}
      <button
        onClick={() => onRemove(image.id)}
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

        {/* Remove button */}
        <button
          onClick={() => onRemove(image.id)}
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

const CreatePropertySales = ({
  isEdit = false,
  editData = null,
  onClose = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    getValues,
  } = useForm({ mode: 'onTouched' });

  const [location, setLocation] = useState({
    lat: 25.79,
    lng: -80.13,
    address: '',
  });

  const [mediaImages, setMediaImages] = useState([]);
  const [bedroomImages, setBedroomImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const [signatureList, setSignatureList] = useState(['']);
  const [interiorAmenities, setInteriorAmenities] = useState(['']);
  const [outdoorAmenities, setOutdoorAmenities] = useState(['']);

  const [submitting, setSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const interiorRefs = useRef([]);
  const outdoorRefs = useRef([]);
  const signatureRefs = useRef([]);

  // Function to ensure URL is absolute
  const getAbsoluteUrl = (url) => {
    if (!url) return '';

    // If it's already an absolute URL
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('blob:')
    ) {
      return url;
    }

    // If it's a relative URL, prepend API base URL
    if (url.startsWith('/')) {
      return `${API_BASE.replace('/api', '')}${url}`;
    }

    // If it's just a path, prepend API base
    return `${API_BASE.replace('/api', '')}/${url}`;
  };

  useEffect(() => {
    if (isEdit && editData) {
      // Populate form with editData
      const formData = {
        title: editData.title || '',
        description: editData.description || '',
        price: editData.price || editData.price_display || '',
        property_type: editData.property_type || 'sales',
        status: editData.status || 'Draft',
        add_guest: editData.add_guest || '',
        bedrooms: editData.bedrooms || '',
        bathrooms: editData.bathrooms || '',
        pool: editData.pool || '',
        address: editData.address || '',
        city: editData.city || '',
        calendar_link: editData.calendar_link || '',
        seo_title: editData.seo_title || '',
        seo_description: editData.seo_description || '',
        youtube_link: editData.youtube_link || '',
        tbc_by: editData.tbc_by || '', // Added field
        commission_rate: editData.commission_rate || '', // Added field
      };
      reset(formData);

      // Populate location
      if (editData.latitude && editData.longitude) {
        setLocation({
          lat: editData.latitude,
          lng: editData.longitude,
          address: editData.address || '123 Ocean Drive, Miami',
        });
      }

      // Populate arrays
      setSignatureList(
        editData.signature_distinctions?.length > 0
          ? editData.signature_distinctions
          : ['']
      );
      setInteriorAmenities(
        editData.interior_amenities?.length > 0
          ? editData.interior_amenities
          : ['']
      );
      setOutdoorAmenities(
        editData.outdoor_amenities?.length > 0
          ? editData.outdoor_amenities
          : ['']
      );

      // Handle media images
      const processMediaImages = () => {
        let mediaImgs = [];

        if (editData.media_images && Array.isArray(editData.media_images)) {
          mediaImgs = editData.media_images.map((img, i) => {
            const imageUrl =
              typeof img === 'string' ? img : img.url || img.image || img;
            const isPrimary =
              typeof img === 'object'
                ? img.is_primary || img.isPrimary || false
                : false;

            return {
              id: `media-${Date.now()}-${i}`,
              url: getAbsoluteUrl(imageUrl),
              file: null,
              isPrimary: isPrimary,
              originalData: img,
            };
          });
        }

        if (mediaImgs.length === 0 && editData.image) {
          mediaImgs.push({
            id: `media-${Date.now()}-0`,
            url: getAbsoluteUrl(editData.image),
            file: null,
            isPrimary: true,
            originalData: { url: editData.image, is_primary: true },
          });
        }

        setMediaImages(mediaImgs);
      };

      // Handle bedroom images
      const processBedroomImages = () => {
        let bedroomImgs = [];

        if (
          editData.bedrooms_images &&
          Array.isArray(editData.bedrooms_images)
        ) {
          bedroomImgs = editData.bedrooms_images.map((img, i) => {
            const imageUrl =
              typeof img === 'string' ? img : img.url || img.image || img;
            const isPrimary =
              typeof img === 'object'
                ? img.is_primary || img.isPrimary || false
                : false;
            const name =
              typeof img === 'object'
                ? img.name || img.title || `Bedroom ${i + 1}`
                : `Bedroom ${i + 1}`;
            const description =
              typeof img === 'object'
                ? img.description || img.caption || ''
                : '';

            return {
              id: `bedroom-${Date.now()}-${i}`,
              url: getAbsoluteUrl(imageUrl),
              file: null,
              isPrimary: isPrimary,
              name: name,
              description: description,
              originalData: img,
            };
          });
        }

        setBedroomImages(bedroomImgs);
      };

      processMediaImages();
      processBedroomImages();

      // Handle videos
      if (
        editData.videos &&
        Array.isArray(editData.videos) &&
        editData.videos.length > 0
      ) {
        console.log(`${editData.videos.length} existing videos found`);
      }
    } else {
      // For create mode
      reset({
        title: '',
        description: '',
        price: '',
        property_type: 'sales',
        status: 'Draft',
        add_guest: '',
        bedrooms: '',
        bathrooms: '',
        pool: '',
        address: '',
        city: '',
        calendar_link: '',
        seo_title: '',
        seo_description: '',
        youtube_link: '',
        tbc_by: '', // Added field
        commission_rate: '', // Added field
      });

      setSignatureList(['']);
      setInteriorAmenities(['']);
      setOutdoorAmenities(['']);
      setMediaImages([]);
      setBedroomImages([]);
      setVideos([]);
    }
  }, [isEdit, editData, reset]);

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
        isPrimary: mediaImages.length === 0 && i === 0,
      };
    });

    setMediaImages((prev) => {
      const updated = [...prev, ...newImgs];
      // Ensure only one primary
      const primaryCount = updated.filter((img) => img.isPrimary).length;
      if (primaryCount > 1) {
        // Keep the first one as primary
        let foundFirst = false;
        return updated.map((img) => {
          if (img.isPrimary) {
            if (!foundFirst) {
              foundFirst = true;
              return img;
            }
            return { ...img, isPrimary: false };
          }
          return img;
        });
      }
      return updated;
    });

    e.target.value = null;
    setMediaError('');
    toast.success(`Added ${files.length} media image(s)`);
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
        isPrimary: false,
        name: `Bedroom ${bedroomImages.length + i + 1}`,
        description: '',
      };
    });

    setBedroomImages((prev) => [...prev, ...newImgs]);
    e.target.value = null;
    toast.success(`Added ${files.length} bedroom image(s)`);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideos(files);
    e.target.value = null;
    toast.success(`Added ${files.length} video file(s)`);
  };

  const removeImage = (id, setState, type = 'media') => {
    setState((prev) => {
      const filtered = prev.filter((i) => i.id !== id);

      // If we removed the primary image, set the first image as primary
      const removedImage = prev.find((i) => i.id === id);
      if (removedImage?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }

      return filtered;
    });

    toast.success(`Removed ${type} image`);
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
      setter(['']);
      return;
    }
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildMediaMetadata = (imgs, category, startOrder = 0) =>
    imgs.map((img, idx) => ({
      category,
      caption: `${category} image ${startOrder + idx + 1}`,
      is_primary: !!img.isPrimary,
      order: startOrder + idx,
    }));

  // এই function টি সম্পুর্ণভাবে সরিয়ে দিন - কোন validation নেই
  const validateBeforeSubmit = () => {
    clearErrors();
    setMediaError('');
    // কোন validation নেই - সব field optional
    return true;
  };

  const onSubmit = async (values, isDraft = false) => {
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
        property_type: values.property_type || 'sales',
        listing_type: 'sale',
        status: isDraft
          ? 'draft'
          : (values.status || 'Draft').toLowerCase().replace(/\s+/g, '_'),
        address: values.address || location.address,
        city: values.city || '',
        add_guest: Number(values.add_guest) || 0,
        bedrooms: Number(values.bedrooms) || 0,
        bathrooms: Number(values.bathrooms) || 0,
        pool: Number(values.pool) || 0,
        signature_distinctions: signatureList.filter(Boolean),
        interior_amenities: interiorAmenities.filter(Boolean),
        outdoor_amenities: outdoorAmenities.filter(Boolean),
        calendar_link: values.calendar_link || '',
        seo_title: values.seo_title || '',
        seo_description: values.seo_description || '',
        latitude: location.lat ?? null,
        longitude: location.lng ?? null,
        youtube_link: values.youtube_link || '',
        tbc_by: values.tbc_by || '', // Added field
        commission_rate: values.commission_rate || '', // Added field
      };

      console.log('--- Processed payload to send ---');
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

      append('title', processed.title);
      append('description', processed.description);
      append('price', processed.price);
      append('price_display', processed.price_display);
      append('property_type', processed.property_type);
      append('listing_type', processed.listing_type);
      append('status', processed.status);
      append('address', processed.address);
      append('city', processed.city);
      append('add_guest', processed.add_guest);
      append('bedrooms', processed.bedrooms);
      append('bathrooms', processed.bathrooms);
      append('pool', processed.pool);
      append('signature_distinctions', processed.signature_distinctions);
      append('interior_amenities', processed.interior_amenities);
      append('outdoor_amenities', processed.outdoor_amenities);
      append('calendar_link', processed.calendar_link);
      append('seo_title', processed.seo_title);
      append('seo_description', processed.seo_description);
      append('latitude', processed.latitude);
      append('longitude', processed.longitude);
      append('youtube_link', processed.youtube_link);
      append('tbc_by', processed.tbc_by); // Added field
      append('commission_rate', processed.commission_rate); // Added field

      const mediaMeta = buildMediaMetadata(mediaImages, 'media', 0);
      mediaMeta.forEach((meta) =>
        fd.append('media_metadata', JSON.stringify(meta))
      );

      const bedroomsMeta = bedroomImages.map((img, idx) => ({
        index: idx,
        name: img.name || `Bedroom ${idx + 1}`,
        description: img.description || '',
      }));
      append('bedrooms_meta', bedroomsMeta);

      // Only append new files, not existing URLs
      mediaImages.forEach((img) => {
        if (img.file) {
          fd.append('media_images', img.file);
        }
      });

      bedroomImages.forEach((img) => {
        if (img.file) {
          fd.append('bedrooms_images', img.file);
        }
      });

      videos.forEach((file) => {
        fd.append('videos', file);
      });

      console.log('--- FormData entries ---');
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

      const access = (() => {
        try {
          return localStorage.getItem('auth_access');
        } catch {
          return null;
        }
      })();
      const headers = {};
      if (access) headers['Authorization'] = `Bearer ${access}`;

      const res = await fetch(
        isEdit
          ? `${API_BASE}/villas/properties/${editData.id}/`
          : `${API_BASE}/villas/properties/`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers,
          body: fd,
        }
      );
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        console.error('Create failed:', res.status, body);
        const message =
          body && (body.error || JSON.stringify(body))
            ? body.error || JSON.stringify(body)
            : `HTTP ${res.status}`;
        Swal.fire({ title: 'Error!', text: message, icon: 'error' });
        setSubmitting(false);
        return;
      }

      console.log('Created property response:', body);
      Swal.fire({
        title: isEdit ? 'Updated!' : 'Created!',
        text: isEdit
          ? 'Property updated successfully.'
          : 'Property created successfully.',
        icon: 'success',
      });

      if (!isEdit) {
        reset();
        setMediaImages([]);
        setBedroomImages([]);
        setVideos([]);
        setSignatureList(['']);
        setInteriorAmenities(['']);
        setOutdoorAmenities(['']);
      }
      setSubmitting(false);
      if (onClose) onClose();
    } catch (err) {
      console.error('Submission error', err);
      toast.error('Submission error — check console.');
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

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen w-full">
      {!isEdit && (
        <div className="w-15">
          <Link
            to="/dashboard/admin-properties-sales"
            className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      )}

      <div className="lg:flex space-x-10 justify-between items-center mb-6 mt-2 w-full">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            {isEdit ? 'Edit Property (Sales)' : 'Create New Property (Sales)'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isEdit
              ? 'Update the details of the property listing.'
              : 'Fill out the details to create a comprehensive property listing.'}
          </p>
        </div>
        <div className="flex mt-2 items-center gap-4">
       
        </div>
      </div>

      {!isEdit && (
        <>
          <div className="text-2xl mt-2 font-semibold mb-2">Add Location</div>
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
        </>
      )}

      <form
        onSubmit={handleSubmit((values) => onSubmit(values, false))}
        className="max-w-full mx-auto space-y-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Title
            </label>
            <input
              name="title"
              {...register('title')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Enter property title"
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              {...register('description')}
              rows="3"
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Enter property description"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              name="price"
              type="number"
              {...register('price')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Enter price"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <input type="text" disabled value="sales" className='w-full border rounded-lg p-3 bg-gray-50 cursor-not-allowed text-gray-500' />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                {...register("status")}
                defaultValue="draft"
                className="w-full appearance-none border rounded-lg p-3 pr-[44px] bg-gray-50"
              >
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="sold">Sold</option>
              </select>

              {/* Custom Dropdown Arrow */}
              <span className="pointer-events-none absolute right-[20px] top-1/2 -translate-y-1/2 text-gray-500">
                ▼
              </span>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              name="bedrooms"
              type="number"
              step="0.1"
              {...register('bedrooms')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Number of bedrooms"
            />
          </div>

          <div className="col-span-12 sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              name="bathrooms"
              type="number"
              step="0.1"
              {...register('bathrooms')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Number of bathrooms"
            />
          </div>

          <div className="col-span-12 sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pools
            </label>
            <input
              name="pool"
              type="number"
              {...register('pool')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Number of pools"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              {...register('address')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Enter property address"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              name="city"
              {...register('city')}
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
              {mediaImages.length} image(s) uploaded
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mediaImages.map((img, index) => (
              <ImagePreview
                key={img.id}
                image={img}
                index={index}
                onRemove={(id) => removeImage(id, setMediaImages, 'media')}
                onSetPrimary={setPrimaryImage}
                isPrimary={img.isPrimary}
                type="media"
              />
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32 bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Upload Media Images</p>
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
              image(s) uploaded.
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
              {bedroomImages.length} image(s) uploaded
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {bedroomImages.map((img, index) => (
              <BedroomImagePreview
                key={img.id}
                image={img}
                index={index}
                onRemove={(id) =>
                  removeImage(id, setBedroomImages, 'bedroom')
                }
                onSetPrimary={setPrimaryImage}
                isPrimary={img.isPrimary}
                onNameChange={updateBedroomImageName}
                onDescriptionChange={updateBedroomImageDescription}
              />
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32 bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Upload Bedrooms Images</p>
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

          {bedroomImages.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              No bedroom images uploaded yet.
            </p>
          ) : (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{bedroomImages.length}</span>{' '}
              bedroom image(s) uploaded.
            </div>
          )}
        </div>

        {/* Videos Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Property Videos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32 bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Upload Videos</p>
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
                  <span className="font-medium">{videos.length}</span> video
                  file(s) selected:
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

        {/* New Fields: Booking TBC and Commission Rate */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking TBC
            </label>
            <input
              name="tbc_by"
              {...register('tbc_by')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Enter booking TBC details"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <input
              name="commission_rate"
              type="number"
              step="0.01"
              {...register('commission_rate')}
              className="w-full border rounded-lg p-3 bg-gray-50"
              placeholder="Enter commission rate percentage"
            />
          </div>
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
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem(setSignatureList, signatureList, i)
                    }
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {signatureList.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No signature distinctions added yet. Click "Add" to add one.
              </p>
            )}
          </div>
        </div>

        {/* Indoor / Outdoor Amenities */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indoor Amenities
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
                  </div>
                </div>
              ))}
              {interiorAmenities.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No indoor amenities added yet. Click "Add" to add one.
                </p>
              )}
            </div>
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
                  </div>
                </div>
              ))}
              {outdoorAmenities.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No outdoor amenities added yet. Click "Add" to add one.
                </p>
              )}
            </div>
          </div>
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

        {/* Buttons */}
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
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <img
                  className="mr-2 w-5 h-5 cursor-pointer"
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760999922/Icon_41_fxo3ap.png"
                  alt="icon"
                />{' '}
                {isEdit ? 'Update Property' : 'Create Property'}
              </>
            )}
          </button>

          {!isEdit && (
            <>
              <button
                type="button"
                className="flex items-center cursor-pointer justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
                onClick={async () => {
                  const values = getValues();
                  await onSubmit(values, true);
                }}
                disabled={submitting}
              >
                <Save className="w-5 h-5 mr-2" /> Save as Draft
              </button>

              <Link
                to="/dashboard/admin-properties-sales"
                className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
              >
                Cancel
              </Link>
            </>
          )}

          {isEdit && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreatePropertySales;