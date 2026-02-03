

const DiamondCheckIcon = () => (

  <div
    className="absolute top-1/2 left-0 transform -translate-y-1/2 
                    w-8 h-8 rounded-lg border border-teal-300 bg-teal-50 flex items-center justify-center 
                    text-teal-500"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
     
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 1L1 12l11 11 11-11L12 1z"
      ></path>
    </svg>
  </div>
);

const FeatureItem = ({ title, description }) => (

  <div className="relative flex items-start p-6 h-full  bg-white  shadow-sm transition duration-300">
    <DiamondCheckIcon />

    {/* Text Content */}
    <div className="ml-10">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  </div>
);


const LuxuryFeaturesGrid = () => {
  return (
    <div className="mt-20 lg:p-0 p-2">
      <div className=" text-center">
        <h2 className="text-4xl  mb-4 font-semibold text-center">
          Luxury Made Effortless
        </h2>
        <p className="text-gray-500">
          Carefully selected for Elegance, Comfort, And World-Class Service.
        </p>
      </div>

      <div className=" mt-10 mb-15 bg-white">
        <div className=" mx-auto ">
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 ">
         
            <div className="w-full h-full  lg:sticky lg:top-8">
              <img
                src="https://res.cloudinary.com/dqkczdjjs/image/upload/v1760817376/Frame_1000004224_wfl1vc.png"
                alt="Luxury Villa"
                className="w-full h-[600px] rounded-xl shadow-2xl"
              />
            </div>

            
            <div>
        
              <div className="grid grid-cols-1 lg:grid-cols-2  items-start">

                <div className="grid gap-8 grid-cols-1 lg:mt-10">
              
                  <FeatureItem
                    title="Personal Concierge"
                    description="From private chefs to curated adventures — every detail is handled with white-glove care."
                  />

                  <FeatureItem
                    title="Trusted Worldwide"
                    description="Guests from 40+ countries trust Eastmond for unforgettable luxury stays."
                  />

                  <FeatureItem
                    title="Award-Winning Service"
                    description="Recognized globally for excellence in luxury hospitality and exceptional guest care."
                  />
                </div>

                <div className="grid gap-8  grid-cols-1">
               
                  <FeatureItem
                    title="Exclusive Access"
                    description="Only the most exceptional villas, hand-picked and verified for uncompromising quality."
                  />

                  
                  <FeatureItem
                    title="Seamless Booking"
                    description="A secure, transparent, and hassle-free process from Enquire to check-in."
                  />

               
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
