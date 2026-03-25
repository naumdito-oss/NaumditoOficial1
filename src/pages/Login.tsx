import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Contexts
import { useAuth } from '../context/AuthContext';

const translateAuthError = (msg: string) => {
  if (!msg) return 'Ocorreu um erro inesperado. Tente novamente.';
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (lowerMsg.includes('user already registered')) return 'Este e-mail já está cadastrado. Tente fazer login.';
  if (lowerMsg.includes('password should be at least') || lowerMsg.includes('password must be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (lowerMsg.includes('email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  if (lowerMsg.includes('rate limit')) return 'Muitas tentativas. Tente novamente mais tarde.';
  if (lowerMsg.includes('network')) return 'Erro de conexão. Verifique sua internet.';
  
  // Se já estiver em português (lançado pelo AuthContext) ou não for um erro conhecido do Supabase, retorna a mensagem original
  return msg;
};

/**
 * Login page component.
 * Allows users to authenticate using their email and password.
 * Provides a responsive layout with branding on desktop and a focused form on mobile.
 */
export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home or onboarding if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
      if (onboardingCompleted) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles the login form submission.
   * Authenticates the user and redirects to the home page or onboarding on success.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
      if (onboardingCompleted) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(translateAuthError(err.message));
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
          <div className="absolute inset-0 bg-gradient-to-r from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="size-24 rounded-3xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-primary/20 dark:border-white/20 flex items-center justify-center mb-8 shadow-2xl">
              <img 
                alt="NaumDito Logo" 
                className="w-16 h-16 object-contain" 
                src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" 
                referrerPolicy="no-referrer"
              />
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

      {/* Mobile Top Section (Mobile Only) */}
      <div className="md:hidden relative h-[35vh] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1080&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-60 dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary dark:from-background-dark/80 dark:to-background-dark" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="size-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-xl">
            <img 
              alt="NaumDito Logo" 
              className="w-12 h-12 object-contain" 
              src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">NaumDito</h2>
          <p className="text-white/80 mt-1 font-medium">Conectando corações</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-start md:items-center justify-center p-0 md:p-12 relative -mt-6 md:mt-0 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white dark:bg-background-dark md:bg-transparent md:dark:bg-transparent rounded-t-[2rem] md:rounded-none p-8 md:p-10 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] md:shadow-none min-h-[65vh] md:min-h-0 flex flex-col"
        >
          <div className="md:backdrop-blur-xl md:bg-white/80 md:dark:bg-white/5 md:border md:border-primary/10 md:dark:border-white/10 md:rounded-[2rem] md:p-10 md:shadow-2xl flex-1">
            <div className="mb-8 hidden md:block">
              <h1 className="text-3xl font-bold text-navy-main dark:text-white tracking-tight">Entrar</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Acesse sua conta para continuar.</p>
            </div>
            
            <div className="mb-8 md:hidden text-center">
              <h1 className="text-2xl font-bold text-navy-main dark:text-white tracking-tight">Bem-vindo de volta</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Acesse sua conta para continuar.</p>
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

