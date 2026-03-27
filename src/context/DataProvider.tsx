import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { notificationService } from '../services/notificationService';
import { STORAGE_KEYS } from '../constants';
import { getStartOfDay, getStartOfWeek } from '../utils/dateUtils';
import {
  Agreement,
  ExchangeItem,
  WishlistItem,
  CheckinHistoryItem,
  WeeklyProgress,
  EmpathyMessage,
  NextDatePlan,
  Achievement
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
  nextDatePlans: NextDatePlan[];
  weeklyHistory: WeeklyProgress[];
  checkinHistory: CheckinHistoryItem[];
  achievements: Achievement[];
  addAgreement: (text: string) => void;
  updateAgreement: (id: string, updates: Partial<Agreement>) => void;
  removeAgreement: (id: string) => void;
  clearBrokenAgreements: () => void;
  addExchange: (exchange: Omit<ExchangeItem, 'id' | 'createdAt' | 'status'>) => void;
  updateExchange: (id: string, updates: Partial<ExchangeItem>) => void;
  removeExchange: (id: string) => void;
  addToWishlist: (link: string) => void;
  removeFromWishlist: (id: string) => void;
  addPoints: (amount: number) => void;
  addEmpathyMessage: (message: Omit<EmpathyMessage, 'id' | 'createdAt'>) => void;
  removeEmpathyMessage: (id: string) => void;
  addNextDatePlan: (plan: Omit<NextDatePlan, 'id' | 'updatedAt'>) => Promise<void>;
  removeNextDatePlan: (id: string) => Promise<void>;
  updateNextDatePlan: (plan: Omit<NextDatePlan, 'updatedAt'>) => void;
  checkinCompleted: boolean;
  completeCheckin: (feeling: string, tags: string[], note: string) => Promise<boolean>;
  microGestureCompleted: boolean;
  completeMicroGesture: () => void;
  updateWeeklyProgress: (percentage: number) => void;
  getCoupleStatus: () => { label: string; color: string; percentage: number };
  recordAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt' | 'claimed'> & { claimed?: boolean }) => Promise<void>;
  claimAchievement: (id: string) => Promise<void>;
  pointsModal: { isOpen: boolean; points: number; reason: string };
  setPointsModal: (modal: { isOpen: boolean; points: number; reason: string }) => void;
  showPoints: (points: number, reason: string) => void;
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [nextDatePlans, setNextDatePlans] = useState<NextDatePlan[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [pointsModal, setPointsModal] = useState({ isOpen: false, points: 0, reason: '' });
  const isUpdatingProfileRef = useRef(false);

  const fetchData = React.useCallback(async () => {
    if (!user?.id || !user?.coupleId) {
      // Clear state if no user is logged in
      setPoints(0);
      setLevel(1);
      setAgreements([]);
      setExchanges([]);
      setWishlist([]);
      setEmpathyMessages([]);
      setNextDatePlan(null);
      setNextDatePlans([]);
      setCheckinCompleted(false);
      setMicroGestureCompleted(false);
      setWeeklyHistory([]);
      setCheckinHistory([]);
      setAchievements([]);
      setCurrentWeekProgress(0);
      setWeeklyPoints(0);
      setDailyPoints(0);
      setPointsModal({ isOpen: false, points: 0, reason: '' });
      isUpdatingProfileRef.current = false;

      // Clear user-specific localStorage
      localStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS);
      localStorage.removeItem('weekly_points');
      localStorage.removeItem('daily_points');
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DAY_START);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK_START);
      return;
    }

    try {
      // Load profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, level, weekly_points, daily_points, checkin_completed, micro_gesture_completed')
        .eq('id', user.id)
        .single();

      if (profile && !isUpdatingProfileRef.current) {
        setPoints(profile.points || 0);
        setLevel(profile.level || 1);
        setWeeklyPoints(profile.weekly_points || 0);
        setDailyPoints(profile.daily_points || 0);
        const today = new Date().toISOString().split('T')[0];
        const localCheckin = localStorage.getItem(`checkin_${user.id}_${today}`) === 'true';
        setCheckinCompleted(profile.checkin_completed || localCheckin);
        
        const localCompleted = localStorage.getItem(`micro_gesture_${user.id}_${today}`) === 'true';
        setMicroGestureCompleted(profile.micro_gesture_completed || localCompleted);
      }

      // Load agreements
      const { data: agreementsData } = await supabase
        .from('agreements')
        .select('*')
        .eq('couple_id', user.coupleId)
        .order('created_at', { ascending: false });
      if (agreementsData) {
        const filteredAgreements = agreementsData
          .filter(a => !deletedIds.has(a.id))
          .map(a => ({
            id: a.id,
            text: a.text,
            status: a.status,
            justification: a.justification,
            createdAt: a.created_at
          }));
        setAgreements(filteredAgreements);
      }

      // Load exchanges
      const { data: exchangesData } = await supabase
        .from('exchanges')
        .select('*')
        .eq('couple_id', user.coupleId)
        .order('created_at', { ascending: false });
      if (exchangesData) {
        const filteredExchanges = exchangesData
          .filter(e => !deletedIds.has(e.id))
          .map(e => ({
            id: e.id,
            title: e.title,
            description: e.description,
            type: e.type,
            status: e.status,
            counterOffer: e.counter_offer,
            createdAt: e.created_at
          }));
        setExchanges(filteredExchanges);
      }

      // Load wishlist
      const { data: wishlistData } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('couple_id', user.coupleId)
        .order('created_at', { ascending: false });
      if (wishlistData) {
        const filteredWishlist = wishlistData
          .filter(w => !deletedIds.has(w.id))
          .map(w => ({
            id: w.id,
            link: w.link,
            title: w.title,
            image: w.image,
            authorId: w.author_id,
            createdAt: w.created_at
          }));
        setWishlist(filteredWishlist);
      }

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
        createdAt: m.created_at,
        authorId: m.author_id
      })));

      // Load next date plans (all of them)
      const { data: datePlansData } = await supabase
        .from('next_date_plans')
        .select('*')
        .eq('couple_id', user.coupleId)
        .order('date', { ascending: true });
      
      if (datePlansData) {
        const mappedPlans = datePlansData.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          location: p.location,
          photo: p.photo,
          date: p.date,
          programType: p.program_type as any,
          updatedAt: p.updated_at
        }));
        setNextDatePlans(mappedPlans);
        
        // Set the next upcoming plan as the "nextDatePlan" for the home screen
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const upcoming = mappedPlans.find(p => p.date && new Date(p.date) >= now);
        setNextDatePlan(upcoming || mappedPlans[mappedPlans.length - 1] || null);
      }

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

      // Load achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (achievementsData) setAchievements(achievementsData.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        points: a.points,
        icon: a.icon,
        claimed: a.claimed,
        createdAt: a.created_at
      })));

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    }
  }, [user?.id, user?.coupleId]);

  const showPoints = (points: number, reason: string) => {
    setPointsModal({ isOpen: true, points, reason });
  };
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

  useEffect(() => {
    const checkCycles = async () => {
      const storedStartOfDay = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY_START);
      const currentStartOfDay = getStartOfDay();

      if (!storedStartOfDay) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_DAY_START, currentStartOfDay);
      } else if (storedStartOfDay !== currentStartOfDay) {
        // Reset daily status in DB if user is logged in
        if (user?.id) {
          try {
            await supabase
              .from('profiles')
              .update({ 
                checkin_completed: false, 
                micro_gesture_completed: false 
              })
              .eq('id', user.id);
            console.log('Daily status reset in database');
          } catch (error) {
            console.error('Error resetting daily status in DB:', error);
          }
        }

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
    fetchData();

    if (!user?.id || !user?.coupleId) return;

    // Subscribe to real-time changes
    const channels = [
      supabase.channel('profiles_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, fetchData),
      supabase.channel('agreements_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'agreements', filter: `couple_id=eq.${user.coupleId}` }, fetchData),
      supabase.channel('exchanges_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'exchanges', filter: `couple_id=eq.${user.coupleId}` }, fetchData),
      supabase.channel('wishlist_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_items', filter: `couple_id=eq.${user.coupleId}` }, fetchData),
      supabase.channel('empathy_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'empathy_messages', filter: `couple_id=eq.${user.coupleId}` }, fetchData),
      supabase.channel('date_plans_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'next_date_plans', filter: `couple_id=eq.${user.coupleId}` }, fetchData),
      supabase.channel('checkins_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'checkins', filter: `couple_id=eq.${user.coupleId}` }, fetchData),
      supabase.channel('achievements_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user.id}` }, fetchData)
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user?.id, user?.coupleId, fetchData]);

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
      // Reaching 350 weekly points (approx 50 per day) grants the full 20%
      const engagementScore = Math.min(20, (weeklyPoints / 350) * 20);

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

    // Manually refresh data to ensure UI updates
    await fetchData();

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

    if (updates.status === 'completed' && user?.id) {
      await recordAchievement({
        title: 'Acordo Cumprido',
        description: `Você cumpriu o acordo: ${currentAgreement.text}`,
        points: 100,
        icon: 'task_alt'
      });
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

    // Manually refresh data to ensure UI updates
    await fetchData();

    await recordAchievement({
      title: 'Novo Acordo',
      description: `Você criou um novo combinado: ${text}`,
      points: 20,
      icon: 'handshake'
    });

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
    // Add to deletedIds to filter out immediately in UI
    setDeletedIds(prev => new Set(prev).add(id));
    
    // Optimistic update using functional state to avoid stale closures
    let previousAgreements: Agreement[] = [];
    setAgreements(prev => {
      previousAgreements = [...prev];
      return prev.filter(a => a.id !== id);
    });

    try {
      const { error } = await supabase.from('agreements').delete().eq('id', id);
      if (error) {
        throw error;
      }
      // Rely on real-time subscription for final sync
    } catch (error) {
      console.error('Error removing agreement:', error);
      setAgreements(previousAgreements); // Revert
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const clearBrokenAgreements = async () => {
    if (!user?.coupleId) return;

    const brokenIds = agreements.filter(a => a.status === 'broken').map(a => a.id);
    if (brokenIds.length === 0) return;

    // Add to deletedIds
    setDeletedIds(prev => {
      const next = new Set(prev);
      brokenIds.forEach(id => next.add(id));
      return next;
    });

    // Optimistic update using functional state
    let previousAgreements: Agreement[] = [];
    setAgreements(prev => {
      previousAgreements = [...prev];
      return prev.filter(a => a.status !== 'broken');
    });

    try {
      const { error } = await supabase
        .from('agreements')
        .delete()
        .eq('couple_id', user.coupleId)
        .eq('status', 'broken');
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error clearing broken agreements:', error);
      setAgreements(previousAgreements); // Revert
      setDeletedIds(prev => {
        const next = new Set(prev);
        brokenIds.forEach(id => next.delete(id));
        return next;
      });
    }
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

    // Manually refresh data to ensure UI updates
    await fetchData();

    await recordAchievement({
      title: 'Nova Permuta',
      description: `Você propôs uma nova permuta: ${exchange.title}`,
      points: 30,
      icon: 'swap_horiz'
    });
    
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

    // Manually refresh data to ensure UI updates
    await fetchData();

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

          await recordAchievement({
            title: 'Permuta Aceita!',
            description: `O acordo foi fechado: ${currentExchange.title}`,
            points: 50,
            icon: 'handshake'
          });
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
    // Add to deletedIds
    setDeletedIds(prev => new Set(prev).add(id));

    // Optimistic update using functional state
    let previousExchanges: ExchangeItem[] = [];
    setExchanges(prev => {
      previousExchanges = [...prev];
      return prev.filter(e => e.id !== id);
    });

    try {
      const { error } = await supabase.from('exchanges').delete().eq('id', id);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error removing exchange:', error);
      setExchanges(previousExchanges); // Revert
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
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

    // Manually refresh data to ensure UI updates
    await fetchData();

    // Add points
    const pointsToAdd = 20;
    await addPoints(pointsToAdd);
    showPoints(pointsToAdd, `Item Adicionado: ${title}`);

    await recordAchievement({
      title: 'Desejo Adicionado',
      description: `Você adicionou "${title}" à lista de desejos.`,
      points: pointsToAdd,
      icon: 'card_giftcard',
      claimed: true
    });

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
    // Optimistic update using functional state
    let previousWishlist: WishlistItem[] = [];
    setWishlist(prev => {
      previousWishlist = [...prev];
      return prev.filter(item => item.id !== id);
    });

    try {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
      if (error) {
        throw error;
      }
      setTimeout(() => fetchData(), 500);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setWishlist(previousWishlist); // Revert
    }
  };

  const addEmpathyMessage = async (message: Omit<EmpathyMessage, 'id' | 'createdAt'>) => {
    if (!user?.id || !user?.coupleId) return;

    const { error } = await supabase.from('empathy_messages').insert({
      couple_id: user.coupleId,
      author_id: user.id,
      text: message.text,
      vibe: message.vibe
    });

    if (error) {
      console.error('Error adding empathy message:', error);
      return;
    }

    // Notify partner
    const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
    if (partnerId) {
      let title = 'Nova Mensagem';
      let description = 'Seu par deixou uma nova mensagem para você.';
      let icon = 'mail';
      let color = 'bg-primary';
      let link = '/empathy-box';

      if (message.vibe === 'sos') {
        title = 'Alerta SOS';
        description = 'Seu par postou um desabafo no mural.';
        icon = 'emergency_home';
        color = 'bg-red-500';
        link = '/sos';
      } else if (message.vibe === 'sincero') {
        title = 'Pedido de Desculpas';
        description = 'Seu par deixou um pedido de desculpas.';
        icon = 'favorite';
        color = 'bg-pink-500';
      }

      await notificationService.createNotification({
        user_id: partnerId,
        type: 'message',
        title,
        description,
        icon,
        color,
        link
      });
    }

    // Manually refresh data to ensure UI updates
    await fetchData();
  };

  const removeEmpathyMessage = async (id: string) => {
    // Optimistic update using functional state
    let previousMessages: EmpathyMessage[] = [];
    setEmpathyMessages(prev => {
      previousMessages = [...prev];
      return prev.filter(m => m.id !== id);
    });

    try {
      const { error } = await supabase.from('empathy_messages').delete().eq('id', id);
      if (error) {
        throw error;
      }
      setTimeout(() => fetchData(), 500);
    } catch (error) {
      console.error('Error removing empathy message:', error);
      setEmpathyMessages(previousMessages); // Revert
    }
  };

  const addNextDatePlan = async (plan: Omit<NextDatePlan, 'id' | 'updatedAt'>) => {
    if (!user?.id || !user?.coupleId) return;

    const { data, error } = await supabase.from('next_date_plans').insert({
      couple_id: user.coupleId,
      author_id: user.id,
      title: plan.title,
      description: plan.description,
      location: plan.location,
      photo: plan.photo,
      date: plan.date,
      program_type: plan.programType,
      updated_at: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('Error adding date plan:', error);
      return;
    }

    await fetchData();
    
    // Add points
    const pointsToAdd = 40;
    await addPoints(pointsToAdd);
    showPoints(pointsToAdd, 'Encontro Planejado!');

    await recordAchievement({
      title: 'Planejador(a)',
      description: `Você planejou um novo date: ${plan.title}`,
      points: 30,
      icon: 'event'
    });
  };

  const removeNextDatePlan = async (id: string) => {
    setDeletedIds(prev => new Set(prev).add(id));
    setNextDatePlans(prev => prev.filter(p => p.id !== id));

    try {
      const { error } = await supabase.from('next_date_plans').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error removing date plan:', error);
      await fetchData();
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const updateNextDatePlan = async (plan: Omit<NextDatePlan, 'updatedAt'>) => {
    if (!user?.id || !user?.coupleId) return;

    if ('id' in plan && (plan as any).id) {
      const { error } = await supabase.from('next_date_plans').update({
        title: plan.title,
        description: plan.description,
        location: plan.location,
        photo: plan.photo,
        date: plan.date,
        program_type: plan.programType,
        updated_at: new Date().toISOString()
      }).eq('id', (plan as any).id);
      
      if (error) {
        console.error('Error updating next date plan:', error);
        return;
      }
    } else {
      await addNextDatePlan(plan as any);
      return;
    }
    
    // Manually refresh data to ensure UI updates
    await fetchData();
    
    // Add points
    const pointsToAdd = 40;
    await addPoints(pointsToAdd);
    showPoints(pointsToAdd, 'Encontro Atualizado!');

    await recordAchievement({
      title: 'Encontro Planejado',
      description: `Você atualizou o plano para o próximo encontro: ${plan.title}`,
      points: pointsToAdd,
      icon: 'calendar_month',
      claimed: true
    });
  };

  const addPoints = async (amount: number) => {
    if (!user?.id || dailyPoints >= DAILY_POINTS_CAP) return;
    
    const pointsToAdd = Math.min(amount, DAILY_POINTS_CAP - dailyPoints);
    const newPoints = points + pointsToAdd;
    const newDailyPoints = dailyPoints + pointsToAdd;
    const newWeeklyPoints = weeklyPoints + pointsToAdd;

    // Optimistically update local state
    setPoints(newPoints);
    setDailyPoints(newDailyPoints);
    setWeeklyPoints(newWeeklyPoints);

    const { error } = await supabase.from('profiles').update({
      points: newPoints,
      daily_points: newDailyPoints,
      weekly_points: newWeeklyPoints
    }).eq('id', user.id);

    if (error) {
      console.error('Error updating points:', error);
      // Revert if failed
      setPoints(points);
      setDailyPoints(dailyPoints);
      setWeeklyPoints(weeklyPoints);
    }
  };

  const completeCheckin = async (feeling: string, tags: string[], note: string): Promise<boolean> => {
    if (!user?.id || !user?.coupleId) return false;

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
      return false;
    }

    // Update local state immediately for better UX
    setCheckinCompleted(true);

    let profileError;
    const updateRes = await supabase.from('profiles').update({
      checkin_completed: true
    }).eq('id', user.id);
    profileError = updateRes.error;

    if (profileError) {
      console.error('Error updating profile checkin status:', profileError);
      // Fallback to localStorage if column doesn't exist
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`checkin_${user.id}_${today}`, 'true');
    }

    // Manually refresh data to ensure UI updates
    await fetchData();

    // Update points
    const pointsToAdd = 50;
    await addPoints(pointsToAdd);
    showPoints(pointsToAdd, 'Check-in Diário Concluído!');

    await recordAchievement({
      title: 'Check-in Diário',
      description: 'Você realizou o check-in emocional de hoje.',
      points: 50,
      icon: 'event_available'
    });

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
    
    return true;
  };

  const completeMicroGesture = async () => {
    if (!user?.id || !user?.coupleId || microGestureCompleted) {
      console.log('Cannot complete micro-gesture:', { userId: user?.id, coupleId: user?.coupleId, microGestureCompleted });
      return;
    }

    // Optimistically update local state
    setMicroGestureCompleted(true);
    isUpdatingProfileRef.current = true;

    try {
      // Fetch current profile to get latest points and avoid race conditions
      // Try fetching with all columns first
      let profile;
      let fetchError;
      
      const res = await supabase
        .from('profiles')
        .select('points, daily_points, weekly_points')
        .eq('id', user.id)
        .single();
        
      profile = res.data;
      fetchError = res.error;

      // If it fails, maybe the columns don't exist. Fallback to just points.
      if (fetchError) {
        console.warn('Failed to fetch daily/weekly points, falling back to just points:', fetchError);
        const fallbackRes = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();
          
        if (fallbackRes.error) throw fallbackRes.error;
        profile = fallbackRes.data;
      }

      const currentPoints = profile?.points || 0;
      const currentDailyPoints = profile?.daily_points || 0;
      const currentWeeklyPoints = profile?.weekly_points || 0;

      // Calculate points to add
      const pointsToAdd = Math.min(10, DAILY_POINTS_CAP - currentDailyPoints);
      const newPoints = currentPoints + pointsToAdd;
      const newDailyPoints = currentDailyPoints + pointsToAdd;
      const newWeeklyPoints = currentWeeklyPoints + pointsToAdd;

      console.log('Updating micro-gesture status and points:', { pointsToAdd, newPoints });

      // Try updating all fields
      let updateError;
      const updateRes = await supabase.from('profiles').update({
        micro_gesture_completed: true,
        points: newPoints,
        daily_points: newDailyPoints,
        weekly_points: newWeeklyPoints
      }).eq('id', user.id);
      
      updateError = updateRes.error;

      // If update fails, fallback to just points and micro_gesture_completed
      if (updateError) {
        console.warn('Failed to update all fields, falling back to basic fields:', updateError);
        const fallbackUpdateRes = await supabase.from('profiles').update({
          points: newPoints
        }).eq('id', user.id);
        
        if (fallbackUpdateRes.error) {
          console.error('Failed to update points:', fallbackUpdateRes.error);
        } else {
          // If we can't update micro_gesture_completed in DB, store in localStorage
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`micro_gesture_${user.id}_${today}`, 'true');
        }
      }

      // Update local points state
      setPoints(newPoints);
      setDailyPoints(newDailyPoints);
      setWeeklyPoints(newWeeklyPoints);

      // Show points modal
      if (pointsToAdd > 0) {
        showPoints(pointsToAdd, 'Gesto do Dia Concluído!');
      } else {
        // Still show a success message even if points are capped
        showPoints(0, 'Gesto do Dia Concluído! (Limite diário atingido)');
      }

      // Record achievement
      await recordAchievement({
        title: 'Gesto do Dia',
        description: 'Você realizou o gesto do dia para o seu par.',
        points: pointsToAdd,
        icon: 'favorite',
        claimed: true
      });

      // Notify partner
      const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
      if (partnerId) {
        await notificationService.createNotification({
          user_id: partnerId,
          type: 'achievement',
          title: 'Gesto de Carinho!',
          description: `Seu par acabou de realizar o gesto do dia para você.`,
          icon: 'favorite',
          color: 'bg-pink-500',
          link: '/home'
        });
      }
    } catch (error) {
      console.error('Error updating micro gesture status:', error);
      // Revert local state if failed
      setMicroGestureCompleted(false);
      throw error;
    } finally {
      isUpdatingProfileRef.current = false;
    }
  };

  const recordAchievement = async (achievement: Omit<Achievement, 'id' | 'createdAt' | 'claimed'> & { claimed?: boolean }) => {
    if (!user?.id || !user?.coupleId) return;

    const { error } = await supabase.from('achievements').insert({
      user_id: user.id,
      couple_id: user.coupleId,
      title: achievement.title,
      description: achievement.description,
      points: achievement.points,
      icon: achievement.icon,
      claimed: achievement.claimed || false
    });

    if (error) console.error('Error recording achievement:', error);
  };

  const claimAchievement = async (id: string) => {
    if (!user?.id) return;

    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.claimed) return;

    const { error: updateError } = await supabase
      .from('achievements')
      .update({ claimed: true })
      .eq('id', id);

    if (updateError) {
      console.error('Error claiming achievement:', updateError);
      return;
    }

    await addPoints(achievement.points);
    showPoints(achievement.points, `Conquista: ${achievement.title}`);
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
      nextDatePlans,
      addAgreement,
      updateAgreement,
      removeAgreement,
      clearBrokenAgreements,
      addExchange,
      updateExchange,
      removeExchange,
      addToWishlist,
      removeFromWishlist,
      addEmpathyMessage,
      removeEmpathyMessage,
      addNextDatePlan,
      removeNextDatePlan,
      updateNextDatePlan,
      addPoints,
      checkinCompleted,
      completeCheckin,
      microGestureCompleted,
      completeMicroGesture,
      weeklyHistory,
      checkinHistory,
      achievements,
      recordAchievement,
      claimAchievement,
      updateWeeklyProgress,
      getCoupleStatus,
      pointsModal,
      setPointsModal,
      showPoints
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
