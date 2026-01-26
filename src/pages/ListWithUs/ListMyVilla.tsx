import React from "react";

interface Props {
  onSubmitClick?: () => void;
}

const ListMyVilla: React.FC<Props> = ({ onSubmitClick }) => {
  return (
    <div className="relative mb-[920px] mt-14 mx-auto overflow-hidden shadow-lg">
      {/* Banner Image */}
      <img
        src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760212482/Properties_Container_4_ou2czf.png"
        alt="Luxury Property Banner"
        className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover object-center"
      />

      {/* Overlay with Content */}
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 sm:p-8 text-center">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Let's Turn Your Property Into <br className="hidden md:block" /> a Luxury Investment
        </h1>
        <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-md sm:max-w-lg md:max-w-xl">
          Join our network of premier villa owners and unlock your property's full potential.
        </p>
        
        {/* Updated button to use the onSubmitClick handler */}
        <button
          onClick={onSubmitClick}
          className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition duration-300 ease-in-out"
        >
          List My Villa
        </button>
      </div>
    </div>
  );
};

export default ListMyVilla;