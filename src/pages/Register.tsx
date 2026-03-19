import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerCode, setPartnerCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredCode, setRegisteredCode] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const newUser = await register(name, email, partnerCode);
      if (!partnerCode && newUser?.coupleCode) {
        setRegisteredCode(newUser.coupleCode);
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredCode) {
    const shareUrl = `${window.location.origin}/register?code=${registeredCode}`;
    const shareText = `Oi! Criei nossa conta no NaumDito. Acesse o app e use o código ${registeredCode} para nos conectarmos! Link: ${shareUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1920&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20 dark:opacity-40 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md px-6"
        >
          <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-primary/10 dark:border-white/20 rounded-3xl p-8 shadow-2xl text-center">
            <div className="size-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h2 className="text-2xl font-bold text-navy-main dark:text-white mb-2">Conta criada com sucesso!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Compartilhe este código com seu parceiro(a) para que ele(a) se conecte a você:
            </p>

            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-8">
              <div className="text-4xl font-black tracking-[0.2em] text-primary dark:text-peach-main">
                {registeredCode}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-bold text-lg shadow-xl shadow-[#25D366]/20 hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
              >
                <img src="https://www.svgrepo.com/show/475692/whatsapp-color.svg" alt="WhatsApp" className="w-6 h-6" />
                Compartilhar no WhatsApp
              </a>
              
              <button 
                onClick={() => navigate('/onboarding')}
                className="w-full h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
              >
                Continuar para o App
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1920&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 dark:opacity-40 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-peach-main/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-primary/10 dark:border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="text-navy-main dark:text-white flex size-10 items-center justify-center hover:bg-primary/10 dark:hover:bg-white/10 rounded-full transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-navy-main dark:text-white text-center tracking-tight">Crie sua conta</h1>
            <p className="text-slate-500 dark:text-slate-300 text-center mt-2 font-medium">Comece sua jornada de conexão</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-slate-500 dark:text-slate-200 text-xs font-bold uppercase tracking-widest ml-1">Nome</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                  placeholder="Seu nome" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-500 dark:text-slate-200 text-xs font-bold uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-500 dark:text-slate-200 text-xs font-bold uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                  placeholder="Crie uma senha forte" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-500 dark:text-slate-200 text-xs font-bold uppercase tracking-widest ml-1">Código do Parceiro (Opcional)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">group_add</span>
                <input 
                  type="text" 
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase" 
                  placeholder="Ex: A1B2C3" 
                  maxLength={6}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">Se seu parceiro já tem conta, insira o código dele aqui.</p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 mt-2 rounded-2xl bg-gradient-to-r from-primary to-peach-main text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Criando...' : 'Criar conta'}
              <span className="material-symbols-outlined">person_add</span>
            </motion.button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Faça login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
