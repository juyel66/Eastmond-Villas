import React, { useState } from "react";

interface DescriptionProps {
  descriptionData: string;
  descriptionImage?: string;
}

const Description: React.FC<DescriptionProps> = ({
  descriptionData,
  descriptionImage,
}) => {
  const [showFull, setShowFull] = useState(false);

  const toggleShow = () => setShowFull((prev) => !prev);

  const text = descriptionData;
  const shortText = text.slice(0, 550) + "...";
  const title = "Description";

  return (
    <div className="flex mt-20 gap-5 flex-col md:flex-row items-start justify-center">
      {/* TEXT SECTION */}
      <div className="w-full md:w-1/2 bg-white rounded-lg">
        <div className="h-[440px] w-full p-4 text-left">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-4">
            {title}
          </h2>

          {/* SCROLLABLE DESCRIPTION TEXT */}
          <div className="text-gray-600 text-base leading-relaxed mb-4 max-h-[300px] overflow-y-auto pr-2">
            {showFull ? text : shortText}
          </div>

          <button
            onClick={toggleShow}
            className="text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200"
          >
            {showFull ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>

      {/* IMAGE / PLACEHOLDER SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="h-[440px] w-full rounded-lg overflow-hidden bg-gray-100">
          {descriptionImage ? (
            <img
              src={descriptionImage}
              alt="Property Description"
              className="h-full w-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center rounded-xl bg-gray-100">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7h18M3 17h18M5 7v10M19 7v10"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                Property Image Not Available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Description;
