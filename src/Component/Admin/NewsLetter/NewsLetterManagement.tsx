
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const API_BASE = 'https://api.eastmondvillas.com';

interface Newsletter {
  id: number;
  property_type: 'rental' | 'sale';
  layout: 'single' | 'triple';
  frequency: 'instant' | 'weekly' | 'monthly';
  include_agent: boolean;
  include_customer: boolean;
  include_admin: boolean;
  extra_emails: string[];
  scheduled_day: number | null;
  scheduled_date: number | null;
  scheduled_time: string | null;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  properties?: any[];
  users?: any[];
  property_ids?: number[];
  user_ids?: number[];
}

const NewsLetterManagement = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  /* ---------------- FETCH NEWSLETTERS ---------------- */
  const fetchNewsletters = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_access');
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/newsletter/newsletters/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch newsletters: ${response.status}`);
      }

      const data: Newsletter[] = await response.json();
      setNewsletters(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch newsletters');
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- START SCHEDULE ---------------- */
  const handleStartSchedule = async (newsletterId: number) => {
    const newsletter = newsletters.find(nl => nl.id === newsletterId);
    
    // Check if it's instant frequency
    if (newsletter?.frequency === 'instant') {
      Swal.fire({
        title: 'Cannot Activate',
        html: `
          <div class="text-left">
            <p class="font-medium text-gray-800 mb-2">Instant newsletters cannot be activated/deactivated.</p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Reason:</span> Instant newsletters are sent immediately when created and don't have a recurring schedule.
            </p>
            <p class="text-sm text-gray-600 mt-2">
              <span class="font-medium">Solution:</span> To create a scheduled newsletter, use "Weekly" or "Monthly" frequency when creating the newsletter.
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setUpdating(newsletterId);
    try {
      const token = localStorage.getItem('auth_access');
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}/api/newsletter/newsletters/${newsletterId}/start_schedule/`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to start schedule: ${response.status}`);
      }

      // Update local state
      setNewsletters((prev) =>
        prev.map((nl) =>
          nl.id === newsletterId ? { ...nl, is_active: true } : nl
        )
      );

      Swal.fire({
        title: 'Success!',
        text: 'Newsletter schedule has been activated.',
        icon: 'success',
        confirmButtonColor: '#0d9488',
      });
    } catch (error: any) {
      console.error('Error starting schedule:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to activate schedule',
        icon: 'error',
        confirmButtonColor: '#0d9488',
      });
    } finally {
      setUpdating(null);
    }
  };

  /* ---------------- STOP SCHEDULE ---------------- */
  const handleStopSchedule = async (newsletterId: number) => {
    const newsletter = newsletters.find(nl => nl.id === newsletterId);
    
    // Check if it's instant frequency
    if (newsletter?.frequency === 'instant') {
      Swal.fire({
        title: 'Cannot Stop',
        html: `
          <div class="text-left">
            <p class="font-medium text-gray-800 mb-2">Instant newsletters cannot be stopped.</p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Reason:</span> Instant newsletters are sent immediately upon creation and don't have an ongoing schedule to stop.
            </p>
            <p class="text-sm text-gray-600 mt-2">
              <span class="font-medium">What you can do:</span> 
              <ul class="mt-1 pl-4 list-disc">
                <li>Create a new newsletter with "Weekly" or "Monthly" frequency for scheduled sending</li>
                <li>Instant newsletters are one-time sends only</li>
              </ul>
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setUpdating(newsletterId);
    try {
      const token = localStorage.getItem('auth_access');
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}/api/newsletter/newsletters/${newsletterId}/stop_schedule/`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to stop schedule: ${response.status}`);
      }

      // Update local state
      setNewsletters((prev) =>
        prev.map((nl) =>
          nl.id === newsletterId ? { ...nl, is_active: false } : nl
        )
      );

      Swal.fire({
        title: 'Success!',
        text: 'Newsletter schedule has been stopped.',
        icon: 'success',
        confirmButtonColor: '#0d9488',
      });
    } catch (error: any) {
      console.error('Error stopping schedule:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to stop schedule',
        icon: 'error',
        confirmButtonColor: '#0d9488',
      });
    } finally {
      setUpdating(null);
    }
  };

  /* ---------------- DELETE NEWSLETTER ---------------- */
  const handleDeleteNewsletter = async (newsletterId: number) => {
    const newsletter = newsletters.find(nl => nl.id === newsletterId);
    
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-left">
          <p class="font-medium text-gray-800 mb-2">You are about to delete this newsletter:</p>
          <div class="bg-gray-50 p-3 rounded-md mb-3">
            <p class="text-sm font-medium">${formatPropertyType(newsletter?.property_type || 'rental')} Newsletter</p>
            <p class="text-xs text-gray-600">${formatFrequency(newsletter || { frequency: 'weekly', scheduled_day: 0, scheduled_date: null, scheduled_time: '09:00' })}</p>
            <p class="text-xs text-gray-600">Layout: ${formatLayout(newsletter?.layout || 'single')}</p>
          </div>
          
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setUpdating(newsletterId);
    try {
      const token = localStorage.getItem('auth_access');
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}/api/newsletter/newsletters/${newsletterId}/`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete newsletter: ${response.status}`);
      }

      // Remove from local state
      setNewsletters((prev) => prev.filter((nl) => nl.id !== newsletterId));

      Swal.fire({
        title: 'Deleted!',
        text: 'Newsletter has been deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#0d9488',
      });
    } catch (error: any) {
      console.error('Error deleting newsletter:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete newsletter',
        icon: 'error',
        confirmButtonColor: '#0d9488',
      });
    } finally {
      setUpdating(null);
    }
  };

  /* ---------------- FORMAT FREQUENCY DISPLAY ---------------- */
  const formatFrequency = (newsletter: Newsletter) => {
    if (newsletter.frequency === 'instant') {
      return 'Immediately (One-time send)';
    } else if (newsletter.frequency === 'weekly') {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayName =
        newsletter.scheduled_day !== null
          ? days[newsletter.scheduled_day]
          : 'Unknown';
      return `Weekly on ${dayName} at ${newsletter.scheduled_time || '09:00'}`;
    } else if (newsletter.frequency === 'monthly') {
      return `Monthly on ${newsletter.scheduled_date}th at ${newsletter.scheduled_time || '09:00'}`;
    }
    return newsletter.frequency;
  };

  /* ---------------- FORMAT PROPERTY TYPE ---------------- */
  const formatPropertyType = (type: string) => {
    return type === 'rental' ? 'Rentals' : 'Sales';
  };

  /* ---------------- FORMAT LAYOUT ---------------- */
  const formatLayout = (layout: string) => {
    return layout === 'single' ? 'Focus (1 Property)' : 'Showcase (3 Properties)';
  };

  /* ---------------- FORMAT DATE ---------------- */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* ---------------- FORMAT INCLUDED ROLES ---------------- */
  const formatIncludedRoles = (newsletter: Newsletter) => {
    const roles = [];
    if (newsletter.include_admin) roles.push('Admin');
    if (newsletter.include_agent) roles.push('Agent');
    if (newsletter.include_customer) roles.push('Customer');
    if (newsletter.extra_emails && newsletter.extra_emails.length > 0)
      roles.push(`${newsletter.extra_emails.length} extra email(s)`);

    return roles.length > 0 ? roles.join(', ') : 'None';
  };

  /* ---------------- GET PROPERTIES COUNT ---------------- */
  const getPropertiesCount = (newsletter: Newsletter) => {
    if (newsletter.properties && Array.isArray(newsletter.properties)) {
      return newsletter.properties.length;
    } else if (
      newsletter.property_ids &&
      Array.isArray(newsletter.property_ids)
    ) {
      return newsletter.property_ids.length;
    }
    return 0;
  };

  /* ---------------- GET USERS COUNT ---------------- */
  const getUsersCount = (newsletter: Newsletter) => {
    if (newsletter.users && Array.isArray(newsletter.users)) {
      return newsletter.users.length;
    } else if (newsletter.user_ids && Array.isArray(newsletter.user_ids)) {
      return newsletter.user_ids.length;
    }
    return 0;
  };

  /* ---------------- CHECK IF CAN BE STOPPED/STARTED ---------------- */
  const canBeManaged = (newsletter: Newsletter) => {
    return newsletter.frequency !== 'instant';
  };

  /* ---------------- FETCH ON MOUNT ---------------- */
  useEffect(() => {
    fetchNewsletters();
  }, []);

  return (
    <div className="mx-auto space-y-6 mt-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Newsletter Management
        </h1>
        <button
          onClick={fetchNewsletters}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-500">Loading newsletters...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-red-600 mb-2">⚠️ Error loading newsletters</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchNewsletters}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && newsletters.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-2">📭</div>
          <p className="text-gray-500">No newsletters found</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first newsletter to get started
          </p>
        </div>
      )}

      {!loading && !error && newsletters.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Newsletter Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-500">Total Newsletters</p>
              <p className="text-2xl font-semibold text-gray-900">
                {newsletters.length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border">
              <p className="text-sm text-green-600">Active Scheduled</p>
              <p className="text-2xl font-semibold text-green-700">
                {newsletters.filter((nl) => nl.is_active && nl.frequency !== 'instant').length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-500">Inactive Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">
                {newsletters.filter((nl) => !nl.is_active && nl.frequency !== 'instant').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border">
              <p className="text-sm text-blue-600">Instant Newsletters</p>
              <p className="text-2xl font-semibold text-blue-700">
                {newsletters.filter((nl) => nl.frequency === 'instant').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Newsletters List */}
      {!loading && !error && newsletters.length > 0 && (
        <div className="space-y-4">
          {newsletters.map((newsletter) => {
            const canManage = canBeManaged(newsletter);
            
            return (
              <div
                key={newsletter.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                {/* Header */}
                <div
                  className={`p-4 border-b ${
                    newsletter.is_active && canManage
                      ? 'bg-green-50 border-green-200'
                      : newsletter.frequency === 'instant'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newsletter.is_active && canManage
                            ? 'bg-green-500'
                            : newsletter.frequency === 'instant'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                      ></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {formatPropertyType(newsletter.property_type)}{' '}
                          Newsletter
                          {newsletter.frequency === 'instant' && (
                            <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Instant
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatLayout(newsletter.layout)} •{' '}
                          {formatFrequency(newsletter)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          newsletter.is_active && canManage
                            ? 'bg-green-100 text-green-800'
                            : newsletter.frequency === 'instant'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {newsletter.frequency === 'instant'
                          ? 'One-time Sent'
                          : newsletter.is_active
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                      
                      <div className="flex gap-2">
                        {/* Delete Button - Always visible */}





 







                   
                        {canManage ? (
                          newsletter.is_active ? (
                            <button
                              onClick={() => handleStopSchedule(newsletter.id)}
                              disabled={updating === newsletter.id}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                              title="Stop the scheduled newsletter"
                            >
                              {updating === newsletter.id ? (
                                <svg
                                  className="animate-spin h-4 w-4 text-white"
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
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                              )}
                              Stop Schedule
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartSchedule(newsletter.id)}
                              disabled={updating === newsletter.id}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                              title="Activate the scheduled newsletter"
                            >
                              {updating === newsletter.id ? (
                                <svg
                                  className="animate-spin h-4 w-4 text-white"
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
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  ></path>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                              )}
                              Activate Schedule
                            </button>
                          )
                        ) 



                        
                        
                        
                        
                        : (
                          <button
                            onClick={() => handleStopSchedule(newsletter.id)}
                            className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
                            title="Instant newsletters cannot be stopped/started"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              ></path>
                            </svg>
                            Not Manageable
                          </button>
                        )}


                                               <button
                          onClick={() => handleDeleteNewsletter(newsletter.id)}
                          disabled={updating === newsletter.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                          title="Delete this newsletter"
                        >
                          {updating === newsletter.id ? (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
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
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          )}
                          Delete
                        </button>



                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Schedule Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Frequency:
                            </span>
                            <span className="text-sm font-medium">
                              {formatFrequency(newsletter)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Layout:</span>
                            <span className="text-sm font-medium">
                              {formatLayout(newsletter.layout)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="text-sm font-medium">
                              {formatPropertyType(newsletter.property_type)}
                            </span>
                          </div>
                          {newsletter.frequency === 'instant' && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-blue-700 font-medium mb-1">
                                ⚡ Instant Newsletter
                              </p>
                              <p className="text-xs text-blue-600">
                                This newsletter was sent immediately when created and doesn't have a recurring schedule.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Last Activity
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Created:
                            </span>
                            <span className="text-sm font-medium">
                              {formatDate(newsletter.created_at)}
                            </span>
                          </div>
                     
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Updated:
                            </span>
                            <span className="text-sm font-medium">
                              {formatDate(newsletter.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Target Audience
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Included Roles:
                            </span>
                            <span className="text-sm font-medium">
                              {formatIncludedRoles(newsletter)}
                            </span>
                          </div>
                        
                          
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Additional Emails
                        </h4>
                        {newsletter.extra_emails &&
                        newsletter.extra_emails.length > 0 ? (
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {newsletter.extra_emails.map((email, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-700 truncate"
                              >
                                {email}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No additional emails
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Newsletter Status
                      </h4>
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${
                          newsletter.frequency === 'instant'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50'
                        }`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Status
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                newsletter.frequency === 'instant'
                                  ? 'bg-blue-100 text-blue-800'
                                  : newsletter.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {newsletter.frequency === 'instant'
                                ? 'One-time Sent'
                                : newsletter.is_active
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {newsletter.frequency === 'instant'
                              ? 'This was a one-time instant newsletter. It was sent immediately when created and cannot be scheduled or stopped.'
                              : newsletter.is_active
                              ? 'This newsletter is currently active and will be sent according to its schedule.'
                              : 'This newsletter is currently inactive and will not be sent.'}
                          </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="text-sm font-medium text-blue-700 mb-1">
                            Schedule Information
                          </h5>
                          <p className="text-xs text-blue-600">
                            ID: {newsletter.id}
                            <br />
                            Created By: User #{newsletter.created_by}
                            <br />
                            Frequency: {newsletter.frequency}
                            <br />
                            {newsletter.scheduled_day !== null &&
                              `Day: ${newsletter.scheduled_day}`}
                            {newsletter.scheduled_date !== null &&
                              `Date: ${newsletter.scheduled_date}`}
                            {newsletter.scheduled_time &&
                              `Time: ${newsletter.scheduled_time}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsLetterManagement;