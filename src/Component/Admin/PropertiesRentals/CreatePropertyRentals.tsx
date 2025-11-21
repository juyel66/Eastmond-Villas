// src/components/CreatePropertyRentals.jsx
import React, { useState, useRef } from 'react';
import { User, UploadCloud, X, Save, ChevronDown, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import LocationCreateProperty from './LocationCreateProperty';
import toast from 'react-hot-toast';

const splitCommaSeparated = (value) => {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://10.10.13.60:8000/api';

const CreatePropertyRentals = () => {
  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm({ mode: 'onTouched' });

  // Location
  const [location, setLocation] = useState({ lat: 25.79, lng: -80.13, address: '123 Ocean Drive, Miami' });

  // Images
  const [mediaImages, setMediaImages] = useState([]); // {id,url,file,isPrimary}
  const [bedroomImages, setBedroomImages] = useState([]);

  // Mark primary image by id
  const setPrimaryImage = (id) => {
    setMediaImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === id })));
    setBedroomImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === id })));
  };

  // Dynamic lists
  const [interiorAmenities, setInteriorAmenities] = useState(['']);
  const [outdoorAmenities, setOutdoorAmenities] = useState(['']);
  const [rules, setRules] = useState(['']);

  // Check-in
  const [checkInPeriods, setCheckInPeriods] = useState([]);
  const [tempCheckIn, setTempCheckIn] = useState({ check_in: '', check_out: '' });

  // Staff
  const [staffNamesStr, setStaffNamesStr] = useState('');
  const [staffDetailsStr, setStaffDetailsStr] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState('');

  // refs for focusing new inputs
  const interiorRefs = useRef([]);
  const outdoorRefs = useRef([]);
  const rulesRefs = useRef([]);

  // helper: add files to state with preview
  const handleImageUpload = (e, setState) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((file, i) => ({
      id: Date.now() + i + Math.random(),
      url: URL.createObjectURL(file),
      file,
      isPrimary: false
    }));
    setState(prev => [...prev, ...newImgs]);
    e.target.value = null;
    setMediaError('');
  };

  const removeImage = (id, setState) => {
    setState(prev => prev.filter(i => i.id !== id));
  };

  // array helpers
  const updateArray = (setter, arr, idx, value) => {
    const copy = [...arr]; copy[idx] = value; setter(copy);
  };
  const addArrayItem = (setter, arr, refs) => {
    setter(prev => {
      const next = [...prev, ''];
      setTimeout(() => {
        const i = next.length - 1;
        if (refs.current[i]) refs.current[i].focus();
      }, 60);
      return next;
    });
  };
  const removeArrayItem = (setter, arr, idx) => {
    if (arr.length === 1) { setter(['']); return; }
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  // check-in periods
  const addCheckInPeriod = () => {
    if (!tempCheckIn.check_in || !tempCheckIn.check_out) return;
    setCheckInPeriods(prev => [...prev, { ...tempCheckIn }]);
    setTempCheckIn({ check_in: '', check_out: '' });
  };
  const removeCheckIn = idx => setCheckInPeriods(prev => prev.filter((_, i) => i !== idx));

  // staff builder
  const buildStaffArray = (namesStr, detailsStr) => {
    const names = splitCommaSeparated(namesStr);
    const details = splitCommaSeparated(detailsStr);
    const max = Math.max(names.length, details.length);
    const arr = [];
    for (let i = 0; i < max; i++) arr.push({ name: names[i] || '', details: details[i] || '' });
    return arr;
  };

  // metadata builder
  const buildMediaMetadata = (imgs, category, startOrder=0) => imgs.map((img, idx) => ({
    category,
    caption: `${category} image ${startOrder + idx + 1}`,
    is_primary: !!img.isPrimary, // use user selection if available
    order: startOrder + idx
  }));

  // validate basic fields + media
  const validateBeforeSubmit = (values) => {
    let ok = true;
    if (!values.title) { setError('title', { type: 'required', message: 'Title is required' }); ok = false; }
    if (!values.price) { setError('price', { type: 'required', message: 'Price is required' }); ok = false; }
    if (!values.address) { setError('address', { type: 'required', message: 'Address is required' }); ok = false; }
    const totalFiles = (mediaImages.length || 0) + (bedroomImages.length || 0);
    if (totalFiles === 0) { setMediaError('At least one property image is required.'); ok = false; }
    return ok;
  };

  // final submit
  const onSubmit = async (values) => {
    clearErrors();
    setMediaError('');
    if (!validateBeforeSubmit(values)) return;

    setSubmitting(true);
    try {
      // Processed payload (for console)
      const processed = {
        title: values.title,
        description: values.description || '',
        price: values.price ? String(values.price) : '0.00',
        listing_type: values.property_type === 'sales' ? 'sale' : 'rent', // backend expects listing_type
        status: (values.status || 'draft').toLowerCase().replace(/\s+/g, '_'),
        address: values.address || location.address,
        city: values.city || '',
        add_guest: Number(values.add_guest) || 1,
        bedrooms: Number(values.bedrooms) || 0,
        bathrooms: Number(values.bathrooms) || 0,
        pool: Number(values.pool) || 0,
        signature_distinctions: splitCommaSeparated(values.signature_distinctions || ''),
        interior_amenities: interiorAmenities.filter(Boolean),
        outdoor_amenities: outdoorAmenities.filter(Boolean),
        rules_and_etiquette: rules.filter(Boolean),
        check_in_periods: checkInPeriods,
        staff: buildStaffArray(staffNamesStr, staffDetailsStr),
        calendar_link: values.calendar_link || '',
        booking_rate_start: values.booking_rate_start || '',
        seo_title: values.seo_title || '',
        seo_description: values.seo_description || '',
        latitude: location.lat ?? null,
        longitude: location.lng ?? null
      };

      console.log('Processed payload:', processed);

      // Build FormData
      const fd = new FormData();
      const append = (k, v) => {
        if (v === undefined || v === null) return;
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') fd.append(k, String(v));
        else fd.append(k, JSON.stringify(v));
      };

      // append simple fields
      append('title', processed.title);
      append('description', processed.description);
      append('price', processed.price);
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
      append('check_in_periods', processed.check_in_periods);
      append('staff', processed.staff);
      append('calendar_link', processed.calendar_link);
      append('booking_rate_start', processed.booking_rate_start);
      append('seo_title', processed.seo_title);
      append('seo_description', processed.seo_description);
      append('latitude', processed.latitude);
      append('longitude', processed.longitude);

      // metadata and file order — let user selection override first primary if they chose one
      const mediaMeta = buildMediaMetadata(mediaImages, 'media', 0);
      const bedroomMeta = buildMediaMetadata(bedroomImages, 'bedroom', mediaImages.length);
      const combinedMeta = [...mediaMeta, ...bedroomMeta];

      // If no image was manually marked primary, set first overall as primary
      const anyPrimary = combinedMeta.some(m => m.is_primary);
      if (!anyPrimary && combinedMeta.length > 0) combinedMeta[0].is_primary = true;

      // append files in canonical order (mediaImages then bedroomImages)
      mediaImages.forEach(img => fd.append('media_files', img.file));
      bedroomImages.forEach(img => fd.append('media_files', img.file));

      // For compatibility also append the files under the exact keys some clients used
      mediaImages.forEach(img => fd.append('media_images', img.file));
      bedroomImages.forEach(img => fd.append('bedrooms_images', img.file));

      // append metadata entries in same order
      combinedMeta.forEach(meta => fd.append('media_metadata', JSON.stringify(meta)));

      // debug: list keys (will appear in console)
      console.log('FormData preview:');
      for (const pair of fd.entries()) {
        if (pair[1] instanceof File) console.log(pair[0], 'File:', pair[1].name);
        else console.log(pair[0], (typeof pair[1] === 'string' && pair[1].length > 100) ? pair[1].slice(0,100) + '...' : pair[1]);
      }

      // send
      const access = (() => { try { return localStorage.getItem('auth_access'); } catch { return null; } })();
      const headers = {};
      if (access) headers['Authorization'] = `Bearer ${access}`;

      const res = await fetch(`${API_BASE}/villas/properties/`, { method: 'POST', headers, body: fd });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        console.error('Create failed:', res.status, body);
        const message = body && (body.error || JSON.stringify(body)) ? (body.error || JSON.stringify(body)) : `HTTP ${res.status}`;
        if (message.includes('At least one media')) setMediaError('At least one property image is required by the server.');
        alert(`Failed to create property: ${message}`);
        setSubmitting(false);
        return;
      }

      console.log('Created property:', body);
      toast.success('Property created successfully.');

      // reset UI (keep location)
      reset();
      setMediaImages([]);
      setBedroomImages([]);
      setInteriorAmenities(['']);
      setOutdoorAmenities(['']);
      setRules(['']);
      setCheckInPeriods([]);
      setStaffNamesStr('');
      setStaffDetailsStr('');
      setSubmitting(false);
    } catch (err) {
      console.error('Submission error', err);
      alert('Submission error — see console.');
      setSubmitting(false);
    }
  };

  // small field components
  const FormCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 w-full shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h2>
      <div className="space-y-6">{children}</div>
    </div>
  );

  const Field = ({ label, ...rest }) => (
    <div className="col-span-12">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input className="w-full border rounded-lg bg-gray-50 text-gray-800 p-3" {...rest} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen w-full">
      <Link to="/dashboard/admin-properties-rentals" className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4">
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      <div className="lg:flex space-x-10 justify-between items-center mb-10 mt-6 w-full">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Create New Property Listing</h1>
          <p className="text-gray-500 mt-2">Fill out the details to create a comprehensive property listing.</p>
        </div>
        <div className="flex mt-2 items-center gap-4">
          <button type="button" className="border border-gray-300 text-black flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow-sm"><User className="lg:h-5 lg:w-5" /> Preview Agent Portal</button>
        </div>
      </div>

      <div className='text-2xl mt-2 font-semibold mb-2'>Add Location</div>
      <div className='mb-5'>
        <LocationCreateProperty lat={location.lat} lng={location.lng} text={location.address}
          onLocationAdd={(villaData) => setLocation({ lat: villaData.lat, lng: villaData.lng, address: villaData.name, description: villaData.description })}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-full mx-auto space-y-8">
        <FormCard title="Basic Information">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
              <input {...register('title')} className={`w-full border rounded-lg p-3 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows="3" className="w-full border rounded-lg p-3 bg-gray-50" />
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" {...register('price')} className={`w-full border rounded-lg p-3 ${errors.price ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select {...register('property_type')} className="w-full border rounded-lg p-3 bg-gray-50">
                <option value="">Select type</option>
                <option value="rentals">Rentals</option>
                <option value="sales">Sales</option>
              </select>
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="w-full border rounded-lg p-3 bg-gray-50">
                <option>Draft</option>
                <option>Pending Review</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </div>

            <Field label="Add Guest" placeholder="Add guest" {...register('add_guest')} />
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input type="number" {...register('bedrooms')} className="w-full border rounded-lg p-3" />
            </div>
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input type="number" {...register('bathrooms')} className="w-full border rounded-lg p-3" />
            </div>
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pools</label>
              <input type="number" {...register('pool')} className="w-full border rounded-lg p-3" />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input {...register('address')} className={`w-full border rounded-lg p-3 ${errors.address ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input {...register('city')} className="w-full border rounded-lg p-3" />
            </div>
          </div>
        </FormCard>

        <FormCard title="Media & Assets">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mediaImages.map(img => (
              <div key={img.id} className="relative border rounded-xl overflow-hidden h-32">
                <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute left-2 bottom-2 flex gap-2">
                  <button type="button" onClick={() => setPrimaryImage(img.id)} className="px-2 py-1 bg-white/80 rounded text-xs">★</button>
                </div>
                <div className="absolute top-2 right-2">
                  <button onClick={() => removeImage(img.id, setMediaImages)} type="button" className="bg-red-500 rounded-full p-1 text-white"><X className="w-3 h-3" /></button>
                </div>
                {img.isPrimary && <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">Primary</span>}
              </div>
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32">
              <UploadCloud className="w-6 h-6 mb-1" />
              <p className="text-sm">Upload Media Images</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, setMediaImages)} />
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Link (optional)</label>
            <input {...register('calendar_link')} className="w-full border rounded-lg p-3 bg-gray-50" placeholder="https://calendly.com/..." />
          </div>

          {mediaError && <p className="text-sm text-red-600 mt-2">{mediaError}</p>}
        </FormCard>

        <FormCard title="Bedrooms Images">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {bedroomImages.map(img => (
              <div key={img.id} className="relative border rounded-xl overflow-hidden h-32">
                <img src={img.url} alt="bedroom" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <button onClick={() => removeImage(img.id, setBedroomImages)} type="button" className="bg-red-500 rounded-full p-1 text-white"><X className="w-3 h-3" /></button>
                </div>
                {img.isPrimary && <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded">Primary</span>}
              </div>
            ))}

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-gray-500 hover:border-teal-500 hover:text-teal-600 transition h-32">
              <UploadCloud className="w-6 h-6 mb-1" />
              <p className="text-sm">Upload Bedrooms Images</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, setBedroomImages)} />
            </label>
          </div>
        </FormCard>

        <FormCard title="Signature Distinctions">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature Distinctions (comma-separated)</label>
            <textarea {...register('signature_distinctions')} className="w-full border rounded-lg p-3 bg-gray-50" rows="2" />
          </div>
        </FormCard>

        <FormCard title="Floor Details">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Indoor Amenities</label>
              <div className="space-y-3">
                {interiorAmenities.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input ref={el => interiorRefs.current[i] = el} value={v} onChange={e => updateArray(setInteriorAmenities, interiorAmenities, i, e.target.value)} placeholder="e.g. WiFi" className="flex-1 border rounded-lg p-2 bg-gray-50" />
                    <div className="flex gap-2">
                      {i === interiorAmenities.length - 1 && v.trim().length > 0 && <button type="button" onClick={() => addArrayItem(setInteriorAmenities, interiorAmenities, interiorRefs)} className="px-3 py-2 bg-teal-600 text-white rounded-lg">Add</button>}
                      <button type="button" onClick={() => removeArrayItem(setInteriorAmenities, interiorAmenities, i)} className="px-2 py-1 bg-red-100 text-red-600 rounded-lg">x</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Outdoor Amenities</label>
              <div className="space-y-3">
                {outdoorAmenities.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input ref={el => outdoorRefs.current[i] = el} value={v} onChange={e => updateArray(setOutdoorAmenities, outdoorAmenities, i, e.target.value)} placeholder="e.g. Parking" className="flex-1 border rounded-lg p-2 bg-gray-50" />
                    <div className="flex gap-2">
                      {i === outdoorAmenities.length - 1 && v.trim().length > 0 && <button type="button" onClick={() => addArrayItem(setOutdoorAmenities, outdoorAmenities, outdoorRefs)} className="px-3 py-2 bg-teal-600 text-white rounded-lg">Add</button>}
                      <button type="button" onClick={() => removeArrayItem(setOutdoorAmenities, outdoorAmenities, i)} className="px-2 py-1 bg-red-100 text-red-600 rounded-lg">x</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FormCard>

        <FormCard title="Rules & Etiquette">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rules (add one by one)</label>
          <div className="space-y-3">
            {rules.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input ref={el => rulesRefs.current[i] = el} value={v} onChange={e => updateArray(setRules, rules, i, e.target.value)} placeholder="e.g. No Smoking Indoors" className="flex-1 border rounded-lg p-2 bg-gray-50" />
                <div className="flex gap-2">
                  {i === rules.length - 1 && v.trim().length > 0 && <button type="button" onClick={() => addArrayItem(setRules, rules, rulesRefs)} className="px-3 py-2 bg-teal-600 text-white rounded-lg">Add</button>}
                  <button type="button" onClick={() => removeArrayItem(setRules, rules, i)} className="px-2 py-1 bg-red-100 text-red-600 rounded-lg">x</button>
                </div>
              </div>
            ))}
          </div>
        </FormCard>

        <FormCard title="Check-in Information">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
              <input type="date" value={tempCheckIn.check_in} onChange={e => setTempCheckIn(prev => ({ ...prev, check_in: e.target.value }))} className="w-full border rounded-lg p-2 bg-gray-50" />
            </div>
            <div className="col-span-12 md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
              <input type="date" value={tempCheckIn.check_out} onChange={e => setTempCheckIn(prev => ({ ...prev, check_out: e.target.value }))} className="w-full border rounded-lg p-2 bg-gray-50" />
            </div>
            <div className="col-span-12 md:col-span-2 flex items-end">
              <button type="button" onClick={addCheckInPeriod} className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg">Add</button>
            </div>

            <div className="col-span-12">
              <div className="flex flex-wrap gap-3">
                {checkInPeriods.map((p, i) => (
                  <div key={i} className="bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-3">
                    <span className="text-sm">{p.check_in} → {p.check_out}</span>
                    <button type="button" onClick={() => removeCheckIn(i)} className="text-xs text-red-500">x</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FormCard>

        <FormCard title="Staff">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name (comma-separated)</label>
              <input value={staffNamesStr} onChange={e => setStaffNamesStr(e.target.value)} className="w-full border rounded-lg p-2 bg-gray-50" />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Details (comma-separated)</label>
              <input value={staffDetailsStr} onChange={e => setStaffDetailsStr(e.target.value)} className="w-full border rounded-lg p-2 bg-gray-50" />
            </div>
          </div>
        </FormCard>

        <FormCard title="Booking Rate">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12"><input {...register('booking_rate_start')} placeholder="Rate details" className="w-full border rounded-lg p-3 bg-gray-50" /></div>
          </div>
        </FormCard>

        <FormCard title="SEO Optimization">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12"><input {...register('seo_title')} placeholder="SEO title" className="w-full border rounded-lg p-3 bg-gray-50" /></div>
            <div className="col-span-12"><textarea {...register('seo_description')} placeholder="SEO description" className="w-full border rounded-lg p-3 bg-gray-50" rows="2" /></div>
          </div>
        </FormCard>

        <div className="flex flex-col gap-3 mt-6 w-full mb-10">
          <button type="submit" className="flex items-center justify-center w-full px-4 py-3 text-white rounded-lg transition shadow-md bg-teal-600 border border-teal-700 hover:bg-teal-700">
            {submitting ? 'Creating…' : <><img className='mr-2 w-5 h-5' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760999922/Icon_41_fxo3ap.png" alt="icon" /> Create Property</>}
          </button>

          <button type="button" className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm" onClick={() => alert('Save as Draft clicked — implement server call with status=draft')}>
            <Save className="w-5 h-5 mr-2" /> Save as Draft
          </button>

          <Link to="/dashboard/admin-properties-rentals" className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreatePropertyRentals;
