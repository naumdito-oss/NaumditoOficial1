/**
 * Represents a user in the system.
 */
export interface User {
  id?: string;
  name: string;
  email: string;
  partnerName?: string;
  photoUrl?: string;
  points: number;
  level: number;
  coupleId?: string;
  coupleCode?: string;
}

/**
 * Represents an agreement made between the couple.
 */
export interface Agreement {
  id: string;
  text: string;
  createdAt: string;
  status: 'active' | 'broken';
  justification?: string;
}

/**
 * Represents an exchange or favor proposed between the couple.
 */
export interface ExchangeItem {
  id: string;
  title: string;
  description: string;
  type: 'romantico' | 'divertido' | 'picante' | 'ajuda';
  status: 'pending' | 'counter_proposed' | 'accepted' | 'completed';
  createdAt: string;
  authorName?: string;
  counterOffer?: string;
}

/**
 * Represents an item in a user's wishlist.
 */
export interface WishlistItem {
  id: string;
  link: string;
  title?: string;
  image?: string;
  createdAt: string;
}

/**
 * Represents a daily emotional check-in record.
 */
export interface CheckinHistoryItem {
  id: string;
  date: string;
  feeling: string;
  tags: string[];
  note: string;
}

/**
 * Represents the progress of the couple over a specific week.
 */
export interface WeeklyProgress {
  weekStarting: string;
  percentage: number;
}

/**
 * Represents an empathy message sent between the couple.
 */
export interface EmpathyMessage {
  id: string;
  text: string;
  vibe: 'fofo' | 'sincero' | 'engracado';
  createdAt: string;
  authorName?: string;
}

/**
 * Represents a planned date or outing.
 */
export interface NextDatePlan {
  title: string;
  description: string;
  location: string;
  photo: string;
  programType: 'pipoca' | 'restaurante' | 'parque' | 'experiencia' | 'outro';
  updatedAt: string;
}
