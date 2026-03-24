import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Contexts
import { useData } from '../context/DataContext';

// Constants
import { CHECKIN_FEELINGS, CHECKIN_TAGS } from '../constants';

/**
 * Checkin page component.
 * Allows users to log their daily feelings and tags, and view a summary of their recent check-ins.
 */
export function Checkin() {
  const navigate = useNavigate();
  const { completeCheckin, checkinHistory } = useData();
  
  // Form state
  const [feeling, setFeeling] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Calculates a weekly summary based on the user's check-in history.
   * Analyzes the most frequent feeling and tags over the last 7 days.
   * 
   * @returns {Object|null} The summary object containing text, tips, icon, color, top tags, and count, or null if no history.
   */
  const getWeeklySummary = () => {
    if (!checkinHistory || checkinHistory.length === 0) return null;

    // Get checkins from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentCheckins = checkinHistory.filter(item => new Date(item.date) >= oneWeekAgo);
    
    if (recentCheckins.length === 0) return null;

    const feelingCounts = recentCheckins.reduce((acc, curr) => {
      acc[curr.feeling] = (acc[curr.feeling] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find the most frequent feeling
    let dominantFeeling = '';
    let maxCount = 0;
    Object.entries(feelingCounts).forEach(([feeling, count]: [string, number]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantFeeling = feeling;
      }
    });

    let summaryText = '';
    let supportTip = '';
    let icon = '';
    let color = '';

    switch (dominantFeeling) {
      case 'tired':
        summaryText = 'A semana tem sido cansativa.';
        supportTip = 'Que tal preparar o jantar hoje ou assumir uma tarefa da casa para que seu par possa descansar?';
        icon = 'bedtime';
        color = 'bg-indigo-100 text-indigo-500';
        break;
      case 'sad':
        summaryText = 'A semana tem sido difícil.';
        supportTip = 'Um abraço apertado e ouvidos atentos podem fazer toda a diferença hoje. Seja presente.';
        icon = 'volunteer_activism';
        color = 'bg-blue-100 text-blue-500';
        break;
      case 'angry':
        summaryText = 'A semana tem sido estressante.';
        supportTip = 'Evite discussões sobre temas difíceis hoje. Ofereça uma massagem ou um momento de relaxamento.';
        icon = 'spa';
        color = 'bg-red-100 text-red-500';
        break;
      case 'calm':
        summaryText = 'A semana tem sido tranquila.';
        supportTip = 'Ótimo momento para uma conversa de qualidade ou para planejarem algo juntos para o fim de semana.';
        icon = 'self_improvement';
        color = 'bg-teal-100 text-teal-500';
        break;
      case 'happy':
      default:
        summaryText = 'A semana tem sido muito positiva!';
        supportTip = 'Aproveitem essa energia boa! Que tal saírem para comemorar ou fazerem uma atividade divertida juntos?';
        icon = 'celebration';
        color = 'bg-amber-100 text-amber-500';
        break;
    }

    // Collect common tags
    const allTags = recentCheckins.flatMap(c => c.tags || []);
    const tagCounts = allTags.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTags = Object.entries(tagCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 2)
      .map(t => t[0]);

    return { summaryText, supportTip, icon, color, topTags, count: recentCheckins.length };
  };

  const summary = getWeeklySummary();

  /**
   * Handles saving the check-in data.
   * Validates that a feeling is selected before completing the check-in.
   */
  const handleSave = () => {
    if (!feeling) {
      return;
    }
    
    completeCheckin(feeling, tags, note);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/home');
    }, 2000);
  };

  /**
   * Toggles a tag in the selected tags list.
   * 
   * @param {string} tag - The tag to toggle.
   */
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Check-in Diário</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors opacity-0">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">info</span>
          </div>
        </header>

        {showSuccess && (
          <div className="mx-4 md:mx-8 mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="font-bold">Check-in salvo com sucesso! +50 pontos</p>
          </div>
        )}

        <main className="flex-1 px-4 md:px-8 py-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Feelings */}
            <section className="lg:col-span-7 space-y-8">
              <div className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-navy-main dark:text-slate-100 tracking-tight mb-2">Como você está se sentindo?</h2>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Seu par verá isso para te apoiar melhor</p>
                </div>

                <div className="grid grid-cols-5 gap-3 md:gap-6 mb-8">
                  {CHECKIN_FEELINGS.map((item) => (
                    <div key={item.id} className="flex flex-col items-center gap-3">
                      <button 
                        onClick={() => setFeeling(item.id)}
                        className={`w-full aspect-square rounded-2xl md:rounded-3xl flex items-center justify-center border-2 transition-all ${
                          feeling === item.id 
                            ? 'bg-peach-main/10 border-peach-main shadow-lg shadow-peach-main/20 scale-110' 
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="text-3xl md:text-5xl">{item.icon}</span>
                      </button>
                      <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest text-center ${feeling === item.id ? 'text-peach-main' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight">O que está influenciando seu humor?</h3>
                  <div className="flex gap-2 md:gap-3 flex-wrap">
                    {CHECKIN_TAGS.map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-5 py-2.5 rounded-full border text-xs md:text-sm font-bold transition-all ${
                          tags.includes(tag)
                            ? 'bg-peach-main text-white border-peach-main shadow-md shadow-peach-main/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column: Details & Save */}
            <section className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
                <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-4">Mais detalhes (opcional)</h3>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-peach-main/20 focus:border-peach-main p-6 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-base outline-none transition-all resize-none" 
                  placeholder="Escreva um pouco mais sobre o seu dia..." 
                  rows={6}
                />

                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 flex gap-4 mt-8 border border-primary/10">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Este check-in será compartilhado com seu par. Isso ajuda a entender seu momento emocional e a lidar melhor com as conversas de hoje.
                  </p>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={handleSave}
                    disabled={!feeling}
                    className="w-full bg-navy-main text-white font-black h-16 rounded-2xl shadow-xl shadow-navy-main/20 flex items-center justify-center gap-3 transition-all hover:bg-navy-main/90 active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-lg">Salvar Check-in</span>
                    <span className="material-symbols-outlined text-peach-main">done_all</span>
                  </button>
                </div>
              </div>

              {/* History Section */}
              {checkinHistory && checkinHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
                  {summary && (
                    <div className="mb-8 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${summary.color}`}>
                          <span className="material-symbols-outlined">{summary.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-navy-main dark:text-slate-100 text-sm">Resumo da Semana</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Baseado em {summary.count} check-ins</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-navy-main dark:text-slate-200 mb-2">{summary.summaryText}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{summary.supportTip}</p>
                      
                      {summary.topTags.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Principais influências:</p>
                          <div className="flex flex-wrap gap-2">
                            {summary.topTags.map(tag => (
                              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-4">Histórico Recente</h3>
                  <div className="space-y-4">
                    {checkinHistory.slice(0, 5).map((historyItem) => {
                      const date = new Date(historyItem.date);
                      const formattedDate = `${date.getDate()}/${date.getMonth() + 1} às ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                      
                      let emoji = '😊';
                      if (historyItem.feeling === 'calm') emoji = '😌';
                      if (historyItem.feeling === 'tired') emoji = '😴';
                      if (historyItem.feeling === 'angry') emoji = '😤';
                      if (historyItem.feeling === 'sad') emoji = '😔';

                      return (
                        <div key={historyItem.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{emoji}</span>
                            <div>
                              <p className="text-sm font-bold text-navy-main dark:text-slate-200 uppercase tracking-widest">{historyItem.feeling}</p>
                              <p className="text-xs text-slate-400 font-medium">{formattedDate}</p>
                            </div>
                          </div>
                          {historyItem.tags && historyItem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {historyItem.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-peach-main/10 text-peach-main font-bold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {historyItem.note && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">"{historyItem.note}"</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
