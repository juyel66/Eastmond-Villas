// src/pages/AllReview.tsx
import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAccessToken,
  selectIsAuthenticated,
  selectCurrentUser,
  refreshToken,
} from '@/features/Auth/authSlice';

type ReviewImage = { id: number; image: string };

type ReviewItem = {
  id: number;
  property: number | string;
  property_title?: string;
  user: number | string | { id?: number; [k: string]: any };
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
  images?: ReviewImage[];
  address?: string | null;
  status?: string;
  location?: string;
  profession?: string;
};

type ReviewsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReviewItem[];
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://api.eastmondvillas.com/api';
const REVIEWS_URL = `${API_BASE}/villas/reviews/`;

/* ---------------- Helpers ---------------- */
const formatDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

const truncateTable = (s = '', n = 20) => (s.length > n ? s.slice(0, n) + '…' : s);

const StarRow = ({ rating }: { rating: number }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <svg
          key={s}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={s <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          className={`w-4 h-4 ${s <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 4.298c.139.28.423.447.72.447h4.722a.562.562 0 01.385.91l-3.844 3.692a.563.563 0 01-.183.568l1.173 4.887a.563.563 0 01-.84.622l-4.302-2.583a.563.563 0 01-.588 0L6.96 19.427a.562.562 0 01-.84-.622l1.173-4.887a.563.563 0 01-.183-.568L3.05 9.154a.562.562 0 01.385-.91h4.722c.297 0 .581-.167.72-.447l2.125-4.298z"
          />
        </svg>
      ))}
    </div>
  );
};

/* ---------------- Spinner (reusable) ---------------- */
const SpinnerInline = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const classes = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  const textClass = size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-xs';
  return (
    <div className="flex items-center justify-center gap-2">
      <svg className={`animate-spin ${classes} text-teal-600`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className={`${textClass} text-gray-700`}>Loading...</span>
    </div>
  );
};

/* ---------------- Component ---------------- */
const AllReview: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [resp, setResp] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  // modal state
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const doFetchWithRefresh = useCallback(
    async (input: RequestInfo, init: RequestInit = {}, allowRetry = true): Promise<Response> => {
      const token = getAccessToken();
      const baseHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...(init.headers ? (init.headers as Record<string, string>) : {}),
      };
      if (token) baseHeaders.Authorization = `Bearer ${token}`;

      const res = await fetch(input, { ...init, headers: baseHeaders });

      if (res.status !== 401) return res;

      if (!allowRetry) return res;

      try {
        // @ts-ignore
        const refreshResult = await dispatch(refreshToken());
        if (refreshToken.fulfilled.match(refreshResult)) {
          const newToken = getAccessToken();
          const retryHeaders = { ...baseHeaders, Authorization: newToken ? `Bearer ${newToken}` : undefined };
          const retryRes = await fetch(input, { ...init, headers: retryHeaders });
          return retryRes;
        }
        return res;
      } catch (e) {
        return res;
      }
    },
    [dispatch]
  );

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doFetchWithRefresh(REVIEWS_URL, { method: 'GET' });

      if (res.status === 401) {
        await Swal.fire({
          icon: 'warning',
          title: 'Login required',
          text: 'You must be logged in to view reviews (or session expired).',
        });
        setResp(null);
        setLoading(false);
        return;
      }

      const rawText = await res.text();
      let parsed: any = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch {
        parsed = rawText;
      }

      if (!res.ok) {
        const msg = typeof parsed === 'object' ? JSON.stringify(parsed) : String(parsed || `status ${res.status}`);
        console.error('Fetch reviews failed:', res.status, parsed);
        await Swal.fire({ icon: 'error', title: 'Error', text: `Failed to fetch reviews — ${msg}` });
        setResp(null);
        setLoading(false);
        return;
      }

      console.log('RAW reviews response:', parsed);
      if (parsed && Array.isArray(parsed.results)) {
        try {
          console.table(parsed.results);
        } catch {}
        setResp(parsed as ReviewsResponse);
      } else if (Array.isArray(parsed)) {
        setResp({ count: parsed.length, next: null, previous: null, results: parsed });
      } else {
        console.warn('Unexpected reviews response shape:', parsed);
        setResp(null);
      }
    } catch (err) {
      console.error('Network error fetching reviews:', err);
      await Swal.fire({ icon: 'error', title: 'Network error', text: 'Could not fetch reviews. See console.' });
      setResp(null);
    } finally {
      setLoading(false);
    }
  }, [doFetchWithRefresh]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: number) => {
    const confirmed = await Swal.fire({
      title: 'Delete review?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#e11d48',
    });
    if (!confirmed.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await doFetchWithRefresh(`${REVIEWS_URL}${id}/`, { method: 'DELETE' });

      if (res.status === 401) {
        await Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Authentication failed. Please login again.' });
        window.location.href = '/login';
        return;
      }

      const rawText = await res.text();
      let parsed;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch {
        parsed = rawText;
      }

      if (res.status === 204 || res.ok) {
        setResp((prev) =>
          prev ? { ...prev, results: prev.results.filter((r) => r.id !== id), count: Math.max(0, prev.count - 1) } : prev
        );

        await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Review deleted successfully.', timer: 1400, showConfirmButton: false });
        return;
      }

      const msg = typeof parsed === 'object' ? JSON.stringify(parsed) : String(parsed || `status ${res.status}`);
      console.error('Delete failed:', res.status, parsed);
      await Swal.fire({ icon: 'error', title: 'Delete failed', text: msg });
    } catch (err) {
      console.error('Network error deleting review:', err);
      await Swal.fire({ icon: 'error', title: 'Network error', text: 'Could not delete review. See console.' });
    } finally {
      setDeletingId(null);
    }
  };

  // NEW: change status (PATCH) — send as FormData (no Content-Type header)
  const handleChangeStatus = async (id: number, newStatus: string) => {
    const review = resp?.results.find((r) => r.id === id);
    if (!review) return;

    if (String(review.status || '').toLowerCase() === String(newStatus).toLowerCase()) {
      // no change
      return;
    }

    const confirm = await Swal.fire({
      title: `Change status to "${newStatus}"?`,
      text: `This will set the review status to "${newStatus}". Proceed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      cancelButtonText: 'Cancel',
    });
    if (!confirm.isConfirmed) {
      return;
    }

    setUpdatingStatusId(id);
    try {
      // Use FormData to avoid sending application/json
      const form = new FormData();
      form.append('status', newStatus);

      const res = await doFetchWithRefresh(`${REVIEWS_URL}${id}/`, {
        method: 'PATCH',
        body: form, // do NOT set headers.Content-Type — browser will set multipart boundary
      });

      const rawText = await res.text();
      let parsed: any = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch {
        parsed = rawText;
      }

      if (res.status === 401) {
        await Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Authentication failed. Please login again.' });
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const msg = typeof parsed === 'object' ? JSON.stringify(parsed) : String(parsed || `status ${res.status}`);
        console.error('Status update failed', res.status, parsed);
        await Swal.fire({ icon: 'error', title: 'Update failed', text: msg });
        return;
      }

      // Update local state: replace the review item
      setResp((prev) => {
        if (!prev) return prev;
        const updatedResults = prev.results.map((r) => (r.id === id ? { ...r, ...(parsed || {}), status: parsed?.status ?? newStatus } : r));
        return { ...prev, results: updatedResults };
      });

      // if modal open for this review, update it
      setSelectedReview((sr) => (sr && sr.id === id ? { ...sr, ...(parsed || {}), status: parsed?.status ?? newStatus } : sr));

      await Swal.fire({ icon: 'success', title: 'Updated', text: `Status updated to "${newStatus}".`, timer: 1200, showConfirmButton: false });
    } catch (err) {
      console.error('Network error updating status:', err);
      await Swal.fire({ icon: 'error', title: 'Network error', text: 'Could not update status. See console.' });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // modal functions
  const openView = (r: ReviewItem) => {
    setSelectedReview(r);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };
  
  const closeView = () => {
    setSelectedReview(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = '';
  };
  
  const nextImage = () => {
    if (selectedReview?.images && selectedReview.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedReview.images!.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  const prevImage = () => {
    if (selectedReview?.images && selectedReview.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedReview.images!.length - 1 : prev - 1
      );
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedReview) closeView();
      if (e.key === 'ArrowRight' && selectedReview) nextImage();
      if (e.key === 'ArrowLeft' && selectedReview) prevImage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedReview]);

  const rows = resp?.results ?? [];

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <div className="flex items-center gap-2">
            <button onClick={fetchReviews} className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700">
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center"><SpinnerInline size="md" /></div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No reviews found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-12 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r, idx) => {
                  const imgs = r.images || [];
                  const total = imgs.length;
                  const status = (r.status ?? 'pending').toLowerCase();
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {total === 0 ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                            <>
                              <div className="relative">
                                <img src={imgs[0].image} alt={`img-${imgs[0].id}`} className="w-12 h-12 object-cover rounded" />
                                <span className="absolute -bottom-1 -right-1 bg-black/70 text-white text-xs px-1 rounded">1 / {total}</span>
                              </div>

                              {imgs.slice(1, 3).map((img, i) => {
                                const isLastSlot = i === 1 && total > 3;
                                if (isLastSlot) {
                                  const remaining = total - 2;
                                  return (
                                    <div key={img.id} className="relative">
                                      <img src={img.image} alt={`img-${img.id}`} className="w-10 h-10 object-cover rounded opacity-90" />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/45 rounded text-white text-sm">+{remaining}</div>
                                    </div>
                                  );
                                }
                                return <img key={img.id} src={img.image} alt={`img-${img.id}`} className="w-10 h-10 object-cover rounded" />;
                              })}
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                        <div className="truncate max-w-[12rem]">{truncateTable(r.comment ?? '', 20)}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <StarRow rating={r.rating} />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {/* Dropdown to change status */}
                          <select
                            value={status}
                            onChange={(e) => handleChangeStatus(r.id, e.target.value)}
                            disabled={updatingStatusId === r.id}
                            className="ml-2 text-xs border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                          </select>

                          {updatingStatusId === r.id && (
                            <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => openView(r)}
                          className="inline-flex items-center gap-2 px-2 py-1 rounded bg-sky-50 text-sky-600 hover:bg-sky-100"
                          title="View review"
                        >
                          <span className="bg-teal-600 text-white text-sm px-3 py-1 rounded-md hover:bg-teal-500">View</span>
                        </button>

                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-red-50 text-red-600"
                          title="Delete review"
                        >
                          {deletingId === r.id ? (
                            <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H3.5A1.5 1.5 0 002 5.5V6h16v-.5A1.5 1.5 0 0016.5 4H15V3a1 1 0 00-1-1H6zM4 7v9.5A1.5 1.5 0 005.5 18h9A1.5 1.5 0 0016 16.5V7H4zm3 2a1 1 0 012 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {resp && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">Total:</span> {resp.count}
            {resp.next && <span className="ml-3">More pages available</span>}
          </div>
        )}
      </div>

      {/* Modal: View Review with Image Slideshow */}
      {selectedReview && (
        <div role="dialog" aria-modal="true" aria-labelledby="view-review-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeView} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 mx-auto">

            {/* Image Slideshow Section */}
            {selectedReview.images && selectedReview.images.length > 0 ? (
              <div className="relative w-full h-72 overflow-hidden rounded-t-2xl">
                {/* Main Image */}
                <img
                  src={selectedReview.images[currentImageIndex].image}
                  alt={`Review ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Navigation Buttons */}
                {selectedReview.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedReview.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center space-x-2 px-4">
                  {selectedReview.images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-teal-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={`Thumb ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={closeView}
                  className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative w-full h-48 bg-gray-100 rounded-t-2xl flex items-center justify-center">
                <span className="text-gray-400">No Images</span>
                <button
                  onClick={closeView}
                  className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header with User Info */}
            <div className="p-6 border-b space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Review Details
                </h3>
                <div className="flex justify-center items-center gap-3 mt-2">
                  <StarRow rating={selectedReview.rating} />
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      selectedReview.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedReview.status === "approved"
                      ? "Approved"
                      : selectedReview.status ?? "Pending"}
                  </span>
                </div>
              </div>

              {/* User Info Section */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">User</div>
                  <div className="text-lg font-bold text-gray-900">
                    {selectedReview.user_name || 'Anonymous'}
                  </div>
                </div>
                
                {selectedReview.location && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Location</div>
                    <div className="text-lg text-gray-900">{selectedReview.location}</div>
                  </div>
                )}
                
                {selectedReview.profession && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Profession</div>
                    <div className="text-lg text-gray-900">{selectedReview.profession}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">Review Comment</h4>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedReview.comment}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Property:</span>{' '}
                  <span className="text-gray-700">{selectedReview.property_title || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Rating:</span>{' '}
                  <span className="text-gray-700">{selectedReview.rating} / 5</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Created:</span>{' '}
                  <span className="text-gray-700">{formatDate(selectedReview.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Images:</span>{' '}
                  <span className="text-gray-700">{(selectedReview.images?.length || 0)} photos</span>
                </div>
              </div>

              <div className="flex justify-center pt-4 space-x-4">
                <button
                  onClick={closeView}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedReview.status === 'approved') {
                      handleChangeStatus(selectedReview.id, 'pending');
                    } else {
                      handleChangeStatus(selectedReview.id, 'approved');
                    }
                  }}
                  className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition"
                  disabled={updatingStatusId === selectedReview.id}
                >
                  {updatingStatusId === selectedReview.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Updating...
                    </span>
                  ) : selectedReview.status === 'approved' ? (
                    'Mark as Pending'
                  ) : (
                    'Approve Review'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllReview;