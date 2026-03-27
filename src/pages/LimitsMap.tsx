import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { BottomNav } from '../components/layout/BottomNav';

export function LimitsMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partnerLimits, setPartnerLimits] = useState<any>(null);
  const [userLimits, setUserLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimits = async () => {
      if (!user?.id) return;

      try {
        // Fetch user's own limits
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single();
        
        if (userProfile?.metadata?.limits) {
          setUserLimits(userProfile.metadata.limits);
        }

        // Fetch partner's limits
        if (user.coupleId) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('id, name, metadata')
            .eq('couple_id', user.coupleId)
            .neq('id', user.id)
            .single();
          
          if (partnerProfile?.metadata?.limits) {
            setPartnerLimits({
              name: partnerProfile.name,
              ...partnerProfile.metadata.limits
            });
          }
        }
      } catch (err) {
        console.error('Error fetching limits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [user]);

  const LimitCard = ({ title, content, icon, color }: { title: string, content: string, icon: string, color: string }) => (
    <div className={`p-6 rounded-3xl border bg-white dark:bg-slate-900/40 shadow-sm border-slate-100 dark:border-slate-800 flex flex-col gap-3`}>
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-xl flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <h4 className="font-black text-navy-main dark:text-slate-100 uppercase tracking-widest text-xs">{title}</h4>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
        {content || 'Não definido'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-navy-main dark:text-white pb-24 transition-colors duration-300">
      <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
        <button onClick={() => navigate(-1)} className="flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center">Mapa de Limites</h1>
        <div className="w-10 md:w-12" />
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando limites...</p>
          </div>
        ) : (
          <>
            {/* Partner's Limits Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <span className="material-symbols-outlined text-peach-main">favorite</span>
                <h2 className="text-xl font-black tracking-tight">Limites de {partnerLimits?.name || 'seu parceiro(a)'}</h2>
              </div>
              
              {partnerLimits ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LimitCard 
                    title="Respeito" 
                    content={partnerLimits.respect} 
                    icon="verified_user" 
                    color="bg-blue-100 text-blue-600" 
                  />
                  <LimitCard 
                    title="Gatilhos" 
                    content={partnerLimits.triggers} 
                    icon="warning" 
                    color="bg-amber-100 text-amber-600" 
                  />
                  <LimitCard 
                    title="Temas Sensíveis" 
                    content={partnerLimits.sensitiveThemes} 
                    icon="visibility_off" 
                    color="bg-purple-100 text-purple-600" 
                  />
                  {partnerLimits.custom?.map((c: any) => (
                    <LimitCard 
                      key={c.id}
                      title={c.label} 
                      content={c.value} 
                      icon="label" 
                      color="bg-slate-100 text-slate-600" 
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center">
                  <p className="text-slate-500 text-sm font-medium">Seu parceiro(a) ainda não definiu os limites.</p>
                </div>
              )}
            </section>

            {/* User's Own Limits Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <span className="material-symbols-outlined text-primary">person</span>
                <h2 className="text-xl font-black tracking-tight">Seus Limites</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LimitCard 
                  title="Respeito" 
                  content={userLimits?.respect} 
                  icon="verified_user" 
                  color="bg-blue-100 text-blue-600" 
                />
                <LimitCard 
                  title="Gatilhos" 
                  content={userLimits?.triggers} 
                  icon="warning" 
                  color="bg-amber-100 text-amber-600" 
                />
                <LimitCard 
                  title="Temas Sensíveis" 
                  content={userLimits?.sensitiveThemes} 
                  icon="visibility_off" 
                  color="bg-purple-100 text-purple-600" 
                />
                {userLimits?.custom?.map((c: any) => (
                  <LimitCard 
                    key={c.id}
                    title={c.label} 
                    content={c.value} 
                    icon="label" 
                    color="bg-slate-100 text-slate-600" 
                  />
                ))}
              </div>

              <button 
                onClick={() => navigate('/onboarding')}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-primary/20 text-primary hover:bg-primary/5 transition-all font-black uppercase tracking-widest text-xs"
              >
                Editar Meus Limites
              </button>
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
