import { NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes.
 * Combines `clsx` for conditional classes and `twMerge` to resolve Tailwind conflicts.
 * 
 * @param {...ClassValue[]} inputs - Class names or conditional class objects.
 * @returns {string} The merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Bottom Navigation Component
 * 
 * Renders the sticky bottom navigation bar used throughout the main app pages.
 * 
 * @returns {JSX.Element} The rendered BottomNav component.
 */
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 pb-6 pt-2 z-50">
      <div className="flex gap-2 overflow-x-auto items-center no-scrollbar pb-2 px-2 snap-x">
        <div className="snap-center shrink-0">
          <NavItem to="/home" icon="home" label="Início" />
        </div>
        <div className="snap-center shrink-0">
          <NavItem to="/points" icon="stars" label="Sintonia" />
        </div>
        <div className="snap-center shrink-0">
          <NavItem to="/next-date" icon="event_available" label="Rotina" />
        </div>
        <div className="snap-center shrink-0">
          <NavItem to="/sos" icon="emergency_home" label="SOS" />
        </div>
        <div className="snap-center shrink-0">
          <NavItem to="/surprise" icon="redeem" label="Surpresa" />
        </div>
        <div className="snap-center shrink-0">
          <NavItem to="/empathy-box" icon="mail" label="Desculpas" />
        </div>
        <div className="snap-center shrink-0">
          <NavItem to="/profile" icon="person" label="Perfil" />
        </div>
      </div>
    </nav>
  );
}

/**
 * Props for the NavItem component.
 */
interface NavItemProps {
  /** The route to navigate to. */
  to: string;
  /** The Material Symbols icon name. */
  icon: string;
  /** The text label displayed under the icon. */
  label: string;
}

/**
 * Individual Navigation Item Component
 * 
 * Renders a single link in the bottom navigation bar.
 * Handles active state styling automatically via React Router's NavLink.
 * 
 * @param {NavItemProps} props - The component props.
 * @returns {JSX.Element} The rendered NavItem component.
 */
function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1 transition-colors w-16 px-1",
          isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 hover:text-primary"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative flex h-8 items-center justify-center">
            <span className={cn("material-symbols-outlined text-[24px]", isActive && "filled")}>
              {icon}
            </span>
            {/* Notification dot for active item (example logic) */}
            {isActive && label === 'Saia da Rotina' && (
              <span className="absolute -top-1 -right-1 size-2 bg-peach-main rounded-full"></span>
            )}
          </div>
          <p className="text-[10px] font-bold leading-normal uppercase tracking-wider">{label}</p>
        </>
      )}
    </NavLink>
  );
}
