import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Components
import { BottomNav } from '../components/layout/BottomNav';

// Types
interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  keyName: string;
}

// Constants
const INTEGRATIONS: Integration[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'music_note',
    description: 'Sincronize suas playlists de casal e trilha sonora.',
    color: 'bg-[#1DB954]/10 text-[#1DB954]',
    keyName: 'Client ID / Secret'
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: 'calendar_month',
    description: 'Importe datas especiais e eventos automaticamente.',
    color: 'bg-blue-100 text-blue-600',
    keyName: 'API Key / OAuth'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: 'chat',
    description: 'Envie alertas SOS e lembretes via WhatsApp.',
    color: 'bg-peach-100 text-peach-600',
    keyName: 'API Token / Instance ID'
  },
  {
    id: 'custom',
    name: 'API Customizada',
    icon: 'api',
    description: 'Conecte qualquer outro serviço via Webhook ou REST.',
    color: 'bg-purple-100 text-purple-600',
    keyName: 'Endpoint URL / Auth Token'
  }
];

/**
 * Integrations Page Component
 * 
 * Allows users to configure and manage third-party API integrations
 * (e.g., Spotify, Google Calendar, WhatsApp).
 * 
 * @returns {JSX.Element} The rendered Integrations component.
 */
export function Integrations() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('naumdito_api_keys');
      if (savedKeys) {
        setKeys(JSON.parse(savedKeys));
      }
    } catch (e) {
      console.error('Error parsing api keys:', e);
    }
  }, []);

  const handleSave = () => {
    if (editingId) {
      const newKeys = { ...keys, [editingId]: tempKey };
      setKeys(newKeys);
      localStorage.setItem('naumdito_api_keys', JSON.stringify(newKeys));
      setEditingId(null);
      setTempKey('');
    }
  };

  const startEditing = (integration: Integration) => {
    setEditingId(integration.id);
    setTempKey(keys[integration.id] || '');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Integrações & APIs</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full opacity-0">
            <span className="material-symbols-outlined">info</span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-8 space-y-8">
          <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-navy-main dark:text-slate-100 uppercase tracking-widest mb-1">Central de Conexões</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Conecte o NaumDito aos seus aplicativos favoritos para automatizar sua rotina e trazer mais inteligência para a relação.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {INTEGRATIONS.map((integration) => (
              <div 
                key={integration.id}
                className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center ${integration.color} shrink-0`}>
                    <span className="material-symbols-outlined text-3xl">{integration.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-navy-main dark:text-slate-100 text-base uppercase tracking-widest">{integration.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{integration.description}</p>
                    {keys[integration.id] && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-peach-main bg-peach-main/10 px-2 py-0.5 rounded-full w-fit">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        CONECTADO
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {editingId === integration.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="password"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder={integration.keyName}
                        className="flex-1 h-12 px-4 rounded-xl border border-primary/20 bg-slate-50 dark:bg-white/5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                        autoFocus
                      />
                      <button 
                        onClick={handleSave}
                        className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        <span className="material-symbols-outlined">save</span>
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="size-12 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startEditing(integration)}
                      className="w-full md:w-fit px-6 h-12 rounded-xl bg-navy-main text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-navy-main/20 hover:bg-navy-main/90 transition-all flex items-center justify-center gap-2"
                    >
                      {keys[integration.id] ? 'Editar Chave' : 'Configurar'}
                      <span className="material-symbols-outlined text-sm">key</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-blue-500">security</span>
              <div>
                <h4 className="font-black text-blue-900 dark:text-blue-100 text-xs uppercase tracking-widest mb-1">Segurança de Dados</h4>
                <p className="text-[11px] text-slate-600 dark:text-blue-200 font-medium leading-relaxed">
                  Suas chaves de API são armazenadas localmente e criptografadas. O NaumDito nunca compartilha suas credenciais com terceiros sem sua autorização explícita.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
