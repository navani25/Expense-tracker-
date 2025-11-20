import React, { useState } from 'react';
import { Page } from '../types';

interface ForgotPasswordProps {
  setActivePage: (page: Page) => void;
}

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-6 left-6 p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-colors z-10"
        aria-label="Go back"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    </button>
);

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setActivePage }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`If an account with ${email} exists, a password reset link has been sent.`);
        setActivePage(Page.LOGIN);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 relative">
            <BackButton onClick={() => setActivePage(Page.LOGIN)} />
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in-up">
                <div className="p-8">
                    <header className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Find Your Account</h1>
                    </header>
                    <main>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                Please enter your email address to search for your account.
                            </p>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                                autoFocus
                            />
                            <div className="pt-2 flex justify-end items-center space-x-3">
                               <button
                                    type="button"
                                    onClick={() => setActivePage(Page.LOGIN)}
                                    className="py-2.5 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="py-2.5 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;