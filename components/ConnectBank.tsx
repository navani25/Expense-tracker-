
import React, { useState } from 'react';
import { Page, Bank } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

interface ConnectBankProps {
  setActivePage: (page: Page) => void;
  banks: Bank[];
  onSelectBank: (bank: Bank) => void;
}

const ConnectBank: React.FC<ConnectBankProps> = ({ setActivePage, banks, onSelectBank }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBankClick = (bank: Bank) => {
    onSelectBank(bank);
    setActivePage(Page.LINK_ACCOUNT);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-full flex flex-col">
      <Header title="Connect Your Bank" />
      <div className="p-4 flex-1">
        <BackButton onClick={() => setActivePage(Page.REPORTS)} text="Back to Reports" />
        
        <div className="relative mb-6">
          <input
            type="search"
            placeholder="Search for your bank"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-1">Popular Banks</h3>
        <div className="grid grid-cols-2 gap-4">
          {filteredBanks.map((bank) => (
            <button
              key={bank.name}
              onClick={() => handleBankClick(bank)}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500/50 hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="mb-3 h-8 flex items-center">{bank.logo}</div>
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-center text-sm">{bank.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectBank;
