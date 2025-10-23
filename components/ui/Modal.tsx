import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  backgroundClassName?: string;
  onExitComplete?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '', backgroundClassName = 'bg-slate-800/80 border border-slate-700/80 backdrop-blur-md', onExitComplete }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
        window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const modalContent = (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={`relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col ${backgroundClassName} ${className}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex-shrink-0 flex items-start justify-between p-6 border-b border-slate-700/50">
                <h3 id="modal-title" className="text-xl font-bold text-white pr-4">{title}</h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>
            <div className="flex-grow p-6 overflow-hidden">
                {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }
  
  const portalRoot = document.getElementById('portal-root');
  return portalRoot ? createPortal(modalContent, portalRoot) : null;
};

export default Modal;