import React from 'react';
import containerImg from "../../assets/Container (1).svg"

interface LuxuryFeatureCardProps {
  imageUrl: string;
  brandName: string;
  tagline: string;
  description: string;
}

const LuxuryFeatureCard: React.FC<LuxuryFeatureCardProps> = ({ imageUrl, brandName, tagline, description }) => {
  return (
    <div className=" bg-white shadow-xl rounded-xl overflow-hidden my-10">
     
      <div className="relative h-64 sm:h-80 md:h-96 w-full">
        
        <img
          src={imageUrl} 
          alt={`${brandName} interior`}
          className="w-full h-full object-cover"
        />
        
        
      </div>

      <div className="p-6 md:p-8 border-t">
       
        <div className="flex items-center mb-4">
      
          <div className=" h-6 mr-3 flex items-center justify-center  rounded-md">

           <img className='w-10 h-10' src={containerImg} alt="" />
          </div>
          
          <div>
            <p className="text-gray-900 font-semibold text-lg leading-none">{brandName}</p>
            <p className="text-gray-500 text-sm">{tagline}</p>
          </div>
        </div>

     
        <p className="text-2xl sm:text-2xl font-bold text-gray-800 leading-snug pt-2">
          {description}
        </p>
      </div>
    </div>
  );
};


const Eastmond: React.FC = () => {
  const exampleData = {
    imageUrl: 'https://res.cloudinary.com/dqkczdjjs/image/upload/v1760215120/bannnnner_jrc9uz.png', 
    brandName: 'Eastmond as a Standard',
    tagline: 'The Curatorium of Distinction',
    description: 'True luxury anticipates your needs before they arise'
  };

  return (
    <div className=" ">
   
      <LuxuryFeatureCard 
        imageUrl={exampleData.imageUrl}
        brandName={exampleData.brandName}
        tagline={exampleData.tagline}
        description={exampleData.description}
      />
    </div>
  );
};

export default Eastmond;