import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  // Initialize dark mode state based on document class
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Configurações</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full opacity-0">
            <span className="material-symbols-outlined">info</span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 space-y-8">
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

          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Preferências</h3>
            
            <div className="space-y-4">
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
        </main>
      </div>
    </div>
  );
}
