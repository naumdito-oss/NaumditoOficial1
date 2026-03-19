import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-navy-main dark:text-white tracking-tight">{title}</h3>
              <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
