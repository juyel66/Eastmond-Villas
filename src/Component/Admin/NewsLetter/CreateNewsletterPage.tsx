import React, { useMemo, useState } from "react";


const LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Luxury Modern Villa with Pool",
    beds: 1,
    baths: 4,
    pools: 4,
    location: "Miami Beach",
    price: 2850000,
    status: "published",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: "2",
    title: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "New York",
    price: 2850000,
    status: "published",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: "2",
    title: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "New York",
    price: 2850000,
    status: "published",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: "2",
    title: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "New York",
    price: 2850000,
    status: "published",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: "2",
    title: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "New York",
    price: 2850000,
    status: "published",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
];

/* ---------------- MOCK USERS ---------------- */
const USERS: User[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@example.com", role: "Admin" },
  { id: "2", name: "Michael Chen", email: "michael@example.com", role: "Admin" },
  { id: "3", name: "Admin Emily", email: "adminemily@gmail.com", role: "Admin" },
  { id: "4", name: "John Smith", email: "john.smith@example.com", role: "User" },
  { id: "4", name: "John Smith", email: "john.smith@example.com", role: "User" },
  { id: "4", name: "John Smith", email: "john.smith@example.com", role: "User" },
  { id: "4", name: "John Smith", email: "john.smith@example.com", role: "User" },
];

const Newsletter: React.FC = () => {
  /* ---------------- STATES ---------------- */
  const [newsletterType, setNewsletterType] =
    useState<NewsletterType>("rentals");
  const [layout, setLayout] = useState<LayoutType>("focus");
  const [schedule, setSchedule] =
    useState<ScheduleType>("immediate");

  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Admin" | "User">("All");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");

  /* ---------------- LISTING HANDLER ---------------- */
  const toggleListing = (id: string) => {
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ---------------- USER FILTER ---------------- */
  const filteredUsers = useMemo(() => {
    return USERS.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase());

      const matchRole =
        roleFilter === "All" ? true : u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [searchUser, roleFilter]);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleInvite = () => {
    const emailsArray = inviteEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    console.log("📨 INVITE PAYLOAD:", emailsArray);
    setInviteEmails("");
    setInviteOpen(false);
  };

  return (
    <div className=" mx-auto space-y-6 mt-3">
      <h1 className="text-2xl font-semibold">Create Newsletter</h1>

      {/* ---------------- TYPE & LAYOUT ---------------- */}
      <div className="flex gap-8">
        <div>
          <p className="text-sm text-gray-500 mb-2">Newsletter Type</p>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {(["rentals", "sales"] as NewsletterType[]).map((t) => (
              <button
                key={t}
                onClick={() => setNewsletterType(t)}
                className={`px-4 py-2 rounded-md text-sm ${
                  newsletterType === t
                    ? "bg-teal-600 text-white"
                    : "text-gray-600"
                }`}
              >
                {t === "rentals" ? "Rentals" : "Sales"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Visual Layout</p>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setLayout("focus")}
              className={`px-4 py-2 rounded-md text-sm ${
                layout === "focus"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Focus (1)
            </button>
            <button
              onClick={() => setLayout("showcase")}
              className={`px-4 py-2 rounded-md text-sm ${
                layout === "showcase"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Showcase (3)
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- LISTINGS ---------------- */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-4"></th>
              <th className="p-4 text-left">Project Name</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {LISTINGS.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(item.id)}
                    onChange={() => toggleListing(item.id)}
                  />
                </td>
                <td className="p-4 flex gap-3">
                  <img
                    src={item.image}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.beds} bed · {item.baths} baths · {item.pools} Pools
                    </p>
                  </div>
                </td>
                <td className="p-4">{item.location}</td>
                <td className="p-4">${item.price.toLocaleString()}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-xs">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- SEND SCHEDULE (NEW) ---------------- */}
<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">

  {/* LEFT GROUP */}
  <div className="flex flex-col md:flex-row md:items-center gap-6">

    {/* TARGET AUDIENCE */}
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">
        Target Audience
      </p>
      <button
        onClick={() => setOpenUserModal(true)}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm"
      >
        <img
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768158718/Icon_27_g6ontt.png"
          className="w-4 h-4"
        />
        Select User
      </button>
    </div>

    {/* SEND SCHEDULE */}
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">
        Send Schedule
      </p>
      <div className="relative">
        <img
          src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768158846/calendar_1_tpsk1n.png"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
        />

        <select
          value={schedule}
          onChange={(e) =>
            setSchedule(e.target.value as ScheduleType)
          }
          className="pl-10 pr-10 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="immediate">Immediate Delivery</option>
          <option value="weekly">Weekly Delivery</option>
          <option value="monthly">Monthly Delivery</option>
        </select>
      </div>
    </div>

    {/* WEEKLY OPTION */}
    {schedule === "weekly" && (
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">
          Day
        </p>
        <select className="px-4 py-2.5 border rounded-lg bg-gray-50 text-sm">
          <option>Friday</option>
          <option>Saturday</option>
          <option>Sunday</option>
        </select>
      </div>
    )}

    {/* MONTHLY OPTION */}
    {schedule === "monthly" && (
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">
          Date
        </p>
        <select className="px-4 py-2.5 border rounded-lg bg-gray-50 text-sm">
          <option>12 Jan</option>
          <option>15 Jan</option>
          <option>20 Jan</option>
        </select>
      </div>
    )}
  </div>

  {/* RIGHT SIDE – PREVIEW */}
  <div className="flex justify-end">
    <button className="bg-teal-600 hover:bg-teal-700 transition text-white px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2">
      Preview
      <img
        src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768158804/Frame_3_s47a8v.png"
        className="w-4 h-4"
      />
    </button>
  </div>

</div>


      {/* ================= USER MODAL ================= */}
      {openUserModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-5xl rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold"> Select User</h2>
              <button onClick={() => setOpenUserModal(false)}>✕</button>
            </div>

            <div className="flex gap-3 items-center">
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as any)
                }
                className="border rounded-lg px-4 py-2 bg-gray-50"
              >
                <option value="All">All</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>

              <input
                placeholder="Search name, email or role"
                className="flex-1 border rounded-lg px-4 py-2"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />

              <button
                onClick={() => setInviteOpen(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
              <div className="flex items-center gap-2">  <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768158718/Icon_27_g6ontt.png" alt="" />
                Invite New User</div>
              </button>
            </div>

            {inviteOpen && (
              <div className="border bg-emerald-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  Enter emails (comma separated)
                </p>
                <input
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="user1@mail.com, user2@mail.com"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setInviteOpen(false)}>
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            )}

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
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => toggleUser(u.id)}
                        />
                      </td>
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenUserModal(false)}
                className="border px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpenUserModal(false)}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Newsletter;
