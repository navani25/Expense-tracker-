
import React, { useState } from 'react';
import { Page } from '../types';

interface CreateAccountProps {
  onSignup: (name?: string, email?: string) => void;
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


const CreateAccount: React.FC<CreateAccountProps> = ({ onSignup, setActivePage }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // In a real app, you'd do more validation here.
        const email = `${username}@gmail.com`;
        onSignup(`${firstName} ${lastName}`, email);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
            <BackButton onClick={() => setActivePage(Page.LOGIN)} />
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in-up">
                <div className="p-8">
                    <header className="text-center mb-6">
                        <svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google-style wordmark" className="w-20 h-auto mx-auto mb-4">
                            <title>Google-style wordmark</title>
                            <g fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="96" textRendering="optimizeLegibility">
                                <text x="10" y="90" fill="#4285F4">G</text>
                                <text x="92" y="90" fill="#EA4335">o</text>
                                <text x="152" y="90" fill="#FBBC05">o</text>
                                <text x="212" y="90" fill="#4285F4">g</text>
                                <text x="276" y="90" fill="#34A853">l</text>
                                <text x="308" y="90" fill="#EA4335">e</text>
                            </g>
                        </svg>
                        <h1 className="text-2xl font-normal text-gray-900 dark:text-gray-100 mt-4">Create your Google Account</h1>
                    </header>
                    <main>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required
                                />
                                <input
                                    type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required
                                />
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">@gmail.com</span>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <input
                                    type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required minLength={6}
                                />
                                 <input
                                    type={showPassword ? 'text' : 'password'} placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required minLength={6}
                                />
                            </div>
                             <div className="flex items-center">
                                <input
                                    id="show-password-create" type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="show-password-create" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Show password
                                </label>
                            </div>

                            <div className="pt-6 flex justify-between items-center">
                                <button type="button" onClick={() => setActivePage(Page.LOGIN)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                    Sign in instead
                                </button>
                                <button
                                    type="submit"
                                    className="py-2.5 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
