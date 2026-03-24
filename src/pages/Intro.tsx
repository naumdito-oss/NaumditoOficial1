import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

// Contexts
import { useAuth } from '../context/AuthContext';

/**
 * Interface representing a slide in the intro carousel.
 */
interface IntroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  accent: string;
}

/**
 * Array of slides for the intro carousel.
 */
const slides: IntroSlide[] = [
  {
    id: 1,
    title: "Dê voz ao silêncio",
    description: "Conecte-se com o que não é dito e descubra uma nova forma de entender as emoções. Transformamos silêncio em conexão profunda.",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1920&auto=format&fit=crop",
    icon: "favorite",
    accent: "from-primary to-blue-600"
  },
  {
    id: 2,
    title: "Modo SOS & Tradutor",
    description: "Intervenções rápidas para momentos de crise e tradução de sentimentos baseada em Comunicação Não-Violenta.",
    image: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1920&auto=format&fit=crop",
    icon: "emergency_home",
    accent: "from-peach-500 to-orange-600"
  },
  {
    id: 3,
    title: "Gamificação do Amor",
    description: "Ganhe pontos ao realizar atividades juntos e troque por recompensas que celebram a jornada do casal.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1920&auto=format&fit=crop",
    icon: "stars",
    accent: "from-amber-400 to-orange-500"
  }
];

export function Intro() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true' || !!user?.profileData;
    if (isAuthenticated) {
      if (onboardingCompleted) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Background Image Section - Full screen on mobile, Left side on Desktop */}
      <div className="absolute inset-0 lg:relative lg:w-1/2 lg:h-screen z-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out">
          <img 
            key={currentSlide}
            src={slide.image} 
            alt="Background" 
            className="w-full h-full object-cover animate-fade-in"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-black/10 lg:bg-transparent"></div>
        
        {/* Logo Overlay for Desktop */}
        <div className="hidden lg:flex absolute top-12 left-12 items-center gap-3 z-20">
          <div className="size-12 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
            <img src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
          </div>
          <span className="text-navy-main dark:text-white font-black tracking-tighter text-2xl uppercase tracking-[0.2em]">NaumDito</span>
        </div>
      </div>

      {/* Content Container - Right side on Desktop */}
      <div className="relative z-10 w-full lg:w-1/2 max-w-2xl px-8 md:px-16 lg:px-24 flex flex-col h-screen py-12 lg:py-24 justify-between bg-white/50 dark:bg-background-dark/50 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none transition-colors duration-300">
        <div className="flex justify-between items-center lg:hidden">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-primary/20 dark:border-white/20 flex items-center justify-center overflow-hidden">
              <img src="https://lh3.googleusercontent.com/d/1dz6abenaA_8IjqSEOfxAiLvmtYyQUVQb" alt="Logo" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-navy-main dark:text-white font-bold tracking-tight text-xl">NaumDito</span>
          </div>
          <button onClick={handleSkip} className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-navy-main dark:hover:text-white transition-colors">
            Pular
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className={`size-20 rounded-[2rem] bg-gradient-to-br ${slide.accent} flex items-center justify-center shadow-2xl shadow-primary/40`}>
                <span className="material-symbols-outlined text-white text-4xl">{slide.icon}</span>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-navy-main dark:text-white leading-[0.9] tracking-tighter">
                  {slide.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-lg font-medium">
                  {slide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-12">
          {/* Pagination Dots */}
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 rounded-full transition-all duration-700 ${
                  index === currentSlide 
                    ? 'w-12 bg-primary shadow-[0_0_15px_rgba(123,143,214,0.5)]' 
                    : 'w-2 bg-slate-300 dark:bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex-1 h-20 rounded-3xl bg-navy-main dark:bg-white text-white dark:text-slate-950 font-black text-xl shadow-2xl hover:bg-navy-main/90 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-3 group"
            >
              {currentSlide === slides.length - 1 ? "Começar Agora" : "Próximo Passo"}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </motion.button>
            
            <button 
              onClick={handleSkip} 
              className="hidden lg:flex items-center justify-center px-8 h-20 rounded-3xl border border-slate-300 dark:border-white/10 text-navy-main dark:text-white font-black text-sm uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Pular Intro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
