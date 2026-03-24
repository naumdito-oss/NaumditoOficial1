import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

// Components
import { BottomNav } from '../components/layout/BottomNav';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';

// Contexts
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataProvider';

// Constants
import { EMPATHY_VIBES } from '../constants';

/**
 * EmpathyBox page component.
 * Allows users to send and receive empathy messages (apologies, cute notes, etc.)
 * to their partner.
 */
export function EmpathyBox() {
  const navigate = useNavigate();
  const { empathyMessages, addEmpathyMessage, removeEmpathyMessage } = useData();
  const { user } = useAuth();
  
  // State for modal and form inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<'fofo' | 'sincero' | 'engracado'>('fofo');

  // State for delete confirmation
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  /**
   * Handles the submission of a new empathy message.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addEmpathyMessage({
        text: newMessage.trim(),
        vibe: selectedVibe,
        authorName: user?.name || 'Seu Par'
      });
      setNewMessage('');
      setIsModalOpen(false);
    }
  };

  /**
   * Retrieves the configuration for a specific vibe.
   * 
   * @param {string} vibeId - The ID of the vibe to retrieve.
   * @returns {Object} The vibe configuration object.
   */
  const getVibeConfig = (vibeId: string) => {
    return EMPATHY_VIBES.find(v => v.id === vibeId) || EMPATHY_VIBES[0];
  };

  /**
   * Opens the delete confirmation modal.
   * 
   * @param {string} id - The ID of the message to delete.
   */
  const openDeleteModal = (id: string) => {
    setMessageToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  /**
   * Handles the actual deletion after confirmation.
   */
  const handleConfirmDelete = () => {
    if (messageToDelete) {
      removeEmpathyMessage(messageToDelete);
      setMessageToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 pb-24">
        <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
          </div>
          <h2 className="text-navy-main dark:text-slate-100 text-lg md:text-xl font-bold leading-tight tracking-tight flex-1 text-center">Caixinha de Desculpas</h2>
          <div className="flex size-10 items-center justify-end" />
        </header>

        <div className="p-4 md:p-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5 text-center">
            <div className="size-16 mx-auto bg-peach-main/10 text-peach-main rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">mail</span>
            </div>
            <h3 className="text-xl font-black text-navy-main dark:text-slate-100 mb-2">Mensagens de Paz</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Deixe um pedido de desculpas, um recadinho carinhoso ou uma mensagem para fazer as pazes.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-8 py-4 bg-navy-main text-white rounded-2xl font-bold shadow-lg shadow-navy-main/20 hover:bg-navy-main/90 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <span className="material-symbols-outlined">edit</span>
              Escrever Mensagem
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 ml-2">Mensagens Recebidas</h4>
            
            {empathyMessages.length === 0 ? (
              <div className="text-center bg-white dark:bg-slate-900/20 rounded-[2.5rem] p-12 border border-dashed border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4">inbox</span>
                <p className="text-slate-500">Nenhuma mensagem na caixinha ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {empathyMessages.map(msg => {
                    const vibeConfig = getVibeConfig(msg.vibe);
                    const date = new Date(msg.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={msg.id}
                        className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${vibeConfig.color}`}>
                            <span className="material-symbols-outlined text-sm">{vibeConfig.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{vibeConfig.label}</span>
                          </div>
                          <button 
                            onClick={() => openDeleteModal(msg.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                        
                        <p className="text-navy-main dark:text-slate-100 text-lg font-medium leading-relaxed mb-6">"{msg.text}"</p>
                        
                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                          <span className="text-xs font-bold text-slate-400">De: {msg.authorName}</span>
                          <span className="text-[10px] text-slate-400">{date}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Mensagem">
        <form onSubmit={handleAddMessage} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Qual a vibe?</label>
            <div className="grid grid-cols-3 gap-2">
              {EMPATHY_VIBES.map(vibe => (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => setSelectedVibe(vibe.id as any)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    selectedVibe === vibe.id 
                      ? 'border-peach-main bg-peach-main/5 scale-105' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <span className={`material-symbols-outlined ${selectedVibe === vibe.id ? 'text-peach-main' : 'text-slate-400'}`}>
                    {vibe.icon}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedVibe === vibe.id ? 'text-peach-main' : 'text-slate-400'}`}>
                    {vibe.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Sua mensagem</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-peach-main outline-none min-h-[120px] transition-all resize-none"
              placeholder="Escreva algo especial..."
            />
          </div>
          
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-full h-14 bg-peach-main text-slate-950 rounded-2xl font-bold text-lg shadow-xl shadow-peach-main/20 hover:bg-peach-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Enviar para a Caixinha
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Mensagem"
        message="Tem certeza que deseja excluir esta mensagem da caixinha? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        type="danger"
      />

      <BottomNav />
    </div>
  );
}
