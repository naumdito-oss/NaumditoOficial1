import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  reason: string;
}

export function PointsModal({ isOpen, onClose, points, reason }: PointsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-main/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -100 }}
            className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-center max-w-xs w-full overflow-hidden"
          >
            {/* Background Sparkles */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-4 left-4 size-2 bg-primary rounded-full animate-ping" />
              <div className="absolute bottom-10 right-10 size-3 bg-peach-main rounded-full animate-bounce" />
              <div className="absolute top-20 right-4 size-2 bg-emerald-main rounded-full animate-pulse" />
            </div>

            <div className="relative z-10">
              <motion.div 
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="size-24 bg-gradient-to-br from-primary to-primary-light rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl mb-6"
              >
                <span className="material-symbols-outlined text-5xl">stars</span>
              </motion.div>

              <h3 className="text-3xl font-black text-navy-main dark:text-slate-100 mb-2 tracking-tighter">Parabéns!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">{reason}</p>
              
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 mb-8">
                <span className="text-4xl font-black text-emerald-600">+{points}</span>
                <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Pontos</span>
              </div>

              <button 
                onClick={onClose}
                className="w-full h-14 bg-navy-main text-white font-bold rounded-2xl shadow-xl hover:bg-navy-main/90 transition-all active:scale-95"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
