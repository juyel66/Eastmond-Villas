const PrivacyPolicy = () => {
  return (
   <div>
     <div className="container relative mb-[920px] mx-auto px-4 py-6 text-gray-800">
      {/* Top Green Header */}
      <div className="bg-teal-600 text-white text-center py-2 rounded-md mb-4 font-semibold">
        Privacy Policy
      </div>

      {/* Effective Date */}
      <p className="text-xl text-gray-700 mb-4">
        <strong>Effective Date:</strong> June 7, 2024
      </p>

      {/* 1 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        1. Information We Collect
      </div>

      <p className="mt-2 mb-2">
        We may collect the following types of information:
      </p>

      <ul className="list-disc pl-6 space-y-1 mb-4">
        <li>
          <strong>Personal Information:</strong> Name, email address, phone
          number, or other details you provide voluntarily.
        </li>
        <li>
          <strong>Usage Data:</strong> Pages visited, time spent, device type,
          browser type, and interaction data.
        </li>
        <li>
          <strong>Cookies & Tracking Technologies:</strong> We use cookies to
          improve user experience and analyze usage patterns.
        </li>
      </ul>

      {/* 2 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        2. How We Use Your Information
      </div>

      <p className="mt-2 mb-2">We use your information to:</p>

      <ul className="list-disc pl-6 space-y-1 mb-4">
        <li>Provide and maintain our services</li>
        <li>Improve user experience and product performance</li>
        <li>Communicate updates, support, or important notices</li>
        <li>Analyze usage trends and user behavior</li>
        <li>Ensure security and prevent fraudulent activities</li>
      </ul>

      {/* 3 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        3. Sharing of Information
      </div>

      <p className="mt-2 mb-2">
        We do not sell or rent your personal information.
      </p>

      <ul className="list-disc pl-6 space-y-1 mb-4">
        <li>
          Trusted third-party service providers (analytics, hosting, payment
          processing)
        </li>
        <li>
          Legal authorities if required by law or to protect our rights
        </li>
      </ul>

      {/* 4 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        4. Data Security
      </div>

      <p className="mt-2 mb-4">
        We implement appropriate technical and organizational measures to protect
        your personal data from unauthorized access, loss, misuse, or alteration.
        However, no method of transmission over the internet is 100% secure.
      </p>

      {/* 5 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        5. Your Rights
      </div>

      <p className="mt-2 mb-2">You have the right to:</p>

      <ul className="list-disc pl-6 space-y-1 mb-2">
        <li>Access your personal data</li>
        <li>Request correction or deletion of your data</li>
        <li>Withdraw consent where applicable</li>
      </ul>

      <p className="mb-4">
        To exercise these rights, please contact us.
      </p>

      {/* 6 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        6. Cookies Policy
      </div>

      <p className="mt-2 mb-4">
        Cookies help us understand how users interact with our platform. You can
        choose to disable cookies through your browser settings, but some
        features may not function properly.
      </p>

      {/* 7 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        7. Third-Party Links
      </div>

      <p className="mt-2 mb-4">
        Our platform may contain links to third-party websites. We are not
        responsible for the privacy practices or content of those external sites.
      </p>

      {/* 8 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        8. Changes to This Policy
      </div>

      <p className="mt-2 mb-4">
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page with an updated revision date.
      </p>

      {/* 9 */}
      <div className="bg-gray-100 inline-block px-3 py-1 rounded-md font-semibold mb-2">
        9. Contact Us
      </div>

      <p className="mt-2 text-sm">
        If you have any questions about this Privacy Policy, please contact us
        at:
        <br />
        Email: support@example.com
        <br />
        Address: [Company Address]
      </p>
    </div>
    
   </div>
  );
};

export default PrivacyPolicy;
