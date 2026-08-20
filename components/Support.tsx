import React, { useState, useEffect, useRef } from 'react';
import { Page, Income, Expense } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';
import { useTranslation } from './LanguageProvider';
import { api } from '../constants';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');

    return (
        <div>
            {lines.map((line, index) => {
                if (line.trim().startsWith('* ')) {
                    const content = line.trim().substring(2);
                    const parts = content.split(/\*\*(.*?)\*\*/g);
                    return (
                        <div key={index} className="flex items-start pl-4 -indent-4">
                            <span className="mr-2">•</span>
                            <span className="flex-1">
                                {parts.map((part, i) => (
                                    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
                                ))}
                            </span>
                        </div>
                    );
                }
                
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={index} className={line.trim() === '' ? 'h-2' : ''}>
                        {parts.map((part, i) => (
                            i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
};


const Support: React.FC<{ 
    setActivePage: (page: Page) => void; 
    userName: string;
    income: Income[];
    expenses: Expense[];
}> = ({ setActivePage, userName, income, expenses }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'model', text: t('support_greeting') }]);
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyIncome = income.filter(item => {
        const incomeDate = new Date(item.date);
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
      });
      const monthlyExpenses = expenses.filter(item => {
        const expenseDate = new Date(item.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });

      const context = `
        Current Month: ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        Income Data for Current Month: ${JSON.stringify(monthlyIncome)}
        Expense Data for Current Month: ${JSON.stringify(monthlyExpenses)}
      `;
        
      const reply = await api.ai.chat(currentInput, context);
      const modelMessage: Message = { role: 'model', text: reply };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI response error:", error);
      const errorMessage: Message = { role: 'model', text: "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
      <Header title={t('support_title')} />
      <div className="p-4 flex-1 flex flex-col">
        <BackButton onClick={() => setActivePage(Page.SETTINGS)} text={t('back_to_settings')} />
        
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center flex-shrink-0 self-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-violet-600 text-white rounded-br-lg' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer text={msg.text} />
                </div>
              </div>
               {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 font-bold text-gray-800 dark:text-gray-200">
                    {userName.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && (
             <div className="flex items-start gap-2 justify-start">
               <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-lg">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t('support_placeholder')}
            className="flex-1 w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-violet-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-violet-700 transition-colors disabled:bg-violet-400 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Support;