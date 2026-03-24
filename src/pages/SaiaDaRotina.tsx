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
  const { nextDatePlan, updateNextDatePlan } = useData();
  
  const [isEditing, setIsEditing] = useState(!nextDatePlan);
  const [title, setTitle] = useState(nextDatePlan?.title || '');
  const [description, setDescription] = useState(nextDatePlan?.description || '');
  const [location, setLocation] = useState(nextDatePlan?.location || '');
  const [photo, setPhoto] = useState(nextDatePlan?.photo || '');
  const [programType, setProgramType] = useState<'pipoca' | 'restaurante' | 'parque' | 'experiencia' | 'outro'>(nextDatePlan?.programType || 'pipoca');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNextDatePlan({
      title,
      description,
      location,
      photo,
      programType
    });
    setIsEditing(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 pb-24">
        <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
          </div>
          <h2 className="text-navy-main dark:text-slate-100 text-lg md:text-xl font-bold leading-tight tracking-tight flex-1 text-center">Saia da Rotina</h2>
          <div className="flex size-10 items-center justify-end">
            {!isEditing && nextDatePlan && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center rounded-full size-10 hover:bg-primary/10 transition-colors text-slate-900 dark:text-slate-100"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 flex flex-col gap-8">
          {isEditing ? (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSave} 
              className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5 space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30">
                    <span className="material-symbols-outlined text-2xl">event</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-navy-main dark:text-slate-100 tracking-tight">Detalhes do Plano</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">O que vamos fazer?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Título</span>
                    <input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main h-14 px-4 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base outline-none transition-all" 
                      placeholder="Ex: Jantar Italiano"
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
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-500 dark:bg-amber-900/30">
                    <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-navy-main dark:text-slate-100 tracking-tight">Categoria</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">O que vamos fazer?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
            nextDatePlan && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] shadow-sm border border-primary/5 overflow-hidden group"
              >
                <div className="h-64 md:h-80 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {nextDatePlan.photo ? (
                    <img 
                      src={nextDatePlan.photo} 
                      alt={nextDatePlan.title} 
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
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${PROGRAM_ICONS[nextDatePlan.programType].color}`}>
                      <span className="material-symbols-outlined">{PROGRAM_ICONS[nextDatePlan.programType].icon}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{PROGRAM_ICONS[nextDatePlan.programType].label}</span>
                    </div>
                    <h3 className="text-white font-black text-3xl leading-tight mb-2">{nextDatePlan.title || 'Plano Surpresa'}</h3>
                    <p className="text-white/80 text-sm font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {nextDatePlan.location || 'Local a definir'}
                    </p>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">
                    {nextDatePlan.description || 'Ainda não definimos os detalhes do nosso plano.'}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
