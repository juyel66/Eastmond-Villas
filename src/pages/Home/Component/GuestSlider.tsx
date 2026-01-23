
import { Swiper, SwiperSlide } from "swiper/react";

import star from "../../../assets/star.svg"


import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

// Import required modules
import { FreeMode, Pagination } from "swiper/modules";



const testimonialData = [
    {
        id: 1,
        name: "Sarah Johnson",
        location: "UK",
        title: "CEO, TechNova",
        text: "Great service and amazing properties. I always feel like I'm getting the best deals and the team is always there to help",
        rating: 5.0,
        image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389339/Ellipse_1_ttjbzh.png"
    },
    {
        id: 2,
        name: "Joanna Lynch",
        location: "Singapore",
        title: "Venture Capitalist",
        text: "EV is always super responsive, extremely professional and experienced enough to ensure  ",
        rating: 4.8,
        image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389418/Ellipse_1_3_jw2vgn.png"
    },
    {
        id: 3,
        name: "Maria Rodriguez",
        location: "Spain",
        title: "Architect",
        text: "TI have been using EV for years now and they never disappoint, Their attention to detail and..",
        rating: 4.9,
        image: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760389450/Ellipse_1_4_wjn80w.png"
    },
    {
        id: 4,
        name: "Omar Hassan",
        location: "Dubai",
        title: "Hotelier",
        text: "As a fellow professional in the hospitality industry, I was thoroughly impressed. The service...",
        rating: 5.0,
        image: "https://randomuser.me/api/portraits/men/30.jpg"
    },
    {
        id: 5,
        name: "Emily White",
        location: "USA",
        title: "Travel Blogger",
        text: "My family trip was unforgettable. The local experiences arranged by the concierge were ...",
        rating: 4.7,
        image: "https://randomuser.me/api/portraits/women/8.jpg"
    }
];








const TestimonialCard = ({ testimonial }) => {
    return (
 
        <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-lg min-h-[350px] flex flex-col justify-between">
        
            <div className="flex items-center mb-6">
                <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover "
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
                        <img src={star} alt="" className="w-4 h-4 ml-1" />
                    </div>
                )}
            </div>
        </div>
    );
};






export default function GuestSlider() {
    return (
       
        <div className="w-full h-[450px]  mt-10 flex flex-col">
            
        
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-shrink-0">
              
            </div>

     
            <div className="w-full flex-grow">
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
                    {testimonialData.map((testimonial) => (
                        <SwiperSlide key={testimonial.id}>
                            <TestimonialCard testimonial={testimonial} />
                        </SwiperSlide>
                    ))}

                </Swiper>
            </div>
        </div>
    );
}