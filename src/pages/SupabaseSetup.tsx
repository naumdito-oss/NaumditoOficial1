import React, { useState } from 'react';
import { motion } from 'motion/react';

export function SupabaseSetup() {
  const [url, setUrl] = useState(localStorage.getItem('supabase_url') || '');
  const [key, setKey] = useState(localStorage.getItem('supabase_anon_key') || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configurar Supabase</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Insira as chaves do seu projeto Supabase para continuar.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase Anon Key
            </label>
            <input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary/30"
          >
            Salvar e Continuar
          </button>
        </form>
      </motion.div>
    </div>
  );
}
