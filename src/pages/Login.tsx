import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300">
      {/* Left Side: Branding/Visual (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1920&auto=format&fit=crop" 
            alt="Couple" 
            className="w-full h-full object-cover opacity-30 dark:opacity-50 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80"></div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="size-24 rounded-3xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-primary/20 dark:border-white/20 flex items-center justify-center mb-8 shadow-2xl">
              <img alt="NaumDito Logo" className="w-16 h-16 object-contain" src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" referrerPolicy="no-referrer"/>
            </div>
            <h1 className="text-6xl font-black text-navy-main dark:text-white leading-tight tracking-tighter mb-6">
              Onde o silêncio <br />
              <span className="text-primary dark:text-peach-main">encontra a voz.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Transforme sua comunicação e fortaleça sua conexão emocional com ferramentas baseadas em psicologia e empatia.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Background for mobile */}
        <div className="md:hidden absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1080&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-10 dark:opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-background-light/90 dark:bg-background-dark/90"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="size-16 rounded-2xl bg-primary/10 dark:bg-peach-main/20 border border-primary/20 dark:border-peach-main/30 flex items-center justify-center mb-4">
              <img alt="NaumDito Logo" className="w-10 h-10 object-contain" src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" referrerPolicy="no-referrer"/>
            </div>
            <h2 className="text-3xl font-bold text-navy-main dark:text-white tracking-tight">NaumDito</h2>
          </div>

          <div className="backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-navy-main dark:text-white tracking-tight">Entrar</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Acesse sua conta para continuar.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">mail</span>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-peach-main/50 focus:border-primary dark:focus:border-peach-main transition-all" 
                    placeholder="seu@email.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Senha</label>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">lock</span>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-peach-main/50 focus:border-primary dark:focus:border-peach-main transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 mt-2 rounded-2xl bg-primary dark:bg-peach-main text-white dark:text-slate-950 font-bold text-lg shadow-xl shadow-primary/20 dark:shadow-peach-main/20 hover:bg-primary-light dark:hover:bg-peach-light transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Não tem uma conta? <Link to="/register" className="text-primary font-bold hover:underline">Cadastre-se</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
