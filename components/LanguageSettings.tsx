import React, { useState } from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';
import { LANGUAGES } from '../constants';
import { useTranslation } from './LanguageProvider';
import ConfirmationModal from './ConfirmationModal'; // Import the new component

interface LanguageSettingsProps {
  setActivePage: (page: Page) => void;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({ setActivePage }) => {
  const { t, language: selectedLanguage, setLanguage: setSelectedLanguage } = useTranslation();
  // --- NEW STATE FOR CONFIRMATION MODAL ---
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // --- NEW CLICK HANDLER TO SHOW CONFIRMATION ---
  const handleLanguageSelect = (language: typeof LANGUAGES[0]) => {
    setConfirmation({
        isOpen: true,
        title: "Change Language",
        message: `Are you sure you want to change the language to ${language.name}?`,
        onConfirm: () => {
            setSelectedLanguage(language.code);
            setConfirmation(null);
        }
    });
  };
  
  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
        <Header title={t('language_settings_title')} />
        <div className="p-4 flex-1">
          <BackButton onClick={() => setActivePage(Page.SETTINGS)} text={t('back_to_settings')} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)} // Use the new handler
                className="flex items-center justify-between w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-200">{language.name}</p>
                {selectedLanguage === language.code && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- RENDER THE NEW CONFIRMATION MODAL --- */}
      {confirmation?.isOpen && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation(null)}
            confirmText="Change"
        />
      )}
    </>
  );
};

export default LanguageSettings;