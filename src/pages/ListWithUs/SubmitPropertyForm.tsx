import React, { useState, DragEvent } from 'react';
import { useForm } from 'react-hook-form'; 
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// Define the shape of your form data for React Hook Form
interface Inputs {
  name?: string;
  email?: string;
  phone?: string;
  property_name?: string;
  property_brief?: string;
  confirm_accuracy?: boolean;
}

// File interface for better type safety
interface UploadedFile {
  id: string;
  file: File;
  preview: string | null;
}

// API Base URL
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.eastmondvillas.com';

const SubmitPropertyForm: React.FC = () => {
  // React Hook Form methods - NO validation rules
  const {
    register,
    handleSubmit,
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

  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [isPhotoDragActive, setIsPhotoDragActive] = useState(false);
  const [isDocumentDragActive, setIsDocumentDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission with API call
  const onSubmit = async (data: Inputs) => {
    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      const accessToken = localStorage.getItem('auth_access');
      if (!accessToken) {
        Swal.fire({
          title: "Authentication Required",
          text: "Please log in to submit a property",
          icon: "warning",
        });
        // Redirect to login or show login modal
        window.location.assign('/login');
        return;
      }

      // Create FormData object for multipart/form-data
      const formData = new FormData();
      
      // Add form fields - সব fields optional
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (data.property_name) formData.append('property_name', data.property_name);
      if (data.property_brief) formData.append('property_brief', data.property_brief);
      if (data.confirm_accuracy !== undefined) {
        formData.append('confirm_accuracy', data.confirm_accuracy.toString());
      }

      // Add multiple photos
      photos.forEach((photo) => {
        formData.append('property_photo', photo.file);
      });

      // Add multiple documents
      documents.forEach((doc) => {
        formData.append('property_document', doc.file);
      });

      // Log form data for debugging
      console.log("--- Form Submission Data (All fields optional) ---");
      console.log("Name:", data.name || "(empty)");
      console.log("Email:", data.email || "(empty)");
      console.log("Phone:", data.phone || "(empty)");
      console.log("Property Name:", data.property_name || "(empty)");
      console.log("Property Brief:", data.property_brief || "(empty)");
      console.log("Confirm Accuracy:", data.confirm_accuracy || "(empty)");
      console.log("Total photos:", photos.length);
      console.log("Total documents:", documents.length);
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, 'File:', value.name);
        } else {
          console.log(key, value);
        }
      }

      // Make API call
      const response = await fetch(`${API_BASE}/list_vila/list/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
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
            errors.push(`Photos: ${errorData.property_photo[0]}`);
          }
          if (errorData.property_brief) {
            errors.push(`Description: ${errorData.property_brief[0]}`);
          }
          if (errorData.property_document) {
            errors.push(`Documents: ${errorData.property_document[0]}`);
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
        text: `Your property has been submitted successfully with ${photos.length} photo(s) and ${documents.length} document(s).`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Reset form
      reset();
      setPhotos([]);
      setDocuments([]);
      
      // Show toast notification
      toast.success(`Property submitted successfully!`);

    } catch (error: any) {
      console.error('Submission error:', error);
      
      Swal.fire({
        title: "Submission Failed",
        text: error.message || "An error occurred while submitting your property. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      
      toast.error(error.message || 'Failed to submit property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileSelection = (files: FileList | null, type: 'photo' | 'document') => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let preview: string | null = null;
      
      // Create preview for images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        preview = URL.createObjectURL(file);
      }
      
      newFiles.push({ id, file, preview });
    });

    if (type === 'photo') {
      setPhotos(prev => [...prev, ...newFiles]);
    } else {
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
    handleFileSelection(e.target.files, type);
    e.target.value = ''; // Reset input to allow selecting same file again
  };

  // Handle drag and drop
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

  const handleDrop = (e: DragEvent, type: 'photo' | 'document', setActive: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    handleFileSelection(e.dataTransfer.files, type);
  };

  // Remove a file
  const removeFile = (id: string, type: 'photo' | 'document') => {
    if (type === 'photo') {
      setPhotos(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove?.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
        return prev.filter(f => f.id !== id);
      });
    } else {
      setDocuments(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove?.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
        return prev.filter(f => f.id !== id);
      });
    }
  };

  // Clear all files
  const clearAllFiles = (type: 'photo' | 'document') => {
    if (type === 'photo') {
      photos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview);
      });
      setPhotos([]);
    } else {
      documents.forEach(doc => {
        if (doc.preview) URL.revokeObjectURL(doc.preview);
      });
      setDocuments([]);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto mt-14 p-8 bg-white shadow-2xl rounded-xl">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">Submit Your Property</h2>
        <p className="text-gray-500 mt-2">Kindly fill out the below form and a member of our team will review and be in touch accordingly.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
            <input
              {...register("name")} 
              type="text"
              id="name"
              placeholder="e.g. Juyel (Optional)"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <input
              {...register("email")} 
              type="email"
              id="email"
              placeholder="e.g. ashik@example.com (Optional)"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              {...register("phone")} 
              type="tel"
              id="phone"
              placeholder="e.g. 123456789 (Optional)"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="property_name" className="text-sm font-medium text-gray-700 mb-1">Property Name (Optional)</label>
            <input
              {...register("property_name")} 
              type="text"
              id="property_name"
              placeholder="e.g. Seaclusion (Optional)"
              className="p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* --- Multiple Property Photos/Videos Upload (Optional) --- */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Property Photos/Videos (Optional)
            </label>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => clearAllFiles('photo')}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear All ({photos.length})
              </button>
            )}
          </div>
          
          {/* Photos Preview Grid */}
          {photos.length > 0 && (
            <div className="mb-4 p-4 border border-teal-200 rounded-lg bg-teal-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                      {photo.preview ? (
                        photo.file.type.startsWith('image/') ? (
                          <img 
                            src={photo.preview} 
                            alt="Preview" 
                            className="w-full h-24 object-cover"
                          />
                        ) : photo.file.type.startsWith('video/') ? (
                          <div className="relative w-full h-24 bg-gray-800 flex items-center justify-center">
                            <video className="absolute inset-0 w-full h-full object-cover">
                              <source src={photo.preview} type={photo.file.type} />
                            </video>
                            <div className="relative z-10 text-white">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ) : null
                      ) : (
                        <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(photo.id, 'photo')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      <div className="font-medium truncate">{photo.file.name}</div>
                      <div className="text-gray-500">{formatFileSize(photo.file.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total: {photos.length} file(s) selected
              </div>
            </div>
          )}
          
          {/* Upload Area */}
          <label
            htmlFor="uploadPhotos"
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-gray-50 transition duration-150 cursor-pointer
                         ${isPhotoDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-100'}`}
            onDragOver={(e) => handleDrag(e, setIsPhotoDragActive)}
            onDragLeave={(e) => handleDragLeave(e, setIsPhotoDragActive)}
            onDrop={(e) => handleDrop(e, 'photo', setIsPhotoDragActive)}
          >
            <img className='' src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760832355/Component_17_ejh4v8.png" alt="" />
            <p className="text-sm text-gray-500 mt-2">
              {photos.length > 0 ? 'Click to add more photos/videos' : 'Drop photos/videos here or click to upload (Optional)'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF, MP4, AVI, etc.</p>
            <input
              type="file"
              id="uploadPhotos"
              multiple
              onChange={(e) => handleFileChange(e, 'photo')}
              accept="image/*,video/*"
              className="hidden"
            />
          </label>
        </div>

        {/* --- Multiple Property Documents Upload (Optional) --- */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Property Documents (Optional)
            </label>
            {documents.length > 0 && (
              <button
                type="button"
                onClick={() => clearAllFiles('document')}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear All ({documents.length})
              </button>
            )}
          </div>
          
          {/* Documents Preview List */}
          {documents.length > 0 && (
            <div className="mb-4 p-4 border border-teal-200 rounded-lg bg-teal-50">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group">
                    <div className="flex items-center gap-3">
                      {doc.preview ? (
                        <img 
                          src={doc.preview} 
                          alt="Document preview" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm truncate max-w-xs">{doc.file.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(doc.file.size)} • {doc.file.type.split('/')[1]?.toUpperCase() || 'File'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id, 'document')}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total: {documents.length} document(s) selected
              </div>
            </div>
          )}
          
          {/* Upload Area */}
          <label
            htmlFor="uploadDocuments"
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-gray-50 transition duration-150 cursor-pointer
                         ${isDocumentDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-100'}`}
            onDragOver={(e) => handleDrag(e, setIsDocumentDragActive)}
            onDragLeave={(e) => handleDragLeave(e, setIsDocumentDragActive)}
            onDrop={(e) => handleDrop(e, 'document', setIsDocumentDragActive)}
          >
            <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760832355/Component_17_ejh4v8.png" alt="" />
            <p className="text-sm text-gray-500 mt-2">
              {documents.length > 0 ? 'Click to add more documents' : 'Drop any files here or click to upload (Optional)'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports: PDF, DOC, DOCX, Images, Videos, etc.</p>
            <input
              type="file"
              id="uploadDocuments"
              multiple
              onChange={(e) => handleFileChange(e, 'document')}
              className="hidden"
            />
          </label>
        </div>

        {/* Property Brief Textarea (Optional) */}
        <div className="mb-6">
          <label htmlFor="property_brief" className="text-sm font-medium text-gray-700 block mb-1">
            Property Brief Description (Optional)
          </label>
          <textarea
            {...register("property_brief")} 
            id="property_brief"
            rows={4}
            placeholder="Describe your property (Optional)..."
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-teal-500 focus:border-teal-500"
          ></textarea>
        </div>

        {/* Checkbox (Optional) */}
        <div className="flex flex-col space-y-4">
          <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
            <input
              {...register("confirm_accuracy")}
              type="checkbox"
              className="form-checkbox h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="ml-2">I confirm the information is accurate. (Optional)</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center w-full md:w-auto px-6 py-3 font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 ${
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