// src/components/LuxuryCardGrid.jsx

import React from 'react';

// --- Feature Card Data (One icon per card) ---
const LUXURY_CARD_DATA = [
  {
    id: 1,
    // Using original image URL, as requested to use "default ja img use kora ache segulai use korba"
    imageUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760215908/ImageWithFallback_1_ho2re6.png', 
    brandName: 'The Unspoken Itinerary', // Matches card title in the image
    tagline: 'True luxury anticipates your needs before they arise', // Matches the main bold text in the image
    description: null, // Set to null for the Feature List Card variant
    icon: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760833071/Container_wsqj7b.png',
    // New data for the Feature List Card:
    features: [ 
        'Private aviation & yacht/catamaran coordination',
        'Villa pre-stocking (rare vintages & bespoke pantry curation)',
        'Discreet relocation & logistics mastery',
    ],
    // The icon you requested to use for the "options" (nicher option gula te)
    featureIconUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1761166814/Icon_45_jcnhwd.png' 
  },
  {
    id: 2,
    imageUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760216052/ImageWithFallback_2_ucygoa.png',
    brandName: 'VIP Access',
    tagline: 'Beyond the Velvet Rope',
    description: 'Unlock experiences that are simply beyond ordinary reach.',
    icon: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760833740/Frame_1000004285_fehjjw.png',
        features: [ 
        'Private aviation & yacht/catamaran coordination',
        'Villa pre-stocking (rare vintages & bespoke pantry curation)',
        'Discreet relocation & logistics mastery',
    ],
    // The icon you requested to use for the "options" (nicher option gula te)
    featureIconUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1761166814/Icon_45_jcnhwd.png' 
  },
  {
    id: 3,
    imageUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760216117/ImageWithFallback_3_cjzwkc.png',
    brandName: 'Absolute Discretion',
    tagline: 'The Invisible Hand of Protection',
    description: 'Guaranteed privacy and impeccable professional oversight.',
    icon: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760833778/Container_1_unumym.png',
        features: [ 
        'Private aviation & yacht/catamaran coordination',
        'Villa pre-stocking (rare vintages & bespoke pantry curation)',
        'Discreet relocation & logistics mastery',
    ],
    // The icon you requested to use for the "options" (nicher option gula te)
    featureIconUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1761166814/Icon_45_jcnhwd.png' 
  },
  {
    id: 4,
    imageUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760216147/ImageWithFallback_4_bqamcw.png',
    brandName: 'Bespoke Events',
    tagline: 'The Alchemy of the Exceptional',
    description: 'Customized luxury crafted from your unique vision.',
    icon: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760833829/Container_2_cdh1jr.png',
        features: [ 
        'Private aviation & yacht/catamaran coordination',
        'Villa pre-stocking (rare vintages & bespoke pantry curation)',
      
    ],
    // The icon you requested to use for the "options" (nicher option gula te)
    featureIconUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1761166814/Icon_45_jcnhwd.png' 
  },
];

// --- Reusable Card Component (Single Icon) ---
interface LuxuryFeatureCardProps {
  imageUrl: string;
  brandName: string;
  tagline: string;
  description: string | null; // Made nullable for the new card type
  icon: string;
  // New props for the feature list
  features?: string[];
  featureIconUrl?: string;
}

const LuxuryFeatureCard: React.FC<LuxuryFeatureCardProps> = ({ 
    imageUrl, 
    brandName, 
    tagline, 
    description, 
    icon, 
    features, 
    featureIconUrl 
}) => {

  const isFeatureListCard = features && features.length > 0;

  // The feature icon URL, defaulting to the one provided by the user if available
  const itemIcon = featureIconUrl; 

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden my-0 flex flex-col h-full">
      {/* 1. Image Section */}
      <div className="relative h-64 sm:h-72 w-full flex-shrink-0">
        <img
          src={imageUrl}
          alt={`${brandName} interior`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Content Card Section */}
      <div className="p-6 md:p-8 border-t flex-grow flex flex-col">
        {/* Header - Icon, Brand Name, and Tagline (Original style) or Icon and Title (New style) */}
        <div className="flex items-center mb-4 gap-3">
          {/* Single Icon */}
          <img src={icon} alt="icon" className="w-6 h-6 object-contain" />

          {/* Title / Brand and Tagline */}
          {isFeatureListCard ? (
             // New Card: Only Title is shown here
             <p className="text-gray-900 font-semibold text-lg leading-none">{brandName}</p>
          ) : (
            // Original Card: Brand Name and Tagline are both shown
            <div>
              <p className="text-gray-900 font-semibold text-lg leading-none">{brandName}</p>
              <p className="text-gray-500 text-sm">{tagline}</p>
            </div>
          )}
        </div>

        {/* Description Text */}
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 leading-snug pt-2 flex-shrink-0">
          {/* Use tagline for the main bold text in the new list card, and description for the original card */}
          {isFeatureListCard ? tagline : description}
        </p>

        {/* Feature List (Conditional Rendering) */}
        {isFeatureListCard && (
            <ul className="space-y-4 pt-6 mt-6 border-t border-gray-100 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        {/* Use the requested feature icon */}
                        <img 
                            src={itemIcon} 
                            alt="feature icon" 
                            className="w-5 h-5 object-contain mt-1 text-teal-600 flex-shrink-0"
                        />
                        <span className="text-gray-600 text-base font-medium">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
};

// --- Main Grid Rendering Component ---
const LuxuryCardGrid = () => {
  return (
    <section>
      <div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
          {LUXURY_CARD_DATA.map((cardData) => (
            <LuxuryFeatureCard
              key={cardData.id}
              imageUrl={cardData.imageUrl}
              brandName={cardData.brandName}
              tagline={cardData.tagline}
              description={cardData.description}
              icon={cardData.icon}
              features={cardData.features}
              featureIconUrl={cardData.featureIconUrl}
            />
          ))}
        </div>
      </div>

      <section className="bg-gray-900 mt-10 sm:py-24 lg:py-32 flex items-center justify-center">
        <div className="sm:px-6 lg:px-8 text-center">
          <div className="mb-8 flex justify-center p-2">
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760217464/Container_2_gnf8y8.png" alt="" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
            We Do Not Serve – We Enthrall
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 font-medium">
            Redefining the limits of luxury concierge
          </p>
        </div>
      </section>

      <section className="bg-white mb-[920px] py-20 sm:py-24 lg:py-32 flex items-center justify-center">
        <div className="mx-auto   text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            Begin the Unwritten Journey
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 font-medium mb-10">
            Every detail perfected before you even think to ask.
          </p>
          <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 md:py-4 md:px-10 shadow-lg transition duration-300 ease-in-out">
            Get In Touch
          </button>
        </div>
      </section>
    </section>
  );
};

// Example Usage Component
const ConciergeCard: React.FC = () => (
  <div>
    <LuxuryCardGrid />
  </div>
);

export default ConciergeCard;