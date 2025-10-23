import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../../hooks/useToast';
import { ToastMessage } from '../../types';

const icons = {
  success: <CheckCircle className="h-6 w-6 text-green-400" />,
  error: <XCircle className="h-6 w-6 text-red-400" />,
  info: <Info className="h-6 w-6 text-indigo-400" />,
};

const Toast: React.FC<{ message: ToastMessage, onDismiss: (id: string) => void }> = ({ message, onDismiss }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{ duration: 0.2 }}
      className="mb-4 flex w-full max-w-sm items-start space-x-4 rounded-xl p-4 shadow-lg bg-slate-900/80 border border-slate-700 backdrop-blur-lg"
    >
      <div className="flex-shrink-0">{icons[message.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-100">{message.message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => onDismiss(message.id)}
          className="inline-flex rounded-md text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

const ToastContainer: React.FC<{ toasts: ToastMessage[], onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start">
      <div className="w-full flex flex-col items-center sm:items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};