import React from 'react';
import { useTranslation } from './LanguageProvider';

interface WelcomeProps {
    onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* --- UPDATED LOGO AND BACKGROUND --- */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-gray-800 dark:via-gray-900 overflow-hidden relative">
                <div className="relative z-10 animate-fade-in-up">
                    <svg width="320" height="100" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(20, 15) scale(1.5)">
                            <g transform="rotate(-15 15 20)">
                                <rect x="5" y="5" width="20" height="30" rx="3" fill="white" stroke="#004D40" strokeWidth="1.5" />
                                <path d="M15 25 L15 15 M12 18 L15 15 L18 18" stroke="#004D40" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <g>
                                <rect x="15" y="5" width="20" height="30" rx="3" fill="white" stroke="#004D40" strokeWidth="1.5" />
                                <path d="M25 15 L25 25 M22 22 L25 25 L28 22" stroke="#004D40" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 12 L24 14 L28 10" stroke="#FB8C00" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                        </g>
                        <text x="90" y="50" fontFamily="sans-serif" fontSize="28" fontWeight="bold" fill="#004D40">LEDGERLY</text>
                        <text x="90" y="73" fontFamily="sans-serif" fontSize="14" fill="#00695C">Smart Expense Tracking.</text>
                    </svg>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                    {t('welcome_title')}
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                    {t('welcome_subtitle')}
                </p>
                <button
                    onClick={onGetStarted}
                    className="w-full max-w-xs mx-auto py-4 px-6 bg-violet-600 text-white font-semibold rounded-xl text-lg shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                    <span>{t('get_started')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>
        </div>
    );
};

export default Welcome;