import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  percentage: number;
}

export function ConnectionModal({ isOpen, onClose, percentage }: ConnectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-main/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-navy-main dark:text-slate-100 tracking-tighter">Termômetro de Sintonia</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Sua conexão atual: <span className="text-primary font-bold">{percentage}%</span></p>
                </div>
                <button 
                  onClick={onClose}
                  className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Como funciona?</h3>
                  <p className="text-emerald-900/70 dark:text-emerald-400/70 text-sm leading-relaxed">
                    A sintonia é calculada semanalmente com base na interação e engajamento do casal. Quanto mais vocês usam as ferramentas do app, maior será a barra de conexão!
                  </p>
                </div>

                <div>
                  <h3 className="text-navy-main dark:text-slate-100 font-bold uppercase tracking-widest text-xs mb-4">Bônus de Sintonia</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Check-ins Diários</span>
                      </div>
                      <span className="text-emerald-600 font-black text-sm">+30%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-lg">favorite</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Gesto do Dia</span>
                      </div>
                      <span className="text-emerald-600 font-black text-sm">+20%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-lg">handshake</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Compromissos Ativos</span>
                      </div>
                      <span className="text-emerald-600 font-black text-sm">+15%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-lg">swap_horiz</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Trocas & Permutas</span>
                      </div>
                      <span className="text-emerald-600 font-black text-sm">+15%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-lg">card_giftcard</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Itens na Wishlist</span>
                      </div>
                      <span className="text-emerald-600 font-black text-sm">+10%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-lg">calendar_month</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Plano de Encontro</span>
                      </div>
                      <span className="text-emerald-600 font-black text-sm">+10%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Bônus para o Casal</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Manter a sintonia acima de <span className="font-bold text-primary">80%</span> por 3 semanas consecutivas desbloqueia o emblema <span className="font-bold text-primary">"Conexão Inquebrável"</span> e concede <span className="font-bold text-primary">500 pontos bônus</span> para cada um!
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full mt-8 h-14 bg-navy-main text-white font-bold rounded-2xl shadow-xl hover:bg-navy-main/90 transition-all active:scale-95"
              >
                Entendi!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
