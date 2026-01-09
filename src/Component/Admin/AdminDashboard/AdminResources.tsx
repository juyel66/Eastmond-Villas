// src/components/AdminResources.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Search, Plus, UploadCloud, X, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources } from '../../../features/Properties/PropertiesSlice';
import { API_BASE, authFetch } from '../../../features/Auth/authSlice';
import Swal from 'sweetalert2';

type APIResourceFile = { name: string; url: string; type: 'image' | 'video' | 'pdf' | 'Other' };
type UIResource = {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  fileType?: string;
  downloadUrl?: string | null;
  files?: APIResourceFile[];
  raw?: any;
};

const CATEGORIES_DISPLAY = ['All', 'Branding', 'Templates', 'Legal Forms', 'Training', 'Market Research', 'External Tools'] as const;
const CATEGORY_TO_API: Record<string, string> = {
  Branding: 'branding',
  Templates: 'templates',
  'Legal Forms': 'legal_forms',
  Training: 'training',
  'Market Research': 'market_research',
  'External Tools': 'external_tools',
  All: '',
};
const categories = CATEGORIES_DISPLAY as string[];

/* -----------------------
   Helpers
------------------------*/
function getFileUrl(filePath?: string | null) {
  if (!filePath) return null;
  const s = String(filePath).trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  try {
    const root = (API_BASE || '').replace(/\/api\/?$/, '');
    if (!root) return s;
    if (s.startsWith('/')) return `${root}${s}`;
    return `${root}/${s}`;
  } catch {
    return s;
  }
}

function normalizeCategoryForCompare(cat?: string | null) {
  if (!cat) return '';
  return String(cat).trim().toLowerCase().replace(/\s+/g, '_');
}

// NEW helper: format backend category -> Title Case display (e.g. "external_tools" -> "External Tools")
function formatCategoryForDisplay(cat?: string | null) {
  if (!cat) return '—';
  const s = String(cat).trim().replace(/_/g, ' ');
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/* -----------------------
   Resource card
------------------------*/
const ResourceCard = ({ resource, onDownload, onDelete }: { resource: UIResource; onDownload: (r: UIResource) => void; onDelete: (r: UIResource) => void }) => {
  const fileCount = resource.files?.length ?? (resource.downloadUrl ? 1 : 0);
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 flex flex-col hover:shadow-xl transition duration-300 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium py-1 px-3 rounded-full bg-gray-100 text-gray-700">
            {resource.fileType ?? 'file'}
          </span>

          {/* Gray delete button (replaces 3-dot menu) */}
          <button
            onClick={() => onDelete(resource)}
            title="Delete resource"
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{resource.title}</h3>
      <p className="text-sm text-gray-600 flex-grow mb-4">{resource.description}</p>

      <div className="flex justify-between items-center mb-3 border-t pt-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Category</p>
          {/* Use formatted category (Title Case, underscores removed) */}
          <span className="text-sm font-medium text-gray-800">{formatCategoryForDisplay(resource.category)}</span>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium uppercase">Files</p>
          <span className="text-sm font-medium text-gray-700">{fileCount} File(s)</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDownload(resource)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-md"
          style={{ backgroundColor: '#00A597' }}
        >
          <Download className="w-4 h-4" />
          Download Files
        </button>
      </div>
    </div>
  );
};

/* -----------------------
   Main AdminResources component
------------------------*/
export default function AdminResources() {
  const dispatch = useDispatch();
  const apiState = useSelector((s: any) => s.propertyBooking ?? {});
  const apiResources = apiState.resources ?? [];
  const apiLoading = apiState.loading ?? false;
  const apiError = apiState.error ?? null;

  const [resources, setResources] = useState<UIResource[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Templates');
  const [newDescription, setNewDescription] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; preview?: string; name: string; kind: 'image' | 'video' | 'pdf' | 'Other' }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchResources() as any);
      } catch (err) {
        console.error('fetchResources failed', err);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!Array.isArray(apiResources) || apiResources.length === 0) {
      setResources([]);
      return;
    }

    const normalized: UIResource[] = apiResources.map((r: any, idx: number) => {
      const singularFile = r.file ?? r.file_path ?? null;
      const filesArr: APIResourceFile[] =
        Array.isArray(r.files) && r.files.length
          ? r.files.map((f: any) => {
              const url = getFileUrl(f.file ?? f.url ?? f.path ?? f);
              const name = f.name ?? f.filename ?? String(f.file ?? url ?? '').split('/').pop() ?? 'file';
              const ctype = String(f.content_type || f.type || '').toLowerCase();
              let type: APIResourceFile['type'] = 'Other';
              if (ctype.startsWith('image')) type = 'image';
              else if (ctype.startsWith('video')) type = 'video';
              else if (ctype.includes('pdf')) type = 'pdf';
              return { name, url, type };
            })
          : singularFile
          ? [{ name: String(singularFile).split('/').pop() ?? 'file', url: getFileUrl(singularFile), type: 'image' }]
          : [];

      const downloadUrl = (r.download_url && String(r.download_url).trim()) ? getFileUrl(r.download_url) : (filesArr[0]?.url ?? null);

      return {
        id: r.id ?? r.pk ?? `api-${idx}`,
        title: r.title ?? r.name ?? 'Untitled',
        description: r.description ?? r.details ?? '',
        category: r.category ?? r.type ?? '',
        fileType: r.file_type ?? (filesArr[0]?.type ?? 'document'),
        downloadUrl,
        files: filesArr,
        raw: r,
      };
    });

    const map = new Map<string | number, UIResource>();
    for (const it of normalized) if (!map.has(it.id)) map.set(it.id, it);
    setResources(Array.from(map.values()));
  }, [apiResources]);

  function mapCategoryToApi(label: string) {
    if (!label) return '';
    if (CATEGORY_TO_API[label] !== undefined && CATEGORY_TO_API[label] !== '') return CATEGORY_TO_API[label];
    return label.toLowerCase().replace(/\s+/g, '_');
  }

  const filteredResources = resources.filter((resource) => {
    const search = searchTerm.toLowerCase();
    const searchMatch =
      (resource.title ?? '').toLowerCase().includes(search) ||
      (resource.description ?? '').toLowerCase().includes(search);

    if (activeCategory === 'All') {
      return searchMatch;
    }

    const expectedApiKey = mapCategoryToApi(activeCategory);
    const resourceCatNormalized = normalizeCategoryForCompare(resource.category);
    const expectedNormalized = normalizeCategoryForCompare(expectedApiKey);

    const categoryMatch = resourceCatNormalized === expectedNormalized;

    return categoryMatch && searchMatch;
  });

  function openModal() {
    setIsModalOpen(true);
    setNewTitle('');
    setNewCategory('Templates');
    setNewDescription('');
    for (const f of selectedFiles) if (f.preview) try { URL.revokeObjectURL(f.preview); } catch {}
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    document.body.style.overflow = 'hidden';
    setErrorMessage(null);
  }

  function closeModal() {
    for (const f of selectedFiles) if (f.preview) try { URL.revokeObjectURL(f.preview); } catch {}
    setSelectedFiles([]);
    setIsModalOpen(false);
    document.body.style.overflow = '';
  }

  /* ============================
     FILE SELECTION (with logs)
     ============================ */
  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('[FilesSelected] chosen count:', files.length);
    const selected: typeof selectedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const lowered = (f.type || '').toLowerCase();
      let kind: 'image' | 'video' | 'pdf' | 'Other' = 'Other';
      if (lowered.startsWith('image/')) kind = 'image';
      else if (lowered.startsWith('video/')) kind = 'video';
      else if (lowered.includes('pdf')) kind = 'pdf';

      let preview: string | undefined = undefined;
      if (kind === 'image') {
        try { preview = URL.createObjectURL(f); } catch {}
      }

      console.log(`[FilesSelected] index=${i}`, { name: f.name, size: f.size, type: f.type, kind });
      selected.push({ file: f, preview, name: f.name, kind });
    }

    setSelectedFiles((prev) => {
      const merged = [...prev, ...selected];
      console.log('[FilesSelected] total selectedFiles after merge:', merged.length);
      return merged;
    });
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed?.preview) try { URL.revokeObjectURL(removed.preview); } catch {}
      console.log('[FilesSelected] removed index', index, removed?.name);
      return copy;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ============================
     UPLOAD (use uploaded_files field)
     ============================ */
  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!newTitle.trim()) {
      alert('Please provide a title.');
      return;
    }

    if (selectedFiles.length === 0) {
      const createNoFiles = await Swal.fire({
        title: 'No files selected',
        text: 'You have not attached any files. Do you want to create the resource without files?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Create without files',
        cancelButtonText: 'Cancel',
      });
      if (!createNoFiles.isConfirmed) return;
    }

    setIsSubmitting(true);

    try {
      const apiCategory = mapCategoryToApi(newCategory);
      const form = new FormData();
      form.append('title', newTitle);
      form.append('description', newDescription || '');
      form.append('category', apiCategory);

      // IMPORTANT: server expects "uploaded_files" as file field (one per file)
      selectedFiles.forEach((s, idx) => {
        console.log(`[form append uploaded_files] idx=${idx}`, { name: s.name, size: s.file.size, type: s.file.type });
        form.append('uploaded_files', s.file, s.name);
      });

      // Debug: enumerate FormData entries
      console.log('[FormData entries BEFORE send]');
      for (const pair of (form as any).entries()) {
        const [k, v] = pair;
        if (v instanceof File) console.log(' -', k, '=> File', v.name, v.size, v.type);
        else console.log(' -', k, '=>', v);
      }

      // Log token presence
      try { console.log('[Auth] auth_access present?', !!localStorage.getItem('auth_access')); } catch {}

      const base = (API_BASE || '').replace(/\/api\/?$/, '');
      const url = `${base}/api/resources/`;
      console.log('[POST] sending to', url);

      // Use authFetch (it will not set Content-Type for FormData)
      const resp = await authFetch(url, { method: 'POST', body: form });

      console.log('[POST] response status', resp.status);
      const data = await resp.json().catch(() => null);
      console.log('[POST] response body', data);

      if (!resp.ok) {
        const message = data && typeof data === 'object' ? JSON.stringify(data) : (data || `HTTP ${resp.status}`);
        throw new Error(message);
      }

      const returnedFiles: APIResourceFile[] =
        Array.isArray(data?.files) && data.files.length
          ? data.files.map((f: any) => {
              const url = getFileUrl(f.file ?? f.url ?? f.path ?? f);
              const name = f.name ?? f.filename ?? String(f.file ?? url ?? '').split('/').pop() ?? 'file';
              const ctype = String(f.content_type || f.type || '').toLowerCase();
              const type: APIResourceFile['type'] = ctype.startsWith('image')
                ? 'image'
                : ctype.startsWith('video')
                ? 'video'
                : ctype.includes('pdf')
                ? 'pdf'
                : 'Other';
              return { name, url, type };
            })
          : [];

      const created: UIResource = {
        id: data?.id ?? `r-${Date.now()}`,
        title: data?.title ?? newTitle,
        description: data?.description ?? newDescription ?? '',
        category: data?.category ?? apiCategory,
        fileType: data?.file_type ?? (returnedFiles[0]?.type ?? 'image'),
        downloadUrl: (returnedFiles[0]?.url) ?? null,
        files: returnedFiles,
        raw: data,
      };

      console.log('[Upload] created resource', created);

      setResources((prev) => {
        const filtered = prev.filter((p) => String(p.id) !== String(created.id));
        return [created, ...filtered];
      });

      for (const f of selectedFiles) if (f.preview) try { URL.revokeObjectURL(f.preview); } catch {}
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setNewTitle('');
      setNewDescription('');
      setNewCategory('Templates');
      setIsModalOpen(false);
      document.body.style.overflow = '';
      Swal.fire('Success', 'Resource uploaded successfully.', 'success');
    } catch (err) {
      console.error('Upload failed', err);
      const msg = String((err as any)?.message ?? err);
      setErrorMessage(msg);
      Swal.fire('Upload failed', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ============================
     DOWNLOAD & DELETE
     ============================ */

  // UPDATED: prompt per-file using Swal before downloading each file
  async function handleDownload(resource: UIResource) {
    // Build list of file candidates (preserve order)
    const candidates: { name: string; url: string }[] = [];

    if (Array.isArray(resource.files) && resource.files.length > 0) {
      for (const f of resource.files) {
        const url = f.url ?? getFileUrl(f.url);
        const name = f.name ?? (f.url ? String(f.url).split('/').pop() : 'file');
        if (url) candidates.push({ name, url });
      }
    } else if (resource.downloadUrl) {
      const name = resource.downloadUrl.split('/').pop() || String(resource.title || 'file').replace(/\s+/g, '_');
      candidates.push({ name, url: resource.downloadUrl });
    } else if (resource.raw && (resource.raw.file || resource.raw.file_path)) {
      const url = getFileUrl(resource.raw.file ?? resource.raw.file_path);
      const name = String(url?.split('/').pop?.() ?? resource.title ?? 'file');
      if (url) candidates.push({ name, url });
    }

    if (candidates.length === 0) {
      Swal.fire('No file', 'No downloadable file URL available for this resource.', 'info');
      return;
    }

    // Loop each file and ask permission before downloading
    for (const file of candidates) {
      try {
        const res = await Swal.fire({
          title: `Download "${file.name}"?`,
          text: `Do you want to save "${file.name}" to your device?`,
          icon: 'question',
          showCancelButton: true,
          focusCancel: true,
          confirmButtonText: 'Save',
          cancelButtonText: 'Skip',
        });

        if (!res.isConfirmed) {
          // skip this file and continue to next
          continue;
        }

        // Attempt fetch -> blob download
        try {
          const resp = await fetch(file.url, { method: 'GET', mode: 'cors' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const blob = await resp.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.warn('Fetch->blob download failed for', file.url, err);
          // fallback: open in new tab
          try {
            window.open(file.url, '_blank', 'noopener,noreferrer');
            // notify user we opened in new tab
            await Swal.fire('Opened', `Could not auto-save "${file.name}". Opened in new tab instead.`, 'info');
          } catch {
            await Swal.fire('Error', `Unable to download or open "${file.name}". Check CORS or network.`, 'error');
          }
        }
      } catch (outerErr) {
        console.error('Download loop error', outerErr);
        // continue to next file
      }
    }
  }

  async function handleDelete(resource: UIResource) {
    const res = await Swal.fire({
      title: 'Delete resource?',
      text: `Are you sure you want to permanently delete "${resource.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      focusCancel: true,
    });

    if (!res.isConfirmed) return;

    const id = resource.id;
    const base = (API_BASE || '').replace(/\/api\/?$/, '');
    const url = `${base}/api/resources/${id}/`;

    try {
      const resp = await authFetch(url, { method: 'DELETE' });
      if (!resp.ok && resp.status !== 204) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Delete failed: ${resp.status} ${text}`);
      }
      setResources(prev => prev.filter(r => String(r.id) !== String(id)));
      Swal.fire('Deleted!', 'The resource has been deleted.', 'success');
    } catch (err) {
      console.error('Delete failed', err);
      Swal.fire('Error', `Failed to delete resource: ${String((err as any)?.message ?? err)}`, 'error');
    }
  }

  /* ============================
     RENDER
     ============================ */
  return (
    <div className="bg-gray-50 font-sans p-4 md:p-8 min-h-screen">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Resources</h1>
            <p className="text-gray-600 text-sm">Access marketing materials, templates, images and PDFs.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={openModal} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium shadow-md" style={{ backgroundColor: '#00A597' }}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Resources</span>
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="relative mr-5 flex-grow lg:w-1/3">
            <input type="text" placeholder="Search Resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 transition shadow-sm" />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="overflow-x-auto whitespace-nowrap">
            <div className="inline-flex space-x-2 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
              {categories.map((category) => (
                <button key={category}
                  onClick={() => { setActiveCategory(category); setSearchTerm(''); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition duration-200 ${activeCategory === category ? 'bg-gray-900 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {apiLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 p-6 rounded-lg shadow-lg flex flex-col items-center pointer-events-auto">
              <svg className="animate-spin h-10 w-10 text-teal-600 mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <div className="text-sm text-gray-700">Loading Resources</div>
            </div>
          </div>
        )}

        {errorMessage && <div className="mb-4 text-sm text-red-600">{errorMessage}</div>}
        {apiError && <div className="mb-4 text-sm text-red-600">Error loading resources: {String(apiError)}</div>}

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, idx) => (
            <ResourceCard key={resource.id ?? `res-${idx}`} resource={resource} onDownload={handleDownload} onDelete={handleDelete} />
          ))}

          {!apiLoading && filteredResources.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-10">No resources found matching your filter and search criteria.</p>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') closeModal(); }}>
          <div className="fixed inset-0 bg-black/40" onClick={closeModal}></div>

          <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">Add Resource</h2>
                <p className="text-sm text-gray-500">Upload multiple files (images, videos, pdfs, docs)</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none" aria-label="Close add resource modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 border rounded-md text-sm bg-gray-50" placeholder="Title" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-3 border rounded-md text-sm bg-gray-50">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border rounded-md text-sm bg-gray-50" placeholder="Short description" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (multiple)</label>

                <label htmlFor="files-upload" className="relative cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                  <UploadCloud className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Select files (images, videos, pdfs, docs...)</span>
                  <input id="files-upload" ref={fileInputRef} onChange={handleFilesSelected} type="file"
                    accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only" multiple />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedFiles.map((s, i) => (
                      <div key={`${s.name}-${i}`} className="relative rounded-md overflow-hidden border">
                        {s.kind === 'image' && s.preview ? (
                          <img src={s.preview} alt={s.name} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="p-3 flex flex-col items-start gap-2">
                            <div className="text-sm font-medium truncate">{s.name}</div>
                            <div className="text-xs text-gray-500">{s.kind.toUpperCase()}</div>
                          </div>
                        )}

                        <button type="button" onClick={() => removeSelectedFile(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1" title="Remove">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex cursor-pointer items-center gap-2 px-4 justify-center py-3 rounded-md text-white font-medium w-full" style={{ backgroundColor: '#00A597', opacity: isSubmitting ? 0.7 : 1 }}>
                  <Plus className="w-4 h-4" />
                  {isSubmitting ? 'Uploading…' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
