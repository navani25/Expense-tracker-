import React from 'react';
import { Expense, Income, Transfer, Page } from '../types';
import { useTranslation } from './LanguageProvider';
import { CURRENCIES } from '../constants';

interface DashboardProps {
  openModal: (mode: 'manual' | 'voice' | 'receipt') => void;
  expenses: Expense[];
  income: Income[];
  transfers: Transfer[];
  userName: string;
  setActivePage: (page: Page) => void;
  currency: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string | number) => void;
}

const DashboardEmptyState: React.FC<{ openModal: (mode: 'manual') => void }> = ({ openModal }) => (
    <div className="text-center p-8 my-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fade-in-up">
        <div className="w-20 h-20 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                <path d="M20 7h-9"></path>
                <path d="M14 17H5"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <circle cx="7" cy="7" r="3"></circle>
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Your slate is clean!</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
            Ready to track your finances? Add your first expense to get started.
        </p>
        <button
            onClick={() => openModal('manual')}
            className="py-3 px-8 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-transform transform hover:scale-105"
        >
            Add First Expense
        </button>
    </div>
);


const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}> = ({ icon, label, onClick, className = '' }) => (
  <button onClick={onClick} className={`group flex flex-col items-center justify-center space-y-2 p-4 rounded-xl ${className}`}>
    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md transition-transform transform group-hover:scale-110 group-hover:-translate-y-1">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
  </button>
);

const ExpenseItem: React.FC<{ 
    expense: Expense; 
    currencySymbol: string; 
    onEdit: (expense: Expense) => void; 
    onDelete: (id: string | number) => void; 
}> = ({ expense, currencySymbol, onEdit, onDelete }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl">
            <div className="flex items-center space-x-4 min-w-0">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg text-gray-600 dark:text-gray-300">
                    {expense.category ? expense.category.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="min-w-0">
                    {/* --- TITLE FIX: Prioritize `notes` (Title) over `vendor` --- */}
                    <p className="font-semibold text-base text-gray-800 dark:text-gray-100 truncate">{expense.notes || expense.vendor || "Expense"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(expense.date.replace(/-/g, '\/')).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
                <p className="font-bold text-lg text-red-500 dark:text-red-400">
                    -{currencySymbol}{expense.amount.toFixed(2)}
                </p>
                <button onClick={() => onEdit(expense)} className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-full focus:outline-none" aria-label="Edit expense">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button onClick={() => onDelete(expense.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full focus:outline-none" aria-label="Delete expense">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ openModal, expenses, income, userName, setActivePage, currency, onEditExpense, onDeleteExpense }) => {
  const { t } = useTranslation();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const monthlyIncome = income.filter(item => {
    const incomeDate = new Date(item.date);
    return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
  });

  const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentExpenses = sortedExpenses.slice(0, 10);
  const hasTransactions = expenses.length > 0 || income.length > 0;
  
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <header className="mb-6">
        <p className="text-lg text-gray-500 dark:text-gray-400">{t('dashboard_welcome_back')}</p>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{userName}</h1>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {hasTransactions ? (
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">{t('monthly_summary')}</span>
                <span className="text-sm opacity-80">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="text-center mb-6">
                  <p className="text-sm opacity-80">{t('net_balance')}</p>
                  <p className="text-5xl font-bold">{currencySymbol}{netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="flex justify-around">
                  <div>
                      <p className="text-sm opacity-80">{t('income')}</p>
                      <p className="text-xl font-semibold text-green-300">{currencySymbol}{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                      <p className="text-sm opacity-80">{t('expenses')}</p>
                      <p className="text-xl font-semibold text-red-300">{currencySymbol}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
              </div>
            </div>
          ) : (
            <DashboardEmptyState openModal={() => openModal('manual')} />
          )}

          <div className="grid grid-cols-3 gap-4">
              <QuickActionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 w-6 h-6"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
                label={t('add')}
                onClick={() => openModal('manual')}
                className="bg-violet-50 dark:bg-violet-900/20"
              />
              <QuickActionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 w-6 h-6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>}
                label={t('voice')}
                onClick={() => openModal('voice')}
                className="bg-green-50 dark:bg-green-900/20"
              />
              <QuickActionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 w-6 h-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>}
                label={t('receipt')}
                onClick={() => openModal('receipt')}
                className="bg-purple-50 dark:bg-purple-900/20"
              />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {expenses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('recent_expenses')}</h2>
                <div className="space-y-3">
                  {recentExpenses.map(expense => (
                    <ExpenseItem key={expense.id} expense={expense} currencySymbol={currencySymbol} onEdit={onEditExpense} onDelete={onDeleteExpense} />
                  ))}
                </div>
                {expenses.length > 10 && (
                  <div className="mt-4">
                      <button
                          onClick={() => setActivePage(Page.HISTORY)}
                          className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                          {t('view_all_expenses')}
                      </button>
                  </div>
                )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;