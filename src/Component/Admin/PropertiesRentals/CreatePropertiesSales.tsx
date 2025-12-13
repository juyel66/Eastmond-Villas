// src/components/CreatePropertySales.jsx
import React, { useState, useRef, useEffect } from 'react';
import { User, UploadCloud, X, Save, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import LocationCreateProperty from './LocationCreateProperty';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com/api';

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

  useEffect(() => {
    if (isEdit && editData) {
      reset({
        title: editData.title || '',
        description: editData.description || '',
        price: editData.price || editData.price_display || '',
        status: editData.status || 'draft',
        add_guest: editData.add_guest || '',
        bedrooms: editData.bedrooms || '',
        bathrooms: editData.bathrooms || '',
        pool: editData.pool || '',
        address: editData.address || '',
        city: editData.city || '',
        calendar_link: editData.calendar_link || '',
        seo_title: editData.seo_title || '',
        seo_description: editData.seo_description || '',
      });

      if (editData.latitude && editData.longitude) {
        setLocation({
          lat: editData.latitude,
          lng: editData.longitude,
          address: editData.address || '123 Ocean Drive, Miami',
        });
      }

      setSignatureList(editData.signature_distinctions || ['']);
      setInteriorAmenities(editData.interior_amenities || ['']);
      setOutdoorAmenities(editData.outdoor_amenities || ['']);
    }
  }, [isEdit, editData, reset]);

  const [location, setLocation] = useState({
    lat: 25.79,
    lng: -80.13,
    address: '123 Ocean Drive, Miami',
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

  const setPrimaryImage = (id) => {
    setMediaImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
    setBedroomImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
  };

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

  const handleBedroomImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((file, i) => ({
      id: Date.now() + i + Math.random(),
      url: URL.createObjectURL(file),
      file,
      name: '',
      description: '',
      isPrimary: false,
    }));
    setBedroomImages((prev) => [...prev, ...newImgs]);
    e.target.value = null;
    setMediaError('');
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideos(files);
    e.target.value = null;
  };

  const removeImage = (id, setState) => {
    setState((prev) => prev.filter((i) => i.id !== id));
  };

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
        if (refs?.current[i]) refs.current[i].focus();
      }, 60);
      return next;
    });
  };

  const removeArrayItem = (setter, arr, idx) => {
    if (arr.length === 1) {
      setter(['']);
      return;
    }
    setter(arr.filter((_, i) => i !== idx));
  };

  const buildMediaMetadata = (imgs, category, startOrder = 0) =>
    imgs.map((img, idx) => ({
      category,
      caption: `${category} image ${startOrder + idx + 1}`,
      is_primary: !!img.isPrimary,
      order: startOrder + idx,
    }));

  const validateBeforeSubmit = (values) => {
    if (!values.title) {
      toast.error('Title is required');
      return false;
    }
    if (!values.price) {
      toast.error('Price is required');
      return false;
    }
    if (!values.address) {
      toast.error('Address is required');
      return false;
    }

    const totalFiles = mediaImages.length + bedroomImages.length;
    if (!isEdit && totalFiles === 0) {
      toast.error('At least one property image is required.');
      return false;
    }

    const missingMeta = bedroomImages.find((b) => !b.name || !b.name.trim());
    if (missingMeta) {
      toast.error('Bedroom name is required for each bedroom image.');
      return false;
    }

    return true;
  };

  const onSubmit = async (values, isDraft = false) => {
    clearErrors();
    if (!validateBeforeSubmit(values)) return;

    setSubmitting(true);

    try {
      const processed = {
        title: values.title,
        description: values.description || '',
        price: String(values.price),
        price_display: String(values.price),
        listing_type: 'sale', // FIXED SALE
        status: isDraft
          ? 'draft'
          : (values.status || 'draft').toLowerCase().replace(/\s+/g, '_'),
        address: values.address || location.address,
        city: values.city || '',
        add_guest: Number(values.add_guest) || 1,
        bedrooms: Number(values.bedrooms) || 0,
        bathrooms: Number(values.bathrooms) || 0,
        pool: Number(values.pool) || 0,
        signature_distinctions: signatureList.filter(Boolean),
        interior_amenities: interiorAmenities.filter(Boolean),
        outdoor_amenities: outdoorAmenities.filter(Boolean),
        calendar_link: values.calendar_link || '',
        seo_title: values.seo_title || '',
        seo_description: values.seo_description || '',
        latitude: location.lat,
        longitude: location.lng,
      };

      const fd = new FormData();
      const append = (k, v) => {
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      };

      Object.entries(processed).forEach(([k, v]) => append(k, v));

      buildMediaMetadata(mediaImages, 'media').forEach((m) =>
        fd.append('media_metadata', JSON.stringify(m))
      );

      const bedroomsMeta = bedroomImages.map((img, idx) => ({
        index: idx,
        name: img.name,
        description: img.description || '',
      }));
      append('bedrooms_meta', bedroomsMeta);

      mediaImages.forEach((img) => fd.append('media_images', img.file));
      bedroomImages.forEach((img) => fd.append('bedrooms_images', img.file));
      videos.forEach((v) => fd.append('videos', v));

      const token = localStorage.getItem('auth_access');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

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
        Swal.fire({
          title: 'Error',
          text: body?.error || 'Failed',
          icon: 'error',
        });
        setSubmitting(false);
        return;
      }

      console.log('SUCCESS RESPONSE:', body);

      Swal.fire({
        title: isEdit ? 'Updated!' : 'Success!',
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
      console.error('Submission Error:', err);
      toast.error('Submission error — check console.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen w-full">
      {!isEdit && (
        <Link
          to="/dashboard/admin-properties-sales"
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      )}

      <div className="lg:flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            {isEdit ? 'Edit Property (Sales)' : 'Create New Property (Sales)'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isEdit
              ? 'Update the details of the property.'
              : 'Enter details to create the listing.'}
          </p>
        </div>
        <button className="border border-gray-300 text-black px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow-sm">
          <User className="w-5 h-5 sm:inline-block hidden" /> Preview Agent
          Portal
        </button>
      </div>

      {!isEdit && (
        <>
          <div className="text-2xl font-semibold mb-2">Add Location</div>
          <div className="mb-5">
            <LocationCreateProperty
              lat={location.lat}
              lng={location.lng}
              text={location.address}
              onLocationAdd={(villa) =>
                setLocation({
                  lat: villa.lat,
                  lng: villa.lng,
                  address: villa.name,
                })
              }
            />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit((values) => onSubmit(values, false))}
        className="space-y-6"
      >
        {/* BASIC INFO */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Title
            </label>
            <input
              {...register('title')}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
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
              type="number"
              {...register('price')}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              disabled
              className="w-full border rounded-lg p-3 bg-gray-100 text-gray-600"
            >
              <option>Sales </option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
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
              type="number"
              {...register('add_guest')}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              step="0.01"
              {...register('bedrooms')}
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              step="0.01"
              {...register('bathrooms')}
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pools
            </label>
            <input
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
              {...register('address')}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              {...register('city')}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* MEDIA */}
        {!isEdit && (
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
                  <img src={img.url} className="w-full h-full object-cover" />
                  <div className="absolute left-2 bottom-2">
                    <button
                      onClick={() => setPrimaryImage(img.id)}
                      type="button"
                      className="px-2 py-1 bg-white/80 rounded text-xs"
                    >
                      ★
                    </button>
                  </div>
                  <button
                    onClick={() => removeImage(img.id, setMediaImages)}
                    className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 transition h-32">
                <UploadCloud className="w-6 h-6 mb-1" />
                <p className="text-sm">Upload Media</p>
                <input
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
        )}

        {/* BEDROOM IMAGES */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Bedroom Images
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {bedroomImages.map((img, idx) => (
                <div key={img.id} className="space-y-2">
                  <div className="relative border rounded-xl overflow-hidden h-32">
                    <img src={img.url} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(img.id, setBedroomImages)}
                      className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <input
                    value={img.name}
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
                    value={img.description}
                    onChange={(e) =>
                      setBedroomImages((prev) =>
                        prev.map((b) =>
                          b.id === img.id
                            ? { ...b, description: e.target.value }
                            : b
                        )
                      )
                    }
                    placeholder="Description (optional)"
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  />
                </div>
              ))}

              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 transition h-32">
                <UploadCloud className="w-6 h-6 mb-1" />
                <p className="text-sm">Upload Bedroom Images</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleBedroomImageUpload}
                />
              </label>
            </div>
          </div>
        )}

        {/* VIDEOS */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Property Videos
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 transition h-32">
                <UploadCloud className="w-6 h-6 mb-1" />
                <p className="text-sm">Upload Videos</p>
                <input
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
        )}

        {/* SIGNATURE + AMENITIES */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signature Distinctions
          </label>
          <div className="space-y-2">
            {signatureList.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={s}
                  ref={(el) => (signatureRefs.current[i] = el)}
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
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem(setSignatureList, signatureList, signatureRefs)
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
            ))}
          </div>
        </div>

        {/* AMENITIES */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indoor Amenities
            </label>
            <div className="space-y-3">
              {interiorAmenities.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={v}
                    ref={(el) => (interiorRefs.current[i] = el)}
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
                    value={v}
                    ref={(el) => (outdoorRefs.current[i] = el)}
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
                      removeArrayItem(setOutdoorAmenities, outdoorAmenities, i)
                    }
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-lg"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
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

        {/* BUTTONS */}
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
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <img
                  className="mr-2 w-5 h-5"
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
                className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
                onClick={async () => {
                  const values = getValues();
                  await onSubmit(values, true);
                }}
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
        </div>
      </form>
    </div>
  );
};

export default CreatePropertySales;
