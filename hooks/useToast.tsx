
import { useContext, createContext } from 'react';

type ToastContextType = {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
