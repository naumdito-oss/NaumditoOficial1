import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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

  // Helper to get the start of the current day
  const getStartOfDay = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  };

  // Helper to get the start of the current week (Monday)
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
  };

  // Helper to check if it's the end of the week (Sunday 23:59)
  // For prototype purposes, we'll check if the current week has changed
  useEffect(() => {
    const checkCycles = () => {
      // Daily cycle check
      const storedStartOfDay = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY_START);
      const currentStartOfDay = getStartOfDay();

      if (!storedStartOfDay) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_DAY_START, currentStartOfDay);
      } else if (storedStartOfDay !== currentStartOfDay) {
        // Day has changed! Reset daily activities
        setCheckinCompleted(false);
        setMicroGestureCompleted(false);
        setDailyPoints(0);
        localStorage.setItem(STORAGE_KEYS.CURRENT_DAY_START, currentStartOfDay);
      }

      // Weekly cycle check
      const storedStartOfWeek = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_START);
      const currentStartOfWeek = getStartOfWeek();

      if (!storedStartOfWeek) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_START, currentStartOfWeek);
        return;
      }

      if (storedStartOfWeek !== currentStartOfWeek) {
        // Week has changed! Save the final progress of the previous week
        const finalProgress = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS) || '0', 10);
        
        setWeeklyHistory(prev => {
          const newHistory = [...prev, {
            weekStarting: storedStartOfWeek,
            percentage: finalProgress
          }];
          return newHistory;
        });

        // Reset for the new week
        setCurrentWeekProgress(0);
        setWeeklyPoints(0);
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_START, currentStartOfWeek);
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS, '0');
      }
    };

    checkCycles();
    // Check periodically (e.g., every hour) if the cycles have rolled over
    const interval = setInterval(checkCycles, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load from localStorage on mount and listen to storage events
  useEffect(() => {
    const loadData = () => {
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
      const storedProgress = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_PROGRESS);
      if (storedProgress) {
        setCurrentWeekProgress(parseInt(storedProgress, 10));
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.DATA || e.key === STORAGE_KEYS.CURRENT_WEEK_PROGRESS) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify({
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
      checkinHistory
    }));
  }, [points, level, agreements, exchanges, wishlist, empathyMessages, nextDatePlan, checkinCompleted, microGestureCompleted, weeklyHistory, checkinHistory]);

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

  const addExchange = (exchange: Omit<ExchangeItem, 'id' | 'createdAt' | 'status'>) => {
    const newExchange: ExchangeItem = {
      ...exchange,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setExchanges([newExchange, ...exchanges]);
    
    // Dispatch a custom event for local notifications
    window.dispatchEvent(new CustomEvent('new_notification', { 
      detail: { title: 'Nova Permuta', message: `${exchange.authorName || 'Seu par'} propôs uma nova permuta: ${exchange.title}` }
    }));
  };

  const updateExchange = (id: string, updates: Partial<ExchangeItem>) => {
    setExchanges(exchanges.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...updates };
        
        // If counter proposed
        if (updates.status === 'counter_proposed') {
          window.dispatchEvent(new CustomEvent('new_notification', { 
            detail: { title: 'Contraproposta Recebida', message: `Seu par fez uma contraproposta para: ${e.title}` }
          }));
        }
        
        // If accepted
        if (updates.status === 'accepted') {
          window.dispatchEvent(new CustomEvent('new_notification', { 
            detail: { title: 'Permuta Aceita!', message: `O acordo foi fechado: ${e.title}` }
          }));
          
          // Add to agreements automatically
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

  const addToWishlist = (link: string) => {
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      link,
      title: 'Novo Item', // In a real app we'd fetch metadata
      createdAt: new Date().toISOString()
    };
    setWishlist([newItem, ...wishlist]);
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

  const [weeklyPoints, setWeeklyPoints] = useState(() => {
    const stored = localStorage.getItem('weekly_points');
    // Default to 150 (50%) for prototype as requested
    return stored ? parseInt(stored, 10) : 150;
  });

  useEffect(() => {
    localStorage.setItem('weekly_points', weeklyPoints.toString());
  }, [weeklyPoints]);

  const [dailyPoints, setDailyPoints] = useState(() => {
    const stored = localStorage.getItem('daily_points');
    return stored ? parseInt(stored, 10) : 0;
  });
  const DAILY_POINTS_CAP = 100;

  useEffect(() => {
    localStorage.setItem('daily_points', dailyPoints.toString());
  }, [dailyPoints]);

  const addPoints = (amount: number) => {
    if (dailyPoints >= DAILY_POINTS_CAP) return;
    
    const pointsToAdd = Math.min(amount, DAILY_POINTS_CAP - dailyPoints);
    setPoints(prev => prev + pointsToAdd);
    setDailyPoints(prev => prev + pointsToAdd);
    setWeeklyPoints(prev => prev + pointsToAdd);
  };

  const getCoupleStatus = () => {
    const WEEKLY_TARGET = 300; // Example target
    const percentage = Math.min(100, Math.round((weeklyPoints / WEEKLY_TARGET) * 100));
    
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

  const completeCheckin = (feeling: string, tags: string[], note: string) => {
    setCheckinCompleted(true);
    addPoints(50); // Reward for checkin
    
    const newCheckin: CheckinHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      feeling,
      tags,
      note
    };
    
    setCheckinHistory(prev => [newCheckin, ...prev]);
  };

  const completeMicroGesture = () => {
    setMicroGestureCompleted(true);
    addPoints(20); // Reward for micro-gesture
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

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
