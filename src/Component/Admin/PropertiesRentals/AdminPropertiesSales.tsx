// src/features/Properties/AdminPropertiesSales.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  LucideTableProperties,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store'; // optional typed root state

import {
  fetchProperties,
  updateProperty,
  deleteProperty,
} from '../../../features/Properties/PropertiesSlice';

import CreatePropertyRentals from './CreatePropertyRentals';

/* ---------- small inline toast ---------- */
const ToastNotification: React.FC<{
  message: string;
  type?: 'success' | 'error';
  visible: boolean;
}> = ({ message, type = 'success', visible }) => {
  if (!visible) return null;
  const baseClass =
    'fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 z-50';
  const typeClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;
  return (
    <div className={`${baseClass} ${typeClass} flex items-center space-x-2`}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

/* ---------- normalize payload helper ---------- */
function toArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.items && Array.isArray(payload.items)) return payload.items;
  return [];
}

const availableStatuses = [
  { label: "All Status", value: "All Status" },
  { label: "Published", value: "published" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];


/* ---------- helper to decide if property is a "sale" listing ---------- */
function isSaleProperty(p: any): boolean {
  if (!p) return false;
  const val =
    p.listing_type ??
    p.listingType ??
    p.property_type ??
    p.type ??
    p.rateType ??
    p.rate_type ??
    '';
  if (val === null || val === undefined) return false;
  const normalized = String(val).toLowerCase();
  // treat common variants containing "sale" as sale
  if (normalized.includes('sale')) return true;
  if (normalized.includes('sell')) return true;
  if (normalized.includes('sold')) return true;
  // fallback: do not include if unknown
  return false;
}

/* ---------- helper to format status display ---------- */
function formatStatusDisplay(status: string): string {
  if (!status) return 'Draft';
  
  const statusStr = String(status).toLowerCase();
  
  // Handle different status formats
  if (statusStr === 'pending_review' || statusStr === 'pending-review') {
    return 'Pending Review';
  }
  
  // For other statuses, capitalize first letter
  return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
}

/* ---------- small helper: truncate description to 20 chars with ellipsis ---------- */
const truncate = (maybeStr: any, maxLen = 20) => {
  const s =
    typeof maybeStr === 'string'
      ? maybeStr
      : maybeStr === null || maybeStr === undefined
        ? ''
        : String(maybeStr);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
};

const AdminPropertiesSales: React.FC = () => {
  const dispatch: any = useDispatch();
  const slice: any = useSelector((s: any) => s.propertyBooking);
  const rawProperties = slice?.properties;
  const loading = slice?.loading;
  const error = slice?.error;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [toast, setToast] = useState({
    message: '',
    type: '' as 'success' | 'error' | '',
    visible: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // normalized array from redux
  const reduxArray = useMemo(() => toArray(rawProperties), [rawProperties]);

  // local copy for instant UI updates (only sale items)
  const [localProperties, setLocalProperties] = useState<any[]>([]);

  // sync localProperties whenever redux array changes, include ONLY sale listings
  useEffect(() => {
    const saleOnly = reduxArray.filter((p: any) => isSaleProperty(p));
    // copy objects so local edits won't mutate redux objects directly
    setLocalProperties(saleOnly.map((p: any) => ({ ...p })));
  }, [reduxArray]);

  useEffect(() => {
    // dispatch and log the thunk result to console
    const p = dispatch(fetchProperties());
    p.then((res: any) => {
      console.log('[fetchProperties] dispatched result:', res);
      console.log('[fetchProperties] payload:', res?.payload ?? res);
    }).catch((err: any) => {
      console.error('[fetchProperties] dispatch error:', err);
    });
    
  }, []);

  useEffect(() => {
    console.log(
      '[propertyBooking.properties] rawProperties changed:',
      rawProperties
    );
    console.log('[localProperties] length:', localProperties.length);
  }, [rawProperties, localProperties]);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
  };

  const handleEdit = (id: number) => {
    const found = localProperties.find((d) => Number(d.id) === Number(id));
    if (found) {
      setEditItem({ ...found });
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const found = localProperties.find((d) => Number(d.id) === Number(id));
    Swal.fire({
      title: 'Are you sure?',
      html: `<div>Delete property <strong>${found?.title ?? `#${id}`}</strong>?</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#319795',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingId(id);

          
          await dispatch(deleteProperty(id)).unwrap();

          setLocalProperties((prev) =>
            prev.filter((x) => Number(x.id) !== Number(id))
          );

          showToast(`Property ${id} deleted successfully!`, 'success');

        
          dispatch(fetchProperties());
        } catch (err: any) {
          console.error('Delete property error:', err);
          Swal.fire({
            title: 'Error',
            text: err?.detail || err?.message || 'Failed to delete property',
            icon: 'error',
          });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredProjects = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return localProperties.filter((project: any) => {
      const statusMatch =
        statusFilter === 'All Status' ||
        String(project.status ?? '').toLowerCase() ===
          statusFilter.toLowerCase();
      const searchMatch =
        !searchLower ||
        String(project.title ?? '')
          .toLowerCase()
          .includes(searchLower) ||
        String(project.location ?? '')
          .toLowerCase()
          .includes(searchLower) ||
        String(project.type ?? '')
          .toLowerCase()
          .includes(searchLower);
      return statusMatch && searchMatch;
    });
  }, [localProperties, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / itemsPerPage)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };



    const formatUSD = (amount?: number | string) => {
  if (amount === null || amount === undefined || amount === "") return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};


  return (
    <div>
      <ToastNotification
        message={toast.message}
        type={toast.type as any}
        visible={toast.visible}
      />

      {/* Mobile Header */}
      <div className="flex md:hidden flex-col gap-4 justify-between items-start mt-5 p-2">
        <div>
          <h1 className="text-3xl font-semibold">
            Properties - Sales (Sale only)
          </h1>
          <p className="text-gray-500">Showing sale properties only.</p>
        </div>
        <Link
          to="/dashboard/sales/admin-create-property-sales"
          className="bg-[#009689] text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors duration-150 w-full justify-center"
        >
          <LucideTableProperties className="h-5 w-5" /> Create Property
        </Link>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center mt-5 p-2">
        <div>
          <h1 className="text-3xl font-semibold">
            Properties - Sales (Sale only)
          </h1>
          <p className="text-gray-500">Showing sale properties only.</p>
        </div>
        <Link
          to="/dashboard/sales/admin-create-property-sales"
          className="bg-[#009689] text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors duration-150"
        >
          <LucideTableProperties className="h-5 w-5" /> Create Property
        </Link>
      </div>

      <div className="min-h-screen font-sans p-2">
        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
          <div className="relative flex items-center w-full sm:max-w-sm border border-gray-300 rounded-lg bg-white shadow-sm">
            <Search className="h-4 w-4 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Search properties, Agents, or listing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 text-sm rounded-lg focus:outline-none placeholder-gray-500"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                console.log("Status filter changed to:", e.target.value);
              }}
              className="appearance-none block w-full p-3 text-sm border border-gray-300 rounded-lg bg-white shadow-sm pr-10 focus:ring-blue-500 cursor-pointer"
            >
              {availableStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table with Horizontal Scroll */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            {/* Mobile Scroll Indicator */}
            <div className="md:hidden flex justify-center items-center py-2 bg-gray-50 text-gray-500 text-xs">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Scroll horizontally to see all columns
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            
            <div className="min-w-[900px]">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 w-4 min-w-[30px]">
                      <input type="checkbox" className="h-4 w-4" />
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[180px]">
                      Project Name
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Location
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px]">
                      Price
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                      Type
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px]">
                      Update
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[90px]">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProjects.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4">
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                      <td className="px-4 md:px-6 py-4 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item?.main_image_url ||
                              item?.imageUrl ||
                              item?.media_images?.[0]?.image ||
                              'https://placehold.co/64x64'
                            }
                            alt={item.title || item.name || `Property ${item.id}`}
                            className="h-12 w-12 md:h-16 md:w-16 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {item.title ?? item.name ?? `Untitled #${item.id}`}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {truncate(item.details ?? item.description ?? '', 20)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500 min-w-[120px]">
                        <div className="max-w-[120px] md:max-w-none truncate">
                          {item.location ?? item.city ?? item.address}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500 min-w-[100px]">
                        {formatUSD(
                          item.price_display ??
                          item.price ??
                          item.total_price
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500 min-w-[80px]">
                        {(() => {
                          const value =
                            item.listing_type ??
                            item.rateType ??
                            item.property_type ??
                            item.type ??
                            "-";

                          const str = String(value);

                          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                        })()}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500 min-w-[100px]">
                        {item.updated_at ?? item.updateDate ?? '-'}
                      </td>
                      <td className="px-4 md:px-6 py-4 min-w-[90px]">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            (item.status ?? 'draft').toLowerCase() === 'published'
                              ? 'bg-blue-100 text-blue-700'
                              : (item.status ?? 'draft').toLowerCase() ===
                                  'pending_review' || (item.status ?? 'draft').toLowerCase() === 'pending-review'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {formatStatusDisplay(item.status ?? 'draft')}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 min-w-[100px]">
                        <div className="flex items-center justify-start gap-3">
                          <Link 
                            to={`/dashboard/admin-update-property-sales/${item.id}`}
                            onClick={() => handleEdit(item.id)}
                            className="p-2 text-green-500 bg-white hover:bg-gray-100 flex items-center justify-center"
                          >
                            <img
                              src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761000758/Edit_hejj0l.png"
                              alt="Edit"
                              className="p-2  text-green-500 bg-white hover:bg-gray-100 flex items-center justify-center
                              
                              
                              "
                            />
                          </Link>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 border text-red-500 bg-white hover:bg-gray-100 flex items-center justify-center"
                            disabled={deletingId === item.id}
                          >
                            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 md:px-6 py-10">
                        <div className="flex justify-center">
                          <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-4 md:p-5 text-center">
                            {/* Loading */}
                            {loading && (
                              <div className="flex justify-center">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                              </div>
                            )}

                            {/* Error */}
                            {!loading && error && (
                              <>
                                <p className="text-sm font-semibold text-gray-800 mb-1">
                                  Invalid User Session
                                </p>
                                <p className="text-xs text-gray-500">
                                  Your session is no longer valid. Please log out and log in again to continue.
                                </p>
                              </>
                            )}

                            {/* Empty */}
                            {!loading && !error && (
                              <>
                                <p className="text-sm font-semibold text-gray-800 mb-1">
                                  No Sale Properties Found
                                </p>
                                <p className="text-xs text-gray-500">
                                  There are currently no sale properties available.
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-3 sm:gap-0">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-white border text-gray-600 hover:text-white hover:bg-teal-600 disabled:opacity-50 w-full sm:w-auto"
              >
                &larr; Previous
              </Button>

              <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <span
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded cursor-pointer ${
                      currentPage === i + 1
                        ? 'border border-blue-500 text-blue-600 bg-blue-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-white border text-gray-600 hover:text-white hover:bg-teal-600 disabled:opacity-50 w-full sm:w-auto"
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertiesSales;