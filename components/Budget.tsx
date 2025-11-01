
import React from 'react';
import { BUDGET_DATA } from '../constants';
import Header from './common/Header';

const Budget: React.FC = () => {
  const { limit, spent, remaining } = BUDGET_DATA;
  const progressPercentage = (spent / limit) * 100;

  const getProgressColor = () => {
    if (progressPercentage > 90) return 'bg-red-500';
    if (progressPercentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <Header title="My Budget" />
      <div className="p-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <p className="text-gray-500 text-lg">Monthly Limit</p>
          <p className="text-5xl font-bold text-gray-800 my-2">${limit.toLocaleString()}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 my-6">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-lg">
            <div className="text-left">
              <p className="text-gray-500">Spent</p>
              <p className="font-bold text-blue-600">${spent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Remaining</p>
              <p className="font-bold text-green-600">${remaining.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Budget Alerts</h3>
            <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-800">You're getting close!</p>
                    <p className="text-sm text-gray-500">You've spent {progressPercentage.toFixed(0)}% of your budget.</p>
                </div>
                 <div className="text-2xl">
                    ⚠️
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
