// CreateNewsletterPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import ScheduleSection from "./ScheduleSection";
import SelectUserModal from "./SelectUserModal";
import Swal from "sweetalert2";
import { Link } from "react-router";

const API_BASE = "https://api.eastmondvillas.com";

interface Property {
  id: number;
  slug: string;
  title: string;
  listing_type: "rent" | "sale";
  address: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  add_guest: number;
  is_assigned: boolean;
  status: string;
  pool: number;
  images: Array<{
    id: number;
    image: string;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
}

const CreateNewsletterPage: React.FC = () => {
  /* ---------------- STATES ---------------- */
  const [newsletterType, setNewsletterType] = useState<"rentals" | "sales">("rentals");
  const [layout, setLayout] = useState<"focus" | "showcase">("focus");
  const [schedule, setSchedule] = useState<"immediate" | "weekly" | "monthly">("immediate");
  const [scheduledDay, setScheduledDay] = useState<number>(5); // Friday (0=Sunday, 5=Friday)
  const [scheduledDate, setScheduledDate] = useState<number>(12); // 12th of month
  const [scheduledTime, setScheduledTime] = useState<string>("09:00");

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "admin" | "agent" | "customer">("All");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Track if roles were auto-selected
  const [autoSelectedByRole, setAutoSelectedByRole] = useState<{
    admin: boolean;
    agent: boolean;
    customer: boolean;
  }>({
    admin: false,
    agent: false,
    customer: false
  });

  /* ---------------- FETCH PROPERTIES ---------------- */
  useEffect(() => {
    const fetchProperties = async () => {
      setPropertiesLoading(true);
      setPropertiesError(null);
      try {
        const token = localStorage.getItem("auth_access");
        const headers: Record<string, string> = {
          "Accept": "application/json",
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/api/villas/property-assignments/`, {
          headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.status}`);
        }

        const data: Property[] = await response.json();
        setProperties(data);
      } catch (error: any) {
        setPropertiesError(error.message || "Failed to fetch properties");
        console.error("Error fetching properties:", error);
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchProperties();
  }, []);

  /* ---------------- FILTER PROPERTIES BY TYPE ---------------- */
  useEffect(() => {
    const filtered = properties.filter(property => {
      const matchesType = newsletterType === "rentals" 
        ? property.listing_type === "rent"
        : property.listing_type === "sale";
      return matchesType;
    });
    setFilteredProperties(filtered);
    
    // Reset selected properties when type changes
    setSelectedProperties([]);
  }, [properties, newsletterType]);

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const token = localStorage.getItem("auth_access");
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/villas/all-users/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data: User[] = await response.json();
      setAllUsers(data);
      
      // Update selected user emails
      const selectedEmails = data
        .filter(user => selectedUsers.includes(user.id))
        .map(user => user.email);
      setSelectedUserEmails(selectedEmails);
    } catch (error: any) {
      setUsersError(error.message || "Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  /* ---------------- UPDATE SELECTED USER EMAILS WHEN SELECTED USERS CHANGE ---------------- */
  useEffect(() => {
    if (allUsers.length > 0) {
      const selectedEmails = allUsers
        .filter(user => selectedUsers.includes(user.id))
        .map(user => user.email);
      setSelectedUserEmails(selectedEmails);
    }
  }, [selectedUsers, allUsers]);

  /* ---------------- PROPERTY SELECTION HANDLER ---------------- */
  const toggleProperty = (id: number) => {
    setSelectedProperties((prev) => {
      if (prev.includes(id)) {
        // Remove property
        return prev.filter((i) => i !== id);
      } else {
        // Add property with limit check
        if (layout === "focus" && prev.length >= 1) {
          Swal.fire({
            title: "Limit Exceeded",
            text: "Focus layout allows only 1 property",
            icon: "warning",
            confirmButtonColor: "#0d9488",
          });
          return prev;
        } else if (layout === "showcase" && prev.length >= 3) {
          Swal.fire({
            title: "Limit Exceeded",
            text: "Showcase layout allows maximum 3 properties",
            icon: "warning",
            confirmButtonColor: "#0d9488",
          });
          return prev;
        } else {
          return [...prev, id];
        }
      }
    });
  };

  /* ---------------- USER FILTER ---------------- */
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;
    
    // Apply role filter
    if (roleFilter !== "All") {
      filtered = filtered.filter((u) => u.role.toLowerCase() === roleFilter.toLowerCase());
    }
    
    // Apply search filter
    if (searchUser) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
      );
    }
    
    return filtered;
  }, [allUsers, searchUser, roleFilter]);

  /* ---------------- AUTO SELECT USERS BY ROLE ---------------- */
  const autoSelectUsersByRole = (role: "admin" | "agent" | "customer") => {
    const usersByRole = allUsers
      .filter((u) => u.role.toLowerCase() === role.toLowerCase())
      .map((u) => u.id);
    
    // Update selected users
    const newSelectedUsers = [...selectedUsers, ...usersByRole];
    setSelectedUsers(newSelectedUsers);
    
    // Update selected user emails
    const newSelectedEmails = allUsers
      .filter((u) => newSelectedUsers.includes(u.id))
      .map((u) => u.email);
    setSelectedUserEmails(newSelectedEmails);
    
    // Mark this role as auto-selected
    setAutoSelectedByRole(prev => ({
      ...prev,
      [role]: true
    }));
    
    // Show confirmation
    Swal.fire({
      title: `All ${role.charAt(0).toUpperCase() + role.slice(1)}s Selected`,
      confirmButtonColor: "#0d9488",
    });
  };

  /* ---------------- HANDLE USER SELECTION FROM MODAL ---------------- */
  const handleUserSelection = (userIds: number[]) => {
    setSelectedUsers(userIds);
    
    // Update selected user emails
    const selectedEmails = allUsers
      .filter(user => userIds.includes(user.id))
      .map(user => user.email);
    setSelectedUserEmails(selectedEmails);
    
    // Check if all users of each role are selected
    const selectedUserObjects = allUsers.filter(user => userIds.includes(user.id));
    
    // Get all users by role
    const allAdmins = allUsers.filter(user => user.role === "admin");
    const allAgents = allUsers.filter(user => user.role === "agent");
    const allCustomers = allUsers.filter(user => user.role === "customer");
    
    // Check if ALL users of each role are selected
    const allAdminsSelected = allAdmins.length > 0 && 
      selectedUserObjects.filter(u => u.role === "admin").length === allAdmins.length;
    
    const allAgentsSelected = allAgents.length > 0 && 
      selectedUserObjects.filter(u => u.role === "agent").length === allAgents.length;
    
    const allCustomersSelected = allCustomers.length > 0 && 
      selectedUserObjects.filter(u => u.role === "customer").length === allCustomers.length;
    
    // Update autoSelectedByRole state
    setAutoSelectedByRole({
      admin: allAdminsSelected,
      agent: allAgentsSelected,
      customer: allCustomersSelected
    });
  };

  /* ---------------- HANDLE INVITE EMAIL UPDATE ---------------- */
  const handleInviteEmailUpdate = (emails: string) => {
    setInviteEmails(emails);
  };


  const validateBeforeSend = (): boolean => {

    if (selectedProperties.length === 0) {
      Swal.fire({
        title: "No Properties Selected",
        text: "Please select at least one property",
        icon: "warning",
        confirmButtonColor: "#0d9488",
      });
      return false;
    }

    if (layout === "focus" && selectedProperties.length !== 1) {
      Swal.fire({
        title: "Invalid Selection",
        text: "Focus layout requires exactly 1 property",
        icon: "warning",
        confirmButtonColor: "#0d9488",
      });
      return false;
    }

    if (layout === "showcase" && selectedProperties.length > 3) {
      Swal.fire({
        title: "Too Many Properties",
        text: "Showcase layout allows maximum 3 properties",
        icon: "warning",
        confirmButtonColor: "#0d9488",
      });
      return false;
    }

    // Check users
    if (selectedUsers.length === 0 && !inviteEmails.trim()) {
      Swal.fire({
        title: "No Users Selected",
        text: "Please select at least one user or add email addresses",
        icon: "warning",
        confirmButtonColor: "#0d9488",
      });
      return false;
    }

    // Check schedule for weekly/monthly
    if (schedule === "weekly" && (scheduledDay < 0 || scheduledDay > 6)) {
      Swal.fire({
        title: "Invalid Day",
        text: "Please select a valid day of week (0-6)",
        icon: "warning",
        confirmButtonColor: "#0d9488",
      });
      return false;
    }

    if (schedule === "monthly" && (scheduledDate < 1 || scheduledDate > 31)) {
      Swal.fire({
        title: "Invalid Date",
        text: "Please select a valid date (1-31)",
        icon: "warning",
        confirmButtonColor: "#0d9488",
      });
      return false;
    }


    if (inviteEmails.trim()) {
      const emailsArray = inviteEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailsArray.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        Swal.fire({
          title: "Invalid Emails",
          text: `Invalid email format: ${invalidEmails.join(", ")}`,
          icon: "error",
          confirmButtonColor: "#0d9488",
        });
        return false;
      }
    }

    return true;
  };


  const handleSendNewsletter = async () => {
    if (!validateBeforeSend()) {
      return;
    }


    const result = await Swal.fire({
      title: "Send Newsletter?",
      text: "Are you sure you want to send this newsletter?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Send It!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const token = localStorage.getItem("auth_access");
      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }


      const selectedUserObjects = allUsers.filter(user => 
        selectedUsers.includes(user.id)
      );


      const allAdmins = allUsers.filter(user => user.role === "admin");
      const allAgents = allUsers.filter(user => user.role === "agent");
      const allCustomers = allUsers.filter(user => user.role === "customer");


      const includeAdmin = allAdmins.length > 0 && 
        selectedUserObjects.filter(u => u.role === "admin").length === allAdmins.length;
      
      const includeAgent = allAgents.length > 0 && 
        selectedUserObjects.filter(u => u.role === "agent").length === allAgents.length;
      
      const includeCustomer = allCustomers.length > 0 && 
        selectedUserObjects.filter(u => u.role === "customer").length === allCustomers.length;


      const manualEmails = inviteEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      
      const allExtraEmails = [
        ...selectedUserEmails, 
        ...manualEmails        
      ];

      // Remove duplicates
      const uniqueEmails = Array.from(new Set(allExtraEmails));

      // Prepare payload
      const payload = {
        property_type: newsletterType === "rentals" ? "rental" : "sale",
        layout: layout === "focus" ? "single" : "triple",
        frequency: schedule === "immediate" ? "instant" : schedule,
        include_agent: includeAgent,
        include_customer: includeCustomer,
        include_admin: includeAdmin,
        extra_emails: uniqueEmails,
        scheduled_day: schedule === "weekly" ? scheduledDay : null,
        scheduled_date: schedule === "monthly" ? scheduledDate : null,
        scheduled_time: schedule !== "immediate" ? scheduledTime : null,
        properties: selectedProperties,
        user_ids: selectedUsers,
        is_active: true,
      };

      console.log("Sending newsletter payload:", payload);

      const response = await fetch(`${API_BASE}/api/newsletter/newsletters/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = `Failed to send newsletter: ${response.status}`;
        
        if (responseData && typeof responseData === 'object') {
          if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          } else {
            // Try to extract first error
            const errors = Object.values(responseData).flat();
            if (errors.length > 0) {
              errorMessage = String(errors[0]);
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      console.log("Newsletter sent successfully:", responseData);
      
      // Show success message
      await Swal.fire({
        title: "Success!",
        html: `
       <div class="text-center">
  <p class="mb-2">Newsletter has been sent successfully.</p>
  

</div>

        `,
        icon: "success",
        confirmButtonColor: "#0d9488",
      });
      
      // Reset form
      setSelectedProperties([]);
      setSelectedUsers([]);
      setSelectedUserEmails([]);
      setInviteEmails("");
      setAutoSelectedByRole({
        admin: false,
        agent: false,
        customer: false
      });
      
    } catch (error: any) {
      setSendError(error.message || "Failed to send newsletter");
      console.error("Error sending newsletter:", error);
      
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to send newsletter",
        icon: "error",
        confirmButtonColor: "#0d9488",
      });
    } finally {
      setSending(false);
    }
  };

 
  const formatNumberWithDecimal = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    

    if (Number.isInteger(num)) {
      return num.toString(); 
    } else {
     
      return num.toFixed(2).replace(/\.?0+$/, ''); 
    }
  };


  const getPluralForm = (value: string | number, singular: string, plural: string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    

    if (!Number.isInteger(num)) {
      return plural;
    }
    

    return Math.abs(num) === 1 ? singular : plural;
  };


  const renderPropertyRow = (property: Property) => {
    const isSelected = selectedProperties.includes(property.id);
    const imageUrl = property.images?.[0]?.image || "https://via.placeholder.com/56";
    const price = parseFloat(property.price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Format values keeping decimals if they exist
    const bedsFormatted = formatNumberWithDecimal(property.bedrooms);
    const bathsFormatted = formatNumberWithDecimal(property.bathrooms);
    const poolsFormatted = formatNumberWithDecimal(property.pool);

    // Create description text based on values
    const descriptionParts = [];

    if (parseFloat(property.bedrooms) > 0) {
      const bedWord = getPluralForm(property.bedrooms, "Bed", "Beds");
      descriptionParts.push(`${bedsFormatted} ${bedWord}`);
    }
    
    if (parseFloat(property.bathrooms) > 0) {
      const bathWord = getPluralForm(property.bathrooms, "Bath", "Baths");
      descriptionParts.push(`${bathsFormatted} ${bathWord}`);
    }
    
    if (property.pool > 0) {
      const poolWord = getPluralForm(property.pool, "Pool", "Pools");
      descriptionParts.push(`${poolsFormatted} ${poolWord}`);
    }

    const descriptionText = descriptionParts.join(" · ");

    return (
      <tr key={property.id} className="border-t hover:bg-gray-50">
        <td className="p-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleProperty(property.id)}
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            disabled={
              !isSelected && (
                (layout === "focus" && selectedProperties.length >= 1) ||
                (layout === "showcase" && selectedProperties.length >= 3)
              )
            }
          />
        </td>
        <td className="p-4">
          <div className="flex gap-3 items-center">
            <img
              src={imageUrl}
              className="w-14 h-14 rounded-lg object-cover"
              alt={property.title}
            />
            <div>
              <p className="font-medium text-gray-900">{property.title}</p>
              <p className="text-xs text-gray-500">
                {descriptionText || "No details available"}
              </p>
            </div>
          </div>
        </td>
        <td className="p-4 text-gray-700">{property.address}</td>
        <td className="p-4 text-gray-900 font-medium">USD${price}</td>
        <td className="p-4">
          <span className={`px-3 py-1 rounded-full text-xs ${
            property.status === "published" 
              ? "bg-green-100 text-green-800"
              : property.status === "draft"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="mx-auto space-y-6 mt-3">
      <h1 className="text-2xl font-semibold text-gray-900">Create Newsletter</h1>

      {/* ---------------- TYPE & LAYOUT ---------------- */}
      <div className="flex flex-wrap gap-8 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <p className="text-sm text-gray-500 mb-2">Newsletter Type</p>
          <div className="flex gap-2 border p-2 rounded-lg">
            {(["rentals", "sales"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewsletterType(t)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  newsletterType === t
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t === "rentals" ? "Rentals" : "Sales"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Visual Layout</p>

          <div className="flex justify-between items-center gap-2">
            <div className="items-center border p-2 rounded-lg">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setLayout("focus");
                    if (selectedProperties.length > 1) {
                      setSelectedProperties(selectedProperties.slice(0, 1));
                      Swal.fire({
                        title: "Layout Changed",
                        text: "Changed to Focus layout. Only first property kept.",
                        icon: "info",
                        confirmButtonColor: "#0d9488",
                      });
                    }
                  }}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    layout === "focus"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Focus (1 Property)
                </button>

                <button
                  onClick={() => setLayout("showcase")}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    layout === "showcase"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Showcase (3 Properties)
                </button>
              </div>
            </div>

            <Link to="/dashboard/admin-newsletter-management" className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:bg-teal-800 transition whitespace-nowrap">
              Manage Newsletter
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {layout === "focus"
              ? "Select exactly 1 property"
              : "Select up to 3 properties"}
          </p>
        </div>
      </div>

      {/* ---------------- PROPERTIES TABLE ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Select Properties</h2>
          <p className="text-sm text-gray-500">
            {filteredProperties.length} properties available for {newsletterType}
            {selectedProperties.length > 0 && ` • ${selectedProperties.length} selected`}
          </p>
        </div>
        
        {propertiesLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-500">Loading properties...</p>
          </div>
        ) : propertiesError ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Error loading properties</div>
            <p className="text-gray-600">{propertiesError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No properties found for {newsletterType}</p>
            <p className="text-sm text-gray-400 mt-1">
              Try changing the newsletter type
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-sm">
                <tr>
                  <th className="p-4 text-left text-gray-500 font-medium">Select</th>
                  <th className="p-4 text-left text-gray-500 font-medium">Project Name</th>
                  <th className="p-4 text-left text-gray-500 font-medium">Location</th>
                  <th className="p-4 text-left text-gray-500 font-medium">Price</th>
                  <th className="p-4 text-left text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map(renderPropertyRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- SCHEDULE SECTION ---------------- */}
      <ScheduleSection 
        value={schedule}
        onChange={setSchedule}
        scheduledDay={scheduledDay}
        setScheduledDay={setScheduledDay}
        scheduledDate={scheduledDate}
        setScheduledDate={setScheduledDate}
        scheduledTime={scheduledTime}
        setScheduledTime={setScheduledTime}
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border">
        {/* LEFT GROUP */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* TARGET AUDIENCE */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              Target Audience
            </p>
            <button
              onClick={() => {
                fetchUsers();
                setOpenUserModal(true);
              }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm font-medium"
            >
              <img
                src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1768158718/Icon_27_g6ontt.png"
                className="w-4 h-4"
                alt="Select User"
              />
              Select User
              {selectedUsers.length > 0 && (
                <span className="ml-2 bg-teal-700 text-white text-xs rounded-full px-2 py-0.5">
                  {selectedUsers.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Email Summary */}
          {inviteEmails.trim() && (
            <div className="mt-2 md:mt-0">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Additional Emails
              </p>
              <div className="bg-teal-50 text-teal-700 px-3 py-2 rounded-lg">
                <p className="text-sm font-medium">
                  {inviteEmails.split(",").filter(e => e.trim()).length} email(s) added
                </p>
              </div>
            </div>
          )}
        </div>

  
        <div className="flex justify-end">
          <button
            onClick={handleSendNewsletter}
            disabled={sending}
            className="bg-teal-600 hover:bg-teal-700 transition text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                Send Newsletter
              </>
            )}
          </button>
        </div>
      </div>


      {(selectedProperties.length > 0 || selectedUsers.length > 0 || inviteEmails.trim()) && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-2">Selection Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Properties Selected:</p>
              <p className="font-medium">
                {selectedProperties.length} property{selectedProperties.length !== 1 ? 's' : ''}
                {layout === "focus" ? " (Focus Layout)" : " (Showcase Layout)"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Users Selected:</p>
              <p className="font-medium">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User Emails:</p>
              <p className="font-medium">
                {selectedUserEmails.length} email{selectedUserEmails.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Additional Emails:</p>
              <p className="font-medium">
                {inviteEmails.split(",").filter(e => e.trim()).length} email{inviteEmails.split(",").filter(e => e.trim()).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p><strong>Note:</strong> All selected user emails will be sent to backend as extra_emails along with manually added emails.</p>
            <p>Total emails to be sent: {selectedUserEmails.length + inviteEmails.split(",").filter(e => e.trim()).length}</p>
            <p className="mt-1">
              <strong>Role-based flags:</strong> 
              {autoSelectedByRole.admin ? ' Include Admin: Yes' : ''}
              {autoSelectedByRole.agent ? ' Include Agent: Yes' : ''}
              {autoSelectedByRole.customer ? ' Include Customer: Yes' : ''}
              {!autoSelectedByRole.admin && !autoSelectedByRole.agent && !autoSelectedByRole.customer ? ' No role-based flags set' : ''}
            </p>
          </div>
        </div>
      )}


      <SelectUserModal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        users={filteredUsers}
        selected={selectedUsers}
        setSelected={handleUserSelection}
        search={searchUser}
        setSearch={setSearchUser}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        inviteOpen={inviteOpen}
        setInviteOpen={setInviteOpen}
        inviteEmails={inviteEmails}
        setInviteEmails={setInviteEmails}
        onInvite={handleInviteEmailUpdate}
        loading={usersLoading}
        error={usersError}
        autoSelectUsersByRole={autoSelectUsersByRole}
        allUsers={allUsers}
      />
    </div>
  );
};

export default CreateNewsletterPage;