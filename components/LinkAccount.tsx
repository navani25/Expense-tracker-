import React, { useState } from 'react';
import { Page, Bank } from '../types';
import BackButton from './common/BackButton';

interface LinkAccountProps {
  setActivePage: (page: Page) => void;
  bank: Bank | null;
  onConnect: () => void;
}

const LinkAccount: React.FC<LinkAccountProps> = ({ setActivePage, bank, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      onConnect();
    }, 2500); // Simulate secure connection
  };

  if (!bank) {
    // Should not happen in normal flow, but good to have a fallback
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-full p-4">
            <BackButton onClick={() => setActivePage(Page.CONNECT_BANK)} text="Select a Bank" />
            <p className="text-center text-red-500">Error: No bank selected.</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        <BackButton onClick={() => setActivePage(Page.CONNECT_BANK)} text="Change Bank" />
        
        <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md mb-4 p-2 border border-gray-200 dark:border-gray-700">
                {bank.logo}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Enter your {bank.name} credentials</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                We'll securely connect to your account to import your transactions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-sm mx-auto w-full">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400 transition-colors"
                >
                  {isConnecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting securely...
                      </>
                  ) : `Connect to ${bank.name}`}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LinkAccount;
