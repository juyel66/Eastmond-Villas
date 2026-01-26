import { MdEmail } from "react-icons/md";

const TermsAndConditions = () => {
  const handleEmailClick = () => {
    const email = "info@eastmondvillas.com";
    const mailtoLink = `mailto:${email}`;
    
    // Method 1: Direct window.location - most reliable
    window.location.href = mailtoLink;
    
    // Method 2: Fallback with timeout
    setTimeout(() => {
      // If still on same page, try window.open
      if (window.location.href !== mailtoLink) {
        window.open(mailtoLink, "_self");
      }
    }, 100);
  };

  return (
    <div>
      <div className="container relative mx-auto px-4 mb-[920px] py-6 text-gray-800">
        {/* Top Green Header */}
        <div className="bg-teal-600 text-white text-center py-2 rounded-md mb-4 font-semibold">
          Terms & Conditions
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="bg-red-100 text-red-700 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          IMPORTANT NOTICE
        </div>

        <p className="mb-4 leading-relaxed">
          These Terms & Conditions ("Terms") govern your access to and use of this
          website, including all pages, content, features, tools, and services
          made available through it (collectively, the "Site").
        </p>

        <p className="mb-4 leading-relaxed">
          By accessing, browsing, or continuing to use this Site, you <span className="font-semibold">expressly
          acknowledge, accept, and agree</span> to be legally bound by these Terms <span className="font-semibold">in
          full and without limitation.</span>
        </p>

        <p className="mb-6">
          If you do not agree with these Terms, you must <span className="font-semibold">immediately discontinue
          all use</span> of the Site.
        </p>

        {/* 1. About Eastmond Villas */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          1. About Eastmond Villas
        </div>
        <p className="mb-4">
          This Site is owned and operated by <span className="font-semibold">Eastmond Villas Ltd</span>, trading as
          <span className="font-semibold"> Eastmond Villas</span> ("Eastmond", "we", "our", or "us"), a luxury villa
          rental, property sales and lifestyle services provider based in
          Barbados.
        </p>
        <p className="mb-2">All correspondence relating to these Terms should be directed to:</p>
        <div 
          className="flex items-center space-x-2 mb-6 cursor-pointer text-teal-600 hover:text-teal-800"
          onClick={handleEmailClick}
        >
          <MdEmail />
          <span className="hover:underline">info@eastmondvillas.com</span>
        </div>

        {/* 2. Acceptance of Terms & User Eligibility */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          2. Acceptance of Terms & User Eligibility
        </div>
        <p className="mb-4">
          By accessing or using this Site, you represent and warrant that:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>You are at least <span className="font-semibold">sixteen (16) years of age;</span> and</li>
          <li>You possess the legal capacity to enter into binding agreements under applicable law.</li>
        </ul>
        <p className="mb-4">
          If you are using this Site on behalf of a minor, you confirm that you are the minor's parent or legal guardian, that you consent to the minor's use of the Site, and that you assume full responsibility and liability for the minor's actions, omissions, and compliance with these Terms.
        </p>
        <p className="mb-6">
          Any use of the Site under your supervision constitutes your agreement to these Terms on behalf of that user.
        </p>

        {/* 3. Privacy & Data Protection */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          3. Privacy & Data Protection
        </div>
        <p className="mb-4">
          Your use of this Site is subject to our Privacy Policy, which forms part of these Terms. By using the Site, you consent to the collection, use, and processing of information as described therein.
        </p>
        <p className="mb-6">
          While Eastmond Villas implements reasonable safeguards, you acknowledge that no system is entirely secure, and Eastmond Villas disclaims all liability arising from unauthorized access, interception, or misuse beyond its reasonable control.
        </p>

        {/* 4. Changes to These Terms */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          4. Changes to These Terms
        </div>
        <p className="mb-4">
          Eastmond Villas reserves the <span className="font-semibold">absolute and unilateral right</span> to amend, revise, replace, or update these Terms at any time, for any reason, and without prior notice.
        </p>
        <p className="mb-6">
          Changes take effect immediately upon posting. Your continued use of the Site constitutes your <span className="font-semibold">binding acceptance</span> of the revised Terms. Eastmond Villas has no obligation to notify users individually.
        </p>

        {/* 5. Website Availability & Functionality */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          5. Website Availability & Functionality
        </div>
        <p className="mb-4">
          The Site is provided on an <span className="font-semibold">"AS AVAILABLE" basis</span>. Eastmond Villas does not warrant or guarantee that the Site will be uninterrupted, error-free, secure, or continuously accessible.
        </p>
        <p className="mb-6">
          We reserve the right to suspend, withdraw, modify, or restrict access to the Site — in whole or in part — at any time, without liability, including for maintenance, operational, legal, or business reasons.
        </p>

        {/* 6. Permitted Use & User Conduct */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          6. Permitted Use & User Conduct
        </div>
        <p className="mb-4">
          You agree to use the Site only for lawful purposes and in a manner that does not infringe upon the rights of others or impair their use of the Site.
        </p>
        <p className="mb-4">You must not:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>misuse or interfere with Site functionality;</li>
          <li>attempt unauthorized access to systems or data;</li>
          <li>upload or transmit malicious code, viruses, or harmful material;</li>
          <li>use the Site for misleading, fraudulent, or unlawful activity.</li>
        </ul>
        <p className="mb-6">
          Any breach may result in immediate suspension or termination of access without notice.
        </p>

        {/* 7. Intellectual Property Rights */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          7. Intellectual Property Rights
        </div>
        <p className="mb-4">
          All content on this Site — including text, images, branding, layouts, trademarks, and proprietary materials — is owned by or licensed to Eastmond Villas and protected by intellectual property laws.
        </p>
        <p className="mb-6">
          You are granted a <span className="font-semibold">limited, revocable, non-exclusive, non-transferable license</span> to view the Site for personal, non-commercial use only. Any unauthorized use, reproduction, or distribution is <span className="font-semibold">strictly prohibited</span>.
        </p>

        {/* 8. Third-Party Links & External Content */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          8. Third-Party Links & External Content
        </div>
        <p className="mb-4">
          This Site may contain links to third-party websites or services for convenience only. Eastmond Villas does not control, endorse, or assume responsibility for third-party content, availability, or practices.
        </p>
        <p className="mb-6">
          Access to third-party sites is undertaken <span className="font-semibold">entirely at your own risk</span>, and Eastmond Villas disclaims all liability arising therefrom.
        </p>

        {/* 9. Communications With Eastmond Villas */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          9. Communications With Eastmond Villas
        </div>
        <p className="mb-4">
          Any compliments, complaints, questions, feedback, or other communications relating to Eastmond Villas, the Site, or its content must be submitted <span className="font-semibold">exclusively in writing</span> to:
        </p>
        <div 
          className="flex items-center space-x-2 mb-4 cursor-pointer text-teal-600 hover:text-teal-800"
          onClick={handleEmailClick}
        >
          <MdEmail />
          <span className="hover:underline">info@eastmondvillas.com</span>
        </div>
        <p className="mb-4">
          Eastmond Villas is <span className="font-semibold">under no obligation</span> to respond to any communication or to do so within any particular timeframe. Any response provided is made without prejudice, without admission of liability, and does not constitute a waiver of any rights, remedies, or defenses.
        </p>
        <p className="mb-4">You acknowledge and agree that:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Submission of a communication <span className="font-semibold">does not</span> create any contractual, fiduciary, or advisory relationship;</li>
          <li>Eastmond Villas assumes <span className="font-semibold">no responsibility or liability</span> for actions taken or not taken in response;</li>
          <li>Any response is provided for general informational purposes only and <span className="font-semibold">may not be relied upon</span> as advice, confirmation, or assurance.</li>
        </ul>
        <p className="mb-6">
          Eastmond Villas reserves the right to retain, review, disregard, or delete any communication received, without <span className="font-semibold">liability of any kind</span>.
        </p>

        {/* 10. Disclaimers */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          10. Disclaimers
        </div>
        <p className="mb-4 font-medium">General Disclaimer</p>
        <p className="mb-4">
          All content on this Site is provided <span className="font-semibold">"AS IS" and "AS AVAILABLE"</span>, without warranties of any kind — express or implied — including accuracy, completeness, reliability, merchantability, or fitness for a particular purpose.
        </p>
        <p className="mb-4 font-medium">No Professional Advice</p>
        <p className="mb-6">
          Nothing on this Site constitutes legal, financial, investment, travel, or professional advice. Any reliance placed on Site content is done <span className="font-semibold">entirely at your own risk</span>.
        </p>

        {/* 11. Limitation of Liability */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          11. Limitation of Liability
        </div>
        <p className="mb-4 font-medium">
          <span className="font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY LAW</span>, Eastmond Villas shall not be liable for any loss or damage — whether direct, indirect, incidental, consequential, special, exemplary, or punitive — arising out of or related to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>use of or inability to use the Site;</li>
          <li>reliance on Site content;</li>
          <li>errors, omissions, delays, or interruptions;</li>
          <li>security breaches or unauthorized access.</li>
        </ul>
        <p className="mb-6">
          This limitation applies regardless of legal theory, including negligence, contract, tort, or strict liability.
        </p>

        {/* 12. User Indemnification */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          12. User Indemnification
        </div>
        <p className="mb-4 font-medium">
          By using this Site, you <span className="font-semibold">irrevocably agree</span> to indemnify, defend, and hold harmless Eastmond Villas, its directors, officers, employees, agents, affiliates, and successors from <span className="font-semibold">any and all claims, liabilities, losses, damages, costs, and expenses</span>, including legal fees, arising out of or relating to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>your use or misuse of the Site;</li>
          <li>your breach of these Terms;</li>
          <li>your violation of any law or third-party rights;</li>
          <li>any claim attributable to your actions or omissions.</li>
        </ul>
        <p className="mb-6">
          This obligation survives termination of Site use.
        </p>

        {/* 13. Governing Law & Jurisdiction */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          13. Governing Law & Jurisdiction
        </div>
        <p className="mb-6">
          These Terms are governed by the laws of Barbados. You <span className="font-semibold">irrevocably submit</span> to the exclusive jurisdiction of the courts of Barbados for any dispute arising from or related to these Terms or the Site.
        </p>

        {/* 14. Severability */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          14. Severability
        </div>
        <p className="mb-6">
          If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
        </p>

        {/* 15. Termination of Access */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          15. Termination of Access
        </div>
        <p className="mb-6">
          Eastmond Villas may suspend or terminate access to the Site at its sole discretion, at any time, for any reason or no reason, without notice and without liability.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;