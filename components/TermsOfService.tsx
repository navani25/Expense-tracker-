import React from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

interface TermsOfServiceProps {
  setActivePage: (page: Page) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ setActivePage }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Terms of Service" />
      <div className="p-4 space-y-4">
        <BackButton onClick={() => setActivePage(Page.LEGAL)} text="Back to Legal" />
         <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-4 text-gray-600 dark:text-gray-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>By accessing or using our app, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the app.</p>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Use of the App</h2>
            <p>You are responsible for your use of the app and for any content you provide, including compliance with applicable laws, rules, and regulations.</p>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. User Accounts</h2>
            <p>You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above.</p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;