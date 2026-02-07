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
const words = text.split(" ");

const shortText = words.slice(0, 110).join(" ") + "";
const remainingText = words.slice(110).join(" ");

  const title = "Description";

  

  return (
    <div className="mt-20">
      <div className="flex gap-5 flex-col md:flex-row items-start justify-center">
        
        <div className="w-full md:w-1/2 bg-white rounded-lg">
          <div className="min-h-[440px] w-full text-left">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4 text-left">
              {title}
            </h2>

            <div className="text-gray-600 text-base leading-relaxed text-left">
              {shortText}
            </div>

     
            {!showFull && text.length > 740 && (
              <button
                onClick={toggleShow}
                className="text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200 text-left"
              >
                Show More
              </button>
            )}
          </div>
        </div>

      
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="min-h-[440px] w-full rounded-lg overflow-hidden bg-gray-100">
            {descriptionImage ? (
              <img
                src={descriptionImage}
                alt="Property Description"
                className="h-[440px] w-full object-cover rounded-xl"
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

   
      {showFull && (
        <div className="w-full bg-white rounded-lg ">
          <div className="text-gray-600 text-base leading-relaxed whitespace-pre-line text-left">
            {remainingText}
          </div>
          <button
            onClick={toggleShow}
            className="mt-2 text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200 text-left"
          >
            Show Less
          </button>
        </div>
      )}
    </div>
  );
};

export default Description;









// import React, { useRef, useState } from 'react';

// interface DescriptionProps {
//   descriptionData: string;
//   descriptionImage?: string;
// }

// const Description: React.FC<DescriptionProps> = ({
//   descriptionData,
//   descriptionImage,
// }) => {
//   const [showFull, setShowFull] = useState(false);

//   const toggleShow = () => setShowFull((prev) => !prev);

//   const dRef = useRef<HTMLDivElement | null>(null);


//   const text = descriptionData;
//   const words = text.split(' ');

//   const shortText = words.slice(0, 100).join(' ') + '';
//   const remainingText = words.slice(100).join(' ');

//   const LINE_HEIGHT = 26; // px (text-base + leading-relaxed)
//   const MAX_LINES = 15;
//   const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES; // 520px

//   const title = 'Description';

//   return (
//     <div className="mt-20">
//       <div className="flex gap-5 flex-col md:flex-row items-start justify-center">
   

        
//       </div>


//       <div className="w-full  flex items-center justify-center">
//         <div className="min-h-[440px] w-full rounded-lg overflow-hidden bg-gray-100">
//           {descriptionImage ? (
//             <img
//               src={descriptionImage}
//               alt="Property Description"
//               className="h-[440px] w-full object-cover rounded-xl"
//               onError={(e) => {
//                 e.currentTarget.style.display = 'none';
//               }}
//             />
//           ) : (
//             <div className="h-full w-full flex flex-col items-center justify-center rounded-xl bg-gray-100">
//               <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
//                 <svg
//                   className="w-10 h-10 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="1.5"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3 7h18M3 17h18M5 7v10M19 7v10"
//                   />
//                 </svg>
//               </div>
//               <p className="text-gray-400 text-sm font-medium">
//                 Property Image Not Available
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//       <h2 className="text-2xl font-bold text-[#0F172A] mb-4 text-left mt-6">
//         {title}
//       </h2>

//       <div
//         ref={dRef}
//         className={`text-gray-600 text-base leading-relaxed text-justify
//     ${showFull ? 'overflow-y-auto' : 'overflow-hidden'}
//   `}
//         style={
//           showFull
//             ? { maxHeight: `${MAX_HEIGHT}px` }
//             : {
//                 display: '-webkit-box',
//                 WebkitLineClamp: 15,
//                 WebkitBoxOrient: 'vertical',
//               }
//         }
//       >
//         {text}
//       </div>
//       {!showFull && text.length > 740 && (
//         <button
//           onClick={toggleShow}
//           className="text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200 text-left"
//         >
//           Show More
//         </button>
//       )}

//       {showFull && (

//           <button
//             onClick={() => {
//               if (dRef.current) {
//                 dRef.current.scrollTop = 0;
//               }

//               toggleShow();
//             }}
//  className="text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200 text-left"
//           >
//             Show Less
//           </button>
//       )}
//     </div>
//   );
// };

// export default Description;
