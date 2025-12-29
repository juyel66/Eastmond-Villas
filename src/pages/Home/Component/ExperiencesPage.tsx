import React from 'react';

// --- Explore Icon for the Button ---
const ExploreIcon = () => (
  <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

const ExperiencesPage = () => {
  return (
    <div
      style={{
        backgroundImage:
          'url(https://res.cloudinary.com/dqkczdjjs/image/upload/v1760996003/4f51058172fd6af5d6cce088788ab0e6ca412b35_3_zwuytd.png)',
      }}
      className={
        // Key change: larger height on mobile (default), then tighter on small+ screens,
        // and keep aspect-based sizing on medium/large if desired.
        "relative mt-10 w-full overflow-hidden rounded-3xl shadow-xl bg-gray-900 " +
        // mobile: taller so it displays more vertical space (phones),
        // sm: a bit shorter, md/lg: use wide aspect ratios as before
        " md:aspect-[21/9] lg:aspect-[16/6] bg-cover bg-center"
      }
    >
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content Container: Centered horizontally and vertically */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 sm:p-10">
        {/* Main Heading */}
        <h1 className="lg:text-5xl sm:text-5xl text-2xl font-extrabold text-white mb-4">
          More Than Just a <span className="text-teal-400 italic">Villa</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-white max-w-2xl mx-auto lg:mb-8 mb-2 font-light">
          Your journey doesn't end with a booking. Our concierge crafts personalized
          experiences—whether it's dining under the stars, a private spa retreat, or
          exploring hidden gems.
        </p>

        {/* Button */}
        <button
          className="inline-flex items-center lg:px-8 px-6 lg:py-4 py-2 bg-teal-600 hover:bg-teal-700
                                   text-white text-lg font-semibold rounded-lg shadow-lg
                                   transition duration-300 ease-in-out mt-3"
        >
          <div className="mr-2">
            <ExploreIcon />
          </div>
          Explore Experiences
        </button>
      </div>
    </div>
  );
};

export default ExperiencesPage;
