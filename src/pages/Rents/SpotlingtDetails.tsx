import React from 'react';

// Define the shape of a single spotlight item
interface SpotlightItemProps {
  icon?: React.ReactNode; // Or string if you're using image paths
  title: string;
  description: string;
}

// Props interface for the component
interface SpotlightDetailsProps {
  villa?: {
    spotlight_details?: Array<{
      title?: string;
      description?: string;
    }>;
  };
}

// Reusable component for a single spotlight card
const SpotlightCard: React.FC<SpotlightItemProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 text-center md:text-left">
      {/* Icon on top */}
      <div className="rounded-xl p-3 inline-flex items-center justify-center mb-4">
        {icon || (
          <img 
            src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761518928/Component_10_xz2bwn.png" 
            alt="spotlight icon" 
          />
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const SpotlightDetails: React.FC<SpotlightDetailsProps> = ({ villa }) => {
  // Check if villa and spotlight_details exist and have valid items
  const hasValidSpotlightDetails = villa?.spotlight_details && 
                                  Array.isArray(villa.spotlight_details) && 
                                  villa.spotlight_details.length > 0;

  // Extract spotlight items from villa
  const spotlightItems: SpotlightItemProps[] = hasValidSpotlightDetails 
    ? villa.spotlight_details
        .filter(item => item && item.title && item.description) // Only items with both title and description
        .map(item => ({
          icon: null,
          title: item.title!,
          description: item.description!
        }))
    : [];

  // If no spotlight details, show a message card
  if (spotlightItems.length === 0) {
    return (
      <section className="py-16 mt-36 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Spotlight Details
          </h2>
          
          <div className="flex justify-center">
            <div className="bg-white p-8 border rounded-lg shadow-md max-w-md w-full text-center">
              <div className="rounded-xl p-3 inline-flex items-center justify-center mb-4 mx-auto">
                <img 
                  src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761518928/Component_10_xz2bwn.png" 
                  alt="no spotlight icon" 
                />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Spotlight Details Available
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                No spotlight information has been added for this property yet.
              </p>
              
              <div className="text-xs text-gray-400 mt-4">
                <p>Check back later for updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 mt-36 relative overflow-hidden">
      {/* Background Wavy Patterns (using absolute positioning and z-index) */}
      <div className="container mx-auto px-4 relative z-10">
        {/* z-10 ensures content is above background */}
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Spotlight Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {spotlightItems.map((item, index) => (
            <SpotlightCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpotlightDetails;