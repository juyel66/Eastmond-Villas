import React from "react";
import SignatureCard from "./SignatureCard";

interface Props {
  items?: any[]; // receives filtered items from Home -> FilterSystem
  loading?: boolean;
  error?: string | null;
}

const SignatureCardContainer: React.FC<Props> = ({ items = [], loading = false, error = null }) => {
  // items already mapped as raw API objects (SignatureCard expects villa prop)
  return (
    <div itemID="signatureVilla" className="py-12 p-2 ">
      <div className="">
        <h2 className="lg:text-4xl mt-5 text-2xl font-extrabold text-gray-900 text-center mb-10">
          Our <span className="text-[#009689] italic">Signature</span> Villas
        </h2>

        {loading && (
          <div className="text-center text-gray-600 mb-6">Loading villas…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items && items.length > 0 ? (
            items.map((villa: any) => (
              <SignatureCard key={villa.id ?? villa.pk ?? Math.random()} villa={villa} />
            ))
          ) : (
            !loading && (
              <div className="col-span-full text-center text-gray-600">
                No villas found.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SignatureCardContainer;
