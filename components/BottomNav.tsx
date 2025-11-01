
import React from 'react';
import { Page } from '../types';
import { useTranslation } from './LanguageProvider';

interface NavIconProps {
  isActive: boolean;
}

// A HomeIcon that changes based on active state to be more visible
const HomeIcon: React.FC<NavIconProps> = ({ isActive }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24"
        fill={isActive ? 'currentColor' : 'none'} // Solid fill when active
        stroke="currentColor" 
        strokeWidth={isActive ? 0.5 : 2} 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {/* Render door only when inactive */}
        {!isActive && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
);

// Updated, cleaner icons to match the provided design
const HistoryIcon: React.FC<NavIconProps> = () => <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const ReportsIcon: React.FC<NavIconProps> = () => <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20V16"/></svg>;
const ProfileIcon: React.FC<NavIconProps> = () => <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;


const getNavItems = (t: (key: string) => string): { page: Page; label: string; Icon: React.FC<NavIconProps> }[] => [
  { page: Page.DASHBOARD, label: t('nav_home'), Icon: HomeIcon },
  { page: Page.HISTORY, label: t('nav_history'), Icon: HistoryIcon },
  { page: Page.REPORTS, label: t('nav_reports'), Icon: ReportsIcon },
  { page: Page.SETTINGS, label: t('nav_profile'), Icon: ProfileIcon }
];

const PointerPath = ({ activeIndex }: { activeIndex: number }) => {
  const numItems = 4; // Hardcoded to 4 nav items
  const itemWidth = 100 / numItems;
  const center = (activeIndex * itemWidth) + (itemWidth / 2);
  
  // A path that creates a small pointer above the active icon
  const pathD = `
    M 0,15
    L ${center - 15},15
    Q ${center},0 ${center + 15},15
    L 100,15
    L 100,72 L 0,72 Z
  `;

  return (
    <svg 
        width="100%" 
        height="72"
        viewBox="0 0 100 72"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full"
        style={{ filter: 'drop-shadow(0 -6px 10px rgba(118, 126, 159, 0.06))'}}
    >
      <path d={pathD} className="fill-white dark:fill-gray-800 transition-all duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)]"></path>
    </svg>
  );
};

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useTranslation();
  const navItems = getNavItems(t);
  const activeIndex = navItems.findIndex((item) => item.page === activePage);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-20 z-50 sm:hidden">
      <div className="relative w-full h-full">
        <PointerPath activeIndex={activeIndex !== -1 ? activeIndex : 0} />
        <div className="absolute inset-0 flex justify-around items-center">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.page}
                onClick={() => setActivePage(item.page)}
                className="flex flex-col items-center justify-center h-full w-1/4 pt-1"
                aria-label={item.label}
              >
                <div className={`relative transition-all duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)] ${isActive ? '-translate-y-4' : ''}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-violet-600 shadow-lg' : ''}`}>
                    <div className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                        <item.Icon isActive={isActive} />
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-violet-700 dark:text-violet-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;