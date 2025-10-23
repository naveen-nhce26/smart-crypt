import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, type = 'text', className = '', icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
        <div className="relative">
          {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>}
          <input
            id={id}
            type={type}
            ref={ref}
            className={`w-full bg-slate-800/50 border-0 border-b-2 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-indigo-500 transition duration-300 py-2.5 rounded-t-md ${icon ? 'pl-10' : 'px-3'} ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;