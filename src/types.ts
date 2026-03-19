export interface User {
  name: string;
  email: string;
  partnerName?: string;
  photoUrl?: string;
  points: number;
  level: number;
  coupleId?: string;
  coupleCode?: string;
}

export interface Agreement {
  id: string;
  text: string;
  createdAt: string;
  status: 'active' | 'broken';
  justification?: string;
}

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

export interface WishlistItem {
  id: string;
  link: string;
  title?: string;
  image?: string;
  createdAt: string;
}

export interface CheckinHistoryItem {
  id: string;
  date: string;
  feeling: string;
  tags: string[];
  note: string;
}

export interface WeeklyProgress {
  weekStarting: string;
  percentage: number;
}

export interface EmpathyMessage {
  id: string;
  text: string;
  vibe: 'fofo' | 'sincero' | 'engracado';
  createdAt: string;
  authorName?: string;
}

export interface NextDatePlan {
  title: string;
  description: string;
  location: string;
  photo: string;
  programType: 'pipoca' | 'restaurante' | 'parque' | 'experiencia' | 'outro';
  updatedAt: string;
}
