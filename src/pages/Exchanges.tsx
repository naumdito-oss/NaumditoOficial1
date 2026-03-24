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
import { EXCHANGE_TYPES } from '../constants';

import { PageHeader } from '../components/layout/PageHeader';

/**
 * Exchanges page component.
 * Allows users to create, view, and manage exchanges (permutas) with their partner.
 * Users can propose exchanges, make counter-offers, and accept agreements.
 */
export function Exchanges() {
  const navigate = useNavigate();
  const { exchanges, addExchange, updateExchange, removeExchange } = useData();
  const { user } = useAuth();
  
  // State for modals and form inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [exchangeToDelete, setExchangeToDelete] = useState<string | null>(null);
  const [counterOfferText, setCounterOfferText] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    type: EXCHANGE_TYPES[0] as typeof EXCHANGE_TYPES[number]
  });

  /**
   * Handles the submission of a new exchange request.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleAddExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      addExchange({
        title: formData.title.trim(),
        description: '', // Not used in the new flow initially
        type: formData.type,
        authorName: user?.name || 'Seu Par'
      });
      setFormData({ title: '', type: 'romantico' });
      setIsModalOpen(false);
    }
  };

  /**
   * Opens the counter-offer modal for a specific exchange.
   * 
   * @param {string} id - The ID of the exchange to counter.
   */
  const handleOpenCounterModal = (id: string) => {
    setSelectedExchangeId(id);
    setCounterOfferText('');
    setIsCounterModalOpen(true);
  };

  /**
   * Handles the submission of a counter-offer for an exchange.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSendCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExchangeId && counterOfferText.trim()) {
      updateExchange(selectedExchangeId, {
        counterOffer: counterOfferText.trim(),
        status: 'counter_proposed'
      });
      setIsCounterModalOpen(false);
      setSelectedExchangeId(null);
    }
  };

  /**
   * Handles accepting an exchange agreement.
   * 
   * @param {string} id - The ID of the exchange to accept.
   */
  const handleAcceptAgreement = (id: string) => {
    updateExchange(id, { status: 'accepted' });
  };

  /**
   * Handles the removal of an exchange after user confirmation.
   */
  const handleConfirmDelete = () => {
    if (exchangeToDelete) {
      removeExchange(exchangeToDelete);
      setExchangeToDelete(null);
    }
  };

  /**
   * Opens the delete confirmation modal.
   * 
   * @param {string} id - The ID of the exchange to remove.
   */
  const openDeleteModal = (id: string) => {
    setExchangeToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 pt-6 justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
          <button onClick={() => navigate(-1)} className="text-navy-main dark:text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-navy-main dark:text-white text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10">Permutas</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-8">
          {/* Action Section */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-primary/5 shadow-sm">
              <h2 className="text-navy-main dark:text-white text-lg font-bold mb-2">Nova Troca</h2>
              <p className="text-slate-500 text-sm mb-6">Faça um pedido e negocie com seu parceiro.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-2xl h-14 bg-navy-main text-white text-base font-bold shadow-lg shadow-navy-main/20 hover:bg-navy-main/90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>Fazer um Pedido</span>
              </button>
            </div>

            <div className="bg-peach-main/5 dark:bg-peach-main/10 rounded-3xl p-6 border border-peach-main/10 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-peach-main">
                <span className="material-symbols-outlined">lightbulb</span>
                <span className="font-bold text-sm uppercase tracking-wider">Dica do Especialista</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Permutas com o tom <span className="font-bold text-peach-main">Romântico</span> têm 40% mais chance de serem aceitas rapidamente pelo parceiro.
              </p>
            </div>
          </div>

          {/* List Section */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-navy-main dark:text-white text-lg font-bold">Permutas Ativas</h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">{exchanges.length} Ativas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {exchanges.length === 0 ? (
                <div className="col-span-full text-center bg-white dark:bg-slate-900/20 rounded-3xl p-12 border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4">volunteer_activism</span>
                  <p className="text-slate-500">Nenhuma permuta ativa no momento.</p>
                </div>
              ) : (
                exchanges.map((exchange) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={exchange.id} 
                    className={`bg-white dark:bg-slate-800 rounded-[2rem] p-6 border shadow-sm hover:shadow-md transition-all group ${
                      exchange.status === 'accepted' 
                        ? 'border-emerald-500/30 dark:border-emerald-500/30' 
                        : exchange.status === 'counter_proposed'
                        ? 'border-amber-500/30 dark:border-amber-500/30'
                        : 'border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4 w-full">
                        <div className={`p-3 rounded-2xl flex items-center justify-center size-14 shrink-0 ${
                          exchange.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' 
                          : exchange.status === 'counter_proposed' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                          : 'bg-peach-main/10 dark:bg-peach-main/20 text-peach-main'
                        }`}>
                          <span className="material-symbols-outlined text-[32px]">
                            {exchange.status === 'accepted' ? 'handshake' : exchange.status === 'counter_proposed' ? 'sync_alt' : 'campaign'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                              exchange.status === 'accepted' ? 'text-emerald-500' 
                              : exchange.status === 'counter_proposed' ? 'text-amber-500'
                              : 'text-peach-main'
                            }`}>
                              {exchange.status === 'accepted' ? 'Acordo Fechado' : exchange.status === 'counter_proposed' ? 'Contraproposta Recebida' : 'Aguardando Resposta'}
                            </p>
                            <button onClick={() => openDeleteModal(exchange.id)} className="shrink-0 p-1 text-slate-300 hover:text-red-500 transition-colors -mt-2 -mr-2">
                              <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                          </div>
                          
                          {/* The Request */}
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{exchange.authorName || 'Parceiro'} pediu:</p>
                            <p className="text-navy-main dark:text-slate-100 text-base font-bold leading-tight">{exchange.title}</p>
                          </div>

                          {/* The Counter Offer */}
                          {exchange.counterOffer && (
                            <div className="bg-peach-main/5 dark:bg-peach-main/10 rounded-2xl p-4 border border-peach-main/20">
                              <p className="text-[10px] font-bold text-peach-main uppercase tracking-widest mb-1">Em troca de:</p>
                              <p className="text-navy-main dark:text-slate-100 text-base font-bold leading-tight">{exchange.counterOffer}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-4 flex gap-3">
                            {exchange.status === 'pending' && (
                              <button 
                                onClick={() => handleOpenCounterModal(exchange.id)}
                                className="flex-1 bg-navy-main text-white text-xs font-bold py-3 rounded-xl hover:bg-navy-main/90 transition-colors flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[18px]">reply</span>
                                Fazer Contraproposta
                              </button>
                            )}
                            
                            {exchange.status === 'counter_proposed' && (
                              <button 
                                onClick={() => handleAcceptAgreement(exchange.id)}
                                className="flex-1 bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                              >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Aceitar Acordo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">{exchange.type}</span>
                      <span className="text-[10px] font-medium text-slate-400">Criado em {new Date(exchange.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for New Exchange */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Pedido">
        <form onSubmit={handleAddExchange} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">O que você quer pedir?</label>
            <input
              autoFocus
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-peach-main outline-none transition-all"
              placeholder="Ex: Jogar bola na quarta-feira"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
            <div className="grid grid-cols-2 gap-3">
              {EXCHANGE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type as any })}
                  className={`h-12 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    formData.type === type
                      ? 'bg-peach-main border-peach-main text-slate-950 shadow-md'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={!formData.title.trim()}
            className="w-full h-14 bg-peach-main text-slate-950 rounded-2xl font-bold text-lg shadow-xl shadow-peach-main/20 hover:bg-peach-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Enviar Pedido
          </button>
        </form>
      </Modal>

      {/* Modal for Counter Offer */}
      <Modal isOpen={isCounterModalOpen} onClose={() => setIsCounterModalOpen(false)} title="Contraproposta">
        <form onSubmit={handleSendCounterOffer} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Tudo bem, mas em troca quero...</label>
            <input
              autoFocus
              type="text"
              value={counterOfferText}
              onChange={(e) => setCounterOfferText(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-peach-main outline-none transition-all"
              placeholder="Ex: Sábado irmos ao shopping"
            />
          </div>
          
          <button 
            type="submit"
            disabled={!counterOfferText.trim()}
            className="w-full h-14 bg-navy-main text-white rounded-2xl font-bold text-lg shadow-xl shadow-navy-main/20 hover:bg-navy-main/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Enviar Contraproposta
          </button>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancelar Permuta"
        message="Tem certeza que deseja cancelar esta permuta? Esta ação não pode ser desfeita."
        confirmText="Cancelar Permuta"
        type="danger"
      />

      <BottomNav />
    </div>
  );
}
