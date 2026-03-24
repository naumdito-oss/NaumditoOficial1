import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Components
import { BottomNav } from '../components/BottomNav';
import { ConfirmModal } from '../components/ConfirmModal';

// Contexts
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

/**
 * Surprise page component.
 * Allows users to manage a wishlist and view upcoming special dates.
 */
export function Surprise() {
  const navigate = useNavigate();
  const { user, partner } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useData();
  const [newLink, setNewLink] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddToWishlist = () => {
    if (newLink && newLink.trim()) {
      addToWishlist(newLink.trim());
      setNewLink('');
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeFromWishlist(itemToDelete);
      setItemToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
        <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md py-6 justify-between border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="text-navy-main dark:text-slate-100 flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-primary/5 cursor-pointer transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h1 className="text-navy-main dark:text-slate-100 text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center pr-10 uppercase tracking-widest">Surpreenda</h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Wishlist */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-peach-main/10 text-peach-main">
                  <span className="material-symbols-outlined text-2xl">favorite</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-navy-main dark:text-slate-100 tracking-tight">Minha Wishlist</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Coisas que eu adoraria ganhar</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
                <label className="flex flex-col w-full mb-6">
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-3 ml-1">Link do desejo</p>
                  <div className="flex w-full items-stretch rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus-within:ring-2 focus-within:ring-peach-main/20 transition-all">
                    <input 
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      className="flex-1 border-none bg-transparent focus:ring-0 text-navy-main dark:text-slate-100 placeholder:text-slate-400 text-base h-14 px-6 outline-none" 
                      placeholder="Cole a URL do produto aqui..."
                    />
                    <div className="flex items-center px-6 text-peach-main">
                      <span className="material-symbols-outlined">link</span>
                    </div>
                  </div>
                </label>
                <button 
                  onClick={handleAddToWishlist}
                  disabled={!newLink.trim()}
                  className="w-full bg-navy-main text-white font-bold h-14 rounded-2xl shadow-xl shadow-navy-main/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-navy-main/90 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[24px]">add_circle</span>
                  Adicionar à Wishlist
                </button>
              </div>
            </section>

            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {wishlist.length === 0 ? (
                  <div className="col-span-full text-center bg-white dark:bg-slate-900/20 rounded-[2.5rem] p-12 border border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4">shopping_bag</span>
                    <p className="text-slate-500">Sua wishlist está vazia.</p>
                  </div>
                ) : (
                  wishlist.map((item) => {
                    const isMine = item.authorId === user?.id;
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={item.id} 
                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all relative overflow-hidden"
                      >
                        <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-white/5">
                          {item.image ? (
                            <img className="h-full w-full object-cover" src={item.image} alt={item.title} referrerPolicy="no-referrer" />
                          ) : (
                            <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isMine ? 'bg-peach-main/10 text-peach-main' : 'bg-primary/10 text-primary'}`}>
                              {isMine ? 'Minha Escolha' : `Escolha de ${partner?.name || 'Parceiro'}`}
                            </span>
                          </div>
                          <h3 className="text-navy-main dark:text-slate-100 font-bold text-base truncate">{item.title || 'Novo Item'}</h3>
                          <p className="text-slate-500 text-xs truncate font-medium">{item.link}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={item.link.startsWith('http') ? item.link : `https://${item.link}`} target="_blank" rel="noopener noreferrer" className="size-10 flex items-center justify-center rounded-full bg-peach-main/10 text-peach-main hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                          </a>
                          <button onClick={() => openDeleteModal(item.id)} className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Dates & Inspiration */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">calendar_month</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-navy-main dark:text-slate-100 tracking-tight">Datas Especiais</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Não deixe passar em branco</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {(() => {
                  const allDates = [
                    ...(user?.metadata?.specialDates || []),
                    ...(partner?.metadata?.specialDates || [])
                  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // Unique by ID

                  if (allDates.length === 0) {
                    return (
                      <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-slate-500 text-sm">Nenhuma data especial cadastrada ainda.</p>
                      </div>
                    );
                  }

                  return allDates.map((date, idx) => {
                    const eventDate = new Date(date.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Calculate next occurrence
                    const nextOccurrence = new Date(today.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                    if (nextOccurrence < today) {
                      nextOccurrence.setFullYear(today.getFullYear() + 1);
                    }
                    
                    const diffTime = Math.abs(nextOccurrence.getTime() - today.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    const countdownText = diffDays === 0 ? "É HOJE!" : `Em ${diffDays} dias`;
                    const formattedDate = eventDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

                    return (
                      <div key={date.id || idx} className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
                        <div className={`size-14 rounded-2xl flex items-center justify-center ${idx % 2 === 0 ? 'text-peach-main bg-peach-main/10' : 'text-primary bg-primary/10'} group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined text-2xl">
                            {date.label.toLowerCase().includes('viagem') ? 'flight' : 
                             date.label.toLowerCase().includes('beijo') ? 'favorite' : 
                             date.label.toLowerCase().includes('casamento') ? 'celebration' : 'event'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-navy-main dark:text-slate-100 font-bold text-base">{date.label}</h3>
                          <p className="text-slate-500 text-xs font-medium">{formattedDate}</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">{countdownText}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-500">
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-navy-main dark:text-slate-100 tracking-tight">Inspirações</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Dicas personalizadas</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-peach-main bg-peach-main/10 px-3 py-1 rounded-full uppercase tracking-widest">Toque Físico</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    title: "Jantar Romântico", 
                    tag: "Encontro", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpkQ4IOUnZ-MT-Cj5WuC5AFKEltR8d0IiSL73Y3rsyGRnl76rVPh_rSv6oykWH9ZBbTmTn1_6P2TmNtNzVn6FLnbQsVf_rNP6GHWuKGwjYMNYJ_8CeDacQHpenzdYS3961Cx4FA1EKm9LuBc5cHLP6pvRRa_OGojMaeBQi3o5rKlbzW8mBU0u7GEftNqq_rFFOc4D-akKCCB0-wW8Jf4ebOmPyUzvdopRr-hfSwr8ZHED6fZxnpw9bXiIrH9ojw4evMS3D888QqdhN",
                    link: "https://www.tripadvisor.com.br/Restaurants-g303631-Sao_Paulo_State_of_Sao_Paulo.html"
                  },
                  { 
                    title: "Kit de Massagem", 
                    tag: "Presente", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIsmJrjfQEFItkiSCZKjorfFWqb_WrdfV51q6eEV0LbZs41qWnDwxPRdfhFpo_Smaw-CzuILM6LZfzuwjStSgHwr3SM-0TYlIVxzraRwkiFpDS4bl4QGbZRaOkEaYoYdQA2m9BZafD5CcEU42JGloVpCEQgIsZ8UgHQbh3zN2zf10k9zvxfy8D4mHTzPrPXRWR87SYEEIbGGrocgaUUDM0ZjgAvGf5_37LdwsBxxJr3hEdP-WL8p45I4OIlfv4E4GFaFFUo_vdaHuq",
                    link: "https://www.amazon.com.br/s?k=kit+massagem+relaxante"
                  }
                ].map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative h-64 rounded-[2rem] overflow-hidden shadow-lg group block"
                  >
                    <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.img} referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-main/90 via-navy-main/20 to-transparent"></div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <span className="text-[10px] font-black text-white bg-peach-main px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-1">{item.tag}</span>
                      <h4 className="text-white font-bold text-sm leading-tight">{item.title}</h4>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Item"
        message="Tem certeza que deseja remover este item da sua wishlist?"
        confirmText="Remover"
        type="danger"
      />

      <BottomNav />
    </div>
  );
}
