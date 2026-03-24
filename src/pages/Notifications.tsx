import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

/**
 * Notifications Page Component
 * 
 * Displays a list of recent notifications for the user, such as events,
 * wishlist updates, check-ins, and exchanges.
 * 
 * @returns {JSX.Element} The rendered Notifications component.
 */
export function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const data = await notificationService.getNotifications(user!.id!);
    setNotifications(data);
    setIsLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await notificationService.markAllAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `Há ${diffInMins} min`;
    if (diffInHours < 24) return `Há ${diffInHours} h`;
    if (diffInDays === 1) return 'Ontem';
    return `Há ${diffInDays} dias`;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Notificações</h1>
          <div 
            onClick={handleMarkAllAsRead}
            className="flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">done_all</span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <span className="material-symbols-outlined text-6xl mb-4">notifications_off</span>
              <p className="font-bold">Nenhuma notificação por aqui.</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`flex items-start gap-4 p-5 rounded-3xl border transition-all cursor-pointer ${
                  notification.unread
                    ? 'bg-white dark:bg-slate-800 border-primary/20 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className={`size-12 shrink-0 rounded-2xl flex items-center justify-center ${notification.color}`}>
                  <span className="material-symbols-outlined text-2xl">{notification.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`text-sm md:text-base font-black truncate ${notification.unread ? 'text-navy-main dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notification.title}
                    </h3>
                    {notification.unread && (
                      <span className="size-2 shrink-0 bg-peach-main rounded-full mt-1.5"></span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                    {notification.description}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
