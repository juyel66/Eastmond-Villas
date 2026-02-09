import React, { useState, useEffect, useRef } from "react";

interface DescriptionProps {
  descriptionData: string;
  descriptionImage?: string;
}

const Description: React.FC<DescriptionProps> = ({
  descriptionData,
  descriptionImage,
}) => {
  const [showFull, setShowFull] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const toggleShow = () => setShowFull((prev) => !prev);

  const text = descriptionData || "";
  const characterLimit = 690;

  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  let shortText = "";
  let remainingText = "";
  let shortParagraphs: string[] = [];
  let remainingParagraphs: string[] = [];
  
  if (text.length > characterLimit) {
    // For paragraph-based truncation
    let accumulatedLength = 0;
    shortParagraphs = [];
    remainingParagraphs = [...paragraphs];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (accumulatedLength + paragraph.length <= characterLimit) {
        shortParagraphs.push(paragraph);
        accumulatedLength += paragraph.length;
        remainingParagraphs.shift();
      } else {
        // Need to truncate within this paragraph
        const remainingChars = characterLimit - accumulatedLength;
        let cutoff = remainingChars;
        
        // Don't cut in the middle of a word
        while (cutoff > 0 && paragraph.charAt(cutoff) !== ' ' && 
               paragraph.charAt(cutoff) !== '.' && paragraph.charAt(cutoff) !== ',') {
          cutoff--;
        }
        
        if (cutoff === 0) {
          // If we can't find a good break point in the remaining characters,
          // just take the full remaining chars
          cutoff = Math.max(1, remainingChars);
        }
        
        const truncatedParagraph = paragraph.substring(0, cutoff).trim() + "...";
        shortParagraphs.push(truncatedParagraph);
        remainingParagraphs[0] = paragraph.substring(cutoff).trim();
        break;
      }
    }
    
    shortText = shortParagraphs.join('\n\n');
    remainingText = remainingParagraphs.join('\n\n');
  } else {
    shortText = text;
    shortParagraphs = paragraphs;
  }

  const title = "Description";

  // Helper function to render text with paragraphs
  const renderText = (content: string, isShort: boolean = false) => {
    const paragraphsToRender = isShort ? shortParagraphs : content.split('\n').filter(p => p.trim().length > 0);
    
    return (
      <div className="pr-2">
        {paragraphsToRender.map((paragraph, index) => {
          // Check if paragraph looks like a bullet point (starts with dash, asterisk, etc.)
          const isBulletPoint = /^[\-\*\•\‣\⁃]\s/.test(paragraph.trim());
          const isNumberedList = /^\d+\.\s/.test(paragraph.trim());
          
          if (isBulletPoint) {
            return (
              <div key={index} className="flex items-start mb-3">
                <span className="mr-2 text-teal-600">•</span>
                <span className="flex-1">{paragraph.trim().substring(1).trim()}</span>
              </div>
            );
          } else if (isNumberedList) {
            const match = paragraph.match(/^(\d+)\.\s(.*)/);
            return (
              <div key={index} className="flex items-start mb-3">
                <span className="mr-2 font-medium text-teal-600">{match?.[1]}.</span>
                <span className="flex-1">{match?.[2]}</span>
              </div>
            );
          } else {
            return (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="mt-20">
      <div className="flex gap-5 flex-col md:flex-row items-start justify-center">
        
        {/* Left: Text Content */}
        <div className="w-full md:w-1/2 bg-white rounded-lg">
          <div className="md:h-[480px] h-auto w-full text-left flex flex-col">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4 text-left">
              {title}
            </h2>

            <div 
              ref={textContainerRef}
              className={`text-gray-600 text-base leading-relaxed text-left pr-4 ${
                showFull ? "flex-1 overflow-y-auto" : "overflow-hidden"
              }`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#0D9488 #F3F4F6'
              }}
            >
              <style>
                {`
                  .text-container::-webkit-scrollbar {
                    width: 6px;
                  }
                  .text-container::-webkit-scrollbar-track {
                    background: #F3F4F6;
                    border-radius: 3px;
                  }
                  .text-container::-webkit-scrollbar-thumb {
                    background: #0D9488;
                    border-radius: 3px;
                  }
                  .text-container::-webkit-scrollbar-thumb:hover {
                    background: #0F766E;
                  }
                `}
              </style>
              
              {showFull ? (
                renderText(text)
              ) : (
                renderText(shortText, true)
              )}
            </div>

            {/* Show More/Less Button */}
            {text.length > characterLimit && (
              <div className="mt-2">
                <button
                  onClick={toggleShow}
                  className="text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200 text-left flex items-center gap-2 group"
                >
                  {showFull ? (
                    <>
                      Show Less
                      <svg 
                        className="w-4 h-4 transform transition-transform group-hover:-translate-y-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      See More
                      <svg 
                        className="w-4 h-4 transform transition-transform group-hover:translate-y-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="h-[440px] w-full rounded-lg overflow-hidden bg-gray-100">
            {descriptionImage ? (
              <img
                src={descriptionImage}
                alt="Property Description"
                className="h-full w-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  // Show placeholder if image fails to load
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = "h-full w-full flex flex-col items-center justify-center rounded-xl bg-gray-100";
                    placeholder.innerHTML = `
                      <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 17h18M5 7v10M19 7v10"/>
                        </svg>
                      </div>
                      <p class="text-gray-400 text-sm font-medium">Property Image Not Available</p>
                    `;
                    parent.appendChild(placeholder);
                  }
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
