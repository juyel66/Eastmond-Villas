import React from "react";
import { MdEmail } from "react-icons/md";

const TermsAndConditions = () => {
  return (
    <div>
      <div className="container relative mb-[920px] mx-auto px-4 py-6 text-gray-800">
        {/* Top Green Header (SAME AS PRIVACY POLICY) */}
        <div className="bg-teal-600 text-white text-center py-2 rounded-md mb-4 font-semibold">
          Terms & Conditions
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="bg-red-100 text-red-700 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          IMPORTANT NOTICE
        </div>

        <p className="mb-4 leading-relaxed">
          These Terms & Conditions (“Terms”) govern your access to and use of this
          website, including all pages, content, features, tools, and services
          made available through it (collectively, the “Site”).
        </p>

        <p className="mb-4 leading-relaxed font-medium">
          By accessing, browsing, or continuing to use this Site, you expressly
          acknowledge, accept, and agree to be legally bound by these Terms in
          full and without limitation.
        </p>

        <p className="mb-6">
          If you do not agree with these Terms, you must immediately discontinue
          all use of the Site.
        </p>

        {/* 1 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          1. About Eastmond Villas
        </div>
        <p className="mb-4">
          This Site is owned and operated by Eastmond Villas Ltd., trading as
          Eastmond Villas (“Eastmond Villas”, “we”, “our” or “us”), a luxury villa
          rental, real estate sales, and lifestyle services provider based in
          Barbados.
        </p>

        <p className="mb-2">All correspondence should be directed to:</p>
        <div className="flex items-center space-x-2 mb-6">
          <MdEmail />
          <span>info@eastmondvillas.com</span>
        </div>

        {/* 2 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          2. Acceptance of Terms & Eligibility
        </div>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>You are at least sixteen (16) years of age</li>
          <li>You have legal capacity to enter binding agreements</li>
        </ul>
        <p className="mb-6">
          If you permit a minor to use this Site, you accept full responsibility
          for that individual’s actions and compliance with these Terms.
        </p>

        {/* 3 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          3. Privacy & Data Protection
        </div>
        <p className="mb-6">
          Your use of the Site is subject to our Privacy Policy. By using the
          Site, you consent to the collection and processing of personal
          information as outlined therein.
        </p>

        {/* 4 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          4. Amendments to Terms
        </div>
        <p className="mb-6">
          Eastmond Villas reserves the right to amend or update these Terms at
          any time without prior notice. Continued use of the Site constitutes
          acceptance of the revised Terms.
        </p>

        {/* 5 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          5. Website Availability
        </div>
        <p className="mb-6">
          The Site is provided on an “AS AVAILABLE” basis. We do not guarantee
          uninterrupted or error-free access and may suspend functionality at
          any time.
        </p>

        {/* 6 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          6. Permitted Use & Conduct
        </div>
        <ul className="list-disc pl-6 space-y-1 mb-6">
          <li>Attempt unauthorized system access</li>
          <li>Disrupt or interfere with website functionality</li>
          <li>Transmit harmful, fraudulent, or unlawful material</li>
          <li>Misrepresent identity or intent</li>
        </ul>

        {/* 7 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          7. Intellectual Property
        </div>
        <p className="mb-6">
          All content, trademarks, imagery, and materials are owned by or
          licensed to Eastmond Villas. Unauthorized use is strictly prohibited.
        </p>

        {/* 8 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          8. Third-Party Links
        </div>
        <p className="mb-6">
          The Site may include links to third-party websites. Eastmond Villas is
          not responsible for external content or privacy practices.
        </p>

        {/* 9 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          9. Communications
        </div>
        <p className="mb-6">
          All formal communications must be submitted in writing to:
           <div className="flex items-center space-x-2 mb-6">
          <MdEmail />
          <span>info@eastmondvillas.com</span>
        </div>
        </p>

        {/* 10 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          10. Disclaimers
        </div>
        <p className="mb-6">
          All information on this Site is provided “AS IS” without warranties of
          any kind. Nothing constitutes legal, financial, or professional
          advice.
        </p>

        {/* 11 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          11. Limitation of Liability
        </div>
        <p className="mb-6">
          To the fullest extent permitted by law, Eastmond Villas shall not be
          liable for any loss, damages, or claims arising from use of this Site.
        </p>

        {/* 12 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          12. Indemnification
        </div>
        <p className="mb-6">
          You agree to indemnify and hold harmless Eastmond Villas from any
          claims, losses, or liabilities resulting from your misuse of the Site.
        </p>

        {/* 13 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          13. Governing Law
        </div>
        <p className="mb-6">
          These Terms are governed by and interpreted in accordance with the
          laws of Barbados.
        </p>

        {/* 14 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          14. Severability
        </div>
        <p className="mb-6">
          If any provision is found invalid, the remaining provisions shall
          continue in full force and effect.
        </p>

        {/* 15 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          15. Termination
        </div>
        <p className="mb-6">
          Eastmond Villas reserves the right to suspend or terminate access to
          the Site at any time without notice.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
