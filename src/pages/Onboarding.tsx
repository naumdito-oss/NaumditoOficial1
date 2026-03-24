import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Type definition for the onboarding data collected during the flow.
 */
export type SpecialDate = {
  id: string;
  label: string;
  date: string;
};

export type OnboardingData = {
  name: string;
  gender: string;
  birthDate: string;
  anniversaryDate: string;
  partnerName: string;
  photoUrl: string;
  goals: string[];
  emojiLanguage: string;
  musicStyle: string;
  travelStyle: string[];
  loveLanguages: string[];
  ourStory: string;
  specialDates: SpecialDate[];
  limits: {
    respect: string;
    triggers: string;
    sensitiveThemes: string;
  };
};

const INITIAL_DATA: OnboardingData = {
  name: '',
  gender: '',
  birthDate: '',
  anniversaryDate: '',
  partnerName: '',
  photoUrl: '',
  goals: [],
  emojiLanguage: '',
  musicStyle: '',
  travelStyle: [],
  loveLanguages: [],
  ourStory: '',
  specialDates: [],
  limits: {
    respect: '',
    triggers: '',
    sensitiveThemes: '',
  },
};

/**
 * Onboarding component.
 * Guides the user through a multi-step setup process to personalize their experience.
 */
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updatePhoto } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load existing data
  React.useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('metadata, name, photo_url')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (profile) {
            const dbMetadata = profile.metadata || {};
            const stored = localStorage.getItem('user_profile');
            const localData = stored ? JSON.parse(stored) : {};
            
            setData(prev => ({
              ...prev,
              ...dbMetadata,
              ...localData,
              name: localData.name || profile.name || user.name || '',
              photoUrl: localData.photoUrl || profile.photo_url || user.photoUrl || '',
            }));
          }
        } catch (e) {
          // Fallback to localStorage if metadata column doesn't exist yet
          const stored = localStorage.getItem('user_profile');
          const localData = stored ? JSON.parse(stored) : {};
          setData(prev => ({
            ...prev,
            ...localData,
            name: localData.name || user.name || '',
            photoUrl: localData.photoUrl || user.photoUrl || '',
          }));
        }
      };
      
      fetchProfile();
    }
  }, [user]);

  /**
   * Advances to the next step in the onboarding flow.
   */
  const nextStep = () => setCurrentStep((prev) => prev + 1);

  /**
   * Returns to the previous step in the onboarding flow.
   */
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  /**
   * Completes the onboarding process, saves the data to local storage,
   * and redirects the user to the home page.
   */
  const handleFinish = async () => {
    // Save to localStorage for immediate persistence and offline access
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('user_profile', JSON.stringify(data));
    
    try {
      if (user && user.id) {
        // Update profile in Supabase
        // We save the entire data object to a metadata column for cross-device persistence
        const updateData: any = { 
          name: data.name,
          metadata: data // This requires the metadata column to exist
        };
        
        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        // Update anniversary date in couples table if provided
        if (data.anniversaryDate && user.coupleId) {
          await supabase
            .from('couples')
            .update({ anniversary_date: data.anniversaryDate })
            .eq('id', user.coupleId);
        }

        // Upload photo if selected
        if (selectedFile) {
          await updatePhoto(selectedFile);
        }
      }
    } catch (e) {
      console.error('Error updating profile in Supabase:', e);
      // If metadata column doesn't exist, try updating just the name
      try {
        await supabase
          .from('profiles')
          .update({ name: data.name })
          .eq('id', user!.id);
      } catch (innerError) {
        console.error('Fallback update failed:', innerError);
      }
    }
    
    navigate('/home');
  };

  const steps = [
    // Step 0: Individual Info
    {
      title: 'Cadastro Individual',
      subtitle: 'Conte-nos um pouco sobre você.',
      content: (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Foto do Casal</label>
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="size-32 md:size-40 rounded-full border-4 border-peach-main/20 overflow-hidden bg-slate-100 dark:bg-surface-dark flex items-center justify-center relative">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">add_a_photo</span>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">edit</span>
                </div>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                     setSelectedFile(file);
                     const reader = new FileReader();
                     reader.onloadend = () => {
                       setData({ ...data, photoUrl: reader.result as string });
                     };
                     reader.readAsDataURL(file);
                  }
                }}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Seu Nome</label>
              <div className="relative">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                  placeholder="Como você se chama?"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
              </div>
            </div>
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gênero</label>
              <div className="relative">
                <select
                  value={data.gender}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                  className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="non-binary">Não-binário</option>
                  <option value="other">Outro</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
              </div>
            </div>
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data de Nascimento</label>
              <div className="relative">
                <input
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                  className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
              </div>
            </div>
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data do Aniversário de Namoro</label>
              <div className="relative">
                <input
                  type="date"
                  value={data.anniversaryDate}
                  onChange={(e) => setData({ ...data, anniversaryDate: e.target.value })}
                  className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
              </div>
            </div>
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome do Parceiro(a)</label>
              <div className="relative">
                <input
                  type="text"
                  value={data.partnerName}
                  onChange={(e) => setData({ ...data, partnerName: e.target.value })}
                  className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                  placeholder="Quem é o seu amor?"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Step 1: Special Dates
    {
      title: 'Datas Especiais',
      subtitle: 'Momentos que marcaram a história de vocês.',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {data.specialDates.map((specialDate, index) => (
              <div key={specialDate.id} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-peach-main">Evento #{index + 1}</span>
                  <button 
                    onClick={() => {
                      const specialDates = data.specialDates.filter(d => d.id !== specialDate.id);
                      setData({ ...data, specialDates });
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">O que aconteceu?</label>
                    <input
                      type="text"
                      value={specialDate.label}
                      onChange={(e) => {
                        const specialDates = [...data.specialDates];
                        specialDates[index].label = e.target.value;
                        setData({ ...data, specialDates });
                      }}
                      className="w-full p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-peach-main outline-none font-bold text-sm"
                      placeholder="Ex: Primeiro Beijo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quando?</label>
                    <input
                      type="date"
                      value={specialDate.date}
                      onChange={(e) => {
                        const specialDates = [...data.specialDates];
                        specialDates[index].date = e.target.value;
                        setData({ ...data, specialDates });
                      }}
                      className="w-full p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-peach-main outline-none font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const newDate: SpecialDate = {
                id: Math.random().toString(36).substr(2, 9),
                label: '',
                date: new Date().toISOString().split('T')[0]
              };
              setData({ ...data, specialDates: [...data.specialDates, newDate] });
            }}
            className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:text-peach-main hover:border-peach-main transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs"
          >
            <span className="material-symbols-outlined">add</span>
            Adicionar Nova Data Especial
          </button>
        </div>
      )
    },
    // Step 2: Goals
    {
      title: 'O que você busca?',
      subtitle: 'Selecione seus principais objetivos com o NaumDito.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['Diminuir brigas', 'Conversar melhor', 'Reparar um momento difícil', 'Aumentar a conexão', 'Planejar o futuro', 'Melhorar a intimidade'].map((goal) => (
            <button
              key={goal}
              onClick={() => {
                const goals = data.goals.includes(goal)
                  ? data.goals.filter((g) => g !== goal)
                  : [...data.goals, goal];
                setData({ ...data, goals });
              }}
              className={`p-6 rounded-3xl border text-left transition-all group ${
                data.goals.includes(goal)
                  ? 'bg-peach-main border-peach-main text-white shadow-xl shadow-peach-main/30'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-peach-main/50'
              }`}
            >
              <div className="font-black uppercase tracking-widest text-[10px] mb-1 opacity-60">Objetivo</div>
              <div className="font-black text-sm md:text-base">{goal}</div>
            </button>
          ))}
        </div>
      ),
    },
    // Step 2: Travel Style
    {
      title: 'Estilo de Viagem',
      subtitle: 'Como vocês gostam de explorar o mundo?',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {['Aventura', 'Tranquila', 'Romântica', 'Luxo', 'Econômica', 'Cultural'].map((style) => (
            <button
              key={style}
              onClick={() => {
                const travelStyle = data.travelStyle.includes(style)
                  ? data.travelStyle.filter((s) => s !== style)
                  : [...data.travelStyle, style];
                setData({ ...data, travelStyle });
              }}
              className={`p-6 rounded-3xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                data.travelStyle.includes(style)
                  ? 'bg-peach-main border-peach-main text-white shadow-xl shadow-peach-main/30'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-peach-main/30'
              }`}
            >
              <span className="text-sm font-black uppercase tracking-widest">{style}</span>
            </button>
          ))}
        </div>
      ),
    },
    // Step 4: Love Languages
    {
      title: 'Linguagens do Amor',
      subtitle: 'Selecione as que mais ressoam com você.',
      content: (
        <div className="grid gap-3">
          {['Toque físico', 'Palavras de afirmação', 'Tempo de qualidade', 'Atos de serviço', 'Presentes'].map((lang) => (
            <button
              key={lang}
              onClick={() => {
                const loveLanguages = data.loveLanguages.includes(lang)
                  ? data.loveLanguages.filter((l) => l !== lang)
                  : [...data.loveLanguages, lang];
                setData({ ...data, loveLanguages });
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                data.loveLanguages.includes(lang)
                  ? 'bg-peach-main border-peach-main text-white'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
              }`}
            >
              <span className="font-bold">{lang}</span>
              {data.loveLanguages.includes(lang) && <span className="material-symbols-outlined">check_circle</span>}
            </button>
          ))}
        </div>
      ),
    },
    // Step 5: Limits Map
    {
      title: 'Mapa de Limites',
      subtitle: 'Defina o que é sensível para você.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 relative group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Limites de Respeito</label>
            <div className="relative">
              <input
                type="text"
                value={data.limits.respect}
                onChange={(e) => setData({ ...data, limits: { ...data.limits, respect: e.target.value } })}
                className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                placeholder="O que não pode faltar?"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
            </div>
          </div>
          <div className="space-y-2 relative group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gatilhos Emocionais</label>
            <div className="relative">
              <input
                type="text"
                value={data.limits.triggers}
                onChange={(e) => setData({ ...data, limits: { ...data.limits, triggers: e.target.value } })}
                className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                placeholder="O que te deixa magoado(a)?"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2 relative group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Temas Sensíveis</label>
            <div className="relative">
              <input
                type="text"
                value={data.limits.sensitiveThemes}
                onChange={(e) => setData({ ...data, limits: { ...data.limits, sensitiveThemes: e.target.value } })}
                className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none transition-all font-bold"
                placeholder="Assuntos que exigem cuidado?"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
            </div>
          </div>
          <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/30">
            <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
            <p className="text-xs text-slate-600 dark:text-blue-200 font-medium leading-relaxed">
              Esses dados alimentam recomendações personalizadas em todo o app para evitar sugestões que desrespeitem seus limites.
            </p>
          </div>
        </div>
      ),
    },
    // Step 6: Our Story
    {
      title: 'Nossa História',
      subtitle: 'Conte um pouco sobre a jornada de vocês.',
      content: (
        <div className="space-y-4">
          <div className="space-y-2 relative group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Como se conheceram?</label>
            <div className="relative">
              <textarea
                value={data.ourStory}
                onChange={(e) => setData({ ...data, ourStory: e.target.value })}
                className="w-full p-5 pr-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-peach-main outline-none min-h-[200px] font-medium text-sm"
                placeholder="Conte os detalhes desse momento especial..."
              />
              <span className="material-symbols-outlined absolute right-4 top-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">edit</span>
            </div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex gap-3 items-start border border-amber-100 dark:border-amber-900/30">
            <span className="material-symbols-outlined text-amber-500 text-xl">history_edu</span>
            <p className="text-xs text-slate-600 dark:text-amber-200 font-medium leading-relaxed">
              Registrar sua história ajuda o NaumDito a entender o contexto da relação e sugerir atividades que resgatem memórias positivas.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-navy-main dark:text-white p-4 md:p-8 flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-2xl flex flex-col h-full min-h-[80vh]">
        {/* Header com Progresso */}
        <div className="mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`material-symbols-outlined text-navy-main/50 dark:text-white/50 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${
                currentStep === 0 ? 'opacity-0 pointer-events-none' : ''
              }`}
            >
              arrow_back
            </button>
            <span className="text-xs font-bold text-navy-main/30 dark:text-white/30 uppercase tracking-widest">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <div className="w-10" />
          </div>
          <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-peach-main shadow-[0_0_10px_rgba(255,176,124,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>

        {/* Conteúdo do Passo */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl md:text-4xl font-bold mb-2 tracking-tight text-navy-main dark:text-white">
                {steps[currentStep].title}
              </h1>
              <p className="text-slate-500 dark:text-white/50 mb-8 md:mb-10 text-sm md:text-base">
                {steps[currentStep].subtitle}
              </p>

              <div className="flex-1">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={currentStep === steps.length - 1 ? handleFinish : nextStep}
            className="w-full h-14 md:h-16 bg-navy-main text-white rounded-2xl font-bold text-lg shadow-xl shadow-navy-main/20 hover:bg-navy-main/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Finalizar Cadastro' : 'Próximo Passo'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          
          {currentStep === 0 && (
            <button
              onClick={() => navigate('/home')}
              className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest hover:text-peach-main transition-colors py-2"
            >
              Pular por enquanto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
