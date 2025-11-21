
// import { villaData } from "@/FakeJson"; // Assuming this path for your fake data
// import SignatureCard from "./SignatureCard";


// const SignatureCardContainer = () => {
//     // Get the data from the imported JSON
//     const signatureCardData = villaData;
    
//     // Log the data for debugging (as you requested)
//     // console.log(signatureCardData); 

//     return (
//         <div itemID="signatureVilla" className="py-12 p-2 ">
//             <div className="">
                
//                 {/* Section Title (Optional, but good practice) */}
//                 <h2 className="lg:text-4xl mt-5 text-2xl  font-extrabold text-gray-900 text-center mb-10">
//                     Our <span className="text-[#009689] italic ">Signature</span> Villas 
//                 </h2>

//                 {/* Grid Layout for the Cards */}
//                 <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    
//                     {/* Map Functionality */}
//                     {signatureCardData.map((villa) => (
//                         <SignatureCard 
//                             key={villa.id} // Essential for list performance in React
//                             villa={villa} 
//                         />
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SignatureCardContainer;














import { useEffect, useState } from "react";
import SignatureCard from "./SignatureCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://10.10.13.60:8000/api";

const SignatureCardContainer = () => {
    // Real property data from backend
    const [signatureCardData, setSignatureCardData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/villas/properties/`);
                const data = await res.json();

                console.log("Fetched Signature Villas:", data); // 👈 shows backend data

                // Some APIs return {results: [...]}, some return [...]
                setSignatureCardData(data?.results || data);
            } catch (err) {
                console.error("Error fetching villas:", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div itemID="signatureVilla" className="py-12 p-2 ">
            <div className="">
                <h2 className="lg:text-4xl mt-5 text-2xl font-extrabold text-gray-900 text-center mb-10">
                    Our <span className="text-[#009689] italic">Signature</span> Villas
                </h2>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {signatureCardData?.map((villa) => (
                        <SignatureCard 
                            key={villa.id}
                            villa={villa}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SignatureCardContainer;
