
import React from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

const LegalItem: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <button onClick={onClick} className="flex items-center justify-between w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
    </button>
);


const Legal: React.FC<{ setActivePage: (page: Page) => void }> = ({ setActivePage }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Legal" />
      <div className="p-4">
        <BackButton onClick={() => setActivePage(Page.SETTINGS)} text="Back to Settings" />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <LegalItem title="Privacy Policy" description="How we handle your data." onClick={() => setActivePage(Page.PRIVACY_POLICY)} />
            <LegalItem title="Terms of Service" description="Rules for using our app." onClick={() => setActivePage(Page.TERMS_OF_SERVICE)} />
            <LegalItem title="Licenses" description="Open-source software we use." onClick={() => setActivePage(Page.LICENSES)} />
        </div>
      </div>
    </div>
  );
};

export default Legal;
