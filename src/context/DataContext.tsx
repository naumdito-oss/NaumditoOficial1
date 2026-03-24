import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notificationService';
import { STORAGE_KEYS } from '../constants';
import {
  Agreement,
  ExchangeItem,
  WishlistItem,
  CheckinHistoryItem,
  WeeklyProgress,
  EmpathyMessage,
  NextDatePlan
} from '../types';

/**
 * Defines the shape of the data context, including all application state and actions.
 */
interface DataContextType {
  points: number;
  level: number;
  agreements: Agreement[];
  exchanges: ExchangeItem[];
  wishlist: WishlistItem[];
  empathyMessages: EmpathyMessage[];
  nextDatePlan: NextDatePlan | null;
  weeklyHistory: WeeklyProgress[];
  checkinHistory: CheckinHistoryItem[];
  addAgreement: (text: string) => void;
  updateAgreement: (id: string, updates: Partial<Agreement>) => void;
  removeAgreement: (id: string) => void;
  addExchange: (exchange: Omit<ExchangeItem, 'id' | 'createdAt' | 'status'>) => void;
  updateExchange: (id: string, updates: Partial<ExchangeItem>) => void;
  removeExchange: (id: string) => void;
  addToWishlist: (link: string) => void;
  removeFromWishlist: (id: string) => void;
  addPoints: (amount: number) => void;
  addEmpathyMessage: (message: Omit<EmpathyMessage, 'id' | 'createdAt'>) => void;
  removeEmpathyMessage: (id: string) => void;
  updateNextDatePlan: (plan: Omit<NextDatePlan, 'updatedAt'>) => void;
  checkinCompleted: boolean;
  completeCheckin: (feeling: string, tags: string[], note: string) => void;
  microGestureCompleted: boolean;
  completeMicroGesture: () => void;
  updateWeeklyProgress: (percentage: number) => void;
  getCoupleStatus: () => { label: string; color: string; percentage: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Provider component that manages and supplies the application's core data state.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [empathyMessages, setEmpathyMessages] = useState<EmpathyMessage[]>([]);
  const [nextDatePlan, setNextDatePlan] = useState<NextDatePlan | null>(null);
  const [checkinCompleted, setCheckinCompleted] = useState(false);
  const [microGestureCompleted, setMicroGestureCompleted] = useState(false);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyProgress[]>([]);
  const [checkinHistory, setCheckinHistory] = useState<CheckinHistoryItem[]>([]);
  const [currentWeekProgress, setCurrentWeekProgress] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [weeklyPoints, setWeeklyPoints] = useState(() => {
    const stored = localStorage.getItem('weekly_points');
    const parsed = stored ? parseInt(stored, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const [dailyPoints, setDailyPoints] = useState(() => {
    const stored = localStorage.getItem('daily_points');
    const parsed = stored ? parseInt(stored, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const DAILY_POINTS_CAP = 100;

  /**
   * Helper to get the start of the current day in ISO format.
   */
  const getStartOfDay = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  };

  /**
   * Helper to get the start of the current week (Monday) in ISO format.
   */
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
  };

  useEffect(() => {
    const checkCycles = () => {
      const storedStartOfDay = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY_START);
      const currentStartOfDay = getStartOfDay();

      if (!storedStartOfDay) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_DAY_START, currentStartOfDay);
      } else if (storedStartOfDay !== currentStartOfDay) {
        setCheckinCompleted(false);
        setMicroGestureCompleted(false);
        setDailyPoints(0);
        localStorage.setItem(STORAGE_KEYS.CURRENT_DAY_START, currentStartOfDay);
      }

      const storedStartOfWeek = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_START);
      const currentStartOfWeek = getStartOfWeek();

      if (!storedStartOfWeek) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_START, currentStartOfWeek);
        return;
      }

      if (storedStartOfWeek !== currentStartOfWeek) {
        const finalProgress = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS) || '0', 10);
        
        setWeeklyHistory(prev => {
          const newHistory = [...prev, {
            weekStarting: storedStartOfWeek,
            percentage: finalProgress
          }];
          return newHistory;
        });

        setCurrentWeekProgress(0);
        setWeeklyPoints(0);
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_START, currentStartOfWeek);
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS, '0');
      }
    };

    checkCycles();
    const interval = setInterval(checkCycles, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !user?.coupleId) return;

      try {
        // Load profile stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('points, level, weekly_points, daily_points, checkin_completed, micro_gesture_completed')
          .eq('id', user.id)
          .single();

        if (profile) {
          setPoints(profile.points || 0);
          setLevel(profile.level || 1);
          setWeeklyPoints(profile.weekly_points || 0);
          setDailyPoints(profile.daily_points || 0);
          setCheckinCompleted(profile.checkin_completed || false);
          setMicroGestureCompleted(profile.micro_gesture_completed || false);
        }

        // Load agreements
        const { data: agreementsData } = await supabase
          .from('agreements')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('created_at', { ascending: false });
        if (agreementsData) setAgreements(agreementsData.map(a => ({
          id: a.id,
          text: a.text,
          status: a.status,
          justification: a.justification,
          createdAt: a.created_at
        })));

        // Load exchanges
        const { data: exchangesData } = await supabase
          .from('exchanges')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('created_at', { ascending: false });
        if (exchangesData) setExchanges(exchangesData.map(e => ({
          id: e.id,
          title: e.title,
          description: e.description,
          type: e.type,
          status: e.status,
          counterOffer: e.counter_offer,
          createdAt: e.created_at
        })));

        // Load wishlist
        const { data: wishlistData } = await supabase
          .from('wishlist_items')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('created_at', { ascending: false });
        if (wishlistData) setWishlist(wishlistData.map(w => ({
          id: w.id,
          link: w.link,
          title: w.title,
          image: w.image,
          authorId: w.author_id,
          createdAt: w.created_at
        })));

        // Load empathy messages
        const { data: empathyData } = await supabase
          .from('empathy_messages')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('created_at', { ascending: false });
        if (empathyData) setEmpathyMessages(empathyData.map(m => ({
          id: m.id,
          text: m.text,
          vibe: m.vibe,
          createdAt: m.created_at
        })));

        // Load next date plan
        const { data: datePlanData } = await supabase
          .from('next_date_plans')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        if (datePlanData) setNextDatePlan({
          title: datePlanData.title,
          description: datePlanData.description,
          location: datePlanData.location,
          photo: datePlanData.photo,
          programType: datePlanData.program_type,
          updatedAt: datePlanData.updated_at
        });

        // Load weekly history
        const { data: historyData } = await supabase
          .from('weekly_history')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('week_starting', { ascending: false });
        if (historyData) setWeeklyHistory(historyData.map(h => ({
          weekStarting: h.week_starting,
          percentage: h.percentage
        })));

        // Load checkin history
        const { data: checkinsData } = await supabase
          .from('checkins')
          .select('*')
          .eq('couple_id', user.coupleId)
          .order('created_at', { ascending: false });
        if (checkinsData) setCheckinHistory(checkinsData.map(c => ({
          id: c.id,
          date: c.created_at,
          feeling: c.feeling,
          tags: c.tags,
          note: c.note
        })));

      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const channels = [
      supabase.channel('profiles_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, fetchData),
      supabase.channel('agreements_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'agreements', filter: `couple_id=eq.${user?.coupleId}` }, fetchData),
      supabase.channel('exchanges_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'exchanges', filter: `couple_id=eq.${user?.coupleId}` }, fetchData),
      supabase.channel('wishlist_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_items', filter: `couple_id=eq.${user?.coupleId}` }, fetchData),
      supabase.channel('empathy_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'empathy_messages', filter: `couple_id=eq.${user?.coupleId}` }, fetchData),
      supabase.channel('date_plans_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'next_date_plans', filter: `couple_id=eq.${user?.coupleId}` }, fetchData),
      supabase.channel('checkins_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'checkins', filter: `couple_id=eq.${user?.coupleId}` }, fetchData)
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user?.id, user?.coupleId]);

  /**
   * Automatically calculates the current week's progress based on various engagement metrics.
   */
  useEffect(() => {
    const calculateProgress = () => {
      if (!user?.id) return 0;
      
      const startOfWeek = new Date(getStartOfWeek());
      
      // 1. Check-ins (30%) - Based on unique days with check-ins this week
      const checkinDays = new Set(
        checkinHistory
          .filter(c => new Date(c.date) >= startOfWeek)
          .map(c => new Date(c.date).toDateString())
      ).size;
      const checkinScore = Math.min(30, (checkinDays / 7) * 30);

      // 2. Agreements (15%) - At least one active agreement
      const activeAgreements = agreements.filter(a => a.status === 'active').length;
      const agreementScore = activeAgreements > 0 ? 15 : 0;

      // 3. Exchanges (15%) - At least one accepted or completed exchange this week
      const recentExchanges = exchanges.filter(e => 
        (e.status === 'accepted' || e.status === 'completed') && 
        new Date(e.createdAt) >= startOfWeek
      ).length;
      const exchangeScore = recentExchanges > 0 ? 15 : 0;

      // 4. Wishlist (10%) - At least one item added this week
      const recentWishlist = wishlist.filter(w => 
        new Date(w.createdAt) >= startOfWeek
      ).length;
      const wishlistScore = recentWishlist > 0 ? 10 : 0;

      // 5. Next Date Plan (10%) - If the plan was updated this week
      const datePlanScore = (nextDatePlan && new Date(nextDatePlan.updatedAt) >= startOfWeek) ? 10 : 0;

      // 6. Engagement/Microgestures (20%) - Proxy using weekly points
      // Reaching 500 weekly points (approx 70 per day) grants the full 20%
      const engagementScore = Math.min(20, (weeklyPoints / 500) * 20);

      const total = checkinScore + agreementScore + exchangeScore + wishlistScore + datePlanScore + engagementScore;
      return Math.round(Math.min(100, total));
    };

    const newProgress = calculateProgress();
    if (newProgress !== currentWeekProgress) {
      setCurrentWeekProgress(newProgress);
      localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS, newProgress.toString());
    }
  }, [checkinHistory, agreements, exchanges, wishlist, nextDatePlan, weeklyPoints, user?.id, currentWeekProgress]);

  const updateWeeklyProgress = async (percentage: number) => {
    if (!user?.coupleId) return;
    setCurrentWeekProgress(percentage);
    
    await supabase.from('weekly_history').insert({
      couple_id: user.coupleId,
      week_starting: getStartOfWeek(),
      percentage
    });
  };

  const updateAgreement = async (id: string, updates: Partial<Agreement>) => {
    const { data: currentAgreement } = await supabase.from('agreements').select('*').eq('id', id).single();
    if (!currentAgreement) return;

    const { error } = await supabase
      .from('agreements')
      .update({
        text: updates.text,
        status: updates.status,
        justification: updates.justification
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating agreement:', error);
      return;
    }

    // Notify partner if agreement was broken
    if (updates.status === 'broken' && user?.id && user?.coupleId) {
      const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
      if (partnerId) {
        await notificationService.createNotification({
          user_id: partnerId,
          type: 'system',
          title: 'Acordo Descumprido',
          description: `${user.name || 'Seu par'} marcou um acordo como descumprido: ${updates.justification || ''}`,
          icon: 'warning',
          color: 'bg-red-500',
          link: '/agreements'
        });
      }
    }
  };

  const addAgreement = async (text: string) => {
    if (!user?.id || !user?.coupleId) return;
    
    const { error } = await supabase.from('agreements').insert({
      couple_id: user.coupleId,
      created_by: user.id,
      text,
      status: 'active'
    });

    if (error) {
      console.error('Error adding agreement:', error);
      return;
    }

    // Notify partner
    const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
    if (partnerId) {
      await notificationService.createNotification({
        user_id: partnerId,
        type: 'system',
        title: 'Novo Acordo',
        description: `${user.name || 'Seu par'} criou um novo combinado: ${text}`,
        icon: 'handshake',
        color: 'bg-navy-main',
        link: '/agreements'
      });
    }
  };

  const removeAgreement = async (id: string) => {
    const { error } = await supabase.from('agreements').delete().eq('id', id);
    if (error) console.error('Error removing agreement:', error);
  };

  const addExchange = async (exchange: Omit<ExchangeItem, 'id' | 'createdAt' | 'status'>) => {
    if (!user?.id || !user?.coupleId) return;

    const { data: newExchange, error } = await supabase.from('exchanges').insert({
      couple_id: user.coupleId,
      author_id: user.id,
      title: exchange.title,
      description: exchange.description,
      type: exchange.type,
      status: 'pending'
    }).select().single();

    if (error) {
      console.error('Error adding exchange:', error);
      return;
    }
    
    // Notify partner
    const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
    if (partnerId) {
      await notificationService.createNotification({
        user_id: partnerId,
        type: 'exchange',
        title: 'Nova Permuta',
        description: `${user.name || 'Seu par'} propôs uma nova permuta: ${exchange.title}`,
        icon: 'swap_horiz',
        color: 'bg-indigo-500',
        link: '/agreements'
      });
    }
  };

  const updateExchange = async (id: string, updates: Partial<ExchangeItem>) => {
    const { data: currentExchange } = await supabase.from('exchanges').select('*').eq('id', id).single();
    if (!currentExchange) return;

    const { error } = await supabase
      .from('exchanges')
      .update({
        status: updates.status,
        counter_offer: updates.counterOffer
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating exchange:', error);
      return;
    }

    // Notify partner of status change
    if (user?.id && user?.coupleId) {
      const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
      if (partnerId) {
        let title = '';
        let message = '';
        
        if (updates.status === 'counter_proposed') {
          title = 'Contraproposta Recebida';
          message = `Seu par fez uma contraproposta para: ${currentExchange.title}`;
        } else if (updates.status === 'accepted') {
          title = 'Permuta Aceita!';
          message = `O acordo foi fechado: ${currentExchange.title}`;
          
          // Add as an agreement
          const agreementText = `Acordo: ${currentExchange.title} ${updates.counterOffer ? `em troca de ${updates.counterOffer}` : ''}`;
          addAgreement(agreementText);
        } else if (updates.status === 'rejected') {
          title = 'Permuta Recusada';
          message = `Seu par recusou a permuta: ${currentExchange.title}`;
        }

        if (title) {
          await notificationService.createNotification({
            user_id: partnerId,
            type: 'exchange',
            title,
            description: message,
            icon: 'swap_horiz',
            color: 'bg-indigo-500',
            link: '/agreements'
          });
        }
      }
    }
  };

  const removeExchange = async (id: string) => {
    const { error } = await supabase.from('exchanges').delete().eq('id', id);
    if (error) console.error('Error removing exchange:', error);
  };

  const addToWishlist = async (link: string) => {
    if (!user?.id || !user?.coupleId) return;

    let title = 'Novo Item';
    let image = '';

    if (link.includes('amazon')) title = 'Produto Amazon';
    else if (link.includes('mercadolivre')) title = 'Produto Mercado Livre';
    else if (link.includes('magazineluiza')) title = 'Produto Magalu';
    else if (link.includes('shopee')) title = 'Produto Shopee';

    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          title = data.data.title || title;
          image = data.data.image?.url || data.data.logo?.url || '';
        }
      }
    } catch (e) {
      console.error('Error fetching link metadata:', e);
    }

    const { error } = await supabase.from('wishlist_items').insert({
      couple_id: user.coupleId,
      author_id: user.id,
      link,
      title,
      image
    });

    if (error) {
      console.error('Error adding to wishlist:', error);
      return;
    }

    // Notify partner
    const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
    if (partnerId) {
      await notificationService.createNotification({
        user_id: partnerId,
        type: 'wishlist',
        title: 'Novo Item na Wishlist',
        description: `Seu par adicionou "${title}" à lista de desejos.`,
        icon: 'card_giftcard',
        color: 'bg-pink-500',
        link: '/surprise'
      });
    }
  };

  const removeFromWishlist = async (id: string) => {
    const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
    if (error) console.error('Error removing from wishlist:', error);
  };

  const addEmpathyMessage = async (message: Omit<EmpathyMessage, 'id' | 'createdAt'>) => {
    if (!user?.id || !user?.coupleId) return;

    const { error } = await supabase.from('empathy_messages').insert({
      couple_id: user.coupleId,
      author_id: user.id,
      text: message.text,
      vibe: message.vibe
    });

    if (error) console.error('Error adding empathy message:', error);
  };

  const removeEmpathyMessage = async (id: string) => {
    const { error } = await supabase.from('empathy_messages').delete().eq('id', id);
    if (error) console.error('Error removing empathy message:', error);
  };

  const updateNextDatePlan = async (plan: Omit<NextDatePlan, 'updatedAt'>) => {
    if (!user?.id || !user?.coupleId) return;

    const { error } = await supabase.from('next_date_plans').upsert({
      couple_id: user.coupleId,
      author_id: user.id,
      title: plan.title,
      description: plan.description,
      location: plan.location,
      photo: plan.photo,
      program_type: plan.programType,
      updated_at: new Date().toISOString()
    }, { onConflict: 'couple_id' });

    if (error) console.error('Error updating next date plan:', error);
  };

  const addPoints = async (amount: number) => {
    if (!user?.id || dailyPoints >= DAILY_POINTS_CAP) return;
    
    const pointsToAdd = Math.min(amount, DAILY_POINTS_CAP - dailyPoints);
    const newPoints = points + pointsToAdd;
    const newDailyPoints = dailyPoints + pointsToAdd;
    const newWeeklyPoints = weeklyPoints + pointsToAdd;

    const { error } = await supabase.from('profiles').update({
      points: newPoints,
      daily_points: newDailyPoints,
      weekly_points: newWeeklyPoints
    }).eq('id', user.id);

    if (error) console.error('Error updating points:', error);
  };

  const completeCheckin = async (feeling: string, tags: string[], note: string) => {
    if (!user?.id || !user?.coupleId) return;

    const { error: checkinError } = await supabase.from('checkins').insert({
      couple_id: user.coupleId,
      author_id: user.id,
      feeling,
      tags,
      note,
      date: new Date().toISOString().split('T')[0]
    });

    if (checkinError) {
      console.error('Error saving checkin:', checkinError);
      return;
    }

    await supabase.from('profiles').update({
      checkin_completed: true
    }).eq('id', user.id);

    await addPoints(50);

    // Notify partner
    const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
    if (partnerId) {
      await notificationService.createNotification({
        user_id: partnerId,
        type: 'checkin',
        title: 'Check-in Realizado',
        description: `Seu par acabou de realizar o check-in diário.`,
        icon: 'favorite',
        color: 'bg-red-500',
        link: '/checkin'
      });
    }
  };

  const completeMicroGesture = async () => {
    if (!user?.id) return;

    await supabase.from('profiles').update({
      micro_gesture_completed: true
    }).eq('id', user.id);

    await addPoints(20);
  };

  /**
   * Calculates the couple's connection status based on weekly progress.
   * 
   * @returns {Object} The status object containing label, color, and percentage.
   */
  const getCoupleStatus = () => {
    const percentage = currentWeekProgress;
    const isInitial = weeklyHistory.length === 0 && percentage < 10;
    
    if (isInitial) return { label: 'Acompanhe aqui', color: 'text-slate-400', percentage };
    
    if (percentage >= 80) return { label: 'Em Sintonia Total', color: 'text-emerald-500', percentage };
    if (percentage >= 50) return { label: 'Conexão Estável', color: 'text-peach-main', percentage };
    
    // Only show "Needs Attention" if there's history or we're past the initial phase
    return { label: 'Precisando de Atenção', color: 'text-red-500', percentage };
  };

  return (
    <DataContext.Provider value={{
      points,
      level,
      agreements,
      exchanges,
      wishlist,
      empathyMessages,
      nextDatePlan,
      addAgreement,
      updateAgreement,
      removeAgreement,
      addExchange,
      updateExchange,
      removeExchange,
      addToWishlist,
      removeFromWishlist,
      addEmpathyMessage,
      removeEmpathyMessage,
      updateNextDatePlan,
      addPoints,
      checkinCompleted,
      completeCheckin,
      microGestureCompleted,
      completeMicroGesture,
      weeklyHistory,
      checkinHistory,
      updateWeeklyProgress,
      getCoupleStatus
    }}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Custom hook to access the data context.
 */
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
