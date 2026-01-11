import React, { useMemo, useState } from "react";
// import { User } from "../types/newsletter.types";

interface Props {
  open: boolean;
  onClose: () => void;
  users: User[];
  selected: string[];
  setSelected: (v: string[]) => void;
}

const ITEMS_PER_PAGE = 5;

const SelectUserModal: React.FC<Props> = ({
  open,
  onClose,
  users,
  selected,
  setSelected,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");

  if (!open) return null;

  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);





  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleUser = (id: string) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
  };

  const handleInvite = () => {
    const emailsArray = inviteEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    console.log("📨 SEND TO BACKEND:", emailsArray); // backend ready
    setInviteEmails("");
    setInviteMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl rounded-xl p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">👥 Select User</h2>
            <p className="text-sm text-gray-500">
              Select multiple user and add new user
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Controls */}
        <div className="flex gap-3 items-center">
          <input
            placeholder="🔍 Search name, email or role"
            className="flex-1 border rounded-lg px-4 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setInviteMode(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
          >
            ➕ Invite New User
          </button>
        </div>

        {/* Invite */}
        {inviteMode && (
          <div className="bg-emerald-50 border rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">
              ✉ Enter multiple emails (comma separated)
            </p>
            <input
              className="w-full border rounded-lg px-4 py-2"
              placeholder="example1@mail.com, example2@mail.com"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setInviteMode(false)}>Cancel</button>
              <button
                onClick={handleInvite}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                Send Invite 🚀
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3"></th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                  </td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ◀
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-5 py-2 rounded-lg">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Save ✅
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectUserModal;
