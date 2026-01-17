// SelectUserModal.tsx
import React, { useState } from "react";
import Swal from "sweetalert2";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
}

interface Props {
  open: boolean;
  onClose: () => void;
  users: User[];
  selected: number[];
  setSelected: (v: number[]) => void;
  search: string;
  setSearch: (v: string) => void;
  roleFilter: "All" | "admin" | "agent" | "customer";
  setRoleFilter: (v: "All" | "admin" | "agent" | "customer") => void;
  inviteOpen: boolean;
  setInviteOpen: (v: boolean) => void;
  inviteEmails: string;
  setInviteEmails: (v: string) => void;
  onInvite: (emails: string) => void; // Updated to pass emails back
  loading: boolean;
  error: string | null;
  autoSelectUsersByRole: (role: "admin" | "agent" | "customer") => void;
  allUsers: User[];
}

const ITEMS_PER_PAGE = 10;

const SelectUserModal: React.FC<Props> = ({
  open,
  onClose,
  users,
  selected,
  setSelected,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  inviteOpen,
  setInviteOpen,
  inviteEmails,
  setInviteEmails,
  onInvite,
  loading,
  error,
  autoSelectUsersByRole,
  allUsers,
}) => {
  const [page, setPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);

  if (!open) return null;

  const filtered = users;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleUser = (id: number) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      const allVisibleIds = paginated.map(user => user.id);
      setSelected(Array.from(new Set([...selected, ...allVisibleIds])));
    }
    setSelectAll(!selectAll);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Admin';
      case 'agent': return 'Agent';
      case 'customer': return 'Customer';
      default: return role;
    }
  };

  const handleRoleFilterChange = (role: "All" | "admin" | "agent" | "customer") => {
    setRoleFilter(role);
    setPage(1);
    
    if (role !== "All") {
      Swal.fire({
        title: "Filter Applied",
        text: `Showing only ${role}s. All ${role}s have been auto-selected.`,
        icon: "info",
        confirmButtonColor: "#0d9488",
      });
      
      autoSelectUsersByRole(role);
    }
  };

  const handleSave = () => {
    const selectedUsers = allUsers.filter(user => selected.includes(user.id));
    const adminCount = selectedUsers.filter(u => u.role === "admin").length;
    const agentCount = selectedUsers.filter(u => u.role === "agent").length;
    const customerCount = selectedUsers.filter(u => u.role === "customer").length;
    
    Swal.fire({
      title: "Selection Saved",
      html: `
        <div class="text-left">
          <p class="font-medium text-gray-800 mb-1">Selected ${selected.length} users</p>
          <p class="font-medium text-gray-800 mb-1">Selected ${selectedUsers.length} users</p>
          <div class="text-sm text-gray-600">
            ${adminCount > 0 ? `<p>Admins: ${adminCount}</p>` : ''}
            ${agentCount > 0 ? `<p>Agents: ${agentCount}</p>` : ''}
            ${customerCount > 0 ? `<p>Customers: ${customerCount}</p>` : ''}
          </div>
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#0d9488",
    });
    
    onClose();
  };

  const handleInviteEmailSave = () => {
    if (inviteEmails.trim()) {
      const emailsArray = inviteEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      
      // Call parent component's onInvite function to update emails in main page
      onInvite(inviteEmails);
      
      // Close the invite section
      setInviteOpen(false);
      
      Swal.fire({
        title: "Emails Added",
        text: `${emailsArray.length} email(s) added to the newsletter`,
        icon: "success",
        confirmButtonColor: "#0d9488",
      });
    } else {
      setInviteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Users</h2>
              <p className="text-sm text-gray-500 mt-1">
                Select users to receive the newsletter. Filtering by role will auto-select all users of that role.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-6 h-full flex flex-col">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center mb-6">
              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value as any)}
                  className="border rounded-lg px-4 py-2 bg-gray-50 text-sm font-medium"
                >
                  <option value="All">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {/* Auto-select Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => autoSelectUsersByRole("admin")}
                  className={`px-3 py-2 text-sm rounded-lg ${selected.some(id => {
                    const user = allUsers.find(u => u.id === id);
                    return user?.role === "admin";
                  }) ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  {selected.some(id => {
                    const user = allUsers.find(u => u.id === id);
                    return user?.role === "admin";
                  }) ? 'All Admins Selected' : 'Select All Admins'}
                </button>
                <button
                  onClick={() => autoSelectUsersByRole("agent")}
                  className={`px-3 py-2 text-sm rounded-lg ${selected.some(id => {
                    const user = allUsers.find(u => u.id === id);
                    return user?.role === "agent";
                  }) ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  {selected.some(id => {
                    const user = allUsers.find(u => u.id === id);
                    return user?.role === "agent";
                  }) ? 'All Agents Selected' : 'Select All Agents'}
                </button>
                <button
                  onClick={() => autoSelectUsersByRole("customer")}
                  className={`px-3 py-2 text-sm rounded-lg ${selected.some(id => {
                    const user = allUsers.find(u => u.id === id);
                    return user?.role === "customer";
                  }) ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {selected.some(id => {
                    const user = allUsers.find(u => u.id === id);
                    return user?.role === "customer";
                  }) ? 'All Customers Selected' : 'Select All Customers'}
                </button>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  placeholder="Search name or email"
                  className="w-full border rounded-lg px-4 py-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Invite Button */}
              <button
                onClick={() => setInviteOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
              >
                <img 
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768158718/Icon_27_g6ontt.png" 
                  alt="Invite" 
                  className="w-4 h-4"
                />
                Invite New User
              </button>
            </div>

            {/* Loading/Error States */}
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-red-600">
                  <div className="mb-2">Error loading users</div>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Invite Section */}
            {inviteOpen && (
              <div className="mb-6 border bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Add Additional Emails
                  </p>
                  <p className="text-xs text-gray-600">
                    Enter email addresses separated by commas. These emails will be added to the newsletter recipients.
                  </p>
                </div>
                <input
                  className="w-full border rounded-lg px-8 py-2.5 focus:ring-2   focus:ring-teal-500 focus:border-transparent"
                  placeholder="example1@mail.com, example2@mail.com, example3@mail.com"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setInviteOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteEmailSave}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Add Emails
                  </button>
                </div>
              </div>
            )}

            {/* User Table */}
            {!loading && !error && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Table Header */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Select All</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selected.length} of {filtered.length} users selected
                    </div>
                  </div>
                  
                  {/* Table */}
                  <div className="overflow-auto max-h-[300px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="p-3 text-left text-gray-500 font-medium">Select</th>
                          <th className="p-3 text-left text-gray-500 font-medium">Name</th>
                          <th className="p-3 text-left text-gray-500 font-medium">Email</th>
                          <th className="p-3 text-left text-gray-500 font-medium">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          paginated.map((user) => (
                            <tr key={user.id} className="border-t hover:bg-gray-50">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={selected.includes(user.id)}
                                  onChange={() => toggleUser(user.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                              </td>
                              <td className="p-3 font-medium text-gray-900">{user.name}</td>
                              <td className="p-3 text-gray-700">{user.email}</td>
                              <td className="p-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                  {getRoleDisplayName(user.role)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages} • {filtered.length} users total
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selected.length} users</span> selected for newsletter
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="border border-gray-300 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectUserModal;