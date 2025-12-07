// src/components/CreatePropertyRentals.jsx
import React, { useState, useRef } from 'react';
import { User, UploadCloud, X, Save, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import LocationCreateProperty from './LocationCreateProperty';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com/api';

const CreatePropertyRentals = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm({ mode: 'onTouched' });

  // Location
  const [location, setLocation] = useState({
    lat: 25.79,
    lng: -80.13,
    address: '123 Ocean Drive, Miami',
  });

  // Images
  const [mediaImages, setMediaImages] = useState([]); // {id,url,file,isPrimary}
  const [bedroomImages, setBedroomImages] = useState([]); // {id,url,file,isPrimary,name,description}

  // Videos
  const [videos, setVideos] = useState([]); // File[]

  // Multiple-use arrays
  const [signatureList, setSignatureList] = useState(['']);
  const [interiorAmenities, setInteriorAmenities] = useState(['']);
  const [outdoorAmenities, setOutdoorAmenities] = useState(['']);
  const [rules, setRules] = useState(['']);

  // Concierge services rows (like staff)
  const [conciergeRows, setConciergeRows] = useState(['']);

  // Check-in and Check-out
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Staff rows (name + details)
  const [staffRows, setStaffRows] = useState([{ name: '', details: '' }]);

  // 🔥 Booking Rate rows (Rental Period, Minimum Stay, Rate Per Night)
  const [bookingRateRows, setBookingRateRows] = useState([
    { rentalPeriod: '', minimumStay: '', ratePerNight: '' },
  ]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState('');

  // refs for focusing new inputs
  const interiorRefs = useRef([]);
  const outdoorRefs = useRef([]);
  const rulesRefs = useRef([]);
  const signatureRefs = useRef([]);
  const staffNameRefs = useRef([]);
  const conciergeRefs = useRef([]);

  // Mark primary image by id
  const setPrimaryImage = (id) => {
    setMediaImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
    setBedroomImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
  };

  // helper: add files to state with preview (for MAIN media images)
  const handleMediaImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((file, i) => ({
      id: Date.now() + i + Math.random(),
      url: URL.createObjectURL(file),
      file,
      isPrimary: false,
    }));
    setMediaImages((prev) => [...prev, ...newImgs]);
    e.target.value = null;
    setMediaError('');
  };

  // helper: add files to state with preview (for BEDROOM images, with metadata)
  const handleBedroomImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((file, i) => ({
      id: Date.now() + i + Math.random(),
      url: URL.createObjectURL(file),
      file,
      isPrimary: false,
      name: '',
      description: '',
    }));
    setBedroomImages((prev) => [...prev, ...newImgs]);
    e.target.value = null;
    setMediaError('');
  };

  // handle videos upload
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideos(files);
    e.target.value = null;
  };

  const removeImage = (id, setState) => {
    setState((prev) => prev.filter((i) => i.id !== id));
  };

  // shared array helpers
  const updateArray = (setter, arr, idx, value) => {
    const copy = [...arr];
    copy[idx] = value;
    setter(copy);
  };
  const addArrayItem = (setter, arr, refs) => {
    setter((prev) => {
      const next = [...prev, ''];
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

  // staff row helpers
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
    setStaffRows((prev) => prev.filter((_, i) => i !== idx));
    if (staffRows.length === 1) setStaffRows([{ name: '', details: '' }]);
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

  // 🔥 Booking Rate helpers
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
    setBookingRateRows((prev) => prev.filter((_, i) => i !== idx));
    if (bookingRateRows.length === 1) {
      setBookingRateRows([
        { rentalPeriod: '', minimumStay: '', ratePerNight: '' },
      ]);
    }
  };

  // convert to backend format:
  // "booking_rate": [
  //   "jan 20 - jan 30",
  //   "10 days",
  //   "5600",
  //   ...more if multiple rows
  // ]
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

  // metadata builder for main media images
  const buildMediaMetadata = (imgs, category, startOrder = 0) =>
    imgs.map((img, idx) => ({
      category,
      caption: `${category} image ${startOrder + idx + 1}`,
      is_primary: !!img.isPrimary,
      order: startOrder + idx,
    }));

  // helper to focus + scroll to a field by name or selector
  const focusField = (nameOrSelector) => {
    try {
      let el = null;
      if (typeof nameOrSelector === 'string') {
        el =
          document.querySelector(`[name="${nameOrSelector}"]`) ||
          document.querySelector(nameOrSelector);
      } else {
        el = nameOrSelector;
      }
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  // validate before submit
  const validateBeforeSubmit = (values) => {
    const required = ['title', 'price', 'address'];
    const labels = {
      title: 'Title',
      price: 'Price',
      address: 'Address',
    };

    for (const field of required) {
      if (!values[field] && values[field] !== 0) {
        setError(field, {
          type: 'required',
          message: `${labels[field]} is required`,
        });
        toast.error(`${labels[field]} is required`);
        focusField(field);
        return false;
      }
    }

    const totalFiles = (mediaImages.length || 0) + (bedroomImages.length || 0);
    if (totalFiles === 0) {
      setMediaError('At least one property image is required.');
      toast.error('At least one property image is required.');
      const fileEl = document.querySelector('input[type="file"]');
      if (fileEl)
        fileEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (bedroomImages.length > 0) {
      const missingMeta = bedroomImages.find(
        (b) => !b.name || !b.name.trim()
      );
      if (missingMeta) {
        toast.error(
          'Please fill the Bedroom Name for each bedroom image before submitting.'
        );
        try {
          const idx = bedroomImages.findIndex(
            (b) => !b.name || !b.name.trim()
          );
          const el = document.querySelector(
            `[data-bedroom-name-index="${idx}"]`
          );
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
          }
        } catch (e) {}
        return false;
      }
    }

    return true;
  };

  // final submit
  const onSubmit = async (values) => {
    clearErrors();
    setMediaError('');
    if (!validateBeforeSubmit(values)) return;

    setSubmitting(true);
    try {
      const processed = {
        // core fields + API-aligned
        title: values.title,
        description: values.description || '',
        price: values.price ? String(values.price) : '0.00',
        price_display: values.price ? String(values.price) : '0.00',

        // rentals only
        listing_type: 'rent',
        status: (values.status || 'draft').toLowerCase().replace(/\s+/g, '_'),
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

        // 🔥 booking_rate as requested
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

        concierge_services: conciergeRows
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      };

      console.log('--- Processed payload to send ---');
      console.log(JSON.stringify(processed, null, 2));

      // Build FormData
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
          // non-primitive => JSON (matches Postman text with JSON)
          fd.append(k, JSON.stringify(v));
        }
      };

      append('title', processed.title);
      append('description', processed.description);
      append('price', processed.price);
      append('price_display', processed.price_display);
      append('booking_rate', processed.booking_rate);
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
      append('rules_and_etiquette', processed.rules_and_etiquette);
      append('check_in', processed.check_in);
      append('check_out', processed.check_out);
      append('staff', processed.staff);
      append('calendar_link', processed.calendar_link);
      append('seo_title', processed.seo_title);
      append('seo_description', processed.seo_description);
      append('latitude', processed.latitude);
      append('longitude', processed.longitude);
      append('security_deposit', processed.security_deposit);
      append('damage_deposit', processed.damage_deposit);
      append('commission_rate', processed.commission_rate);
      append('concierge_services', processed.concierge_services);

      // METADATA PART
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

      // files
      mediaImages.forEach((img) => fd.append('media_images', img.file));
      bedroomImages.forEach((img) => fd.append('bedrooms_images', img.file));
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

      // send
      const access = (() => {
        try {
          return localStorage.getItem('auth_access');
        } catch {
          return null;
        }
      })();
      const headers = {};
      if (access) headers['Authorization'] = `Bearer ${access}`;

      const res = await fetch(`${API_BASE}/villas/properties/`, {
        method: 'POST',
        headers,
        body: fd,
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        console.error('Create failed:', res.status, body);
        const message =
          body && (body.error || JSON.stringify(body))
            ? body.error || JSON.stringify(body)
            : `HTTP ${res.status}`;
        if (message.includes('At least one media')) {
          setMediaError(
            'At least one property image is required by the server.'
          );
          toast.error('Server requires at least one property image.');
        } else {
          Swal.fire({ title: 'Error!', text: message, icon: 'error' });
        }
        setSubmitting(false);
        return;
      }

      console.log('Created property response:', body);
      Swal.fire({
        title: 'Created!',
        text: 'Property created successfully.',
        icon: 'success',
      });

      // reset UI (keep location)
      reset();
      setMediaImages([]);
      setBedroomImages([]);
      setVideos([]);
      setSignatureList(['']);
      setInteriorAmenities(['']);
      setOutdoorAmenities(['']);
      setRules(['']);
      setCheckIn('');
      setCheckOut('');
      setStaffRows([{ name: '', details: '' }]);
      setConciergeRows(['']);
      setBookingRateRows([
        { rentalPeriod: '', minimumStay: '', ratePerNight: '' },
      ]);
      setSubmitting(false);
    } catch (err) {
      console.error('Submission error', err);
      toast.error('Submission error — check console.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen w-full">
      <Link
        to="/dashboard/admin-properties-rentals"
        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      <div className="lg:flex space-x-10 justify-between items-center mb-6 mt-2 w-full">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Create New Property Listing
          </h1>
          <p className="text-gray-500 mt-2">
            Fill out the details to create a comprehensive property listing.
          </p>
        </div>
        <div className="flex mt-2 items-center gap-4">
          <button
            type="button"
            className="border border-gray-300 text-black flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow-sm"
          >
            <User className="lg:h-5 lg:w-5" /> Preview Agent Portal
          </button>
        </div>
      </div>

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
              name="title"
              {...register('title')}
              className={`w-full border rounded-lg p-3 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
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
              className={`w-full border rounded-lg p-3 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              name="property_type"
              {...register('property_type')}
              className="w-full border rounded-lg p-3 bg-gray-50"
            >
              <option value="">Select type</option>
              <option value="rentals">Rentals</option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              {...register('status')}
              className="w-full border rounded-lg p-3 bg-gray-50"
            >
              <option>Draft</option>
              <option>Pending Review</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Guest
            </label>
            <input
              name="add_guest"
              type="number"
              placeholder="Add guest"
              {...register('add_guest')}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              name="bedrooms"
              type="number"
              {...register('bedrooms')}
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              name="bathrooms"
              type="number"
              {...register('bathrooms')}
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pools
            </label>
            <input
              name="pool"
              type="number"
              {...register('pool')}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              {...register('address')}
              className={`w-full border rounded-lg p-3 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              name="city"
              {...register('city')}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* Media & Assets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Media Images
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mediaImages.map((img) => (
              <div
                key={img.id}
                className="relative border rounded-xl overflow-hidden h-32"
              >
                <img
                  src={img.url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute left-2 bottom-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(img.id)}
                    className="px-2 py-1 bg-white/80 rounded text-xs"
                  >
                    ★
                  </button>
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => removeImage(img.id, setMediaImages)}
                    type="button"
                    className="bg-red-500 rounded-full p-1 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32">
              <UploadCloud className="w-6 h-6 mb-1" />
              <p className="text-sm">Upload Media Images</p>
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
        </div>

        {/* Bedrooms Images + metadata */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Bedrooms Images
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {bedroomImages.map((img, idx) => (
              <div key={img.id} className="space-y-2">
                <div className="relative border rounded-xl overflow-hidden h-32">
                  <img
                    src={img.url}
                    alt="bedroom"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => removeImage(img.id, setBedroomImages)}
                      type="button"
                      className="bg-red-500 rounded-full p-1 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <input
                  data-bedroom-name-index={idx}
                  value={img.name || ''}
                  onChange={(e) =>
                    setBedroomImages((prev) =>
                      prev.map((b) =>
                        b.id === img.id ? { ...b, name: e.target.value } : b
                      )
                    )
                  }
                  placeholder="Bedroom name (required)"
                  className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                />
                <input
                  value={img.description || ''}
                  onChange={(e) =>
                    setBedroomImages((prev) =>
                      prev.map((b) =>
                        b.id === img.id
                          ? { ...b, description: e.target.value }
                          : b
                      )
                    )
                  }
                  placeholder="Bedroom description (optional)"
                  className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                />
              </div>
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32">
              <UploadCloud className="w-6 h-6 mb-1" />
              <p className="text-sm">Upload Bedrooms Images</p>
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

        {/* Videos Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Property Videos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32">
              <UploadCloud className="w-6 h-6 mb-1" />
              <p className="text-sm">Upload Videos</p>
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
              <div className="flex items-center text-sm text-gray-600">
                {videos.length} video file(s) selected.
              </div>
            )}
          </div>
        </div>

        {/* Calendar Link */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calendar Link (optional)
          </label>
          <input
            name="calendar_link"
            {...register('calendar_link')}
            className="w-full border rounded-lg p-3 bg-gray-50"
            placeholder="https://calendly.com/..."
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
                  placeholder="e.g. Ocean view"
                  className="flex-1 border rounded-lg p-2 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(
                        setSignatureList,
                        signatureList,
                        signatureRefs
                      )
                    }
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem(setSignatureList, signatureList, i)
                    }
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
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
                    placeholder="e.g. WiFi"
                    className="flex-1 border rounded-lg p-2 bg-gray-50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem(
                          setInteriorAmenities,
                          interiorAmenities,
                          interiorRefs
                        )
                      }
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg"
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
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
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
                    placeholder="e.g. Parking"
                    className="flex-1 border rounded-lg p-2 bg-gray-50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addArrayItem(
                          setOutdoorAmenities,
                          outdoorAmenities,
                          outdoorRefs
                        )
                      }
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg"
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
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules */}
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
                  placeholder="e.g. No Smoking Indoors"
                  className="flex-1 border rounded-lg p-2 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(setRules, rules, rulesRefs)
                    }
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem(setRules, rules, i)
                    }
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in / out + deposits */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in (HH:MM)
            </label>
            <input
              name="check_in"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              placeholder="e.g. 15:00"
              className={`w-full border rounded-lg p-3 bg-gray-50 ${
                errors.check_in ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.check_in && (
              <p className="text-sm text-red-600 mt-1">
                {errors.check_in.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Format: HH:MM (24-hour). Leave blank if not applicable.
            </p>
          </div>

          <div className="col-span-12 sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out (HH:MM)
            </label>
            <input
              name="check_out"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder="e.g. 11:00"
              className={`w-full border rounded-lg p-3 bg-gray-50 ${
                errors.check_out ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.check_out && (
              <p className="text-sm text-red-600 mt-1">
                {errors.check_out.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Format: HH:MM (24-hour). Leave blank if not applicable.
            </p>
          </div>

          <div className="col-span-12 sm:col-span-4">
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

          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damage Deposit
            </label>
            <input
              name="damage_deposit"
              type="number"
              {...register('damage_deposit')}
              placeholder="10000.00"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12 sm:col-span-4">
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
        </div>

        {/* Concierge services (rows like staff) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Concierge Services (one per field)
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
                  placeholder='e.g. "this is the courier"'
                  className="flex-1 border rounded-lg p-2 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(
                        setConciergeRows,
                        conciergeRows,
                        conciergeRefs
                      )
                    }
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem(setConciergeRows, conciergeRows, i)
                    }
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff rows */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff (add rows: name + details)
          </label>
          <div className="space-y-2">
            {staffRows.map((r, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  ref={(el) => (staffNameRefs.current[idx] = el)}
                  value={r.name}
                  onChange={(e) => updateStaffRow(idx, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 border rounded-lg p-2"
                />
                <input
                  value={r.details}
                  onChange={(e) =>
                    updateStaffRow(idx, 'details', e.target.value)
                  }
                  placeholder="Details (role, phone)"
                  className="flex-1 border rounded-lg p-2"
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={addStaffRow}
                    className="px-3 py-1 bg-teal-600 text-white rounded"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStaffRow(idx)}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 Booking Rate Section (under Staff) */}
        <div className="border rounded-lg p-4 bg-white shadow mt-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Booking Rate
          </h3>

          {bookingRateRows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 mb-3 items-center">
              <input
                value={row.rentalPeriod}
                onChange={(e) =>
                  handleBookingRateChange(idx, 'rentalPeriod', e.target.value)
                }
                className="col-span-4 border rounded-lg p-2 text-sm"
                placeholder="Rental Period (e.g. Jan 20 - Jan 30)"
              />
              <input
                value={row.minimumStay}
                onChange={(e) =>
                  handleBookingRateChange(idx, 'minimumStay', e.target.value)
                }
                className="col-span-4 border rounded-lg p-2 text-sm"
                placeholder="Minimum Stay (e.g. 10 Nights)"
              />
              <input
                value={row.ratePerNight}
                onChange={(e) =>
                  handleBookingRateChange(idx, 'ratePerNight', e.target.value)
                }
                className="col-span-3 border rounded-lg p-2 text-sm"
                placeholder="Rate Per Night (e.g. 5600)"
                type="number"
              />
              <button
                type="button"
                onClick={() => removeBookingRateRow(idx)}
                className="col-span-1 bg-red-100 text-red-600 rounded-lg px-2 text-sm h-10"
              >
                x
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addBookingRateRow}
            className="mt-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Add Booking Rate
          </button>
        </div>

        {/* SEO */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <input
              name="seo_title"
              {...register('seo_title')}
              placeholder="SEO title"
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          <div className="col-span-12">
            <textarea
              name="seo_description"
              {...register('seo_description')}
              placeholder="SEO description"
              className="w-full border rounded-lg p-3 bg-gray-50"
              rows="2"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6 w-full mb-10">
          <button
            type="submit"
            className="flex items-center justify-center w-full px-4 py-3 text-white rounded-lg transition shadow-md bg-teal-600 border border-teal-700 hover:bg-teal-700"
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
                Creating...
              </>
            ) : (
              <>
                <img
                  className="mr-2 w-5 h-5"
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760999922/Icon_41_fxo3ap.png"
                  alt="icon"
                />{' '}
                Create Property
              </>
            )}
          </button>

          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
            onClick={() =>
              toast(
                'Save as draft clicked — implement server call with status=draft'
              )
            }
          >
            <Save className="w-5 h-5 mr-2" /> Save as Draft
          </button>

          <Link
            to="/dashboard/admin-properties-rentals"
            className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreatePropertyRentals;
