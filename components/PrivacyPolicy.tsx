import React from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

interface PrivacyPolicyProps {
  setActivePage: (page: Page) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ setActivePage }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Privacy Policy" />
      <div className="p-4 space-y-4">
        <BackButton onClick={() => setActivePage(Page.LEGAL)} text="Back to Legal" />
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-4 text-gray-600 dark:text-gray-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, add expenses, or contact us for support. This may include your name, email address, and transaction details.</p>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of the app, as well as to communicate with you, such as to send you service-related notices.</p>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Sharing of Your Information</h2>
            <p>We do not share your personal information with third parties except as described in this Privacy Policy or with your consent.</p>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Data Security</h2>
            <p>We use commercially reasonable safeguards to help keep the information collected through the app secure.</p>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Changes to This Policy</h2>
            <p>We may modify or update this Privacy Policy from time to time, so you should review this page periodically.</p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">Last Updated: July 22, 2024</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;