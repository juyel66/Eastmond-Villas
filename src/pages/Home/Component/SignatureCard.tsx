// import { Link } from 'react-router';

// // --- Icon Components ---
// const LocationIcon = () => (
//     <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//     </svg>
// );
// const BedIcon = () => <img className="w-5 h-5 mr-1" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760827484/Frame_3_rwdb0z.png" alt="bed-icon" />;
// const BathIcon = () => <img className="w-5 h-5 mr-1" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760827484/Frame_4_zsqcrj.png" alt="bath-icon" />;
// const PoolIcon = () => <img className="w-5 h-5 mr-1" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760827483/Frame_5_cyajjb.png" alt="pool-icon" />;
// const HeartIcon = () => (
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-.318-.318a4.5 4.5 0 00-6.364 0z"></path>
//     </svg>
// );
// const ShareIcon = () => <img className="w-5 h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760923888/Icon_39_piurkh.png" alt="share-icon" />;

// const SignatureCard = ({ villa }) => {
//     const defaultVilla = {
//         title: "Loading Villa",
//         location: "Getting Location...",
//         price: "N/A",
//         rating: 0,
//         reviewCount: 0,
//         beds: 0,
//         baths: 0,
//         pool: 0,
//         amenities: [],
//         imageUrl: "https://via.placeholder.com/400x240?text=Image+Loading..."
//     };
    
//     const data = villa || defaultVilla;

//     // ---------- helper for singular/plural ----------
//     const pluralize = (count, singular) => `${count} ${count === 1 ? singular : singular + 's'}`;

//     return (
//         <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl w-full">

//             {/* Image */}
//             <div className="relative h-60 w-full md:h-64">
//                 <img className="w-full h-full object-cover" src={data.imageUrl} alt={data.title} />
                
//                 {/* Rating */}
//                 <div className="absolute top-3 left-3 flex items-center bg-white text-black text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
//                     <span className="text-yellow-400 mr-1">★</span>{data.rating} ({data.reviewCount})
//                 </div>

//                 {/* Heart & Share */}
//                 <div className="absolute top-3 right-3 flex space-x-2">
//                     <button className="p-2 bg-white rounded-full text-black hover:text-red-500 hover:bg-white shadow-md transition duration-200">
//                         <HeartIcon />
//                     </button>
//                     <button className="p-2 bg-white rounded-full text-black hover:text-teal-500 hover:bg-white shadow-md transition duration-200">
//                         <ShareIcon />
//                     </button>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="p-4 md:p-6">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{data.title}</h3>

//                 {/* Location */}
//                 <div className="flex items-center text-sm md:text-base text-gray-600 mb-3">
//                     <img className="w-4 h-4 mr-1 md:w-5 md:h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761076568/Frame_11_cfkzkx.png" alt="location-icon" />
//                     {data.location}
//                 </div>

//                 {/* Price */}
//                 <p className="text-teal-600 font-extrabold text-lg md:text-2xl mb-4">
//                     From USD${data.price}/night
//                 </p>

//                 {/* Specs */}
//                 <div className="flex flex-wrap md:flex-nowrap gap-4 border-y border-gray-100 py-3 mb-4 text-sm md:text-base">
//                     <div className="flex items-center"><BedIcon /> {pluralize(data.beds, 'Bed')}</div>
//                     <div className="flex items-center"><BathIcon /> {pluralize(data.baths, 'Bath')}</div>
//                     <div className="flex items-center"><PoolIcon /> {pluralize(data.pool, 'Pool')}</div>
//                 </div>

//                 {/* Amenities */}
//                 <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
//                     {data.amenities?.map((amenity, idx) => (
//                         <span key={idx} className="px-3 py-1 text-xs md:text-sm font-medium text-teal-700 bg-teal-50 border border-teal-300 rounded-full">
//                             {amenity}
//                         </span>
//                     ))}
//                 </div>

//                 {/* View Details */}
//                 <Link to="/RentsDetails"
//                     className="block text-center py-3 border-2 bg-teal-50 border-teal-500 font-extrabold text-teal-500 rounded-lg hover:bg-teal-100 transition duration-200"
//                 >
//                     View Details
//                 </Link>
//             </div>
//         </div>
//     );
// };

// export default SignatureCard;












// SignatureCard.jsx
import { Link } from 'react-router-dom'; // use react-router-dom for Link
// --- Icon Components ---
const LocationIcon = () => (
    <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
);
const BedIcon = () => <img className="w-5 h-5 mr-1" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760827484/Frame_3_rwdb0z.png" alt="bed-icon" />;
const BathIcon = () => <img className="w-5 h-5 mr-1" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760827484/Frame_4_zsqcrj.png" alt="bath-icon" />;
const PoolIcon = () => <img className="w-5 h-5 mr-1" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760827483/Frame_5_cyajjb.png" alt="pool-icon" />;
const HeartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-.318-.318a4.5 4.5 0 00-6.364 0z"></path>
    </svg>
);
const ShareIcon = () => <img className="w-5 h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760923888/Icon_39_piurkh.png" alt="share-icon" />;

// Local fallback image you provided (keeps visuals when backend has no media)
const LOCAL_FALLBACK_IMAGE = "/mnt/data/28e6a12e-2530-41c9-bdcc-03c9610049e3.png";

const SignatureCard = ({ villa }) => {
    // If villa is undefined/null, we keep the same look with defaults
    const defaultVilla = {
        title: "Loading Villa",
        address: "Unknown address",
        city: "",
        price_display: "N/A",
        rating: 0,
        reviewCount: 0,
        bedrooms: 0,
        bathrooms: 0,
        pool: 0,
        interior_amenities: [],
        outdoor_amenities: [],
        signature_distinctions: [],
        media_images: [],
    };

    // Use provided villa or fallback
    const v = villa || defaultVilla;

    // Map fields from your API shape to UI-friendly fields
    const title = v.title || v.slug || defaultVilla.title;
    const location = v.address && v.city ? `${v.address}, ${v.city}` : (v.address || v.city || "Location not specified");
    const price = v.price_display || v.price || defaultVilla.price_display;

    // ratings/reviews: sometimes your API may not provide these; keep safe defaults
    const rating = v.rating ?? (v.property_stats && v.property_stats.total_bookings ? 4.6 : 0);
    const reviewCount = v.reviewCount ?? (v.property_stats ? v.property_stats.total_bookings : 0);

    // numeric specs
    const beds = Number(v.bedrooms ?? v.property_info?.bedrooms ?? v.beds ?? defaultVilla.bedrooms);
    const baths = Number(v.bathrooms ?? v.property_info?.bathrooms ?? v.baths ?? defaultVilla.bathrooms);
    const poolCount = Number(v.pool ?? v.has_pool ?? defaultVilla.pool);

    // combine amenities gracefully (interior + outdoor + signature_distinctions)
    const interior = Array.isArray(v.interior_amenities) ? v.interior_amenities : (v.interior_amenities && typeof v.interior_amenities === 'object' ? Object.keys(v.interior_amenities).filter(k => v.interior_amenities[k]) : []);
    const outdoor = Array.isArray(v.outdoor_amenities) ? v.outdoor_amenities : (v.outdoor_amenities && typeof v.outdoor_amenities === 'object' ? Object.keys(v.outdoor_amenities).filter(k => v.outdoor_amenities[k]) : []);
    const signature = Array.isArray(v.signature_distinctions) ? v.signature_distinctions : (v.signature_distinctions && typeof v.signature_distinctions === 'object' ? Object.keys(v.signature_distinctions).filter(k => v.signature_distinctions[k]) : []);
    // create a de-duplicated amenities array
    const amenities = Array.from(new Set([...(signature || []), ...(interior || []).slice(0,3), ...(outdoor || []).slice(0,2)]));

    // image: pick first media_images.file_url or .image or fallback to local test image
    let imageUrl = LOCAL_FALLBACK_IMAGE;
    if (Array.isArray(v.media_images) && v.media_images.length > 0) {
        const first = v.media_images[0];
        // backend examples used field name `image` with full URL, or `file_url` in other docs
        imageUrl = first.file_url || first.image || first.file || LOCAL_FALLBACK_IMAGE;
    } else if (v.main_image_url) {
        imageUrl = v.main_image_url;
    } else if (v.media && Array.isArray(v.media) && v.media.length > 0) {
        imageUrl = v.media[0].file_url || v.media[0].file || LOCAL_FALLBACK_IMAGE;
    }

    // ---------- helper for singular/plural ----------
    const pluralize = (count, singular) => `${count} ${count === 1 ? singular : singular + 's'}`;

    // Build the details URL — prefer numeric id, fallback to slug, otherwise base page
    const detailsPath = v.id ? `/property/${encodeURIComponent(v.id)}` : (v.slug ? `/property/${encodeURIComponent(v.slug)}` : `/property`);

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl w-full">
            {/* Image */}
            <div className="relative h-60 w-full md:h-64">
                <img className="w-full h-full object-cover" src={imageUrl} alt={title} />

                {/* Rating */}
                <div className="absolute top-3 left-3 flex items-center bg-white text-black text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                    <span className="text-yellow-400 mr-1">★</span>{rating} ({reviewCount})
                </div>

                {/* Heart & Share */}
                <div className="absolute top-3 right-3 flex space-x-2">
                    <button className="p-2 bg-white rounded-full text-black hover:text-red-500 hover:bg-white shadow-md transition duration-200">
                        <HeartIcon />
                    </button>
                    <button className="p-2 bg-white rounded-full text-black hover:text-teal-500 hover:bg-white shadow-md transition duration-200">
                        <ShareIcon />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{title}</h3>

                {/* Location */}
                <div className="flex items-center text-sm md:text-base text-gray-600 mb-3">
                    <img className="w-4 h-4 mr-1 md:w-5 md:h-5" src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761076568/Frame_11_cfkzkx.png" alt="location-icon" />
                    <span className="truncate">{location}</span>
                </div>

                {/* Price */}
                <p className="text-teal-600 font-extrabold text-lg md:text-2xl mb-4">
                    From USD${price}/night
                </p>

                {/* Specs */}
                <div className="flex flex-wrap md:flex-nowrap gap-4 border-y border-gray-100 py-3 mb-4 text-sm md:text-base">
                    <div className="flex items-center"><BedIcon /> {pluralize(beds, 'Bed')}</div>
                    <div className="flex items-center"><BathIcon /> {pluralize(baths, 'Bath')}</div>
                    <div className="flex items-center"><PoolIcon /> {pluralize(poolCount, 'Pool')}</div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                    {amenities.length > 0 ? amenities.map((amenity, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs md:text-sm font-medium text-teal-700 bg-teal-50 border border-teal-300 rounded-full">
                            {amenity}
                        </span>
                    )) : (
                        <span className="px-3 py-1 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full">
                            No amenities listed
                        </span>
                    )}
                </div>

                {/* View Details */}
                <Link to={detailsPath}
                    className="block text-center py-3 border-2 bg-teal-50 border-teal-500 font-extrabold text-teal-500 rounded-lg hover:bg-teal-100 transition duration-200"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default SignatureCard;
