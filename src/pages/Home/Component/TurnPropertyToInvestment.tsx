import React from 'react';

const TurnPropertyToInvestment = () => {
  return (
    <div className="bg-white py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8 md:space-y-12">
          
          {/* Main Heading */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold text-gray-900 leading-tight tracking-tight">
              Let's Turn Your Property Into
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold text-gray-900 leading-tight tracking-tight">
              a Luxury Investment
            </h2>
          </div>

          {/* Description Text */}
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed tracking-wide">
            Join our network of premier villa owners and unlock your <br className="hidden sm:block" />
            property's full potential.
          </p>

          {/* CTA Button */}
          <div className="pt-6 md:pt-8">
            <button className="group relative px-8 md:px-10 py-3 md:py-4 bg-gray-900 text-white rounded-full font-semibold text-base md:text-lg lg:text-xl hover:bg-gray-800 transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
              
              {/* Button Text */}
              <span className="relative z-10 flex items-center justify-center gap-3">
                List My Villa
                {/* Arrow Icon */}
                <svg 
                  className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </span>
              
              {/* Button Hover Effect */}
              <span className="absolute inset-0 rounded-full border-2 border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110"></span>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 md:w-60 md:h-60 bg-gray-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-60 md:h-60 bg-gray-100 rounded-full blur-3xl opacity-30"></div>
          
        </div>
      </div>
    </div>
  );
};

export default TurnPropertyToInvestment;