import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

/**
 * Standard Page Header component for sub-pages.
 * Provides a consistent look and feel with a back button, title, and optional right action.
 */
export function PageHeader({ title, showBackButton = true, rightAction }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center py-4 px-4 md:py-6 md:px-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/5 -mx-4 md:mx-0">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-primary/5"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          )}
          <h1 className="text-navy-main dark:text-slate-100 text-lg md:text-xl font-black leading-tight tracking-tight">
            {title}
          </h1>
        </div>
        
        {rightAction && (
          <div className="flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}
