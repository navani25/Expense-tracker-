import React from 'react';
import { Page, Expense } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- Sample Data for the Demo ---
const DUMMY_DEMO_EXPENSES: Expense[] = [
    { id: 'd1', amount: 75.50, vendor: 'SuperMart', category: 'Groceries', date: '2025-10-01', notes: 'Weekly groceries' },
    { id: 'd2', amount: 120.00, vendor: 'Edison Power', category: 'Rent & Charges', date: '2025-10-02', notes: 'Electricity bill' },
    { id: 'd3', amount: 45.00, vendor: 'The Grand Cinema', category: 'Entertainment', date: '2025-10-04', notes: 'Movie night' },
    { id: 'd4', amount: 250.00, vendor: 'City Apartments', category: 'Accommodation', date: '2025-10-05', notes: 'Monthly rent' },
    { id: 'd5', amount: 30.00, vendor: 'City Transit', category: 'Transport', date: '2025-10-06', notes: 'Bus pass' },
    { id: 'd6', amount: 85.00, vendor: 'Style Co.', category: 'Shopping', date: '2025-10-08', notes: 'New shoes' },
    { id: 'd7', amount: 60.00, vendor: 'The Corner Cafe', category: 'Restaurants & Bars', date: '2025-10-10', notes: 'Dinner with friends' },
    { id: 'd8', amount: 90.25, vendor: 'SuperMart', category: 'Groceries', date: '2025-10-12', notes: 'More groceries' },
    { id: 'd9', amount: 55.00, vendor: 'Wellness Pharmacy', category: 'Healthcare', date: '2025-10-15', notes: 'Prescription refill' },
];

interface DemoReportProps {
  setActivePage: (page: Page) => void;
  isDarkMode: boolean; // Add prop for theme awareness
}

const DemoReport: React.FC<DemoReportProps> = ({ setActivePage, isDarkMode }) => {
  const tickColor = isDarkMode ? '#A0AEC0' : '#4a5568';
  const gridColor = isDarkMode ? '#4A5568' : '#E2E8F0';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#2D3748' : 'white',
    border: `1px solid ${gridColor}`,
    color: isDarkMode ? 'white' : 'black'
  };

  // Process demo data for charts
  const categoryData = DUMMY_DEMO_EXPENSES.reduce((acc, expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4f', '#40a9ff'];

  const trendData = DUMMY_DEMO_EXPENSES
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(expense => ({
      date: new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: expense.amount,
    }));

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Demo Report" />
      <div className="p-4 md:p-6 lg:p-8">
        <BackButton onClick={() => setActivePage(Page.REPORTS)} text="Back to Reports" />
        
        <div className="space-y-8 mt-4">
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
        </div>
      </div>
    </div>
  );
};

export default DemoReport;