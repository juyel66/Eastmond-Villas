import React from 'react';

const  Affiliates = () => {
    // Array of partner logos (Using the local paths you provided)
    const partners = [
        { id: 1, name: "Travelgay Approved", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760816715/1_2_rl5sre.png" },
        { id: 2, name: "221 Luxury Network", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760816794/2_5_w9qlaf.png" },
        { id: 3, name: "ABTA - Travel with confidence", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760816846/3_1_drciez.png" },
        { id: 4, name: "British Airways Preferred Partner", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760816890/4_1_rtryjo.png" },
        { id: 5, name: "IATA", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817111/5_1_lrnfb3.png" },
        { id: 6, name: "Virtuoso Member", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817187/6_1_aah9ik.png" },
        { id: 7, name: "IGLTA", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817187/7_1_og3qyp.png" },
        { id: 8, name: "Quintessentially Preferred Partner", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817187/8_1_sgmstp.png" },
        { id: 9, name: "XO Private", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817187/9_1_fbncb4.png" },
        { id: 10, name: "XO Private", src: "https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817186/10_1_tvwsyq.png" },
        
    ];

    // Placeholder URL for the background image (REPLACE THIS WITH YOUR IMAGE'S PUBLIC PATH)
    const BG_IMAGE_URL = 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760814575/abbbbb_lmlk5j.png'; 
    // If your image path in the public folder works, use this:
    // const BG_IMAGE_URL = 'public/images/Frame 1000003465 (1).png'; 


    return (
        // <section className="relative w-full lg:mb-[400px] md:mb-[400px] mb-10 0 "> 
         <section className="relative w-full mb-[920px]   ">   
            
            {/* BACKGROUND LAYER: Image and Dark Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center " 
                style={{ 
                    backgroundImage: `url(${BG_IMAGE_URL})`,
                }}
            >
                {/* Dark Overlay for contrast (opacity 50-60 is usually good) */}
                <div className="absolute inset-0  opacity-60"></div>
            </div>

            {/* CONTENT LAYER */}
            <div className="container  relative z-10 py-16 md:py-24  mx-auto text-center">
                {/* Section Title */}
                <div className="py-16 px-4"> {/* A dark background to match the image */}
      <div className="container  text-center">
        {/* Container for the line and "OUR" text */}
        
        
        {/* Adjusted the above `div` to exactly match the image with only one line and "OUR" */}
        <div className="flex items-center justify-center mb-4">
          {/* Left line: longer */}
        
          
          {/* "OUR" text */}
        
          
         
        </div>


       
        <h2 className="text-white text-4xl md:text-4xl lg:text-5xl font-extrabold tracking-wide  leading-tight">
         Our Partners & Affiliates
        </h2>
      </div>
    </div>

                {/* Logos Grid */}
                {/* Corrected the misplaced file path in the xl:grid-cols class */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-8 gap-y-12 md:gap-y-16 justify-items-center">
                    {partners.map((partner) => (
                        <div key={partner.id} className="flex flex-col items-center justify-center h-24 sm:h-28 p-2">
                            <img 
                                src={partner.src} 
                                alt={partner.name} 
                                className="max-h-full max-w-full object-contain filter brightness-0 invert transition duration-300 hover:opacity-80" 
                                // `filter brightness-0 invert` makes colored logos appear white
                            />
                        </div>
                    ))}
                </div>
            </div>
            
        </section>
    );
};

export default Affiliates;