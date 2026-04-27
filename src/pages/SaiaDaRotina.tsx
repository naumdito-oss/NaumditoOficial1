import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Components
import { BottomNav } from '../components/layout/BottomNav';

// Contexts
import { useData } from '../context/DataProvider';

// Constants
import { PROGRAM_ICONS } from '../constants';

/**
 * SaiaDaRotina page component.
 * Allows users to plan and view out-of-routine date ideas.
 */
export function SaiaDaRotina() {
  const navigate = useNavigate();
  const { nextDatePlans, addNextDatePlan, removeNextDatePlan } = useData();
  
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState('');
  const [date, setDate] = useState('');
  const [programType, setProgramType] = useState<'pipoca' | 'restaurante' | 'parque' | 'experiencia' | 'outro'>('pipoca');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNextDatePlan({
      title,
      description,
      location,
      photo,
      date,
      programType
    });
    setIsAdding(false);
    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setPhoto('');
    setDate('');
    setProgramType('pipoca');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 pb-24">
        <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h2 className="text-navy-main dark:text-slate-100 text-lg md:text-xl font-bold leading-tight tracking-tight flex-1 text-center">Saia da Rotina</h2>
          <div className="flex size-10 items-center justify-end">
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center rounded-full size-10 hover:bg-primary/10 transition-colors text-navy-main dark:text-slate-100"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 flex flex-col gap-8">
          {isAdding ? (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSave} 
              className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30">
                    <span className="material-symbols-outlined text-2xl">event</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-navy-main dark:text-slate-100 tracking-tight">Novo Plano</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">O que vamos fazer?</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Título</span>
                  <input 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main h-14 px-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all" 
                    placeholder="Ex: Jantar Italiano"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Data</span>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main h-14 px-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all" 
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Descrição</span>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main p-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all min-h-[100px] resize-none" 
                    placeholder="Ex: Vamos experimentar aquele restaurante novo..."
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Local</span>
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main h-14 px-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all" 
                    placeholder="Ex: Centro da cidade"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">URL da Foto de Inspiração</span>
                  <input 
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main h-14 px-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all" 
                    placeholder="https://.../imagem.jpg"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Categoria</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(PROGRAM_ICONS) as Array<keyof typeof PROGRAM_ICONS>).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProgramType(type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        programType === type 
                          ? 'border-peach-main bg-peach-main/5 scale-105' 
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${programType === type ? 'text-peach-main' : 'text-slate-400'}`}>
                        {PROGRAM_ICONS[type].icon}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${programType === type ? 'text-peach-main' : 'text-slate-400'}`}>
                        {PROGRAM_ICONS[type].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 bg-navy-main text-white rounded-2xl font-bold text-lg shadow-xl shadow-navy-main/20 hover:bg-navy-main/90 transition-all active:scale-95 flex items-center justify-center gap-2 mt-8"
              >
                <span className="material-symbols-outlined">save</span>
                Salvar Plano
              </button>
            </motion.form>
          ) : (
            <div className="space-y-6">
              {nextDatePlans.length > 0 ? (
                nextDatePlans.map((plan, index) => (
                  <motion.div 
                    key={plan.id || index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] shadow-sm border border-primary/5 overflow-hidden group relative"
                  >
                    <button 
                      onClick={() => plan.id && removeNextDatePlan(plan.id)}
                      className="absolute top-4 right-4 z-20 size-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>

                    <div className="h-48 md:h-64 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {plan.photo ? (
                        <img 
                          src={plan.photo} 
                          alt={plan.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">event</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-main/90 via-navy-main/20 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${(PROGRAM_ICONS[plan.programType] || PROGRAM_ICONS['pipoca']).color} bg-white/10 backdrop-blur-md`}>
                          <span className="material-symbols-outlined">{(PROGRAM_ICONS[plan.programType] || PROGRAM_ICONS['pipoca']).icon}</span>
                          <span className="text-xs font-black uppercase tracking-widest">{(PROGRAM_ICONS[plan.programType] || PROGRAM_ICONS['pipoca']).label}</span>
                        </div>
                        <h3 className="text-white font-black text-2xl leading-tight mb-2">{plan.title || 'Plano Surpresa'}</h3>

                        <div className="flex items-center gap-4">
                          <p className="text-white/80 text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {plan.location || 'Local a definir'}
                          </p>
                          {plan.date && (
                            <p className="text-white/80 text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              {new Date(plan.date).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                        {plan.description || 'Ainda não definimos os detalhes do nosso plano.'}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
                  <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <span className="material-symbols-outlined text-5xl">event_busy</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-navy-main dark:text-white mb-2">Nenhum plano ainda</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs">Que tal planejar algo especial para sair da rotina?</p>
                  </div>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="px-8 py-4 bg-navy-main text-white rounded-2xl font-bold shadow-lg shadow-navy-main/20 hover:scale-105 transition-all"
                  >
                    Criar Primeiro Plano
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
