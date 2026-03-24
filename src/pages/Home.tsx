import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Components
import { BottomNav } from '../components/layout/BottomNav';

// Contexts
import { useData } from '../context/DataProvider';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { notificationService } from '../services/notificationService';

// Constants & Data
import { HOME_TOOLS, STORAGE_KEYS } from '../constants';
import { microGestures } from '../data/microGestures';

/**
 * Home Page Component
 * 
 * The main dashboard of the application. Displays the couple's connection status,
 * weekly evolution chart, the micro-gesture of the day, and quick access to tools.
 * 
 * @returns {JSX.Element} The rendered Home page component.
 */
export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    points,
    level,
    checkinCompleted, 
    microGestureCompleted, 
    completeMicroGesture, 
    weeklyHistory, 
    updateWeeklyProgress, 
    getCoupleStatus 
  } = useData();

  const [dbGesture, setDbGesture] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  /**
   * Calculates the "Gesture of the Day" based on the current day of the year.
   * This ensures the gesture changes daily and cycles through the available list.
   */
  const gestureOfTheDay = useMemo(() => {
    if (dbGesture) return dbGesture;
    
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % microGestures.length;
    return microGestures[index];
  }, [dbGesture]);

  // Fetch gesture and notifications
  useEffect(() => {
    const fetchGesture = async () => {
      try {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // We assume there are 50 gestures in the DB, or we get the count
        const { count, error: countError } = await supabase
          .from('micro_gestures')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        if (count && count > 0) {
          const index = dayOfYear % count;
          
          const { data, error } = await supabase
            .from('micro_gestures')
            .select('*')
            .order('id', { ascending: true })
            .range(index, index)
            .single();
            
          if (error) throw error;
          if (data) {
            setDbGesture({
              id: data.id,
              title: data.title,
              description: data.description,
              imagePrompt: data.image_prompt,
              imageUrl: data.image_url
            });
          }
        }
      } catch (err) {
        console.error('Error fetching gesture from DB:', err);
      }
    };
    
    const fetchUnreadCount = async () => {
      if (user?.id) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('unread', true);
        
        if (!error && count !== null) {
          setUnreadCount(count);
        }
      }
    };

    const fetchPartner = async () => {
      if (user?.id && user?.coupleId) {
        const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
        if (partnerId) {
          const { data } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', partnerId)
            .single();
          setPartnerProfile(data);
        }
      }
    };

    const checkEvents = async () => {
      if (user?.id && user?.coupleId) {
        await notificationService.checkAndGenerateEventNotifications(user.id, user.coupleId);
        fetchUnreadCount();
      }
    };
    
    fetchGesture();
    fetchPartner();
    checkEvents();
  }, [user]);

  // Onboarding and User Profile Checks
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    if (!onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [navigate]);

  // Get status from centralized logic
  const { label: statusLabel, color: statusColor, percentage: connectionPercentage } = getCoupleStatus();
  
  const isInitialState = useMemo(() => {
    return weeklyHistory.length === 0 && connectionPercentage < 10;
  }, [weeklyHistory, connectionPercentage]);

  // Check for profile completion
  const userProfile = useMemo(() => {
    try {
      // Try to load from user metadata first (database)
      if (user?.metadata) {
        return user.metadata;
      }
      // Fallback to localStorage
      const stored = localStorage.getItem('user_profile');
      return stored && stored !== 'undefined' && stored !== 'null' ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }, [user]);
  
  const isIncomplete = useMemo(() => {
    const hasName = !!user?.name;
    const hasPhoto = !!user?.photoUrl;
    const hasStory = !!userProfile?.ourStory;
    const hasLimits = !!userProfile?.limits?.respect;
    const hasPartner = !!userProfile?.partnerName;
    
    return !hasName || !hasPhoto || !hasStory || !hasLimits || !hasPartner;
  }, [user, userProfile]);

  /**
   * Prepares the data for the weekly evolution chart.
   * Uses the last 4 weeks of history plus the current week's percentage.
   */
  const chartData = useMemo(() => {
    if (!weeklyHistory || weeklyHistory.length === 0) {
      // Return some mock data if history is empty
      return [
        { name: 'Sem 1', pct: 40 },
        { name: 'Sem 2', pct: 60 },
        { name: 'Sem 3', pct: 55 },
        { name: 'Sem 4', pct: 80 },
        { name: 'Atual', pct: connectionPercentage },
      ];
    }
    
    // Take the last 4 weeks of history + current week
    const recentHistory = weeklyHistory.slice(-4);
    const data = recentHistory.map((entry) => {
      const date = new Date(entry.weekStarting);
      return {
        name: `${date.getDate()}/${date.getMonth() + 1}`,
        pct: entry.percentage
      };
    });
    
    data.push({ name: 'Atual', pct: connectionPercentage });
    return data;
  }, [weeklyHistory, connectionPercentage]);

  const fallbackImageUrl = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <header className="flex items-center py-4 md:py-6 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-30 border-b border-primary/5 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/profile" className="relative flex items-center shrink-0 group active:scale-95 transition-transform">
              <div className="size-10 md:size-14 rounded-full border-2 border-white dark:border-slate-900 p-0.5 shadow-md overflow-hidden z-20 bg-white dark:bg-slate-800">
                <img 
                  alt="You" 
                  className="w-full h-full object-cover rounded-full" 
                  src={user?.photoUrl || "https://images.unsplash.com/photo-1516589174184-c685266e430c?q=80&w=2070&auto=format&fit=crop"} 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="size-10 md:size-14 rounded-full border-2 border-white dark:border-slate-900 p-0.5 shadow-md overflow-hidden -ml-3 md:-ml-4 z-10 bg-white dark:bg-slate-800">
                <img 
                  alt="Partner" 
                  className="w-full h-full object-cover rounded-full" 
                  src={partnerProfile?.photo_url || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop"} 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 size-4 md:size-5 bg-peach-main rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center z-30 shadow-sm">
                <span className="material-symbols-outlined text-[8px] md:text-[10px] text-white font-bold">favorite</span>
              </div>
            </Link>
            <div className="min-w-0">
              <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-0 leading-none">Bem-vindo</p>
              <h2 className="text-navy-main dark:text-slate-100 text-base md:text-xl font-black leading-tight tracking-tight truncate">
                {user?.name?.split(' ')[0] || 'Usuário'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/points" className="flex items-center gap-1.5 bg-white dark:bg-slate-800 pl-2 pr-3 py-1.5 rounded-full border border-primary/10 shadow-sm hover:border-primary/30 active:scale-95 transition-all group">
              <div className="size-7 rounded-full bg-peach-main/10 flex items-center justify-center text-peach-main group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-lg">stars</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-navy-main dark:text-slate-100 font-black text-xs">{points.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Nível {level}</span>
              </div>
            </Link>
            
            <div className="flex gap-1.5">
              <button 
                onClick={() => navigate('/notifications')}
                className="flex size-9 md:size-11 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all relative border border-primary/5"
              >
                <span className="material-symbols-outlined text-[20px] md:text-[24px] text-primary">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 size-4 bg-peach-main rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] text-white font-black animate-in zoom-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="flex size-9 md:size-11 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all border border-primary/5"
              >
                <span className="material-symbols-outlined text-[20px] md:text-[24px] text-slate-500">settings</span>
              </button>
            </div>
          </div>
        </header>

        {/* Profile Completion Warning */}
        {isIncomplete && (
          <div className="mt-6 p-5 rounded-[2rem] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <div>
                <h4 className="font-black text-amber-900 dark:text-amber-100 text-sm uppercase tracking-wider">Perfil Incompleto</h4>
                <p className="text-amber-700 dark:text-amber-300 text-xs font-medium">Complete sua história e informações do casal para uma experiência personalizada.</p>
              </div>
            </div>
            <Link 
              to="/onboarding" 
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
            >
              Completar Agora
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mt-4">
          
          {/* Left Column: Connection Status & Micro-gesture */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            
            {/* Connection Barometer */}
            <div className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
              <div className="flex gap-6 justify-between items-end mb-4">
                <div className="relative group">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-main">Termômetro de Sintonia</p>
                    <span className="material-symbols-outlined text-slate-400 text-sm cursor-help">info</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-3 w-72 p-4 bg-navy-main text-white text-[11px] rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 leading-relaxed border border-white/10">
                      <p className="font-bold mb-2 text-emerald-main">Como subir sua sintonia:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2"><span className="size-1 bg-emerald-main rounded-full"></span>Check-ins Diários (+30%)</li>
                        <li className="flex items-center gap-2"><span className="size-1 bg-emerald-main rounded-full"></span>Gesto do Dia & Engajamento (+20%)</li>
                        <li className="flex items-center gap-2"><span className="size-1 bg-emerald-main rounded-full"></span>Compromissos Ativos (+15%)</li>
                        <li className="flex items-center gap-2"><span className="size-1 bg-emerald-main rounded-full"></span>Trocas & Permutas (+15%)</li>
                        <li className="flex items-center gap-2"><span className="size-1 bg-emerald-main rounded-full"></span>Itens na Wishlist (+10%)</li>
                        <li className="flex items-center gap-2"><span className="size-1 bg-emerald-main rounded-full"></span>Plano de Encontro (+10%)</li>
                      </ul>
                    </div>
                  </div>
                  <p className={`text-2xl md:text-4xl font-black leading-tight tracking-tighter ${statusColor}`}>{statusLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl md:text-5xl font-black leading-none text-primary">{connectionPercentage}%</p>
                </div>
              </div>
              <div className="h-4 rounded-full bg-primary/10 overflow-hidden mb-4">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-peach-main shadow-[0_0_10px_rgba(123,143,214,0.5)] transition-all duration-1000" style={{ width: `${connectionPercentage}%` }}></div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                {isInitialState 
                  ? "Comece a interagir para ver sua sintonia evoluir ao longo da semana!" 
                  : `${user?.name || 'Olá'}! Sua sintonia está ${connectionPercentage >= 60 ? 'excelente' : 'em evolução'} esta semana.`}
              </p>

              {/* Evolution Chart - Only show if there is history */}
              {!isInitialState && weeklyHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-primary/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Evolução Semanal</h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                          formatter={(value: number) => [`${value}%`, 'Sintonia']}
                        />
                        <Area type="monotone" dataKey="pct" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPct)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Micro-gesture */}
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-48 md:h-full overflow-hidden">
                  <img 
                    src={gestureOfTheDay.imageUrl || fallbackImageUrl} 
                    alt={gestureOfTheDay.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-peach-main bg-peach-main/10 px-2 py-1 rounded-full uppercase tracking-widest">Gesto do Dia</span>
                  </div>
                  <h3 className="text-navy-main dark:text-slate-100 text-xl md:text-2xl font-black leading-tight mb-3">{gestureOfTheDay.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6">{gestureOfTheDay.description}</p>
                  <button 
                    onClick={completeMicroGesture}
                    disabled={microGestureCompleted}
                    className={`w-full md:w-fit flex items-center justify-center rounded-2xl h-14 px-8 text-white font-bold shadow-xl transition-all ${
                      microGestureCompleted 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-navy-main hover:bg-navy-main/90 active:scale-95 shadow-navy-main/20'
                    }`}
                  >
                    {microGestureCompleted ? 'Gesto Concluído!' : 'Marcar como Feito'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tools & Check-in */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            
            {/* Tools Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center ml-2">
                <h3 className="text-navy-main dark:text-slate-100 text-lg font-bold uppercase tracking-widest opacity-50">Ferramentas</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {HOME_TOOLS.map((tool) => (
                  <Link 
                    key={tool.to}
                    to={tool.to} 
                    className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 shadow-sm border border-slate-100 dark:border-slate-800 text-center gap-3 hover:shadow-md hover:border-primary/20 transition-all group"
                  >
                    <div className={`size-14 rounded-2xl flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-[32px]">{tool.icon}</span>
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-widest">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Daily Check-in Card */}
            <div className={`rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl transition-all relative overflow-hidden ${
              checkinCompleted 
                ? 'bg-peach-500' 
                : 'bg-gradient-to-br from-primary to-primary-light'
            }`}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-[120px]">assessment</span>
              </div>
              
              <div className="relative z-10 flex-1 text-center md:text-left mb-6 md:mb-0">
                <h4 className="font-black text-2xl md:text-3xl mb-2 text-white tracking-tighter">
                  {checkinCompleted ? 'Check-in Realizado!' : 'Check-in Diário'}
                </h4>
                <p className="text-white/90 text-sm md:text-base max-w-xs">
                  {checkinCompleted 
                    ? 'Parabéns por manter a conexão em dia!' 
                    : 'Ainda não avaliaram o dia. Vamos conversar?'}
                </p>
              </div>
              
              <Link 
                to="/checkin" 
                className={`relative z-10 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all ${
                  checkinCompleted 
                    ? 'bg-white/20 text-white cursor-default' 
                    : 'bg-white text-primary hover:scale-105 active:scale-95'
                }`}
                onClick={(e) => checkinCompleted && e.preventDefault()}
              >
                {checkinCompleted ? 'Ver Resumo' : 'Começar Agora'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
