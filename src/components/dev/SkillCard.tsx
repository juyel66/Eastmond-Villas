import React from 'react';

const SkillCard: React.FC<{ skill: string }> = ({ skill }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/20 p-2 sm:p-3 rounded-lg shadow-sm hover:shadow-md transition active:scale-95">
      <div className="text-xs sm:text-sm font-medium line-clamp-2">{skill}</div>
    </div>
  );
};

export default SkillCard;
