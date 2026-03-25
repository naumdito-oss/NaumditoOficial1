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
  const { login, isAuthenticated, loading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home or onboarding if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
      if (onboardingCompleted) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, loading, navigate]);

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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-background-dark overflow-hidden transition-colors duration-300 relative">
      
      {/* Mobile Background Image & Decoration */}
      <div className="md:hidden absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1080&auto=format&fit=crop" 
          alt="Couple" 
          className="w-full h-full object-cover opacity-80 dark:opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-main/60 via-navy-main/40 to-slate-50 dark:from-background-dark/80 dark:via-background-dark/60 dark:to-background-dark" />
      </div>

      {/* Left Side: Branding/Visual (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1920&auto=format&fit=crop" 
            alt="Couple" 
            className="w-full h-full object-cover opacity-30 dark:opacity-50 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-background-dark dark:via-background-dark/80" />
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

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-20 min-h-screen md:min-h-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center mb-10 mt-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="size-24 rounded-[2rem] bg-white/20 dark:bg-slate-800/50 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center mb-6 shadow-2xl"
          >
            <img 
              alt="NaumDito Logo" 
              className="w-14 h-14 object-contain drop-shadow-lg" 
              src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-black text-white tracking-tight drop-shadow-md"
          >
            Bem-vindo de volta
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 mt-2 font-medium drop-shadow-sm"
          >
            Acesse sua conta para continuar
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl md:backdrop-blur-none md:bg-transparent md:dark:bg-transparent rounded-[2.5rem] md:rounded-none p-8 shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] md:shadow-none border border-white/50 dark:border-white/10 md:border-none"
        >
          <div className="md:backdrop-blur-xl md:bg-white/80 md:dark:bg-white/5 md:border md:border-primary/10 md:dark:border-white/10 md:rounded-[2.5rem] md:p-10 md:shadow-2xl flex-1">
            <div className="mb-8 hidden md:block">
              <h1 className="text-3xl font-bold text-navy-main dark:text-white tracking-tight">Entrar</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Acesse sua conta para continuar.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest ml-2">E-mail</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">mail</span>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-peach-main/20 focus:border-primary dark:focus:border-peach-main transition-all font-medium" 
                    placeholder="seu@email.com" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-2">
                  <label className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest">Senha</label>
                  <Link to="/forgot-password" className="text-[11px] font-bold text-primary dark:text-peach-main hover:underline">Esqueceu?</Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">lock</span>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-peach-main/20 focus:border-primary dark:focus:border-peach-main transition-all font-medium" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 mt-4 rounded-2xl bg-primary dark:bg-peach-main text-white dark:text-slate-900 font-bold text-lg shadow-lg shadow-primary/20 dark:shadow-peach-main/20 hover:bg-primary-light dark:hover:bg-peach-light transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    Entrar
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Não tem uma conta? <Link to="/register" className="text-primary dark:text-peach-main font-bold hover:underline">Cadastre-se</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

