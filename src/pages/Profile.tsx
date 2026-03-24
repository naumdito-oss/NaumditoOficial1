import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Components
import { BottomNav } from '../components/layout/BottomNav';
import { ConfirmModal } from '../components/common/ConfirmModal';

// Contexts
import { useAuth } from '../context/AuthContext';

/**
 * Profile Page Component
 * 
 * Displays user information, allows photo updates, and provides navigation
 * to settings, notifications, privacy, integrations, and logout.
 * 
 * @returns {JSX.Element} The rendered Profile component.
 */
export function Profile() {
  const navigate = useNavigate();
  const { user, logout, updatePhoto } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Handles user logout and redirects to the landing page.
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Opens the logout confirmation modal.
   */
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  /**
   * Copies the couple code to the clipboard.
   */
  const handleCopyCode = () => {
    if (user?.coupleCode) {
      navigator.clipboard.writeText(user.coupleCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  /**
   * Triggers the hidden file input click event.
   */
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles the file selection event, reads the image as a base64 string,
   * and updates the user's profile photo.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updatePhoto(file);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        
        {/* Header */}
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Perfil</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full opacity-0">
            <span className="material-symbols-outlined">info</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 py-12 space-y-12">
          
          {/* User Info Section */}
          <div className="flex flex-col items-center text-center">
            <div className="size-32 md:size-40 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative group overflow-hidden cursor-pointer" onClick={handlePhotoClick}>
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="material-symbols-outlined text-6xl md:text-7xl text-primary">person</span>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">edit</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex items-center gap-2 group cursor-pointer">
              <h2 className="text-3xl font-black text-navy-main dark:text-slate-100 tracking-tight">{user?.name || 'Usuário'}</h2>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity text-xl">edit</span>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">{user?.email || 'usuario@email.com'}</p>
            
            {/* Partner Code Display */}
            {user?.coupleCode && (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Seu Código de Parceiro</p>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-primary/10 shadow-sm relative">
                  <span className="font-mono text-xl font-black text-primary tracking-widest">{user.coupleCode}</span>
                  <button 
                    onClick={handleCopyCode}
                    className={`size-8 rounded-full flex items-center justify-center transition-colors ${copySuccess ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{copySuccess ? 'check' : 'content_copy'}</span>
                  </button>
                  {copySuccess && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md animate-in fade-in slide-in-from-bottom-1">
                      Copiado!
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs">Compartilhe este código com seu parceiro(a) para vincular as contas.</p>
              </div>
            )}
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/settings')}
              className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <span className="font-black text-navy-main dark:text-slate-200 uppercase tracking-widest text-xs">Configurações</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            
            <button 
              onClick={() => navigate('/notifications')}
              className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group relative"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform relative">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-2 right-2 size-2 bg-peach-main rounded-full border border-white dark:border-slate-800"></span>
                </div>
                <span className="font-black text-navy-main dark:text-slate-200 uppercase tracking-widest text-xs">Notificações</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button 
              onClick={() => navigate('/privacy')}
              className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-peach-main/10 flex items-center justify-center text-peach-main group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <span className="font-black text-navy-main dark:text-slate-200 uppercase tracking-widest text-xs">Privacidade</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button onClick={() => navigate('/integrations')} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <span className="font-black text-navy-main dark:text-slate-200 uppercase tracking-widest text-xs">Integrações & APIs</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button onClick={openLogoutModal} className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group">
              <div className="flex items-center gap-4 text-red-600 dark:text-red-400">
                <div className="size-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <span className="font-black uppercase tracking-widest text-xs">Sair da conta</span>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">logout</span>
            </button>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sair da Conta"
        message="Tem certeza que deseja sair da sua conta?"
        confirmText="Sair"
        type="danger"
      />

      <BottomNav />
    </div>
  );
}
