import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { refreshToken } from "../../features/Auth/authSlice";
import { API_BASE, getAccessToken } from "../../features/Auth/authSlice";

const AllContact = () => {
  const dispatch = useDispatch();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    // 🔥 Reverse the order (newest first)
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

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Contact Messages</h1>

      {loading && <p className="text-blue-600 text-lg font-medium">Loading...</p>}

      {error && (
        <p className="text-red-600 text-lg bg-red-50 p-3 rounded-md">{error}</p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Message</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                contacts.map((contact: any) => (
                  <tr key={contact.id} className="border-t hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{contact.name}</td>
                    <td className="py-3 px-4">{contact.email}</td>
                    <td className="py-3 px-4">{contact.phone}</td>
                    <td className="py-3 px-4">{contact.message}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {contact.created_at
                        ? new Date(contact.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllContact;
