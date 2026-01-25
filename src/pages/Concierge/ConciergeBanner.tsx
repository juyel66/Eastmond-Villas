import React from 'react';

const ConciergeBanner: React.FC = () => {
  return (
    <div className="relative   mx-auto overflow-hidden rounded-xl shadow-lg">
      {/* Banner Image */}
      <img 
        src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760213196/ImageWithFallback_zwfrkd.png" // Replace with your actual image path
        alt="Luxury Property Banner"
        className="w-full  lg:h-[600px] object-cover object-center"
      />

      {/* Overlay with Content */}
      <div className="absolute inset-0  bg-opacity-50 flex flex-col items-center justify-center pl-2 pr-2 text-center">
        <h1 className="text-white lg:mt-0 mt-1  lg:text-5xl md:text-5xl font-bold leading-tight mb-4">
        
          Beyond Anticipation – The Art of <br className="hidden md:block" /> Bespoke Luxury
        </h1>
        <p className="text-gray-200 text-base md:text-lg mb-3 max-w-xl">
         Orchestrating the extraordinary with seamless, intuitively tailored service.
        </p>
        <a href='/list-with-us' className="lg:px-8 lg:py-3 bg-teal-500 text-white text-xl p-2 lg:mb-0 mb-2 font-semibold rounded-lg shadow-md hover:bg-teal-600 transition duration-300 ease-in-out">
          Begin Your Journey
        </a>
      </div>
    </div>
  );
};

export default ConciergeBanner;