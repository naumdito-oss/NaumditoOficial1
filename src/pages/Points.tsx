import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Components
import { BottomNav } from '../components/layout/BottomNav';

// Contexts
import { useData } from '../context/DataProvider';

import { formatShortDate } from '../utils/dateUtils';

/**
 * Points Page Component
 * 
 * Displays the user's total connection points, current level, progress to the next level,
 * recent achievements, and available rewards for redemption.
 * 
 * @returns {JSX.Element} The rendered Points component.
 */
export function Points() {
  const navigate = useNavigate();
  const { points, level, achievements, claimAchievement } = useData();
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);

  // Filter for recent unclaimed achievements or recently claimed ones
  const recentAchievements = achievements
    .filter(a => !a.claimed || (new Date().getTime() - new Date(a.createdAt).getTime() < 86400000))
    .slice(0, 5);

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      await claimAchievement(id);
    } catch (error) {
      console.error('Error claiming achievement:', error);
    } finally {
      setClaimingId(null);
    }
  };

  // Level calculation logic (mock)
  const pointsPerLevel = 1000;
  const currentLevelPoints = points % pointsPerLevel;
  const progressPercentage = (currentLevelPoints / pointsPerLevel) * 100;
  const pointsToNextLevel = pointsPerLevel - currentLevelPoints;

  /**
   * Handles the redemption of a reward.
   * Currently disabled as requested.
   */
  const handleRedeem = () => {
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 4000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
        <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md py-6 justify-between border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="text-navy-main dark:text-slate-100 flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-primary/5 cursor-pointer transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h1 className="text-navy-main dark:text-slate-100 text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center pr-10 uppercase tracking-widest">Pontos de Sintonia</h1>
        </header>

        {showFeedback && (
          <div className="mt-4 p-4 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-3 text-indigo-700 dark:text-indigo-400 animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined">info</span>
            <p className="font-bold">Funcionalidade em breve! Estamos fechando parcerias para trazer recompensas reais para você.</p>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Stats & Progress */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white dark:bg-slate-900/40 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-primary/5 flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center mb-8">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-56 h-56 md:w-64 md:h-64 rounded-full border-[12px] border-peach-main/10 flex flex-col items-center justify-center bg-white dark:bg-slate-800 shadow-2xl relative z-10"
                >
                  <span className="text-peach-main text-5xl md:text-6xl font-black tracking-tighter">{points.toLocaleString()}</span>
                  <span className="text-navy-main dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Pontos Totais</span>
                </motion.div>
                
                {/* Decorative rings */}
                <div className="absolute inset-0 w-full h-full rounded-full border border-peach-main/20 animate-ping opacity-20"></div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-4 bg-navy-main text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl z-20 uppercase tracking-widest"
                >
                  Nível {level}: Harmonia
                </motion.div>
              </div>

              <div className="w-full space-y-4 mt-4">
                <div className="flex justify-between items-end px-2">
                  <span className="text-navy-main dark:text-slate-300 text-xs font-black uppercase tracking-widest">Nível {level}</span>
                  <span className="text-peach-main text-xs font-black uppercase tracking-widest">{currentLevelPoints} / {pointsPerLevel} XP</span>
                </div>
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-peach-main rounded-full shadow-[0_0_10px_rgba(255,176,124,0.5)]"
                  ></motion.div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold italic">
                  Faltam apenas {pointsToNextLevel} pontos para o próximo marco!
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-black text-navy-main dark:text-slate-100 tracking-tight px-2">Conquistas Recentes</h2>
              <div className="space-y-4">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((item) => (
                    <div key={item.id} className={`flex items-center gap-4 bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-primary/5 shadow-sm group hover:border-peach-main/20 transition-all ${item.claimed ? 'opacity-60' : ''}`}>
                      <div className={`size-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.claimed ? 'bg-slate-100 text-slate-400' : 'bg-peach-main/10 text-peach-main'}`}>
                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-navy-main dark:text-slate-100 text-sm font-black">{item.title}</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          {formatShortDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-peach-main font-black text-sm">+{item.points} pts</span>
                        {!item.claimed && (
                          <button
                            onClick={() => handleClaim(item.id)}
                            disabled={claimingId === item.id}
                            className="text-[10px] font-black text-white bg-navy-main px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-navy-main/90 transition-colors disabled:opacity-50"
                          >
                            {claimingId === item.id ? '...' : 'Resgatar'}
                          </button>
                        )}
                        {item.claimed && (
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Resgatado</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-primary/20">
                    <p className="text-slate-400 text-xs font-bold italic">Nenhuma conquista recente. Comece a interagir para ganhar pontos!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Rewards Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black text-navy-main dark:text-slate-100 tracking-tight">Resgatar Recompensas</h2>
              <button className="text-[10px] font-black text-peach-main bg-peach-main/10 px-4 py-2 rounded-full uppercase tracking-widest">Ver Tudo</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Cupom Jantar Romântico", cost: 500, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9MN_uSzkMuokh9z_Da7L93xke8uLX1VOzVUf3XeeLcyfmjUx4DwWhX8g0w6WWVM7B001JDXUBQloyYlthQ8vwCDD2goglZ007IE_9tHtCD01hlwWigpRgCxzLp3BAhjhEJBxJa24s97mBmZDUBD1NPRGjlQNLAJ0onK0AMQVVWinPqQB9iswI8RlBr7rIi2BpF4csVuVAI6AI7YGlradZtBiazOxJQDjUNtvSjgMWKGLjwgIaM_RbitCf0tbOYCBzSHXd0uwKDBFo" },
                { title: "Noite de Cinema VIP", cost: 350, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1EUC_fc-PxdZYSVaHEYjEgEBLNnr5_TSwe_zm9SB5KyD5xQDrmdiXaAz73yayyymc_ZnewY0BTNKkmJ182hoDHThSrqFZH_T5iV40z-CsKJ2uYGOVJe3AerMOEr3NqKX-DlXTy7l9-mTuh07QK4iIeDT4Xq3Totrn20wp7NJA7DZ7wRNl_cDZ-cjiKH7qGOsSXWKeB8nEnrJ-sxop5aTd55-TS3E0MZHVeMn25iD6t2RXI9Ol0XPb_k5F7QMirKyFnfinu2OuYGEJ" },
                { title: "Desconto Viagem", cost: 1200, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm2F-cGtRLs6SZ1IZkUOwVcJCi7qkKis95ft2HOK2M9i9O7MaUGhQro-xkI5H-suO_efECl7ydoeybZaDntmqfmFL0loGbOIN8XEs41d1oKQO4g8ARZ6On1lM3dV3QCX2IHHx1NyjufQPSuR8AeZSJi4zMPUQDlHqJN1aaNf5ozI_mcbWL81BjK7PylothI54pgX_nZt04-jScLB0s-JLtOZWkavskcOT74dscfpXe1lzI6FBGSSXVRA0hvTLNdcK564nECQOHboPW" },
                { title: "Vale Massagem", cost: 400, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAny78eAz7tqEP7V_QeYUXV9oZtq3XyM_YlJyA-WWyE2Cyw6CvIasKcaLjwDqu4rGXobo42f0ELdx8cIHZFRvQ_pJxT4O6Ni7vifOT_WPpqyyCFYBjxoQY4pd_s2BWSyv_mZi-02bd_RlRLEwj5QDdQbk6o2-b4yN5JWrD_5CI7BZsAu6KBuxYkV5zNk11YcXZmokuxP0S4Z0aBn1-qYMN_BOAeSQhWiAfdBKQuUtQmD5SfoWdyy8WwD7K4W5xM_jVYIp3MY6KC2WSL" }
              ].map((reward, idx) => (
                <motion.div 
                  whileHover={{ y: -5 }}
                  key={idx} 
                  className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden shadow-sm border border-primary/5 flex flex-col group"
                >
                  <div className="h-40 relative overflow-hidden">
                    <img src={reward.img} alt={reward.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-main/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <span className="text-[10px] font-black text-white bg-peach-main px-2 py-0.5 rounded uppercase tracking-widest inline-block">Destaque</span>
                      <span className="text-[10px] font-black text-white bg-navy-main/80 px-2 py-0.5 rounded uppercase tracking-widest inline-block">Em breve</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-navy-main dark:text-slate-100 text-base font-black leading-tight mb-6 flex-1">{reward.title}</p>
                    <button 
                      onClick={() => handleRedeem()}
                      className="w-full h-12 bg-navy-main rounded-2xl text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-navy-main/90 transition-all shadow-lg shadow-navy-main/20 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg text-peach-main">confirmation_number</span>
                      {reward.cost >= 1000 ? `${(reward.cost/1000).toFixed(1)}k` : reward.cost} pts
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
