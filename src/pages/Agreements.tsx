import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// Components
import { BottomNav } from '../components/layout/BottomNav';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';

// Contexts
import { useData } from '../context/DataProvider';

import { PageHeader } from '../components/layout/PageHeader';

/**
 * Agreements page component.
 * Allows users to create, view, and manage relationship agreements (combinados).
 * Users can also mark agreements as broken with a justification.
 */
export function Agreements() {
  const navigate = useNavigate();
  const { agreements, addAgreement, updateAgreement, removeAgreement, clearBrokenAgreements } = useData();
  
  // State for modals and form inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [newAgreement, setNewAgreement] = useState('');
  const [justification, setJustification] = useState('');
  const [agreementToBreak, setAgreementToBreak] = useState<string | null>(null);
  const [agreementToDelete, setAgreementToDelete] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handles the submission of a new agreement.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleAddAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgreement.trim()) {
      addAgreement(newAgreement.trim());
      setNewAgreement('');
      setIsModalOpen(false);
    }
  };

  /**
   * Handles marking an agreement as broken with a justification.
   */
  const handleBreakAgreement = () => {
    if (agreementToBreak && justification.trim()) {
      updateAgreement(agreementToBreak, { status: 'broken', justification: justification.trim() });
      setJustification('');
      setAgreementToBreak(null);
      setIsJustificationModalOpen(false);
    }
  };

  /**
   * Opens the justification modal for a specific agreement.
   * 
   * @param {string} id - The ID of the agreement to break.
   */
  const openJustificationModal = (id: string) => {
    setAgreementToBreak(id);
    setIsJustificationModalOpen(true);
  };

  /**
   * Handles the removal of an agreement after user confirmation.
   */
  const handleConfirmDelete = () => {
    if (agreementToDelete) {
      removeAgreement(agreementToDelete);
      setAgreementToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  /**
   * Handles clearing all broken agreements.
   */
  const handleConfirmClear = () => {
    clearBrokenAgreements();
    setIsConfirmClearOpen(false);
  };

  /**
   * Opens the delete confirmation modal.
   * 
   * @param {string} id - The ID of the agreement to remove.
   */
  const openDeleteModal = (id: string) => {
    setAgreementToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 pb-24">
        <PageHeader 
          title="Acordos - Nossos combinados" 
          rightAction={
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center rounded-full size-10 hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">more_horiz</span>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setIsTipsModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-peach-500">lightbulb</span>
                      Dicas de Acordos
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1" />
                    <button 
                      onClick={() => {
                        setIsConfirmClearOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete_sweep</span>
                      Limpar Histórico
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
        />

        <div className="p-4 md:p-8">
          <div className="flex flex-col">
            <div className="flex flex-col gap-8">
              {/* Active Agreements Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-[0.1em] opacity-70">Acordos Ativos</h3>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-navy-main text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-navy-main/20 active:scale-95 transition-all hover:bg-navy-main/90"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Novo Combinado
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {agreements.filter(a => a.status === 'active').length === 0 ? (
                    <div className="text-center bg-white dark:bg-slate-900/20 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 text-sm">Nenhum acordo ativo no momento.</p>
                    </div>
                  ) : (
                    agreements.filter(a => a.status === 'active').map((agreement) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={agreement.id} 
                        className="flex items-center gap-4 bg-white dark:bg-slate-900/20 p-5 rounded-2xl border border-transparent hover:border-primary/20 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 size-12 group-hover:bg-primary group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined">handshake</span>
                        </div>
                        <div className="flex flex-col flex-1 justify-center">
                          <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight mb-1">{agreement.text}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-peach-500" />
                            <p className="text-[10px] font-bold uppercase tracking-wider text-peach-500 dark:text-peach-400">
                              Status: ATIVO
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => openJustificationModal(agreement.id)}
                          className="shrink-0 p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Marcar como descumprido"
                        >
                          <span className="material-symbols-outlined">warning</span>
                        </button>
                        <button 
                          onClick={() => openDeleteModal(agreement.id)}
                          className="shrink-0 p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Broken Agreements Section */}
              {agreements.some(a => a.status === 'broken') && (
                <div className="space-y-4">
                  <h3 className="text-red-500 text-sm font-bold uppercase tracking-[0.1em] opacity-70">Acordos Descumpridos</h3>
                  <div className="flex flex-col gap-3">
                    {agreements.filter(a => a.status === 'broken').map((agreement) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={agreement.id} 
                        className="flex items-center gap-4 bg-red-50/50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20 group"
                      >
                        <div className="flex items-center justify-center rounded-2xl bg-red-100 text-red-500 shrink-0 size-12">
                          <span className="material-symbols-outlined">warning</span>
                        </div>
                        <div className="flex flex-col flex-1 justify-center">
                          <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight mb-1 line-through opacity-60">{agreement.text}</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-red-500" />
                              <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                                Status: DESCUMPRIDO
                              </p>
                            </div>
                            {agreement.justification && (
                              <p className="text-xs text-slate-500 italic">"{agreement.justification}"</p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => openDeleteModal(agreement.id)}
                          className="shrink-0 p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for New Agreement */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Combinado">
        <form onSubmit={handleAddAgreement} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">O que vocês combinaram?</label>
            <textarea
              autoFocus
              value={newAgreement}
              onChange={(e) => setNewAgreement(e.target.value)}
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-peach-main outline-none min-h-[120px] transition-all"
              placeholder="Ex: Não usar celular durante o jantar..."
            />
          </div>
          
          <button 
            type="submit"
            disabled={!newAgreement.trim()}
            className="w-full h-14 bg-peach-main text-slate-950 rounded-2xl font-bold text-lg shadow-xl shadow-peach-main/20 hover:bg-peach-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirmar Combinado
          </button>
        </form>
      </Modal>

      {/* Modal for Justification */}
      <Modal isOpen={isJustificationModalOpen} onClose={() => setIsJustificationModalOpen(false)} title="Justificativa">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Por que o acordo foi descumprido?</label>
            <textarea
              autoFocus
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 outline-none min-h-[120px] transition-all"
              placeholder="Descreva o motivo..."
            />
          </div>
          
          <button 
            onClick={handleBreakAgreement}
            disabled={!justification.trim()}
            className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-500/20 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirmar Justificativa
          </button>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Acordo"
        message="Tem certeza que deseja remover este acordo? Esta ação não pode ser desfeita."
        confirmText="Remover"
        type="danger"
      />

      {/* Confirm Clear Modal */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Limpar Histórico"
        message="Deseja remover todos os acordos descumpridos do seu histórico? Esta ação não pode ser desfeita."
        confirmText="Limpar Tudo"
        type="danger"
      />

      {/* Tips Modal */}
      <Modal isOpen={isTipsModalOpen} onClose={() => setIsTipsModalOpen(false)} title="Dicas de Acordos">
        <div className="space-y-6">
          <div className="p-4 bg-peach-50 dark:bg-peach-900/10 rounded-2xl border border-peach-100 dark:border-peach-900/20">
            <h4 className="font-bold text-peach-700 dark:text-peach-400 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              Por que fazer acordos?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Acordos ajudam a alinhar expectativas e evitar conflitos desnecessários. Eles devem ser revistos periodicamente.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-navy-main/10 text-navy-main flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">01</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Seja Específico</p>
                <p className="text-xs text-slate-500">Em vez de "ser mais carinhoso", tente "dar um beijo de bom dia todos os dias".</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-navy-main/10 text-navy-main flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">02</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Foco no Positivo</p>
                <p className="text-xs text-slate-500">Foque no que vocês QUEREM fazer, não apenas no que querem evitar.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-navy-main/10 text-navy-main flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">03</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Revisão Semanal</p>
                <p className="text-xs text-slate-500">Use o check-in semanal para conversar sobre como os acordos estão funcionando.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsTipsModalOpen(false)}
            className="w-full h-14 bg-navy-main text-white rounded-2xl font-bold text-lg shadow-xl shadow-navy-main/20 hover:bg-navy-main/90 transition-all"
          >
            Entendi
          </button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
