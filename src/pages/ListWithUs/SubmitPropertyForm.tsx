import React, { useState, DragEvent } from 'react';
import { useForm } from 'react-hook-form'; 
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

interface Inputs {
  name: string;
  email: string;
  phone: string;
  property_name: string;
  property_brief: string;
  confirm_accuracy: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com';

const SubmitPropertyForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      property_name: '',
      property_brief: '',
      confirm_accuracy: false,
    },
  });

  const [files, setFiles] = useState({
    property_photo: null as File | null,
    property_document: null as File | null, 
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [isPhotoDragActive, setIsPhotoDragActive] = useState(false);
  const [isDocumentDragActive, setIsDocumentDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Inputs) => {
    try {
      // Validation: Check if photo is uploaded
      if (!files.property_photo) {
        Swal.fire({
          title: "Missing Photo",
          text: "Please upload a property photo",
          icon: "warning",
        });
        return;
      }

      setIsSubmitting(true);

      // Create FormData for submission
      const formData = new FormData();
      
      // Append form data
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('property_name', data.property_name);
      formData.append('property_brief', data.property_brief);
      formData.append('confirm_accuracy', data.confirm_accuracy.toString());

      // Append files
      if (files.property_photo) {
        formData.append('property_photo', files.property_photo);
      }

      if (files.property_document) {
        formData.append('property_document', files.property_document);
      }

      // Log form data for debugging
      console.log("--- Property Submission Data (No Login Required) ---");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, 'File:', value.name);
        } else {
          console.log(key, value);
        }
      }

      // Make API call WITHOUT authorization header
      const response = await fetch(`${API_BASE}/list_vila/list/`, {
        method: 'POST',
        // REMOVED: Authorization header since login is not required
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        let errorMessage = 'Failed to submit property. Please try again.';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Extract field errors
          const errors = [];
          if (errorData.property_photo) {
            errors.push(`Photo: ${errorData.property_photo[0]}`);
          }
          if (errorData.property_brief) {
            errors.push(`Description: ${errorData.property_brief[0]}`);
          }
          if (errorData.property_document) {
            errors.push(`Document: ${errorData.property_document[0]}`);
          }
          if (errorData.name) {
            errors.push(`Name: ${errorData.name[0]}`);
          }
          if (errorData.email) {
            errors.push(`Email: ${errorData.email[0]}`);
          }
          if (errorData.phone) {
            errors.push(`Phone: ${errorData.phone[0]}`);
          }
          if (errorData.property_name) {
            errors.push(`Property Name: ${errorData.property_name[0]}`);
          }
          if (errors.length > 0) {
            errorMessage = errors.join(', ');
          } else {
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0] || response.statusText;
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);

      // Show success message
      Swal.fire({
        title: "Success!",
        html: `
          <div class="text-center">
          
            <h3 class="text-xl font-semibold mb-2">Property Submitted Successfully!</h3>
            
         
          </div>
        `,
        icon: "success",
        confirmButtonText: "Done",
        confirmButtonColor: "#0d9488",
      });

      // Reset form
      reset();
      setFiles({ property_photo: null, property_document: null });
      setPhotoPreview(null);
      setDocumentPreview(null);
      
      // Show toast notification
      toast.success('Property submitted successfully!', {
        duration: 5000,
        position: 'top-right',
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      
      Swal.fire({
        title: "Submission Failed",
        html: `
          <div class="text-center">
            <div class="mb-4 text-red-500">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Submission Error</h3>
            <p class="text-gray-600">${error.message || "An error occurred while submitting your property. Please try again."}</p>
            <div class="mt-3 p-2 bg-red-50 rounded">
              <p class="text-xs text-red-700">If the issue persists, please contact support.</p>
            </div>
          </div>
        `,
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#dc2626",
      });
      
      toast.error(error.message || 'Failed to submit property', {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;

    if (name === 'uploadPhotos' && selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, property_photo: file }));
      
      // Create preview for photo/video
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(null);
      }
    } else if (name === 'uploadDocument' && selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, property_document: file })); 
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    }
  };

  const processDroppedFiles = (droppedFiles: FileList | null, targetName: 'uploadPhotos' | 'uploadDocument') => {
    if (!droppedFiles || droppedFiles.length === 0) return;

    if (targetName === 'uploadPhotos') {
      const file = droppedFiles[0];
      setFiles(prev => ({ ...prev, property_photo: file }));
      
      // Create preview
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else if (targetName === 'uploadDocument') {
      const file = droppedFiles[0];
      setFiles(prev => ({ ...prev, property_document: file })); 
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrag = (e: DragEvent, setActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(true);
  };

  const handleDragLeave = (e: DragEvent, setActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
  };

  const handleDrop = (e: DragEvent, targetName: 'uploadPhotos' | 'uploadDocument', setActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    const droppedFiles = e.dataTransfer.files;
    processDroppedFiles(droppedFiles, targetName);
  };

  const removePhoto = () => {
    setFiles(prev => ({ ...prev, property_photo: null }));
    setPhotoPreview(null);
  };

  const removeDocument = () => {
    setFiles(prev => ({ ...prev, property_document: null }));
    setDocumentPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto mt-14 p-8 bg-white shadow-2xl rounded-xl">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">Submit Your Property</h2>
        <p className="text-gray-500 mt-2">
          Kindly fill out the below form and a member of our team will review and be in touch accordingly.
        
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              id="name"
              placeholder="e.g. John Doe"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              id="email"
              placeholder="e.g. example@gmail.com"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone", { 
                required: "Phone number is required",
                minLength: {
                  value: 10,
                  message: "Phone must be at least 10 digits"
                }
              })}
              type="tel"
              id="phone"
              placeholder="e.g. 123456789"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="property_name" className="text-sm font-medium text-gray-700 mb-1">
              Property Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("property_name", { required: "Property Name is required" })}
              type="text"
              id="property_name"
              placeholder="e.g. Seaclusion"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.property_name && <span className="text-red-500 text-xs mt-1">{errors.property_name.message}</span>}
          </div>
        </div>

        {/* Property Photo Upload */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Property Photo <span className="text-red-500">*</span> (Required)
          </label>
          
          {/* Photo Preview */}
          {photoPreview && (
            <div className="mb-3 p-3 border border-teal-200 rounded-lg bg-teal-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-teal-700">Photo Preview:</span>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              {files.property_photo?.type.startsWith('image/') ? (
                <img 
                  src={photoPreview} 
                  alt="Property preview" 
                  className="w-48 h-32 object-cover rounded-md border"
                />
              ) : files.property_photo?.type.startsWith('video/') ? (
                <video 
                  src={photoPreview} 
                  controls 
                  className="w-48 h-32 object-cover rounded-md border"
                />
              ) : null}
              
              <p className="text-xs text-gray-600 mt-1">
                {files.property_photo?.name} ({(files.property_photo?.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
          
          <label
            htmlFor="uploadPhotos"
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-gray-50 transition duration-150 cursor-pointer
                         ${isPhotoDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-100'}`}
            onDragOver={(e) => handleDrag(e, setIsPhotoDragActive)}
            onDragLeave={(e) => handleDragLeave(e, setIsPhotoDragActive)}
            onDrop={(e) => handleDrop(e, 'uploadPhotos', setIsPhotoDragActive)}
          >
            <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760832355/Component_17_ejh4v8.png" alt="Upload icon" />
            <p className="text-sm text-gray-500 mt-2">
              {photoPreview ? 'Click to change photo' : 'Drop photo/video here or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, MP4, etc.</p>
            <input
              type="file"
              id="uploadPhotos"
              name="uploadPhotos"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-red-500">*</span> This field is required
          </p>
        </div>

        {/* Property Document Upload (Optional) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Upload Property Document (Optional)
          </label>
          
          {/* Document Preview */}
          {documentPreview && (
            <div className="mb-3 p-3 border border-teal-200 rounded-lg bg-teal-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-teal-700">Document Preview:</span>
                <button
                  type="button"
                  onClick={removeDocument}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              {files.property_document?.type.startsWith('image/') ? (
                <img 
                  src={documentPreview} 
                  alt="Document preview" 
                  className="w-48 h-32 object-cover rounded-md border"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">{files.property_document?.name}</p>
                    <p className="text-xs text-gray-500">
                      {(files.property_document?.size / 1024).toFixed(2)} KB • {files.property_document?.type}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <label
            htmlFor="uploadDocument"
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-gray-50 transition duration-150 cursor-pointer
                         ${isDocumentDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-100'}`}
            onDragOver={(e) => handleDrag(e, setIsDocumentDragActive)}
            onDragLeave={(e) => handleDragLeave(e, setIsDocumentDragActive)}
            onDrop={(e) => handleDrop(e, 'uploadDocument', setIsDocumentDragActive)}
          >
            <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760832355/Component_17_ejh4v8.png" alt="Upload icon" />
            <p className="text-sm text-gray-500 mt-2">
              {documentPreview ? 'Click to change document' : 'Drop any file here or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports: PDF, DOC, DOCX, Images, Videos, etc.</p>
            <input
              type="file"
              id="uploadDocument"
              name="uploadDocument"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Optional: Upload floor plans, property documents, or additional photos
          </p>
        </div>

        {/* Property Description */}
        <div className="mb-6">
          <label htmlFor="property_brief" className="text-sm font-medium text-gray-700 block mb-1">
            Property Brief Description <span className="text-red-500">*</span> (Required)
          </label>
          <textarea
            {...register("property_brief", { 
              required: "Property brief description is required",
              minLength: {
                value: 10,
                message: "Please provide at least 10 characters"
              }
            })}
            id="property_brief"
            rows={4}
            placeholder="Describe your property (e.g., location, features, amenities, nearby attractions, etc.)..."
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-teal-500 focus:border-teal-500"
          ></textarea>
          {errors.property_brief && <span className="text-red-500 text-xs mt-1">{errors.property_brief.message}</span>}
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-red-500">*</span> Provide details about your property to help us understand it better
          </p>
        </div>

        {/* Checkbox and Submit Button */}
        <div className="flex flex-col space-y-4">
          <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
            <input
              {...register("confirm_accuracy", { 
                required: "You must confirm accuracy to submit" 
              })}
              type="checkbox"
              className="form-checkbox h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="ml-2">
              I confirm the information provided is accurate and I agree to the terms of service.
            </span>
          </label>
          {errors.confirm_accuracy && <span className="text-red-500 text-xs mt-1">{errors.confirm_accuracy.message}</span>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center w-full md:w-auto px-8 py-3 font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 transform -rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M15 10a1 1 0 01-1 1H6a1 1 0 110-2h8a1 1 0 011 1z" clipRule="evenodd" />
                </svg>
                Submit Property
              </>
            )}
          </button>

       
        </div>
      </form>
    </div>
  );
};

export default SubmitPropertyForm;