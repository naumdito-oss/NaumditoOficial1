import { supabase } from '../config/supabase';

export type NotificationType = 'event' | 'wishlist' | 'checkin' | 'exchange' | 'system' | 'achievement' | 'message' | 'alert' | 'gesture';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string;
  icon: string;
  color: string;
  unread: boolean;
  created_at: string;
  link?: string;
}

export const notificationService = {
  /**
   * Fetches notifications for the current user.
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Marks a notification as read.
   */
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('user_id', userId)
      .eq('unread', true);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  /**
   * Creates a notification for a user.
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'unread'>) {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) {
      console.error('Error creating notification:', error);
    }
  },

  /**
   * Helper to get the partner's ID in a couple.
   */
  async getPartnerId(userId: string, coupleId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('couple_id', coupleId)
        .neq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Error fetching partner ID:', err);
      return null;
    }
  },

  /**
   * Checks for upcoming events (birthdays, anniversaries) and creates notifications.
   * This should be called when the app starts or user logs in.
   */
  async checkAndGenerateEventNotifications(userId: string, coupleId: string) {
    try {
      console.log('Checking notifications for user:', userId);
      // 1. Get user profile and couple data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, couples(*)')
        .eq('id', userId)
        .single();

      if (!profile) return;

      // Get partner profile
      const { data: partner } = await supabase
        .from('profiles')
        .select('*')
        .eq('couple_id', coupleId)
        .neq('id', userId)
        .single();

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      console.log('Today:', todayStr);

      // 2. Check Anniversary
      if (profile.couples?.anniversary_date) {
        const anniv = new Date(profile.couples.anniversary_date + 'T12:00:00');
        console.log('Anniversary date:', anniv.toISOString());
        
        // Today
        if (anniv.getMonth() === today.getMonth() && anniv.getDate() === today.getDate()) {
          await this.ensureNotificationExists(userId, 'event', 'Feliz Aniversário de Namoro!', 'Hoje é o dia especial de vocês! Que tal celebrar?', 'celebration', 'bg-amber-100 text-amber-500', todayStr);
        }
        // Upcoming (within 2 days)
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(today.getDate() + 2);
        
        // Check if the anniversary is between today and 2 days from now
        const annivDate = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (annivDate > todayDate && annivDate <= twoDaysFromNow) {
          await this.ensureNotificationExists(userId, 'event', 'Aniversário de Namoro chegando!', 'Em breve vocês completam mais um ciclo juntos. Já pensou no presente?', 'notification_important', 'bg-amber-50 text-amber-400', todayStr);
        }
      }

      // 3. Check Partner Birthday
      if (partner?.metadata?.birthDate) {
        const bday = new Date(partner.metadata.birthDate + 'T12:00:00');
        // Today
        if (bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()) {
          await this.ensureNotificationExists(userId, 'event', `Aniversário de ${partner.name}!`, `Hoje é o aniversário do seu amor! Não esqueça de dar os parabéns.`, 'cake', 'bg-pink-100 text-pink-500', todayStr);
        }
        // Upcoming (within 2 days)
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(today.getDate() + 2);
        
        // Check if the birthday is between today and 2 days from now
        const bdayDate = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (bdayDate > todayDate && bdayDate <= twoDaysFromNow) {
          await this.ensureNotificationExists(userId, 'event', `Aniversário de ${partner.name} chegando!`, `Faltam poucos dias para o aniversário do seu amor. Tempo de preparar uma surpresa!`, 'alarm', 'bg-pink-50 text-pink-400', todayStr);
        }
      }

      // 4. Check Special Dates (from both to be safe)
      const allSpecialDates = [
        ...(profile.metadata?.specialDates || []),
        ...(partner?.metadata?.specialDates || [])
      ];

      for (const specialDate of allSpecialDates) {
        if (specialDate.date && specialDate.label) {
          const date = new Date(specialDate.date + 'T12:00:00');
          // Today
          if (date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) {
            await this.ensureNotificationExists(
              userId, 
              'event', 
              `Dia de: ${specialDate.label}!`, 
              `Hoje é um dia especial: ${specialDate.label}. Que tal celebrar juntos?`, 
              'star', 
              'bg-indigo-100 text-indigo-500', 
              todayStr
            );
          }
          // Upcoming (within 2 days)
          const twoDaysFromNow = new Date();
          twoDaysFromNow.setDate(today.getDate() + 2);
          
          // Check if the special date is between today and 2 days from now
          const dateDate = new Date(today.getFullYear(), date.getMonth(), date.getDate());
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          if (dateDate > todayDate && dateDate <= twoDaysFromNow) {
            await this.ensureNotificationExists(
              userId, 
              'event', 
              `${specialDate.label} chegando!`, 
              `Em breve teremos: ${specialDate.label}. Prepare-se para esse momento!`, 
              'event_upcoming', 
              'bg-indigo-50 text-indigo-400', 
              todayStr
            );
          }
        }
      }
    } catch (err) {
      console.error('Error checking events:', err);
    }
  },

  /**
   * Helper to avoid duplicate notifications for the same event on the same day.
   */
  async ensureNotificationExists(userId: string, type: NotificationType, title: string, description: string, icon: string, color: string, dateStr: string) {
    // Check if a similar notification was created today
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('title', title)
      .gte('created_at', dateStr + 'T00:00:00Z')
      .lte('created_at', dateStr + 'T23:59:59Z');

    if (!data || data.length === 0) {
      await this.createNotification({
        user_id: userId,
        type,
        title,
        description,
        icon,
        color
      });
    }
  }
};
