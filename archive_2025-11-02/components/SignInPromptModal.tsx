
import React from 'react';

interface SignInPromptModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

const SignInPromptModal: React.FC<SignInPromptModalProps> = ({ onClose, onSignIn }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sign In Required</h2>
        <p className="text-gray-500 dark:text-gray-400 my-4">
          Please sign in or create an account to add and manage your transactions.
        </p>
        <div className="flex flex-col space-y-2 mt-6">
          <button
            onClick={onSignIn}
            className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-semibold transition-colors"
          >
            Go to Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-600 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPromptModal;
