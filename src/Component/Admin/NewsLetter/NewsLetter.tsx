const newsletterData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    name: "Luxury Modern Villa with Pool",
    beds: 1,
    baths: 4,
    pools: 4,
    location: "Miami Beach",
    price: "$2,850,000",
    type: "Sales",
    status: "published",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
    name: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "New York",
    price: "$2,850,000",
    type: "Rentals",
    status: "pending",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    name: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "Beverly Hills",
    price: "$2,850,000",
    type: "Sales",
    status: "published",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1599423300746-b62533397364",
    name: "Luxury Modern Villa with Pool",
    beds: 5,
    baths: 4,
    pools: 4,
    location: "San Diego",
    price: "$2,850,000",
    type: "Rentals",
    status: "published",
  },
];

const formatCount = (count: number, label: string) =>
  `${count} ${label}${count > 1 ? "s" : ""}`;

const NewsLetter = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-xl border p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-4">Newsletter</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            placeholder="Search properties"
            className="border rounded-lg px-3 py-2 text-sm w-64"
          />
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Published</option>
            <option>Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">
                  <input type="checkbox" />
                </th>
                <th className="p-3 text-left">Project Name</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {newsletterData.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>

                  {/* Project */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCount(item.beds, "bed")} ·{" "}
                          {formatCount(item.baths, "bath")} ·{" "}
                          {formatCount(item.pools, "pool")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{item.price}</td>
                  <td className="p-3">{item.type}</td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "published"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-3">
                    <button className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-2 rounded-lg">
                      Send Newsletter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <button className="flex items-center gap-2 px-3 py-1 border rounded-lg">
            ← Previous
          </button>

          <div className="flex gap-2">
            {["01", "02", "03", "04", "05", "06"].map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded-lg ${
                  p === "02"
                    ? "bg-gray-100 font-medium"
                    : "text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-3 py-1 border rounded-lg">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
