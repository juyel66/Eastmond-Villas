import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { refreshToken } from "../../features/Auth/authSlice";
import { API_BASE, getAccessToken } from "../../features/Auth/authSlice";
import Swal from "sweetalert2";

const AllContact = () => {
  const dispatch = useDispatch();

  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = `${API_BASE}/list_vila/contect/`;

  const authFetch = async (url: string, options: any = {}) => {
    const access = getAccessToken();

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: access ? `Bearer ${access}` : "",
        ...(options.headers || {}),
      },
    });

    return res;
  };

  const loadContacts = async () => {
    try {
      let res = await authFetch(API_URL);

      if (res.status === 401) {
        const refreshResult = await dispatch(refreshToken());
        if (refreshToken.fulfilled.match(refreshResult)) {
          res = await authFetch(API_URL);
        } else {
          throw new Error("Session expired. Login again.");
        }
      }

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      let data = await res.json();

      // Reverse the order
      if (Array.isArray(data)) {
        data = data.reverse();
      }

      setContacts(data);
    } catch (err: any) {
      setError(err.message || "Error loading contact list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Delete contact message
  const handleDelete = async (id: number, fromModal: boolean = false) => {  // CHANGED: Added fromModal parameter
    // Confirm before delete
    Swal.fire({
      title: "Are you sure?",
      text: "This contact message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0d9488",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingId(id);
          
          // Construct delete URL with ID at the end
          const deleteUrl = `${API_URL}${id}/`;
          
          let res = await authFetch(deleteUrl, {
            method: "DELETE",
          });

          if (res.status === 401) {
            const refreshResult = await dispatch(refreshToken());
            if (refreshToken.fulfilled.match(refreshResult)) {
              res = await authFetch(deleteUrl, {
                method: "DELETE",
              });
            } else {
              throw new Error("Session expired. Login again.");
            }
          }

          if (res.status === 204 || res.ok) {
            // 204 No Content or 200 OK both indicate success
            // Remove from state
            setContacts(prev => prev.filter(contact => contact.id !== id));
            
            // If we're deleting from modal, close the modal
            if (fromModal) {  // CHANGED: Check if deleting from modal
              setShowModal(false);
              setSelectedMessage(null);
            }
            
            Swal.fire({
              title: "Deleted!",
              text: "Contact message has been deleted successfully.",
              icon: "success",
              confirmButtonColor: "#0d9488",
            });
          } else {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to delete contact message");
          }
        } catch (err: any) {
          console.error("Delete error:", err);
          Swal.fire({
            title: "Error!",
            text: err.message || "Failed to delete contact message",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  // Delete contact from modal
  const handleDeleteFromModal = () => {
    if (selectedMessage) {
      // CHANGED: Pass true as second parameter to indicate deletion from modal
      handleDelete(selectedMessage.id, true);
    }
  };

  // Open Modal
  const openModal = (contact: any) => {
    setSelectedMessage(contact);
    setShowModal(true);
  };

  // Filtered contacts by search term
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;

    const q = searchTerm.toLowerCase();
    return contacts.filter((c: any) => {
      const name = (c.name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      const message = (c.message || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        message.includes(q)
      );
    });
  }, [contacts, searchTerm]);

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        All Contact Messages
      </h1>

      {/* Search bar (centered) */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, phone, or message..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        />
      </div>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 p-6 rounded-lg shadow-lg flex flex-col items-center pointer-events-auto">
            <svg
              className="animate-spin h-10 w-10 text-teal-600 mb-3"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <div className="text-sm text-gray-700">Loading contact messages...</div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-lg bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">No</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Message</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-500"
                  >
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact: any, inx: number) => (
                  <tr
                    key={contact.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{inx + 1}</td>
                    <td className="py-3 px-4 font-medium">{contact.name}</td>
                    <td className="py-3 px-4">{contact.email}</td>
                    <td className="py-3 px-4">{contact.phone}</td>
                    <td className="py-3 px-4 truncate max-w-[150px]">
                      {contact.message}
                    </td>
                   <td className="py-3 px-4 text-sm text-gray-500">
  {contact?.created_at
    ? new Date(contact.created_at).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'}
</td>


                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(contact)}
                          className="bg-teal-600 text-white text-sm px-3 py-1 rounded-md hover:bg-teal-500 flex items-center gap-1"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View
                        </button>
                        
                      
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50">
          <div className="bg-white w-11/12 sm:w-2/3 lg:w-1/3 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Message Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Name:</p>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{selectedMessage.name}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Email:</p>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{selectedMessage.email}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Phone:</p>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{selectedMessage.phone}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Message:</p>
                <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap min-h-[100px]">
                  {selectedMessage.message}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Date:</p>
                <p className="text-gray-500">
                 {selectedMessage?.created_at
  ? new Date(selectedMessage.created_at).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  : '-'}

                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={handleDeleteFromModal}  // This calls handleDelete with fromModal=true
                disabled={deletingId === selectedMessage.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:bg-red-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {deletingId === selectedMessage.id ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Message
                  </>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllContact;