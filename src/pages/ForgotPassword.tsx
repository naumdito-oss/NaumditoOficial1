import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Forgot Password Page Component
 * 
 * Allows users to request a password reset link by providing their email address.
 * 
 * @returns {JSX.Element} The rendered ForgotPassword component.
 */
export function ForgotPassword() {
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Instruções enviadas para o seu e-mail!');
    navigate('/');
  };

  return (
    <div className="relative flex min-h-screen w-full max-w-lg mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden p-6 transition-colors duration-300">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors -ml-3">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <h1 className="text-3xl font-bold text-navy mb-2">Recuperar senha</h1>
        <p className="text-slate-500 mb-8">Digite seu e-mail para receber as instruções de redefinição de senha.</p>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">E-mail</span>
            <input type="email" required className="form-input w-full rounded-xl border-primary/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary h-14 px-4 text-base transition-all" placeholder="seu@email.com" />
          </label>

          <button type="submit" className="w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-navy-main/20 transition-all flex items-center justify-center gap-2 mt-4 bg-navy-main hover:bg-navy-main/90">
            Enviar instruções
          </button>
        </form>
      </div>
    </div>
  );
}
