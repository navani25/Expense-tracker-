import React, { useState, useMemo } from 'react';
import { Page } from '../types';
import type { Expense, Income, Transfer, Category } from '../types';
import Header from './common/Header';
import { CURRENCIES } from '../constants';

interface GroupedExpenses { [key: string]: Expense[]; }
interface GroupedIncomes { [key: string]: Income[]; }

const EmptyState: React.FC<{
    type: 'expense' | 'income';
    onActionClick?: () => void;
}> = ({ type, onActionClick }) => {
    
    let icon, title, message, buttonText;

    switch (type) {
        case 'income':
            icon = ( <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 dark:text-violet-400"><path d="M19 7V6a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-1"/><path d="M12 12h8m-4-4v8"/><rect x="2" y="10" width="9" height="4" rx="1"/></svg> );
            title = "Ready to Track Your Earnings?";
            message = "Log your income to see a complete financial picture. Let's add your first entry.";
            buttonText = 'Add New Income';
            break;
        default: // 'expense'
            icon = ( <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 dark:text-violet-400"><path d="M19 7V6a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-1"/><path d="M12 12h8"/><rect x="2" y="10" width="9" height="4" rx="1"/></svg> );
            title = "Your Expense History is Clear!";
            message = "Start by adding your first transaction. Tap the button below to log a new expense.";
            buttonText = 'Add New Expense';
            break;
    }

    return (
        <div className="text-center p-12 animate-fade-in-up mt-8">
            <div className="w-24 h-24 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6"> {icon} </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">{message}</p>
            {onActionClick && buttonText && ( <button onClick={onActionClick} className="py-3 px-6 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-transform transform hover:scale-105" > {buttonText} </button> )}
        </div>
    );
};

const ExpenseListItem: React.FC<{ expense: Expense; currencySymbol: string; onEdit: (item: any) => void; onDelete: (id: any) => void; icon: string; }> = ({ expense, currencySymbol, onEdit, onDelete, icon }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 min-w-0">
            <div className={`w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-2xl`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{expense.vendor || expense.notes}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category || 'Uncategorized'}</p>
            </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="text-right">
                <p className="font-bold text-red-600 dark:text-red-400">-{currencySymbol}{expense.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
            </div>
            {/* --- ICONS UPDATED HERE --- */}
            <button onClick={() => onEdit(expense)} className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-full focus:outline-none" aria-label="Edit expense">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
            <button onClick={() => onDelete(expense.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full focus:outline-none" aria-label="Delete expense">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
    </div>
);

const IncomeListItem: React.FC<{ income: Income; currencySymbol: string; onEdit: (item: any) => void; onDelete: (id: any) => void; icon: string; }> = ({ income, currencySymbol, onEdit, onDelete, icon }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 min-w-0">
            <div className={`w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-2xl`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{income.source || income.notes}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{income.category || 'Uncategorized'}</p>
            </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">+{currencySymbol}{income.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(income.date).toLocaleDateString()}</p>
            </div>
            {/* --- ICONS UPDATED HERE --- */}
            <button onClick={() => onEdit(income)} className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-full focus:outline-none" aria-label="Edit income">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
            <button onClick={() => onDelete(income.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full focus:outline-none" aria-label="Delete income">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
    </div>
);

interface HistoryProps {
    expenses: Expense[];
    income: Income[];
    transfers: Transfer[]; // Keep this prop for data integrity, though it won't be displayed
    onEditTransaction: (transaction: Expense | Income | Transfer) => void;
    onDeleteTransaction: (id: string | number) => void;
    onAdd: (type: 'expense' | 'income') => void; // Removed 'transfer'
    setActivePage: (page: Page) => void;
    currency: string;
    categories: Category[];
    incomeCategories: Category[];
}

const History: React.FC<HistoryProps> = ({ expenses, income, onEditTransaction, onDeleteTransaction, onAdd, currency, categories, incomeCategories }) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.name, c.icon])), [categories]);
  const incomeCategoryMap = useMemo(() => new Map(incomeCategories.map(c => [c.name, c.icon])), [incomeCategories]);

  const onTouchStart = (e: React.TouchEvent) => { setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEndX(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab === 'expense') {
        setActiveTab('income');
    } else if (isRightSwipe && activeTab === 'income') {
        setActiveTab('expense');
    }
    setTouchStartX(null); 
    setTouchEndX(null);
  };

  const groupedExpenses = expenses.reduce((acc: GroupedExpenses, expense) => { const month = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' }); if (!acc[month]) acc[month] = []; acc[month].push(expense); return acc; }, {} as GroupedExpenses);
  const groupedIncomes = income.reduce((acc: GroupedIncomes, incomeItem) => { const month = new Date(incomeItem.date).toLocaleString('default', { month: 'long', year: 'numeric' }); if (!acc[month]) acc[month] = []; acc[month].push(incomeItem); return acc; }, {} as GroupedIncomes);
  
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  
  const getTransformX = () => (activeTab === 'income' ? '-100%' : '0%');

  const ExpensesView = (
    <div className="h-full overflow-y-auto">
        {expenses.length > 0 ? (
            Object.keys(groupedExpenses).map((month) => (
                <div key={month} className="mb-6">
                    <h2 className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 sticky top-0 z-[1]">{month}</h2>
                    <div>
                        {groupedExpenses[month].map(expense => (
                            <ExpenseListItem 
                                key={expense.id} 
                                expense={expense} 
                                onEdit={onEditTransaction} 
                                onDelete={onDeleteTransaction} 
                                currencySymbol={currencySymbol} 
                                icon={categoryMap.get(expense.category) || '🏷️'}
                            />
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <EmptyState type="expense" onActionClick={() => onAdd('expense')} />
        )}
    </div>
  );

  const IncomeView = (
    <div className="h-full overflow-y-auto">
        {income.length > 0 ? (
            Object.keys(groupedIncomes).map((month) => (
                <div key={month} className="mb-6">
                    <h2 className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 sticky top-0 z-[1]">{month}</h2>
                    <div>
                        {groupedIncomes[month].map(incomeItem => (
                            <IncomeListItem 
                                key={incomeItem.id} 
                                income={incomeItem} 
                                currencySymbol={currencySymbol} 
                                onEdit={onEditTransaction} 
                                onDelete={onDeleteTransaction} 
                                icon={incomeCategoryMap.get(incomeItem.category) || '💰'}
                            />
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <EmptyState type="income" onActionClick={() => onAdd('income')} />
        )}
    </div>
  );

  const shouldShowFab = (activeTab === 'expense' && expenses.length > 0) || (activeTab === 'income' && income.length > 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
      <div className="sm:hidden"><Header title="Transaction History" /></div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 sm:mt-6">
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg max-w-2xl mx-auto">
            <button onClick={() => setActiveTab('expense')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'expense' ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Expenses</button>
            <button onClick={() => setActiveTab('income')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${activeTab === 'income' ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Income</button>
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-hidden sm:max-w-4xl sm:mx-auto sm:w-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${getTransformX()})` }}
        >
          <div className="w-full flex-shrink-0 h-full">{ExpensesView}</div>
          <div className="w-full flex-shrink-0 h-full">{IncomeView}</div>
        </div>
      </div>
      
      {shouldShowFab && (
        <button
            onClick={() => onAdd(activeTab)}
            className="absolute bottom-24 sm:bottom-8 right-4 sm:right-8 bg-violet-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-violet-700 transition-transform transform hover:scale-110 z-40"
            aria-label={`Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      )}

    </div>
  );
};

export default History;