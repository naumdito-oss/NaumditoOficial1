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
  redeemPoints: (amount: number) => boolean;
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
  const [points, setPoints] = useState(1200);
  const [level, setLevel] = useState(5);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeItem[]>([
    { 
      id: '1', 
      title: 'Jantar Especial', 
      description: 'Noite sem Celular', 
      type: 'romantico', 
      status: 'pending', 
      createdAt: new Date().toISOString() 
    },
    { 
      id: '2', 
      title: 'Massagem nos pés', 
      description: 'Lavar a louça', 
      type: 'ajuda', 
      status: 'accepted', 
      createdAt: new Date().toISOString() 
    }
  ]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { id: '1', link: 'loja-exemplo.com/produto-xyz', title: 'Relógio Minimalista', createdAt: new Date().toISOString() }
  ]);
  const [empathyMessages, setEmpathyMessages] = useState<EmpathyMessage[]>([]);
  const [nextDatePlan, setNextDatePlan] = useState<NextDatePlan | null>(null);
  const [checkinCompleted, setCheckinCompleted] = useState(false);
  const [microGestureCompleted, setMicroGestureCompleted] = useState(false);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyProgress[]>([]);
  const [checkinHistory, setCheckinHistory] = useState<CheckinHistoryItem[]>([]);
  const [currentWeekProgress, setCurrentWeekProgress] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(() => {
    const stored = localStorage.getItem('weekly_points');
    const parsed = stored ? parseInt(stored, 10) : 150;
    return isNaN(parsed) ? 150 : parsed;
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

  const isInitialLoad = useRef(true);
  const isSyncingFromRemote = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      // First load from local storage for fast render
      try {
        const storedData = localStorage.getItem(STORAGE_KEYS.DATA);
        if (storedData) {
          const data = JSON.parse(storedData);
          setPoints(data.points || 1200);
          setLevel(data.level || 5);
          setAgreements(data.agreements || []);
          setExchanges(data.exchanges || []);
          setWishlist(data.wishlist || []);
          setEmpathyMessages(data.empathyMessages || []);
          setNextDatePlan(data.nextDatePlan || null);
          setCheckinCompleted(data.checkinCompleted || false);
          setMicroGestureCompleted(data.microGestureCompleted || false);
          setWeeklyHistory(data.weeklyHistory || []);
          setCheckinHistory(data.checkinHistory || []);
        }
      } catch (e) {
        console.error('Error parsing stored data:', e);
      }

      // Then load from Supabase if user is part of a couple
      if (user?.coupleId) {
        try {
          const { data: coupleData, error } = await supabase
            .from('couples')
            .select('app_data')
            .eq('id', user.coupleId)
            .single();

          if (error) throw error;

          if (coupleData && coupleData.app_data) {
            const data = coupleData.app_data;
            isSyncingFromRemote.current = true;
            
            if (data.points !== undefined) setPoints(data.points);
            if (data.level !== undefined) setLevel(data.level);
            if (data.agreements) setAgreements(data.agreements);
            if (data.exchanges) setExchanges(data.exchanges);
            if (data.wishlist) setWishlist(data.wishlist);
            if (data.empathyMessages) setEmpathyMessages(data.empathyMessages);
            if (data.nextDatePlan !== undefined) setNextDatePlan(data.nextDatePlan);
            if (data.checkinCompleted !== undefined) setCheckinCompleted(data.checkinCompleted);
            if (data.microGestureCompleted !== undefined) setMicroGestureCompleted(data.microGestureCompleted);
            if (data.weeklyHistory) setWeeklyHistory(data.weeklyHistory);
            if (data.checkinHistory) setCheckinHistory(data.checkinHistory);
            if (data.weeklyPoints !== undefined) setWeeklyPoints(data.weeklyPoints);
            if (data.dailyPoints !== undefined) setDailyPoints(data.dailyPoints);
            
            // Save to local storage to keep it updated
            localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
            
            setTimeout(() => {
              isSyncingFromRemote.current = false;
            }, 500);
          }
        } catch (error) {
          console.error('Error loading data from Supabase:', error);
        }
      }

      const storedProgress = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS);
      if (storedProgress) {
        setCurrentWeekProgress(parseInt(storedProgress, 10));
      }
    };

    loadData();

    // Subscribe to real-time changes
    let subscription: any = null;
    if (user?.coupleId) {
      subscription = supabase
        .channel(`couple_data_${user.coupleId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'couples',
            filter: `id=eq.${user.coupleId}`
          },
          (payload) => {
            if (payload.new && payload.new.app_data) {
              const data = payload.new.app_data;
              isSyncingFromRemote.current = true;
              
              if (data.points !== undefined) setPoints(data.points);
              if (data.level !== undefined) setLevel(data.level);
              if (data.agreements) setAgreements(data.agreements);
              if (data.exchanges) setExchanges(data.exchanges);
              if (data.wishlist) setWishlist(data.wishlist);
              if (data.empathyMessages) setEmpathyMessages(data.empathyMessages);
              if (data.nextDatePlan !== undefined) setNextDatePlan(data.nextDatePlan);
              if (data.checkinCompleted !== undefined) setCheckinCompleted(data.checkinCompleted);
              if (data.microGestureCompleted !== undefined) setMicroGestureCompleted(data.microGestureCompleted);
              if (data.weeklyHistory) setWeeklyHistory(data.weeklyHistory);
              if (data.checkinHistory) setCheckinHistory(data.checkinHistory);
              if (data.weeklyPoints !== undefined) setWeeklyPoints(data.weeklyPoints);
              if (data.dailyPoints !== undefined) setDailyPoints(data.dailyPoints);
              
              localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
              
              setTimeout(() => {
                isSyncingFromRemote.current = false;
              }, 500);
            }
          }
        )
        .subscribe();
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.DATA || e.key === STORAGE_KEYS.CURRENT_WEEK_PROGRESS) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user?.coupleId]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (isSyncingFromRemote.current) {
      return;
    }

    const dataToSave = {
      points,
      level,
      agreements,
      exchanges,
      wishlist,
      empathyMessages,
      nextDatePlan,
      checkinCompleted,
      microGestureCompleted,
      weeklyHistory,
      checkinHistory,
      weeklyPoints,
      dailyPoints
    };

    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(dataToSave));

    // Sync to Supabase
    if (user?.coupleId) {
      supabase
        .from('couples')
        .update({ app_data: dataToSave })
        .eq('id', user.coupleId)
        .then(({ error }) => {
          if (error) console.error('Error syncing to Supabase:', error);
        });
    }
  }, [points, level, agreements, exchanges, wishlist, empathyMessages, nextDatePlan, checkinCompleted, microGestureCompleted, weeklyHistory, checkinHistory, weeklyPoints, dailyPoints, user?.coupleId]);

  const updateWeeklyProgress = (percentage: number) => {
    setCurrentWeekProgress(percentage);
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS, percentage.toString());
  };

  const updateAgreement = (id: string, updates: Partial<Agreement>) => {
    setAgreements(agreements.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addAgreement = (text: string) => {
    const newAgreement: Agreement = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setAgreements([...agreements, newAgreement]);
  };

  const removeAgreement = (id: string) => {
    setAgreements(agreements.filter(a => a.id !== id));
  };

  const addExchange = async (exchange: Omit<ExchangeItem, 'id' | 'createdAt' | 'status'>) => {
    const newExchange: ExchangeItem = {
      ...exchange,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setExchanges([newExchange, ...exchanges]);
    
    // Notify partner
    if (user?.id && user?.coupleId) {
      const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
      if (partnerId) {
        await notificationService.createNotification({
          user_id: partnerId,
          type: 'exchange',
          title: 'Nova Permuta',
          description: `${exchange.authorName || 'Seu par'} propôs uma nova permuta: ${exchange.title}`,
          icon: 'swap_horiz',
          color: 'bg-indigo-500',
          link: '/agreements'
        });
      }
    }
  };

  const updateExchange = async (id: string, updates: Partial<ExchangeItem>) => {
    setExchanges(exchanges.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...updates };
        
        // Notify partner of status change
        if (user?.id && user?.coupleId) {
          notificationService.getPartnerId(user.id, user.coupleId).then(partnerId => {
            if (partnerId) {
              let title = '';
              let message = '';
              
              if (updates.status === 'counter_proposed') {
                title = 'Contraproposta Recebida';
                message = `Seu par fez uma contraproposta para: ${e.title}`;
              } else if (updates.status === 'accepted') {
                title = 'Permuta Aceita!';
                message = `O acordo foi fechado: ${e.title}`;
              } else if (updates.status === 'rejected') {
                title = 'Permuta Recusada';
                message = `Seu par recusou a permuta: ${e.title}`;
              }

              if (title) {
                notificationService.createNotification({
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
          });
        }
        
        if (updates.status === 'accepted') {
          const agreementText = `Acordo: ${e.title} ${updated.counterOffer ? `em troca de ${updated.counterOffer}` : ''}`;
          addAgreement(agreementText);
        }
        
        return updated;
      }
      return e;
    }));
  };

  const removeExchange = (id: string) => {
    setExchanges(exchanges.filter(e => e.id !== id));
  };

  const addToWishlist = async (link: string) => {
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      link,
      title: 'Novo Item',
      createdAt: new Date().toISOString()
    };
    setWishlist([newItem, ...wishlist]);

    // Notify partner
    if (user?.id && user?.coupleId) {
      const partnerId = await notificationService.getPartnerId(user.id, user.coupleId);
      if (partnerId) {
        await notificationService.createNotification({
          user_id: partnerId,
          type: 'wishlist',
          title: 'Novo Item na Wishlist',
          description: `Seu par adicionou um novo item à lista de desejos.`,
          icon: 'card_giftcard',
          color: 'bg-pink-500',
          link: '/surprise'
        });
      }
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(w => w.id !== id));
  };

  const addEmpathyMessage = (message: Omit<EmpathyMessage, 'id' | 'createdAt'>) => {
    const newMessage: EmpathyMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setEmpathyMessages([newMessage, ...empathyMessages]);
  };

  const removeEmpathyMessage = (id: string) => {
    setEmpathyMessages(empathyMessages.filter(m => m.id !== id));
  };

  const updateNextDatePlan = (plan: Omit<NextDatePlan, 'updatedAt'>) => {
    setNextDatePlan({
      ...plan,
      updatedAt: new Date().toISOString()
    });
  };

  const addPoints = (amount: number) => {
    if (dailyPoints >= DAILY_POINTS_CAP) return;
    
    const pointsToAdd = Math.min(amount, DAILY_POINTS_CAP - dailyPoints);
    setPoints(prev => prev + pointsToAdd);
    setDailyPoints(prev => prev + pointsToAdd);
    setWeeklyPoints(prev => prev + pointsToAdd);
  };

  const getCoupleStatus = () => {
    const WEEKLY_TARGET = 300;
    const percentage = Math.max(0, Math.min(100, Math.round((weeklyPoints / WEEKLY_TARGET) * 100) || 0));
    
    if (percentage <= 20) return { label: 'Precisamos Conversar', color: 'text-red-500', percentage };
    if (percentage <= 40) return { label: 'Ajustando a Rota', color: 'text-orange-500', percentage };
    if (percentage <= 60) return { label: 'Caminhando Juntos', color: 'text-yellow-500', percentage };
    if (percentage <= 80) return { label: 'Sintonia Fina', color: 'text-green-500', percentage };
    return { label: 'Amor em Alta', color: 'text-emerald-500', percentage };
  };

  const redeemPoints = (amount: number) => {
    if (points >= amount) {
      setPoints(prev => prev - amount);
      return true;
    }
    return false;
  };

  const completeCheckin = async (feeling: string, tags: string[], note: string) => {
    setCheckinCompleted(true);
    addPoints(50);
    
    const newCheckin: CheckinHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      feeling,
      tags,
      note
    };
    
    setCheckinHistory(prev => [newCheckin, ...prev]);

    // Notify partner
    if (user?.id && user?.coupleId) {
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
    }
  };

  const completeMicroGesture = () => {
    setMicroGestureCompleted(true);
    addPoints(20);
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
      redeemPoints,
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
