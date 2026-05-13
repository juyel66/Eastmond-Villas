import React from 'react';
import { FaGithub, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const SocialButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap justify-center sm:justify-end">
      <a href="https://wa.me/8801747498166" target="_blank" rel="noreferrer" className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-gradient-to-br from-green-400/20 to-green-500/20 hover:from-green-400/40 hover:to-green-500/40 transition shadow-lg active:scale-95" aria-label="Contact on WhatsApp">
        <FaWhatsapp className="text-green-500 text-base sm:text-lg lg:text-xl" />
      </a>
      <a href="https://github.com/juyel66" target="_blank" rel="noreferrer" className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition shadow-lg active:scale-95" aria-label="Visit GitHub">
        <FaGithub className="text-slate-800 text-base sm:text-lg lg:text-xl" />
      </a>
      <a href="https://www.facebook.com/juyel99730/" target="_blank" rel="noreferrer" className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 transition shadow-lg active:scale-95" aria-label="Follow on Facebook">
        <FaFacebook className="text-blue-600 text-base sm:text-lg lg:text-xl" />
      </a>
      <a href="https://www.instagram.com/juyel294922/" target="_blank" rel="noreferrer" className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 transition shadow-lg active:scale-95" aria-label="Follow on Instagram">
        <FaInstagram className="text-pink-500 text-base sm:text-lg lg:text-xl" />
      </a>
    </div>
  );
};

export default SocialButtons;
