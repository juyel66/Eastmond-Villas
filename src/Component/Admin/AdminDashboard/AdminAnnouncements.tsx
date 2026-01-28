// File: AdminAnnouncements.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  X,
  UploadCloud,
  Trash2,
  Search, 
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store"; // adjust path to your store types if available
import {
  fetchAnnouncements,
  createAnnouncement,
} from "../../../features/Properties/PropertiesSlice";
import { unwrapResult } from "@reduxjs/toolkit";
// Import API_BASE only for file URL transformation
import { API_BASE } from "../../../features/Auth/authSlice";

// SweetAlert2 add করেছি
import Swal from "sweetalert2";


const getAuthToken = () => {
  try {
    return localStorage.getItem("auth_access");
  } catch {
    return null;
  }
};


const getFileUrl = (filePath: string) => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  try {
    const root = API_BASE.replace(/\/api\/?$/, "");
    return `${root}${filePath}`;
  } catch {
    return filePath;
  }
};


const PriorityBadge = ({ priority }: { priority: string }) => {
  let bgColor, textColor;
  switch (priority) {
    case "high":
      bgColor = "bg-red-100";
      textColor = "text-red-700";
      break;
    case "medium":
      bgColor = "bg-amber-100";
      textColor = "text-amber-700";
      break;
    default:
      bgColor = "bg-blue-100";
      textColor = "text-blue-700";
      break;
  }
  return (
    <span className={`text-xs font-semibold py-1 px-3 rounded-full ${bgColor} ${textColor}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
    </span>
  );
};


const AttachmentItem = ({ attachment }: { attachment: any }) => {
  // helper to trigger download by fetching blob and using object URL
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = attachment.downloadUrl || attachment.file || attachment;
    const filename = attachment.name || (url && url.split("/").pop()) || "download";

    if (!url) {
      // nothing to download
      return;
    }

    try {
      
      const res = await fetch(url, { method: "GET", mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      // clean up
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      // If fetch fails (CORS, network, HTML response, etc.), fallback to opening the URL in a new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-teal-500 transition">
      <div className="flex items-center space-x-3">
        <FileText className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
          <p className="text-xs text-gray-500">{attachment.size}</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center text-sm font-medium text-white bg-teal-500 rounded-lg px-3 py-1.5 hover:bg-teal-600 transition"
        aria-label={`Download ${attachment.name}`}
        type="button"
      >
        <Download className="w-4 h-4 mr-1" /> Download
      </button>
    </div>
  );
};

const UpdateCard = ({ update, onDelete }: { update: any; onDelete: (id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const attachmentCount = update.attachments?.length ?? 0;


  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onDelete(update.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-4 transition-all overflow-hidden">
      <div
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4">
          <img
            src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760910352/Container_3_l81okq.png"
            alt=""
            className="w-8 h-8"
          />
          <span className="text-base font-medium text-gray-800">{update.title}</span>
          <PriorityBadge priority={update.priority} />
          <span
            className={`text-xs font-medium py-1 px-3 rounded-full ${
              attachmentCount > 0 ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {attachmentCount > 0 ? `${attachmentCount} Attachment(s)` : "No attachments"}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 hidden md:block">{update.date}</span>
          
     
          <button
            onClick={handleDeleteClick}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            aria-label={`Delete announcement: ${update.title}`}
            type="button"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 pt-0 border-t border-gray-100">
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{update.details}</p>
          {attachmentCount > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 border-t pt-4">Attachments</h4>
              <div className="space-y-3">
                {update.attachments.map((att: any, index: number) => (
                  <AttachmentItem key={index} attachment={att} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};


const AnnouncementModal = ({
  onClose,
  onAddLocal, // optional callback (local UI), new item will be available via Redux anyway
}: {
  onClose: () => void;
  onAddLocal?: (item: any) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState("");
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const previewObjs = selected.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
      downloadUrl: URL.createObjectURL(f),
    }));
    setRawFiles((prev) => [...prev, ...selected]);
    setFilePreviews((prev) => [...prev, ...previewObjs]);
  };

  useEffect(() => {
    return () => {
      for (const p of filePreviews) {
        if (p.downloadUrl) URL.revokeObjectURL(p.downloadUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const announcementData = {
        title,
        date,
        priority,
        description: details,
      };

      // dispatch createAnnouncement thunk — thunk knows how to send FormData if `files` provided
      const action = dispatch(createAnnouncement({ announcementData, files: rawFiles }));
      // unwrap to get the created object or throw
      const created: any = await (action as any).unwrap();

      // Optionally notify parent (local update), though Redux contains the new item
      if (onAddLocal) {
        const mapped = {
          id: created.id,
          title: created.title,
          date: created.date,
          priority: created.priority,
          details: created.description ?? details,
          created_at: created.created_at,
          updated_at: created.updated_at,
          attachments: (created.files ?? []).map((f: any) => ({
            id: f.id,
            name: f.file?.split("/").pop() ?? `file_${f.id}`,
            size: "",
            downloadUrl: getFileUrl(f.file),
          })),
        };
        onAddLocal(mapped);
      }

      onClose();
    } catch (err: any) {
      setError(err?.message ? String(err.message) : "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Announcement</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-teal-500"
              placeholder="Enter announcement title"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="Enter announcement details"
            ></textarea>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Attachments</label>
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              <UploadCloud className="w-5 h-5 text-gray-500" />
              Upload Files
            </label>
            <input id="file-upload" type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {filePreviews.length > 0 && (
              <ul className="mt-3 space-y-2">
                {filePreviews.map((f, i) => (
                  <li key={i} className="flex justify-between text-sm text-gray-700 border-b pb-1">
                    <span>{f.name}</span>
                    <a href={f.downloadUrl} download={f.name} className="text-teal-600 hover:underline text-xs">
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md text-sm font-semibold disabled:opacity-60">
            {loading ? "Adding..." : "Add Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
};


const AdminAnnouncements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const announcementsFromStore = useSelector((s: RootState) => s.propertyBooking.announcements) ?? [];
  const loading = useSelector((s: RootState) => s.propertyBooking.loading);
  const fetchError = useSelector((s: RootState) => s.propertyBooking.error);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
  
    dispatch(fetchAnnouncements());
 
  }, []);


  const mappedAnnouncements = (announcementsFromStore || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    date: item.date ?? item.created_at ?? "",
    priority: item.priority ?? "low",
    details: item.description ?? item.details ?? "",
    created_at: item.created_at,
    updated_at: item.updated_at,
    attachments: (item.files ?? []).map((f: any) => ({
      id: f.id,
      name: f.file?.split("/").pop() ?? `file_${f.id}`,
      size: "",
      downloadUrl: getFileUrl(f.file),
    })),
  }));


  const filteredAnnouncements = mappedAnnouncements.filter((announcement) => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      announcement.title.toLowerCase().includes(term) ||
      announcement.details.toLowerCase().includes(term) ||
      announcement.priority.toLowerCase().includes(term) ||
      announcement.date.toLowerCase().includes(term)
    );
  });


  const handleDeleteAnnouncement = async (id: number) => {

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this announcement?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        // Direct API call
        const authToken = getAuthToken();
        const apiUrl = `${API_BASE}/announcements/announcement/${id}/`;
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to delete announcement`);
        }

        // Success message
        await Swal.fire({
          title: 'Deleted!',
          text: 'Announcement has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        
        // Refresh the announcements list
        dispatch(fetchAnnouncements());
        
      } catch (err: any) {
        Swal.fire({
          title: 'Error!',
          text: err?.message ? String(err.message) : 'Failed to delete announcement',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      } finally {
        setDeleting(false);
      }
    }
  };


  const handleAddAnnouncementLocal = (createdMapped: any) => {

  };

  return (
    <div className="bg-gray-50 font-sans p-4 md:p-8 min-h-screen">
      <div className="">
        <div className="flex justify-between mb-8">
          <header>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Announcements</h1>
            <p className="text-gray-600 text-sm">Stay informed with the latest company updates and news.</p>
          </header>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow">
            <Plus className="w-4 h-4" /> Add Announcement
          </button>
        </div>


        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search announcements by title, details, priority or date..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <main className="relative">
 
          {deleting && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-teal-600 mb-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <div className="text-sm text-gray-700">Deleting announcement…</div>
              </div>
            </div>
          )}

  
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <div className="bg-white/90 p-6 rounded-lg shadow-lg flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-teal-600 mb-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <div className="text-sm text-gray-700">Loading announcements…</div>
              </div>
            </div>
          )}

          {/* Error */}
          {fetchError && <div className="text-sm text-red-600 mb-3">{String(fetchError)}</div>}

          {/* Search results info */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600">
              Found {filteredAnnouncements.length} announcement(s) matching "{searchTerm}"
            </div>
          )}

        
          {!loading && filteredAnnouncements.length === 0 && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">
                  {searchTerm ? "No announcements found for your search." : "No announcements found."}
                </p>
                <p className="text-sm mt-2">
                  {searchTerm ? "Try a different search term." : "Create one using the 'Add Announcement' button."}
                </p>
              </div>
            </div>
          )}


          <div className="space-y-4">
            {filteredAnnouncements.map((update: any) => (
              <UpdateCard key={update.id} update={update} onDelete={handleDeleteAnnouncement} />
            ))}
          </div>
        </main>

        {isModalOpen && (
          <AnnouncementModal
            onClose={() => setIsModalOpen(false)}
            onAddLocal={handleAddAnnouncementLocal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;