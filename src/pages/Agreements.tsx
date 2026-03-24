import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Components
import { BottomNav } from '../components/BottomNav';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

// Contexts
import { useData } from '../context/DataContext';

/**
 * Agreements page component.
 * Allows users to create, view, and manage relationship agreements (combinados).
 * Users can also mark agreements as broken with a justification.
 */
export function Agreements() {
  const navigate = useNavigate();
  const { agreements, addAgreement, updateAgreement, removeAgreement } = useData();
  
  // State for modals and form inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [newAgreement, setNewAgreement] = useState('');
  const [justification, setJustification] = useState('');
  const [agreementToBreak, setAgreementToBreak] = useState<string | null>(null);
  const [agreementToDelete, setAgreementToDelete] = useState<string | null>(null);

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
    }
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
        <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
          </div>
          <h2 className="text-navy-main dark:text-slate-100 text-lg md:text-xl font-bold leading-tight tracking-tight flex-1 text-center">Acordos - Nossos combinados</h2>
          <div className="flex size-10 items-center justify-end">
            <button className="flex items-center justify-center rounded-full size-10 hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">more_horiz</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-6">
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
              {agreements.length === 0 ? (
                <div className="text-center bg-white dark:bg-slate-900/20 rounded-3xl p-12 border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4">handshake</span>
                  <p className="text-slate-500">Nenhum acordo criado ainda.</p>
                </div>
              ) : (
                agreements.map((agreement) => (
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
                        <span className={`size-2 rounded-full ${agreement.status === 'active' ? 'bg-peach-500' : 'bg-red-500'}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${agreement.status === 'active' ? 'text-peach-500 dark:text-peach-400' : 'text-red-500 dark:text-red-400'}`}>
                          Status: {agreement.status === 'active' ? 'ATIVO' : 'DESCUMPRIDO'}
                        </p>
                      </div>
                    </div>
                    {agreement.status === 'active' && (
                      <button 
                        onClick={() => openJustificationModal(agreement.id)}
                        className="shrink-0 p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Marcar como descumprido"
                      >
                        <span className="material-symbols-outlined">warning</span>
                      </button>
                    )}
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

      <BottomNav />
    </div>
  );
}
