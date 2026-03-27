import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

// Contexts
import { useAuth } from '../context/AuthContext';

/**
 * Register Component
 * 
 * Handles new user registration, including partner code linking.
 * If a user registers without a partner code, they are given a code to share.
 * If they register with a partner code, they are linked immediately.
 * 
 * @returns {JSX.Element} The rendered Register page component.
 */
export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  
  // Generate a unique code for this user session if they don't have one
  // This fulfills the requirement: "o código de convite deve ser unico para cada usuário ao acessar"
  const [myInviteCode] = useState(() => {
    const saved = localStorage.getItem('my_invite_code');
    if (saved) return saved;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem('my_invite_code', result);
    return result;
  });
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerCode, setPartnerCode] = useState(searchParams.get('code') || '');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [registeredCode, setRegisteredCode] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles the registration form submission.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Pass the generated invite code to register if no partner code is provided
      // This ensures: "o mesmo código deve ser salvo no banco de dados"
      const newUser = await register(name, email, partnerCode, password, myInviteCode);
      
      // If no partner code was provided, show the generated code to share
      if (!partnerCode && newUser?.coupleCode) {
        // Clear the temporary code after successful registration
        localStorage.removeItem('my_invite_code');
        setRegisteredCode(newUser.coupleCode);
      } else {
        // If linked successfully, proceed to onboarding
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error("Full registration error:", err);
      // Map Supabase errors to user-friendly messages
      let message = err.message || 'Erro ao criar conta.';
      const errorMessage = message.toLowerCase();
      
      if (errorMessage.includes('failed to fetch') || errorMessage.includes('network error')) {
        message = 'Erro de conexão com o servidor. Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente ou sua conexão com a internet.';
      } else if (errorMessage.includes('user already registered') || err.code === 'user_already_exists') {
        message = 'Este e-mail já está cadastrado. Tente fazer login.';
      } else if (errorMessage.includes('password should be at least') || errorMessage.includes('password must be at least')) {
        message = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (errorMessage.includes('invalid login credentials')) {
        message = 'E-mail ou senha incorretos.';
      } else if (errorMessage.includes('email not confirmed')) {
        message = 'E-mail não confirmado. Verifique sua caixa de entrada.';
      } else if (errorMessage.includes('rate limit')) {
        message = 'Muitas tentativas. Tente novamente mais tarde.';
      } else if (errorMessage.includes('network')) {
        message = 'Erro de conexão. Verifique sua internet.';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If registration is successful and a code needs to be shared
  if (registeredCode) {
    const shareUrl = `${window.location.origin}/register?code=${registeredCode}`;
    const shareText = `Oi! Criei nossa conta no NaumDito. Acesse o app e use o código ${registeredCode} para nos conectarmos! Link: ${shareUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

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

  // Default Registration Form
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-background-dark overflow-hidden transition-colors duration-300 relative">
      
      {/* Mobile Background Image & Decoration */}
      <div className="md:hidden absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1080&auto=format&fit=crop" 
          alt="Couple" 
          className="w-full h-[55vh] object-cover opacity-80 dark:opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-main/40 via-slate-50/90 to-slate-50 dark:from-background-dark/60 dark:via-background-dark/90 dark:to-background-dark" />
        <div className="absolute top-[30%] right-[-10%] w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] rounded-full bg-primary/20 dark:bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-[50%] left-[-20%] w-[100vw] h-[100vw] max-w-[400px] max-h-[400px] rounded-full bg-peach-main/20 dark:bg-peach-main/10 blur-3xl pointer-events-none" />
      </div>

      {/* Left Side: Branding/Visual (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1920&auto=format&fit=crop" 
            alt="Background" 
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

      {/* Right Side: Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-20 min-h-screen md:min-h-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center mb-8 mt-6">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-navy-main dark:text-white flex size-10 items-center justify-center bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-full transition-colors z-20 backdrop-blur-md">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="size-20 rounded-[1.5rem] bg-white/20 dark:bg-slate-800/50 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center mb-4 shadow-2xl"
          >
            <img 
              alt="NaumDito Logo" 
              className="w-12 h-12 object-contain drop-shadow-lg" 
              src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-black text-white tracking-tight drop-shadow-md"
          >
            Crie sua conta
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 mt-1 font-medium text-sm drop-shadow-sm"
          >
            Comece sua jornada de conexão
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl md:backdrop-blur-none md:bg-transparent md:dark:bg-transparent rounded-[2.5rem] md:rounded-none p-8 shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] md:shadow-none border border-white/50 dark:border-white/10 md:border-none"
        >
          <div className="md:backdrop-blur-xl md:bg-white/80 md:dark:bg-white/5 md:border md:border-primary/10 md:dark:border-white/10 md:rounded-[2.5rem] md:p-10 md:shadow-2xl flex-1">
            <div className="flex items-center mb-6 hidden md:flex">
              <button onClick={() => navigate(-1)} className="text-navy-main dark:text-white flex size-10 items-center justify-center hover:bg-primary/10 dark:hover:bg-white/10 rounded-full transition-colors -ml-2">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>

            <div className="hidden md:flex flex-col items-center mb-8">
              <h1 className="text-3xl font-bold text-navy-main dark:text-white text-center tracking-tight">Crie sua conta</h1>
              <p className="text-slate-500 dark:text-slate-400 text-center mt-2">Comece sua jornada de conexão</p>
            </div>

            {/* Display the unique invite code */}
            <div className="mb-6 p-4 rounded-2xl bg-primary/5 dark:bg-peach-main/5 border border-primary/10 dark:border-peach-main/10 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Seu código de convite único</p>
              <p className="text-2xl font-black text-primary dark:text-peach-main tracking-[0.2em]">{myInviteCode}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Este será seu código para convidar seu parceiro(a).</p>
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

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest ml-2">Nome</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">person</span>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-peach-main/20 focus:border-primary dark:focus:border-peach-main transition-all font-medium" 
                  placeholder="Seu nome" 
                />
              </div>
            </div>

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
              <label className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest ml-2">Senha</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">lock</span>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-peach-main/20 focus:border-primary dark:focus:border-peach-main transition-all font-medium" 
                  placeholder="Crie uma senha forte" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest ml-2">Código do Parceiro (Opcional)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">group_add</span>
                <input 
                  type="text" 
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-peach-main/20 focus:border-primary dark:focus:border-peach-main transition-all uppercase font-medium" 
                  placeholder="Ex: A1B2C3" 
                  maxLength={6}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-2 font-medium">Se seu parceiro já tem conta, insira o código dele aqui.</p>
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
                  Criar conta
                  <span className="material-symbols-outlined">person_add</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Já tem uma conta? <Link to="/login" className="text-primary dark:text-peach-main font-bold hover:underline">Faça login</Link>
            </p>
          </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

