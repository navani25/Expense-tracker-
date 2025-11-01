
import React from 'react';
import { Page } from '../types';
import { useTranslation } from './LanguageProvider';

interface SignupProps {
  onSignup: () => void;
  setActivePage: (page: Page) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, setActivePage }) => {
  const { t } = useTranslation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form validation and submission here
    onSignup();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('signup_title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('signup_subtitle')}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder={t('first_name')} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700" required />
              <input type="text" placeholder={t('last_name')} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700" required />
            </div>
            <input type="email" placeholder={t('email_or_phone')} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700" required />
            <input type="password" placeholder={t('new_password')} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700" required />
            
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
              By clicking Sign Up, you agree to our <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Terms</a>, <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</a> and <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline">Cookies Policy</a>.
            </p>

            <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-lg transition-colors bg-green-600 hover:bg-green-700">
              {t('signup_button')}
            </button>
          </form>
          <div className="text-center mt-6">
            <button onClick={() => setActivePage(Page.LOGIN)} className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
              {t('already_have_account')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;