import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SkillCard from '@/components/dev/SkillCard';
import SocialButtons from '@/components/dev/SocialButtons';


const skills = [
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'React.js',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Firebase',
  'REST API Integration',
  'Tailwind CSS',
  'Responsive Web Design',
  'UI/UX Implementation',
  'Figma to React Conversion',
  'SEO Optimization',
  'Performance Optimization',
  'Authentication Systems',
  'Payment Gateway Integration',
  'AI Integration',
  'Deployment & Hosting',
];

const Developer: React.FC = () => {
  useEffect(() => {
    // SEO meta tags and Open Graph
    document.title = 'Md Juyel Rana — Full Stack Developer';

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Md Juyel Rana — Full Stack Developer. Building scalable, modern, SEO-optimized web applications.');
    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'Md Juyel Rana — Full Stack Developer');
    document.head.appendChild(ogTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    ogDesc.setAttribute('content', 'Passionate Full Stack Developer — React, Node, TypeScript, Next.js, Tailwind');
    document.head.appendChild(ogDesc);

    const jsonLd = document.createElement('script');
    jsonLd.setAttribute('type', 'application/ld+json');
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Md Juyel Rana',
      jobTitle: 'Full Stack Developer',
      telephone: '+8801747498166',
      url: 'https://github.com/juyel66',
      sameAs: [
        'https://www.facebook.com/juyel99730/',
        'https://www.instagram.com/juyel294922/',
        'https://github.com/juyel66',
      ],
    });
    document.head.appendChild(jsonLd);
  }, []);

  return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-12">
        <section className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
            className="glass p-4 sm:p-6 lg:p-10 rounded-xl sm:rounded-2xl shadow-xl border border-white/10"
        >
          {/* Header with Name and Social Icons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <h1 className="text-2xl text-center sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Developer Information</h1>
              <div className="hidden sm:flex flex-shrink-0">
                <SocialButtons />
              </div>
            </div>

          {/* Main Content */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:gap-10 mb-8 sm:mb-10">
            {/* Profile Image */}
              <div className="shrink-0 flex justify-center sm:justify-start">
         
            </div>

              {/* Mobile-only social icons under the image */}
              <div className="flex sm:hidden justify-center mt-3 mb-2">
                <SocialButtons />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-1 sm:mb-2">Md Juyel Rana</h2>
                <p className="text-base sm:text-lg text-slate-600 mb-3 sm:mb-4">Full Stack Developer</p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4 sm:mb-6">
                Passionate about building scalable, modern web applications. Experienced in premium frontend and backend
                systems, converting Figma to responsive React sites, and optimizing for performance and SEO.
              </p>

              {/* Phone Section */}
                <div className="mb-6 sm:mb-8 flex justify-center sm:justify-start items-center gap-2 sm:gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                  <a href="tel:+8801747498166" className="text-sm sm:text-base text-slate-700 hover:text-indigo-600 transition font-medium">
                  +8801747498166
                </a>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center sm:text-left">Skills & Expertise</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {skills.map((s) => (
                <SkillCard key={s} skill={s} />
              ))}
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <a
              className="w-full text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md hover:scale-[1.02] transition-transform font-medium text-sm sm:text-base active:scale-95"
              href="https://wa.me/8801747498166"
              target="_blank"
              rel="noreferrer"
            >
              💬 Start on WhatsApp
            </a>
            <a
              className="w-full text-center border-2 border-slate-300 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-slate-50 transition font-medium text-sm sm:text-base active:bg-slate-100"
              href="https://github.com/juyel66"
              target="_blank"
              rel="noreferrer"
            >
              View My GitHub
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Developer;
