import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', isLoading = false, disabled, ...props }) => {
  const baseClasses = "relative overflow-hidden flex justify-center items-center w-full rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu group";

  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 focus-visible:outline-indigo-600 shadow-indigo-500/20 shadow-[0_10px_20px_-10px_rgba(79,70,229,0.4)]",
    secondary: "bg-slate-800/60 border border-slate-700 text-slate-200 hover:bg-slate-800 focus-visible:outline-slate-700",
    danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {variant === 'primary' && (
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      {variant === 'secondary' && (
         <span className="absolute top-0 left-0 w-full h-full rounded-lg ring-1 ring-slate-700 group-hover:ring-indigo-500 transition-all duration-300" />
      )}
      <span className="relative z-10 flex items-center justify-center w-full">
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

export default Button;