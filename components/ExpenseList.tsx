
import React from 'react';
import type { Expense } from '../types';
import { DUMMY_EXPENSES } from '../constants';
import Header from './common/Header';

interface GroupedExpenses {
  [key: string]: Expense[];
}

const ExpenseListItem: React.FC<{ expense: Expense }> = ({ expense }) => (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                {expense.category.charAt(0)}
            </div>
            <div>
                <p className="font-semibold text-gray-800">{expense.vendor}</p>
                <p className="text-sm text-gray-500">{expense.category}</p>
            </div>
        </div>
        <div className="text-right">
             <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
             <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
        </div>
    </div>
);


const ExpenseList: React.FC = () => {
  const groupedExpenses = DUMMY_EXPENSES.reduce((acc: GroupedExpenses, expense) => {
    const month = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(expense);
    return acc;
  }, {});

  return (
    <div>
      <Header title="All Expenses" />
      <div className="p-4">
        {/* Filters */}
        <div className="flex space-x-2 mb-4">
          <input type="search" placeholder="Search expenses..." className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none" />
          <select className="px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none">
            <option>Category</option>
            <option>Food</option>
            <option>Travel</option>
          </select>
        </div>
      </div>

      {Object.entries(groupedExpenses).map(([month, expenses]) => (
        <div key={month} className="mb-6">
          <h2 className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100">{month}</h2>
          <div>
            {expenses.map(expense => <ExpenseListItem key={expense.id} expense={expense} />)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
