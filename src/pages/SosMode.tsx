import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Components
import { BottomNav } from '../components/layout/BottomNav';
import { Modal } from '../components/common/Modal';

// Contexts
import { useData } from '../context/DataProvider';
import { useAuth } from '../context/AuthContext';

/**
 * SosMode page component.
 * Provides tools for conflict resolution, including AI-assisted mediation
 * and emergency time-out features.
 */
export function SosMode() {
  const navigate = useNavigate();
  const { addEmpathyMessage } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'mediation' | 'emergency'>('mediation');
  
  // Mediation State
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState<'calm' | 'alert' | 'tense'>('calm');
  const [isRefining, setIsRefining] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  // Emergency State
  const [showTimeOutModal, setShowTimeOutModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const analyzeSentiment = (value: string) => {
    setText(value);
    const negativeWords = ['triste', 'irritado', 'bravo', 'chateado', 'ódio', 'sozinho', 'raiva', 'saco', 'droga', 'nunca', 'sempre'];
    const positiveWords = ['feliz', 'calmo', 'amor', 'bom', 'ótimo', 'paz', 'tranquilo', 'entendo', 'sinto'];
    
    let score = 0;
    negativeWords.forEach(word => { if (value.toLowerCase().includes(word)) score -= 1; });
    positiveWords.forEach(word => { if (value.toLowerCase().includes(word)) score += 1; });

    if (score <= -2) setSentiment('tense');
    else if (score < 0) setSentiment('alert');
    else setSentiment('calm');
  };

  const handleRefineWithAI = async () => {
    if (!text.trim()) return;
    setIsRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Atue como um especialista em Comunicação Não-Violenta (CNV) e mediação de conflitos.
        Analise o seguinte desabafo e reescreva-o seguindo os 4 pilares da CNV:
        1. Observação (fatos sem julgamento)
        2. Sentimento (como se sente)
        3. Necessidade (o que precisa)
        4. Pedido (ação concreta)

        Mantenha o tom pessoal e autêntico, mas remova acusações, generalizações ("sempre", "nunca") e críticas destrutivas.
        Transforme o texto em uma mensagem construtiva que convide ao diálogo.
        
        Texto original: "${text}"
        
        Retorne APENAS o texto reescrito, sem explicações adicionais.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const refinedText = response.text?.trim() || '';
      if (refinedText) {
        setSuggestion(refinedText);
        setShowSuggestionModal(true);
      }
    } catch (error) {
      console.error("Erro ao refinar:", error);
      showFeedback('error', "Não foi possível conectar com o Assistente de Mediação agora. Tente novamente.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleAcceptSuggestion = () => {
    setText(suggestion);
    setShowSuggestionModal(false);
    analyzeSentiment(suggestion);
  };

  const handleSendWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePostMural = async () => {
    if (!text.trim()) return;

    await addEmpathyMessage({
      text: text.trim(),
      vibe: 'sos',
      authorName: user?.name || 'Seu Par'
    });

    window.dispatchEvent(new CustomEvent('new_notification', { 
      detail: { title: 'Desabafo Postado', message: 'Seu desabafo foi postado no mural com sucesso.' }
    }));
    showFeedback('success', 'Postado no Mural!');
    setTimeout(() => {
      navigate('/home');
    }, 1500);
  };

  const handleTimeOut = async () => {
    if (user?.id && user?.coupleId) {
      const { notificationService } = await import('../services/notificationService');
      const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
      
      if (partnerId) {
        await notificationService.createNotification({
          user_id: partnerId,
          type: 'alert',
          title: 'Pedido de Tempo',
          description: 'Seu parceiro pediu um tempo para se acalmar. Respeite este momento.',
          icon: 'timer',
          color: 'bg-amber-500',
          link: '/sos'
        });
      }
    }

    window.dispatchEvent(new CustomEvent('new_notification', { 
      detail: { title: 'Pedido de Tempo', message: 'Notificação de "Tempo" enviada ao seu parceiro.' }
    }));
    setShowTimeOutModal(false);
    showFeedback('success', 'Notificação de "Tempo" enviada ao seu parceiro.');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Central de Resolução</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full opacity-0">
            <span className="material-symbols-outlined">info</span>
          </div>
        </header>

        {feedback && (
          <div className={`mx-4 md:mx-8 mt-4 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            feedback.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="font-bold">{feedback.message}</p>
          </div>
        )}

        <main className="flex-1 px-4 md:px-8 py-6 space-y-8">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('mediation')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === 'mediation' 
                  ? 'bg-white dark:bg-slate-700 text-navy-main dark:text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Mediação & Desabafo
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === 'emergency' 
                  ? 'bg-red-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Emergência SOS
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'mediation' ? (
              <motion.div 
                key="mediation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] shadow-sm border border-primary/5 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Como você está se sentindo?</label>
                    <button 
                      onClick={handleRefineWithAI}
                      disabled={isRefining || !text.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                    >
                      {isRefining ? (
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      )}
                      {isRefining ? 'Analisando...' : 'Refinar com IA'}
                    </button>
                  </div>
                  
                  <textarea 
                    value={text}
                    onChange={(e) => analyzeSentiment(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main p-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all min-h-[200px] resize-none" 
                    placeholder="Escreva aqui o que está sentindo... Seja sincero(a)."
                  />
                  
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Termômetro:</span>
                    <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          sentiment === 'calm' ? 'bg-emerald-400 w-1/3' : 
                          sentiment === 'alert' ? 'bg-amber-400 w-2/3' : 
                          'bg-red-500 w-full'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {sentiment === 'calm' ? 'Calmo' : sentiment === 'alert' ? 'Alerta' : 'Tenso'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleSendWhatsApp}
                    disabled={!text.trim()}
                    className="w-full h-14 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-500/20 hover:bg-green-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    Enviar via WhatsApp
                  </button>
                  <button 
                    onClick={handlePostMural}
                    disabled={!text.trim()}
                    className="w-full h-14 bg-navy-main text-white rounded-2xl font-bold text-lg shadow-xl shadow-navy-main/20 hover:bg-navy-main/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">post_add</span>
                    Postar no Mural
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="emergency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 text-center">
                  <span className="material-symbols-outlined text-6xl text-red-500 mb-4">warning</span>
                  <h2 className="text-xl font-black text-red-600 dark:text-red-400 mb-2">Zona de Alta Tensão</h2>
                  <p className="text-sm text-red-800 dark:text-red-200 max-w-md mx-auto">
                    Se a discussão está escalando, o melhor a fazer é dar uma pausa. Use as ferramentas abaixo para desescalar o conflito.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setShowTimeOutModal(true)}
                    className="p-6 bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-primary/5 flex items-center gap-4 hover:border-primary/20 transition-all group"
                  >
                    <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">timer_pause</span>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-black text-navy-main dark:text-slate-100 text-lg">Pedir Tempo (Time-Out)</h3>
                      <p className="text-xs text-slate-500 font-medium">Notifique seu parceiro que você precisa de 20min para se acalmar.</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                  </button>

                  <button 
                    className="p-6 bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-primary/5 flex items-center gap-4 hover:border-primary/20 transition-all group"
                  >
                    <div className="size-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">self_improvement</span>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-black text-navy-main dark:text-slate-100 text-lg">Exercício de Respiração</h3>
                      <p className="text-xs text-slate-500 font-medium">Guia visual de 1 minuto para reduzir a ansiedade agora.</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* AI Suggestion Modal */}
      <Modal 
        isOpen={showSuggestionModal} 
        onClose={() => setShowSuggestionModal(false)} 
        title="Sugestão do Mediador"
      >
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex gap-3 mb-2">
              <span className="material-symbols-outlined text-indigo-500">psychology</span>
              <p className="text-xs text-indigo-800 dark:text-indigo-200 font-bold leading-relaxed">
                Reescrevi seu texto usando Comunicação Não-Violenta para facilitar o entendimento e reduzir defesas.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Sugestão de Texto</label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px] transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleAcceptSuggestion}
              className="w-full h-14 bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Aceitar e Substituir
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleRefineWithAI}
                disabled={isRefining}
                className="h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Tentar Novamente
              </button>
              <button 
                onClick={() => setShowSuggestionModal(false)}
                className="h-12 bg-transparent border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Time Out Modal */}
      <Modal
        isOpen={showTimeOutModal}
        onClose={() => setShowTimeOutModal(false)}
        title="Pedir Tempo"
      >
        <div className="space-y-6 text-center">
          <div className="size-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <span className="material-symbols-outlined text-5xl">timer_pause</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Isso enviará uma notificação para seu parceiro informando que você precisa de um momento para se acalmar.
          </p>
          <p className="text-sm font-bold text-navy-main dark:text-white">
            "Estou me sentindo sobrecarregado(a) e preciso de 20 minutos para me acalmar. Voltamos a conversar depois?"
          </p>
          <button 
            onClick={handleTimeOut}
            className="w-full h-14 bg-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all"
          >
            Confirmar e Enviar
          </button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
