import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

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
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-background-dark overflow-hidden transition-colors duration-300 relative p-6">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[120vw] h-[120vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl" />
        <div className="absolute top-[20%] left-[-20%] w-[100vw] h-[100vw] max-w-[400px] max-h-[400px] rounded-full bg-peach-main/10 dark:bg-peach-main/5 blur-3xl" />
      </div>

      <div className="relative z-20 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <button onClick={() => navigate(-1)} className="absolute top-0 left-0 text-navy-main dark:text-white flex size-10 items-center justify-center bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-full transition-colors z-20 backdrop-blur-md">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="size-20 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-primary/10 dark:border-white/5 flex items-center justify-center mb-6 shadow-xl shadow-primary/5 mt-12"
          >
            <span className="material-symbols-outlined text-4xl text-primary dark:text-peach-main">lock_reset</span>
          </motion.div>
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-black text-navy-main dark:text-white tracking-tight text-center"
          >
            Recuperar senha
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-center"
          >
            Digite seu e-mail para receber as instruções de redefinição.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-white/5"
        >
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest ml-2">E-mail</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-peach-main transition-colors">mail</span>
                <input 
                  type="email" 
                  required 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-navy-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-peach-main/20 focus:border-primary dark:focus:border-peach-main transition-all font-medium" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full h-14 mt-4 rounded-2xl bg-primary dark:bg-peach-main text-white dark:text-slate-900 font-bold text-lg shadow-lg shadow-primary/20 dark:shadow-peach-main/20 hover:bg-primary-light dark:hover:bg-peach-light transition-all flex items-center justify-center gap-2"
            >
              Enviar instruções
              <span className="material-symbols-outlined">send</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
