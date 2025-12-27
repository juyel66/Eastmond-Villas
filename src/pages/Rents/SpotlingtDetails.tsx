import React from 'react';

// Define the shape of a single spotlight item
interface SpotlightItemProps {
  icon: React.ReactNode; // Or string if you're using image paths
  title: string;
  description: string;
}

// Reusable component for a single spotlight card
const SpotlightCard: React.FC<SpotlightItemProps> = ({ icon, title, description }) => {
  return (
<div className="bg-white p-6 border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 text-left">
  {/* Icon on top */}
  <div className="rounded-xl p-3 inline-flex items-center justify-center mb-4">
    {icon || (
    <img src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1761518928/Component_10_xz2bwn.png" alt="" />
    )}
  </div>

  {/* Title */}
  <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>

  {/* Description */}
  <p className="text-gray-600 text-sm">{description}</p>
</div>

  );
};

const SpotlightDetails: React.FC = () => {
  // Data for your spotlight items
  const spotlightItems: SpotlightItemProps[] = [
    {
      icon: null, // Placeholder will be used
      title: 'Incredible Sea Views',
      description: 'Endless horizon and turquoise Caribbean waters.',
    },
    {
      icon: null,
      title: 'Sea View Terrace',
      description: 'Perfect for cocktails and sunsets.',
    },
    {
      icon: null,
      title: 'Infinity Edge Pool',
      description: 'Dramatic sea-facing pool with sunset views.',
    },
    {
      icon: null,
      title: 'Private Fitness & Yoga Room',
      description: 'Wellness in paradise.',
    },
    {
      icon: null,
      title: 'Zen Gardens',
      description: 'Serene landscaped gardens for total relaxation.',
    },
    {
      icon: null,
      title: 'Private Beachfront',
      description: 'Golden sands set on a bluff with direct access.',
    },
  ];

  return (
    <section className="py-16 mt-36  relative overflow-hidden">
      {/* Background Wavy Patterns (using absolute positioning and z-index) */}
     


      <div className="container mx-auto px-4 relative z-10"> {/* z-10 ensures content is above background */}
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