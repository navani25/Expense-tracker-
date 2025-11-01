import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Expense, Page } from '../types';
import Header from './common/Header';
import { CURRENCIES } from '../constants'; // Import CURRENCIES to get symbol

interface ReportsProps {
    expenses: Expense[];
    isDarkMode: boolean;
    setActivePage: (page: Page) => void;
    isBankConnected: boolean;
    setIsBankConnected: (isConnected: boolean) => void;
    currency: string; // Add currency to props
}

const TimeFrameButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            isActive 
            ? 'bg-violet-600 text-white shadow' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);


const Reports: React.FC<ReportsProps> = ({ expenses, isDarkMode, setActivePage, currency }) => {
  const [timeFrame, setTimeFrame] = useState<'7d' | '30d' | 'all'>('30d');
  
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    if (timeFrame === 'all') {
      return expenses;
    }
    const days = timeFrame === '7d' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - days);
    
    return expenses.filter(expense => new Date(expense.date) >= cutoffDate);
  }, [expenses, timeFrame]);

  // --- NEW FUNCTION TO HANDLE EXPORTING ---
  const handleExport = () => {
    const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
    let reportContent = `Expense Report - ${new Date().toLocaleDateString()}\n`;
    reportContent += `Time Frame: ${timeFrame === '7d' ? 'Last 7 Days' : timeFrame === '30d' ? 'Last 30 Days' : 'All Time'}\n`;
    reportContent += '--------------------------------------------------\n\n';

    let total = 0;
    filteredExpenses.forEach(exp => {
        reportContent += `Date:       ${exp.date}\n`;
        reportContent += `Category:   ${exp.category}\n`;
        reportContent += `Vendor:     ${exp.vendor || 'N/A'}\n`;
        reportContent += `Amount:     ${currencySymbol}${exp.amount.toFixed(2)}\n`;
        reportContent += `Notes:      ${exp.notes || 'None'}\n\n`;
        total += exp.amount;
    });

    reportContent += '--------------------------------------------------\n';
    reportContent += `Total Expenses: ${currencySymbol}${total.toFixed(2)}\n`;

    // Create a blob and trigger download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Ledgerly_Report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const tickColor = isDarkMode ? '#A0AEC0' : '#4a5568';
  const gridColor = isDarkMode ? '#4A5568' : '#E2E8F0';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#2D3748' : 'white',
    border: `1px solid ${gridColor}`,
    color: isDarkMode ? 'white' : 'black'
  };

  const categoryData = filteredExpenses.reduce((acc, expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

  const trendData = filteredExpenses
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(expense => ({
      date: new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: expense.amount,
    }));
    
  if (expenses.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        <div className="sm:hidden"><Header title="Reports & Analytics" /></div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] sm:h-full p-8 text-center">
            <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                  <path d="M12 20V10M18 20V4M6 20V16"/>
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Data for Reports</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">
                Add some expenses to generate your personal report, or view a demo to see how it works.
            </p>
            <button
                onClick={() => setActivePage(Page.HISTORY)}
                className="w-full max-w-xs py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
            >
                Add Your First Expense
            </button>
            <button
                onClick={() => setActivePage(Page.DEMO_REPORT)}
                className="mt-4 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
                View Demo Report
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="sm:hidden"><Header title="Reports & Analytics" /></div>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TimeFrameButton label="7 Days" isActive={timeFrame === '7d'} onClick={() => setTimeFrame('7d')} />
                <TimeFrameButton label="30 Days" isActive={timeFrame === '30d'} onClick={() => setTimeFrame('30d')} />
                <TimeFrameButton label="All Time" isActive={timeFrame === 'all'} onClick={() => setTimeFrame('all')} />
            </div>
            {/* --- NEW EXPORT BUTTON --- */}
            <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 rounded-md hover:bg-violet-200 dark:hover:bg-violet-900/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Export</span>
            </button>
        </div>

        {filteredExpenses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No expenses in this time period.</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try selecting a different time frame or adding a new expense.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Category Breakdown</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-80">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                        >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </section>

                <section>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Spending Trend</h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-80">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="date" stroke={tickColor} />
                        <YAxis stroke={tickColor} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
                </section>
            </div>
        )}
      </div>
    </div>
  );
};

export default Reports;