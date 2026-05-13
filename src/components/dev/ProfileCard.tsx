import React from 'react';

type Props = {
  name: string;
  title: string;
  phone: string;
  avatar: string;
};

const ProfileCard: React.FC<Props> = ({ name, title, phone, avatar }) => {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="shrink-0">
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white/40 shadow-lg"
        />
      </div>
      <div>
        <div className="text-xl font-semibold">{name}</div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-3 text-sm flex items-center gap-2 text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5a4.5 4.5 0 004.5 4.5h.75a2.25 2.25 0 002.121-1.5l.75-2.25A2.25 2.25 0 0114.5 10.5H18" />
          </svg>
          <span>{phone}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
