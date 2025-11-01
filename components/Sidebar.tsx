import React from 'react';
import { Page } from '../types';
import { useTranslation } from './LanguageProvider';

const HomeIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor" 
        strokeWidth={isActive ? 0.5 : 2} 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
);

const HistoryIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const ReportsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20V16"/></svg>;
const ProfileIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const getNavItems = (t: (key: string) => string): { page: Page; label: string; Icon: React.FC<any> }[] => [
  { page: Page.DASHBOARD, label: t('nav_home'), Icon: HomeIcon },
  { page: Page.HISTORY, label: t('nav_history'), Icon: HistoryIcon },
  { page: Page.REPORTS, label: t('nav_reports'), Icon: ReportsIcon },
  { page: Page.SETTINGS, label: t('nav_profile'), Icon: ProfileIcon }
];

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { t } = useTranslation();
  const navItems = getNavItems(t);

  return (
    <nav className="hidden sm:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-2 flex-shrink-0">
      {/* --- UPDATED SIDEBAR LOGO --- */}
      <div className="px-2 py-2 mb-4">
        <svg role="img" aria-label="Ledgerly" className="w-32 h-auto text-gray-800 dark:text-gray-100" viewBox="0 0 150 40" xmlns="http://www.w3.org/2000/svg">
            <g transform="scale(0.7)">
                <g transform="rotate(-15 15 20)">
                    <rect x="5" y="5" width="20" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M15 25 L15 15 M12 18 L15 15 L18 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <g>
                    <rect x="15" y="5" width="20" height="30" rx="3" className="fill-white dark:fill-gray-800" stroke="currentColor" strokeWidth="2" />
                    <path d="M25 15 L25 25 M22 22 L25 25 L28 22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 12 L24 14 L28 10" stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
            </g>
            <text x="45" y="28" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="currentColor">LEDGERLY</text>
        </svg>
      </div>

      {navItems.map((item) => {
        const isActive = item.page === activePage;
        return (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              isActive 
                ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-semibold' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.Icon isActive={isActive} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Sidebar;