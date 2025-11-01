import React, { useState } from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';
import { CURRENCIES } from '../constants';
import ConfirmationModal from './ConfirmationModal'; // Import the new component

interface CurrencySettingsProps {
  setActivePage: (page: Page) => void;
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
}

const CurrencySettings: React.FC<CurrencySettingsProps> = ({ setActivePage, selectedCurrency, setSelectedCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // --- NEW STATE FOR CONFIRMATION MODAL ---
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const filteredCurrencies = CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- NEW CLICK HANDLER TO SHOW CONFIRMATION ---
  const handleCurrencySelect = (currency: typeof CURRENCIES[0]) => {
    setConfirmation({
        isOpen: true,
        title: "Change Currency",
        message: `Are you sure you want to change your currency to ${currency.name} (${currency.code})?`,
        onConfirm: () => {
            setSelectedCurrency(currency.code);
            setConfirmation(null); // Close modal on confirm
        }
    });
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
        <Header title="Currency" />
        <div className="p-4 flex-1">
          <BackButton onClick={() => setActivePage(Page.SETTINGS)} text="Back to Settings" />
          
          <div className="relative mb-4">
            <input
              type="search"
              placeholder="Search currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencySelect(currency)} // Use the new handler
                className="flex items-center justify-between w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{currency.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{currency.code}</p>
                </div>
                {selectedCurrency === currency.code && (
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

export default CurrencySettings;