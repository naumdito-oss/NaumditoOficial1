export const STORAGE_KEYS = {
  USER: 'naumdito_user',
  DATA: 'naumdito_data',
  CURRENT_DAY_START: 'naumdito_current_day_start',
  CURRENT_WEEK_START: 'naumdito_current_week_start',
  CURRENT_WEEK_PROGRESS: 'naumdito_current_week_progress',
};

export const EMPATHY_VIBES = [
  { id: 'fofo', label: 'Fofo', icon: 'favorite', color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' },
  { id: 'sincero', label: 'Sincero', icon: 'volunteer_activism', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  { id: 'engracado', label: 'Engraçado', icon: 'sentiment_very_satisfied', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' }
];
export const EXCHANGE_TYPES = ['romantico', 'divertido', 'picante', 'ajuda'] as const;

export const CHECKIN_FEELINGS = [
  { icon: '😊', label: 'Feliz', id: 'happy' },
  { icon: '😌', label: 'Calmo(a)', id: 'calm' },
  { icon: '😴', label: 'Cansado(a)', id: 'tired' },
  { icon: '😤', label: 'Irritado(a)', id: 'angry' },
  { icon: '😔', label: 'Triste', id: 'sad' }
];

export const CHECKIN_TAGS = [
  'Estresse no trabalho',
  'Falta de sono',
  'Saudade de você',
  'Produtivo(a)',
  'Saúde',
  'Família',
  'Finanças',
  'Lazer'
];

export const PROGRAM_ICONS = {
  pipoca: { icon: 'movie', label: 'Cinema em Casa', color: 'bg-amber-100 text-amber-500 dark:bg-amber-900/30' },
  restaurante: { icon: 'restaurant', label: 'Restaurantes', color: 'bg-rose-100 text-rose-500 dark:bg-rose-900/30' },
  parque: { icon: 'park', label: 'Passeios ao Ar Livre', color: 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30' },
  experiencia: { icon: 'explore', label: 'Experiências Novas', color: 'bg-purple-100 text-purple-500 dark:bg-purple-900/30' },
  outro: { icon: 'celebration', label: 'Outro', color: 'bg-slate-100 text-slate-500 dark:bg-slate-900/30' }
};
export const HOME_TOOLS = [
  { to: "/agreements", icon: "handshake", label: "Combinados", color: "bg-primary/10 text-primary" },
  { to: "/sos", icon: "emergency_home", label: "Central SOS", color: "bg-red-100 text-red-500" },
  { to: "/exchanges", icon: "swap_horiz", label: "Permutas", color: "bg-peach-main/10 text-peach-main" },
  { to: "/surprise", icon: "redeem", label: "Surpreenda", color: "bg-amber-100 text-amber-500" },
  { to: "/empathy-box", icon: "mail", label: "Desculpas", color: "bg-pink-100 text-pink-500" },
  { to: "/next-date", icon: "event_available", label: "Saia da Rotina", color: "bg-indigo-100 text-indigo-500" }
];
