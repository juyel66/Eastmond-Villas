
// import { Swiper, SwiperSlide } from "swiper/react";

// import star from "../../../assets/star.svg"


// import "swiper/css";
// import "swiper/css/free-mode";
// import "swiper/css/pagination";

// // Import required modules
// import { FreeMode, Pagination } from "swiper/modules";



// const testimonialData = [
//     {
//         id: 1,
//         name: "Sarah Johnson",
//         location: "UK",
//         title: "CEO, TechNova",
//         text: "Great service and amazing properties. I always feel like I'm getting the best deals and the team is always there to help",
//         rating: 5.0,
//         image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389339/Ellipse_1_ttjbzh.png"
//     },
//     {
//         id: 2,
//         name: "Joanna Lynch",
//         location: "Singapore",
//         title: "Venture Capitalist",
//         text: "EV is always super responsive, extremely professional and experienced enough to ensure  ",
//         rating: 4.8,
//         image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389418/Ellipse_1_3_jw2vgn.png"
//     },
//     {
//         id: 3,
//         name: "Maria Rodriguez",
//         location: "Spain",
//         title: "Architect",
//         text: "TI have been using EV for years now and they never disappoint, Their attention to detail and..",
//         rating: 4.9,
//         image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389450/Ellipse_1_4_wjn80w.png"
//     },
//     {
//         id: 4,
//         name: "Omar Hassan",
//         location: "Dubai",
//         title: "Hotelier",
//         text: "As a fellow professional in the hospitality industry, I was thoroughly impressed. The service...",
//         rating: 5.0,
//         image: "https://randomuser.me/api/portraits/men/30.jpg"
//     },
//     {
//         id: 5,
//         name: "Emily White",
//         location: "USA",
//         title: "Travel Blogger",
//         text: "My family trip was unforgettable. The local experiences arranged by the concierge were ...",
//         rating: 4.7,
//         image: "https://randomuser.me/api/portraits/women/8.jpg"
//     }
// ];








// const TestimonialCard = ({ testimonial }) => {
//     return (
 
//         <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-lg min-h-[350px] flex flex-col justify-between">
        
//             <div className="flex items-center mb-6">
//                 <img 
//                     src={testimonial.image} 
//                     alt={testimonial.name}
//                     className="w-16 h-16 rounded-full object-cover "
//                 />
//             </div>

         
//             <p className="text-gray-800 text-lg leading-relaxed mb-6 flex-grow">
//                 {testimonial.text}
//             </p>

        
//             <div className="flex items-center justify-between mt-auto">
//                 <div>
//                     <h4 className="font-bold text-gray-900 text-base">{testimonial.name}, {testimonial.location}</h4>
//                     <p className="text-gray-600 text-sm">{testimonial.title}</p>
//                 </div>
//                 {testimonial.rating && (
//                     <div className="flex items-center bg-teal-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
//                         <span>{testimonial.rating}</span>
//                         <img src={star} alt="" className="w-4 h-4 ml-1" />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };






// export default function GuestSlider() {
//     return (
       
//         <div className="w-full h-[450px]  mt-10 flex flex-col">
            
        
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-shrink-0">
              
//             </div>

     
//             <div className="w-full flex-grow">
//                 <Swiper
       
//                     slidesPerView={3}
//                     spaceBetween={30}
//                     freeMode={true}
//                     pagination={{
//                         clickable: true,
//                     }}
//                     modules={[FreeMode, Pagination]}
//                     className="mySwiper pt-6 pb-12 h-full !px-0" 
//                     style={{ paddingLeft: '1rem', paddingRight: '1rem' }} 
//                     breakpoints={{
//                         320: { slidesPerView: 1.1, spaceBetween: 10, paddingLeft: '1rem', paddingRight: '1rem' },
//                         640: { slidesPerView: 2.1, spaceBetween: 20, paddingLeft: '1.5rem', paddingRight: '1.5rem' },
//                         1024: { 
//                             slidesPerView: 3, 
//                             spaceBetween: 30, 
//                             paddingLeft: '2rem', 
//                             paddingRight: '2rem'
//                         }, 
//                         1280: { slidesPerView: 3, spaceBetween: 30, paddingLeft: '2rem', paddingRight: '2rem' }
//                     }}
//                 >
//                     {testimonialData.map((testimonial) => (
//                         <SwiperSlide key={testimonial.id}>
//                             <TestimonialCard testimonial={testimonial} />
//                         </SwiperSlide>
//                     ))}

//                 </Swiper>
//             </div>
//         </div>
//     );
// }








import { Swiper, SwiperSlide } from "swiper/react";
import star from "../../../assets/star.svg";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { FreeMode, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";

// Fake JSON data as fallback - always shown first
const testimonialData = [
    {
        id: 1,
        name: "Mitchell Smith",
        location: "UK",
        title: "CEO, TechNova",
        text: "Great service and amazing properties. I always feel like I'm getting the best deals and the team is always there to help.",
        rating: 5.0,
        image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389339/Ellipse_1_ttjbzh.png"
    },
    {
        id: 2,
        name: "Joanna Lynch",
        location: "Singapore",
        title: "Venture Capitalist",
        text: "EV is always super responsive, extremely professional and experienced enough to ensure our vacation was flawless.",
        rating: 4.8,
        image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389418/Ellipse_1_3_jw2vgn.png"
    },
    {
        id: 3,
        name: "Maria Rodriguez",
        location: "Spain",
        title: "Architect",
        text: "I have been using EV for years now and they never disappoint. Their attention to detail and professionalism is unmatched.",
        rating: 4.9,
        image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1769624395/maria_bktw44.webp"
    },
    {
        id: 4,
        name: "Omar Hassan",
        location: "Dubai",
        title: "Hotelier",
        text: "As a fellow professional in the hospitality industry, I was thoroughly impressed. The service exceeded all expectations.",
        rating: 5.0,
        image: "https://randomuser.me/api/portraits/men/30.jpg"
    },
    {
        id: 5,
        name: "Emily White",
        location: "USA",
        title: "Travel Blogger",
        text: "My family trip was unforgettable. The local experiences arranged by the concierge were truly exceptional.",
        rating: 4.7,
        image: "https://randomuser.me/api/portraits/women/8.jpg"
    }
];

// TestimonialCard component for fake data
const TestimonialCard = ({ testimonial, isAPIData = false }) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-lg min-h-[350px] flex flex-col justify-between">
            <div className="flex items-center mb-6">
                <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                />
            </div>

            <p className="text-gray-800 text-lg leading-relaxed mb-6 flex-grow">
                {testimonial.text}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div>
                    <h4 className="font-bold text-gray-900 text-base">{testimonial.name}, {testimonial.location}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </div>
                {testimonial.rating && (
                    <div className="flex items-center bg-teal-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                        <span>{testimonial.rating}</span>
                        <img src={star} alt="star" className="w-4 h-4 ml-1" />
                    </div>
                )}
            </div>
        </div>
    );
};

// APITestimonialCard component for API data (same design)
const APITestimonialCard = ({ review }) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-lg min-h-[350px] flex flex-col justify-between">
            <div className="flex items-center mb-6">
              <img
  src={review.images?.[0]?.image || "/placeholder-user.png"}
  alt={review.user_name || "Guest"}
  className="w-16 h-16 rounded-full border border-teal-600 object-cover"
/>

            </div>

            <p className="text-gray-800 text-lg leading-relaxed mb-6 flex-grow">
                {review.comment}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div>
                    <h4 className="font-bold text-gray-900 text-base">{review.user_name || "Guest"}, {review.location} </h4>
                    <p className="text-gray-600 text-sm">{review.profession}</p>
                </div>
                {review.rating && (
                    <div className="flex items-center bg-teal-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                        <span>{parseFloat(review.rating).toFixed(1)}</span>
                        <img src={star} alt="star" className="w-4 h-4 ml-1" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default function GuestSlider() {
    const [apiReviews, setApiReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Sort fake data by rating (highest first)
    const sortedTestimonialData = [...testimonialData].sort((a, b) => b.rating - a.rating);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://api.eastmondvillas.com/api/villas/reviews/?ordering=-rating");
                
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                
                const data = await response.json();
                
                // Filter only approved reviews and ensure they have rating
                const approvedReviews = data.filter(review => 
                    review.status === "approved" && review.rating
                );
                
                setApiReviews(approvedReviews);
                setError(null);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError(err.message);
                // Keep using fake data if API fails
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Combine data: always show fake data first, then API data
    const allReviews = [...sortedTestimonialData, ...apiReviews];
    const hasApiData = apiReviews.length > 0;

    return (
        <div className="w-full h-[450px] mt-10 flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-shrink-0">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Guest Reviews</h2>
                    <p className="text-gray-600 mt-2">
                        {loading ? "Loading reviews..." : 
                         hasApiData ? `Showing ${sortedTestimonialData.length} featured reviews and ${apiReviews.length} verified guest reviews` : 
                         `Showing ${sortedTestimonialData.length} featured reviews`}
                    </p>
                    {error && (
                        <p className="text-amber-600 text-sm mt-1">
                            Note: Could not load additional reviews from server.
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full flex-grow">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-4"></div>
                            <p className="text-gray-600">Loading additional reviews...</p>
                        </div>
                    </div>
                ) : (
                    <Swiper
                        slidesPerView={3}
                        spaceBetween={30}
                        freeMode={true}
                        pagination={{
                            clickable: true,
                        }}
                        modules={[FreeMode, Pagination]}
                        className="mySwiper pt-6 pb-12 h-full !px-0"
                        style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
                        breakpoints={{
                            320: { slidesPerView: 1.1, spaceBetween: 10, paddingLeft: '1rem', paddingRight: '1rem' },
                            640: { slidesPerView: 2.1, spaceBetween: 20, paddingLeft: '1.5rem', paddingRight: '1.5rem' },
                            1024: { 
                                slidesPerView: 3, 
                                spaceBetween: 30, 
                                paddingLeft: '2rem', 
                                paddingRight: '2rem'
                            },
                            1280: { slidesPerView: 3, spaceBetween: 30, paddingLeft: '2rem', paddingRight: '2rem' }
                        }}
                    >
                        {allReviews.map((review, index) => {
                            // First show fake data, then API data
                            const isFakeData = index < sortedTestimonialData.length;
                            
                            return (
                                <SwiperSlide key={isFakeData ? `fake-${review.id}` : `api-${review.id}`}>
                                    {isFakeData ? (
                                        <TestimonialCard testimonial={review} />
                                    ) : (
                                        <APITestimonialCard review={review} />
                                    )}
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                )}
            </div>
        </div>
    );
}