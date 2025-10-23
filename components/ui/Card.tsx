import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`
      rounded-2xl shadow-2xl p-6 sm:p-8 
      bg-slate-900/60 ring-1 ring-white/10
      backdrop-blur-xl transition-all duration-300 
      group relative overflow-hidden
      ${className}
    `}>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;