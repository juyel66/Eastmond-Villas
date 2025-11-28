import React from 'react';

// --- DiamondCheckIcon Component (The Icon) ---
const DiamondCheckIcon = () => (
    // Positioning: top-1/2, -translate-y-1/2 for vertical centering.
    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 
                    w-8 h-8 rounded-lg border border-teal-300 bg-teal-50 flex items-center justify-center 
                    text-teal-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Diamond shape */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1L1 12l11 11 11-11L12 1z"></path>
        </svg>
    </div>
);

// --- Individual Feature Item Component (The Card itself) ---
const FeatureItem = ({ title, description }) => (
    // Card item with padding, border, and fixed height for uniform look
    <div className="relative flex items-start p-6 h-full  bg-white  shadow-sm transition duration-300">
        
        <DiamondCheckIcon />

        {/* Text Content */}
        <div className="ml-10"> 
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
    </div>
);

// --- Main Section Component (Renders the 6-card grid with hardcoded data) ---
const LuxuryFeaturesGrid = () => {
    
    return (
        <div className='mt-20 lg:p-0 p-2'>
<div className=' text-center'>
    
            <h2 className="text-4xl  mb-4 font-semibold text-center">
                            Luxury made effortless
                        </h2>
                        <p>Carefully selected for Elegance, Comfort, And world-class service.</p>
</div>


                        
            <div className=" mt-10 mb-15 bg-white">
            <div className=" mx-auto ">
                
                {/* 🚨 Outer Grid for Image and Feature Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 ">
                    
                    {/* 1. LEFT COLUMN: Image Section */}
                    <div className="w-full h-full  lg:sticky lg:top-8"> 
                        <img 
                            src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817376/Frame_1000004224_wfl1vc.png" 
                            alt="Luxury Villa" 
                            className="w-full h-[600px] rounded-xl shadow-2xl" 
                        />
                    </div>
                    
                    {/* 2. RIGHT COLUMN: Feature Cards Container */}
                    <div>
                        
                        
                        {/* 🚨 Inner Grid for Two Columns (for the 6 cards) */}
                        {/* Note: items-start keeps columns aligned top when staggered */}
                        <div className="grid grid-cols-1 lg:grid-cols-2  items-start">
                            
                            {/* === LEFT CARD COLUMN (1, 3, 5) === */}
                            {/* 🚨 This div holds 1, 3, 5 and is pushed down by lg:mt-10 */}
                            <div className="grid gap-8 grid-cols-1 lg:mt-10">
                                
                                {/* Card 1: Personal Concierge */}
                                <FeatureItem 
                                    title="Personal Concierge"
                                    description="From private chefs to curated adventures — every detail is handled with white-glove care."
                                />
                                
                                {/* Card 3: Trusted Worldwide */}
                                <FeatureItem 
                                    title="Trusted Worldwide"
                                    description="Guests from 40+ countries trust Eastmond for unforgettable luxury stays."
                                />
                                
                                {/* Card 5: Award-Winning Service */}
                                <FeatureItem 
                                    title="Award-Winning Service"
                                    description="Recognized globally for excellence in luxury hospitality and exceptional guest care."
                                />
                                
                            </div>
                            
                            {/* === RIGHT CARD COLUMN (2, 4, 6) === */}
                            {/* This div holds 2, 4, 6 and stays in the normal position */}
                            <div className="grid gap-8  grid-cols-1">
                                
                                {/* Card 2: Exclusive Access */}
                                <FeatureItem 
                                    title="Exclusive Access"
                                    description="Only the most exceptional villas, hand-picked and verified for uncompromising quality."
                                />
                                
                                {/* Card 4: Seamless Booking */}
                                <FeatureItem 
                                    title="Seamless Booking"
                                    description="A secure, transparent, and hassle-free process from inquiry to check-in."
                                />
                                
                                {/* Card 6: Tailored Experiences */}
                                <FeatureItem 
                                    title="Tailored Experiences"
                                    description="Every stay is personalized — from arrival transfers to bespoke local experiences, crafted just for you."
                                />
                                
                            </div>
                            
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </div>
    );
};

export default LuxuryFeaturesGrid;