import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '../hooks/useTheme';

/**
 * Settings Page Component
 * 
 * Allows the user to configure app preferences such as dark mode,
 * push notifications, and app sounds.
 * 
 * @returns {JSX.Element} The rendered Settings component.
 */
export function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Preferences State
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  const darkMode = theme === 'dark';
  const toggleDarkMode = toggleTheme;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        
        {/* Header */}
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Configurações</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full opacity-0">
            <span className="material-symbols-outlined">info</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 py-6 space-y-6">
          
          {/* Profile & Onboarding Section */}
          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Perfil e Onboarding</h3>
            
            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Editar Perfil Completo</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Refazer o onboarding e atualizar dados</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </section>

          {/* Appearance Section */}
          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Aparência</h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{darkMode ? 'dark_mode' : 'light_mode'}</span>
                </div>
                <div>
                  <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Modo Escuro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tema escuro para a interface</p>
                </div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-peach-main' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`size-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Preferências</h3>
            
            <div className="space-y-4">
              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">notifications_active</span>
                  </div>
                  <div>
                    <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Notificações Push</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receber alertas no dispositivo</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-peach-main' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`size-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* App Sounds Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">volume_up</span>
                  </div>
                  <div>
                    <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Sons do App</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Efeitos sonoros em ações</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSound(!sound)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${sound ? 'bg-peach-main' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`size-4 rounded-full bg-white transition-transform ${sound ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </section>

          {/* Privacy & Security Section */}
          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Privacidade e Segurança</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">policy</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Termos de Uso</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Política de Privacidade</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          {/* Account Section */}
          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Conta</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined">logout</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Sair da Conta</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined">delete_forever</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-600 text-sm">Excluir Minha Conta</p>
                    <p className="text-[10px] text-red-500/70">Esta ação é irreversível</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-red-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          {/* About Section */}
          <div className="text-center py-8">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">NaumDito v1.0.0</p>
            <p className="text-[10px] text-slate-400 mt-1">Feito com ❤️ para casais</p>
          </div>

        </main>
      </div>
    </div>
  );
}
