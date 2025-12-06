// File: FAQs.tsx (Agent View Only - GET Only)
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';

// ---- CONFIG ----
const API_BASE = 'https://api.eastmondvillas.com';
const FAQ_ENDPOINT = `${API_BASE}/api/faqs/`;

// Category options exactly like backend expects (value = API string, label = nice text)
const CATEGORY_OPTIONS = [
  { value: 'marketing_materials', label: 'Marketing Materials' },
  { value: 'property_viewings', label: 'Property Viewings' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'commissions', label: 'Commissions' },
  { value: 'technical_support', label: 'Technical Support' },
];

// Small helper: read auth token if needed
function authHeaders() {
  try {
    const token =
      localStorage.getItem('auth_access') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {}
  return {};
}

// Resolve category label from value
function getCategoryLabel(value) {
  if (!value) return '';
  const opt = CATEGORY_OPTIONS.find((o) => o.value === value);
  if (opt) return opt.label;
  return value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
}

// ---- FAQ ITEM COMPONENT ----
const FAQItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md mb-4 border border-gray-100 transition-all duration-300">
      <div
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base font-medium text-gray-800 flex-grow pr-4">
          {faq.question}
        </span>

        {/* NO DELETE BUTTON FOR AGENT */}
        <div className="border border-gray-300 rounded-full p-1 flex items-center justify-center">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </div>

      <div
        className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ transitionProperty: 'max-height, opacity' }}
      >
        <div className="p-5 pt-0 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
          {faq.category && (
            <p className="mt-3 text-xs text-gray-500">
              Category: {getCategoryLabel(faq.category)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- MAIN COMPONENT ----
const AgentFaqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ALL = '__ALL__';
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [searchTerm, setSearchTerm] = useState('');

  // ----- FETCH FAQ LIST (GET ONLY) -----
  const fetchFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FAQ_ENDPOINT, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(`Failed to load FAQs (${res.status})`);

      const json = await res.json();
      const list = Array.isArray(json.results) ? json.results : json;
      setFaqs(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to load FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // ----- CATEGORY LIST -----
  const categories = useMemo(() => [ALL, ...CATEGORY_OPTIONS.map((c) => c.value)], []);

  // ----- FILTERED LIST -----
  const filteredFAQs = faqs.filter((faq) => {
    const categoryMatch = activeCategory === ALL || faq.category === activeCategory;
    const lower = searchTerm.toLowerCase();
    const searchMatch =
      faq.question.toLowerCase().includes(lower) ||
      faq.answer.toLowerCase().includes(lower);
    return categoryMatch && searchMatch;
  });

  return (
    <div className="font-sans p-4 md:p-8">
      <div className=" mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-sm">
              Find answers to common questions about the agent portal
            </p>
          </div>

          {/* NO ADD BUTTON FOR AGENTS */}
        </header>

        {/* Search + Filter */}
        <div className="flex flex-col mb-8 space-y-4">
          <div className="flex items-center border-2 p-2 rounded-xl gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-gray-900 focus:border-gray-900 transition shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="inline-flex space-x-2 p-1 rounded-xl shadow-sm">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                      activeCategory === category
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category === ALL ? 'All Categories' : getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <main>
          {loading && <p className="text-center text-gray-500 py-6">
            
             <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <span className="loading loading-spinner loading-xl" />
            </div>
          </div>

            </p>}
          {error && <p className="text-center text-red-500 py-4 text-sm">{error}</p>}
          {!loading && !error && filteredFAQs.map((faq) => <FAQItem key={faq.id} faq={faq} />)}
          {!loading && !error && filteredFAQs.length === 0 && (
             <div className="flex justify-center py-10">
    <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-8 max-w-md text-center shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-2">
        No FAQs available
      </h3>
      <p className="text-sm text-gray-500">
        There are no FAQs matching your current search or category filter.
      </p>
    </div>
  </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AgentFaqs;
