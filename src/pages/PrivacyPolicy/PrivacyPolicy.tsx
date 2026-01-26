import React from "react";

const PrivacyPolicy = () => {
  const handleEmailClick = (e) => {
    e.preventDefault();
    window.location.href = "mailto:info@eastmondvillas.com";
  };

  return (
    <div>
      <div className="container relative mb-[920px] mx-auto px-4 py-6 text-gray-800">
        {/* Top Green Header */}
        <div className="bg-teal-600 text-white text-center py-2 rounded-md mb-4 font-semibold">
          Privacy Policy
        </div>

        {/* Intro */}
        <p className="text-base text-gray-700 mb-6 leading-relaxed">
          Eastmond Villas <span className="font-semibold">("Eastmond Villas", "we", "our" or "us")</span> recognizes that
          privacy, discretion, and confidentiality are foundational principles
          in the delivery of luxury villa rentals, real estate transactions, and
          bespoke lifestyle services. We are committed to protecting the
          personal information entrusted to us by our clients, villa owners,
          partners, and website visitors, and to handling such information in a
          lawful, transparent, and responsible manner.
        </p>

        <p className="mb-6 leading-relaxed">
          This Privacy Policy explains how personal information is collected,
          used, disclosed, safeguarded, and retained in connection with our
          website, booking platforms, communications, and associated services.
        </p>

        {/* 1 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          1. Scope and Application
        </div>
        <p className="mb-2">
          This Privacy Policy applies to personal information collected:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-6">
          <li>Through our website and digital platforms</li>
          <li>During villa rental inquiries, bookings, and guest stays</li>
          <li>
            In connection with real estate sales, acquisitions, or property
            management services
          </li>
          <li>
            Through direct communications via email, telephone, messaging
            platforms, or in person
          </li>
          <li>From villa owners, guests, agents, and professional partners</li>
        </ul>
        <p className="mb-6">
          By accessing our website or engaging with Eastmond Villas, you
          acknowledge and agree to the practices described in this Privacy
          Policy.
        </p>

        {/* 2 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          2. Information We Collect
        </div>
        <p className="mb-2">
          We collect personal information that is reasonably necessary to
          conduct our operations, deliver services, and comply with legal and
          contractual obligations.
        </p>

        <p className="mt-4 font-semibold">2.1 Personal Information</p>
        <p className="mb-2">
          Depending on the nature of your engagement with Eastmond Villas, this
          may include:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Full legal name, preferred name, title, and contact details</li>
          <li>Email address, telephone number, and physical mailing address</li>
          <li>Nationality, country of residence, and language preferences</li>
          <li>
            Passport or government-issued identification details (where required
            for booking validation, immigration facilitation, security, or
            regulatory compliance)
          </li>
          <li>
            Travel itineraries, arrival and departure details, and accommodation
            preferences
          </li>
          <li>Payment, billing, and transaction information</li>
          <li>
            Lifestyle preferences, special requests, or medical considerations
            voluntarily disclosed to enhance service delivery
          </li>
          <li>Records of correspondence and communications with our team</li>
          <li>
            For property owners, additional information may include ownership
            documentation, banking details, contractual records, and
            property-specific data required for listing, marketing, or
            management services
          </li>
        </ul>

        <p className="mt-2 font-semibold">
          2.2 Non-Personal and Technical Information
        </p>
        <p className="mb-2">
          We may also collect non-identifying information such as:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-6">
          <li>IP address and approximate geographic location</li>
          <li>Browser type, operating system, and device identifiers</li>
          <li>Website interaction data, analytics, and referral sources</li>
        </ul>
        <p className="mb-6">
          This information assists in maintaining website security,
          functionality, and performance.
        </p>

        {/* 3 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          3. How We Use Personal Information
        </div>
        <p className="mb-2">
          Eastmond Villas uses personal information solely for legitimate and
          proportionate business purposes, including:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-6">
          <li>
            Responding to inquiries and providing accurate villa or property
            information
          </li>
          <li>
            Processing reservations, contracts, payments, deposits, and refunds
          </li>
          <li>
            Delivering concierge services, guest experiences, and personalized
            offerings
          </li>
          <li>
            Communicating pre-arrival, in-stay, and post-departure information
          </li>
          <li>
            Managing relationships with villa owners, suppliers, and
            professional partners
          </li>
          <li>
            Complying with legal, regulatory, tax, immigration, and reporting
            obligations
          </li>
          <li>Protecting against fraud, misuse, or security risks</li>
          <li>
            Improving operational efficiency, service quality, and digital
            platforms
          </li>
          <li>
            Conducting marketing and promotional activities where lawful and
            consented
          </li>
        </ul>
        <p className="font-semibold mb-6">
          We do not sell, rent, or trade personal information.
        </p>

        {/* 4 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          4. Legal Basis for Processing
        </div>
        <p className="mb-2">
          Personal information is processed under one or more lawful bases,
          including:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <span className="font-semibold">Contractual necessity</span>, where
            processing is required to fulfill a booking, transaction, or service
            agreement
          </li>
          <li>
            <span className="font-semibold">Legal obligation</span>, where
            processing is necessary to comply with applicable laws or
            regulations
          </li>
          <li>
            <span className="font-semibold">Legitimate business interests</span>
            , where processing supports the operation and integrity of our
            business without overriding individual rights
          </li>
          <li>
            <span className="font-semibold">Consent</span>, where individuals
            have explicitly agreed to specific processing activities
          </li>
        </ul>
        <p className="mb-6">
          Where consent is relied upon, it may be withdrawn at any time by
          contacting{" "}
          <a 
            href="mailto:info@eastmondvillas.com" 
            onClick={handleEmailClick}
            className="font-semibold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
          >
            info@eastmondvillas.com
          </a>
          , subject to applicable legal or contractual limitations.
        </p>

        {/* 5 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          5. Disclosure and Sharing of Information
        </div>
        <p className="mb-2">
          All personal information is treated as confidential and disclosed only
          where necessary and appropriate.
        </p>
        <p className="mb-2">Information may be shared with:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            Trusted third-party service providers supporting our operations
            (e.g. payment processors, IT providers, concierge partners)
          </li>
          <li>
            Property owners, where necessary to facilitate bookings or
            property-related services
          </li>
          <li>
            Professional advisers such as attorneys, accountants, insurers, or
            auditors
          </li>
          <li>
            Regulatory authorities, government bodies, or law enforcement
            agencies where legally required
          </li>
        </ul>
        <p className="mb-6">
          All third parties are required to maintain confidentiality and data
          protection standards consistent with this Privacy Policy.
        </p>

        {/* 6 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          6. International Data Transfers
        </div>
        <p className="mb-6">
          Due to the international nature of luxury travel and real estate,
          personal information may be transferred to or processed in
          jurisdictions outside Barbados. Where such transfers occur, Eastmond
          Villas implements reasonable safeguards to ensure that personal
          information receives an appropriate level of protection consistent
          with recognized data protection principles.
        </p>

        {/* 7 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          7. Data Retention
        </div>
        <p className="mb-6">
          Personal information is retained only for as long as reasonably
          necessary to fulfill the purposes outlined in this Privacy Policy,
          including compliance with legal, contractual, accounting, or
          regulatory requirements. Retention periods vary based on the nature of
          the data and services provided. When no longer required, information
          is securely deleted or anonymized.
        </p>

        {/* 8 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          8. Data Security
        </div>
        <p className="mb-6">
          Eastmond Villas implements and maintains administrative, technical,
          and physical safeguards designed to protect personal information
          against unauthorized access, loss, misuse, alteration, or disclosure,
          in accordance with recognized industry standards.
        </p>
        <p className="mb-6">
          Notwithstanding the implementation of such safeguards, users
          expressly acknowledge and agree that no method of transmission over
          the internet, electronic storage system, or security framework is
          infallible or capable of guaranteeing absolute security.
        </p>
        <p className="mb-6">
          By accessing our website, submitting personal information, or
          otherwise engaging with Eastmond Villas and its services, users
          knowingly and voluntarily assume all risks associated with the
          transmission and storage of personal information. To the fullest
          extent permitted by applicable laws, users agree that Eastmond Villas
          shall not be liable for any loss, damage, unauthorized access,
          disclosure, interception, or misuse of personal information resulting
          from cyber incidents, system failures, acts or omissions of third
          parties, or events beyond Eastmond Villas' reasonable control,
          provided that reasonable and appropriate safeguards were in place at
          the relevant time.
        </p>

        {/* 9 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          9. Cookies and Website Technologies
        </div>
        <p className="mb-6">
          Our website may use cookies and similar technologies to enhance user
          experience, analyze traffic, and support website functionality.
          Cookies may collect information regarding browsing behavior or
          preferences. Users may manage cookie settings through their browser or
          request additional information by contacting{" "}
          <a 
            href="mailto:info@eastmondvillas.com" 
            onClick={handleEmailClick}
            className="font-semibold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
          >
            info@eastmondvillas.com
          </a>
          .
        </p>

        {/* 10 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          10. Marketing Communications
        </div>
        <p className="mb-6">
          Where permitted by law, Eastmond Villas may send marketing or
          promotional communications relating to villa rentals, real estate
          opportunities, or curated experiences. Individuals may opt out of such
          communications at any time by following the unsubscribe instructions
          included in the communication or by contacting{" "}
          <a 
            href="mailto:info@eastmondvillas.com" 
            onClick={handleEmailClick}
            className="font-semibold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
          >
            info@eastmondvillas.com
          </a>
          .
        </p>

        {/* 11 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          11. Your Rights
        </div>
        <p className="mb-2">
          Subject to applicable law, individuals may have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            Request access to personal information held by Eastmond Villas
          </li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>
            Request deletion or restriction of processing, where applicable
          </li>
          <li>Object to certain processing activities</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p className="mb-6">
          All requests may be submitted by contacting{" "}
          <a 
            href="mailto:info@eastmondvillas.com" 
            onClick={handleEmailClick}
            className="font-semibold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
          >
            info@eastmondvillas.com
          </a>
          , and will be handled in accordance with legal requirements.
        </p>

        {/* 12 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          12. Third-Party Websites
        </div>
        <p className="mb-6">
          Our website may contain links to third-party websites. Eastmond
          Villas is not responsible for the privacy practices, content, or
          security of external websites. Users are encouraged to review
          third-party privacy policies independently.
        </p>

        {/* 13 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          13. Children's Privacy
        </div>
        <p className="mb-6">
          Our services and website are not intended for individuals under the
          age of 18. Eastmond Villas does not knowingly collect personal
          information from minors.
        </p>

        {/* 14 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          14. Changes to This Privacy Policy
        </div>
        <p className="mb-6">
          Eastmond Villas reserves the unrestricted right, at its sole
          discretion, to amend, modify, update, or replace this Privacy Policy
          at any time and without prior notice, approval, or consent. Such
          amendments may be made to reflect changes in legal or regulatory
          requirements, business operations, service offerings, technological
          developments, or industry standards, or for any other reason deemed
          necessary by Eastmond Villas.
        </p>
        <p className="mb-6">
          Any revisions shall become effective immediately upon publication on
          our website, unless otherwise stated. Continued use of our website or
          services following the posting of any changes constitutes acceptance
          of the revised Privacy Policy. Eastmond Villas shall not be liable
          for, nor subject to any claim, loss, or adverse consequence arising
          from any modification to this Privacy Policy.
        </p>

        {/* 15 */}
        <div className="bg-gray-300 inline-block px-3 py-1 rounded-md font-semibold mb-2">
          15. Contact Information
        </div>
        <p className="text-sm mb-6">
          For questions, requests, or concerns relating to this Privacy Policy
          or the handling of personal information, please contact:
        </p>
        <p className="text-sm">
          <span className="font-semibold">Eastmond Villas</span> <br />
          📍 #65 Husbands Gardens, St. James, Barbados BB23042 <br />
          📞 +1 (246) 233-3278 <br />
          📧{" "}
          <a 
            href="mailto:info@eastmondvillas.com" 
            onClick={handleEmailClick}
            className="font-semibold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
          >
            info@eastmondvillas.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;