import React from 'react';
import { Page } from '../types';
import { useTranslation } from './LanguageProvider';
// --- THIS IS THE FIX: Import the native Google Auth plugin ---
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

interface SignInProps {
    setActivePage: (page: Page) => void;
    onGoogleLogin: (name?: string, email?: string, id?: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ setActivePage, onGoogleLogin }) => {
    const { t } = useTranslation();

    // --- THIS IS THE FIX: A new function to handle the native sign-in ---
    const handleNativeGoogleSignIn = async () => {
        try {
            const googleUser = await GoogleAuth.signIn();
            if (googleUser) {
                onGoogleLogin(googleUser.name, googleUser.email, googleUser.id);
            } else {
                alert("Google Sign-In failed. Please try again.");
            }
        } catch (error) {
            console.error("❌ Google Sign-In Error", error);
            alert("An error occurred during sign-in. Please check the console.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-full p-4 bg-white dark:bg-gray-900">
            <section className="text-center">
                {/* ... (icon and text are the same) ... */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('sign_in')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto text-sm">
                    {t('sign_in_prompt')}
                </p>
            </section>

            <section className="mt-8 w-full max-w-xs">
                {/* --- THIS IS THE FIX: A standard button that calls our native function --- */}
                <button
                    onClick={handleNativeGoogleSignIn}
                    className="w-full flex items-center justify-center py-3 px-4 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 transition-colors"
                >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.94C34.353 4.882 28.185 2 24 2C11.854 2 2 11.854 2 24s9.854 22 22 22s22-9.854 22-22c0-1.341-.138-2.65-.389-3.917z" />
                        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.841-5.841C34.353 4.882 28.185 2 24 2C16.318 2 9.656 6.348 6.306 14.691z" />
                        <path fill="#4CAF50" d="M24 46c5.94 0 11.21-1.807 15.14-4.854l-6.42-4.93C30.493 38.046 27.51 39 24 39c-5.216 0-9.557-3.418-11.12-8.03l-6.53 5.04C9.507 41.594 16.14 46 24 46z" />
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.571l6.42 4.93C40.222 36.372 43.201 31.056 43.611 20.083z" />
                    </svg>
                    Sign in with Google
                </button>
            </section>
            
            <section className="mt-8 w-full max-w-xs text-center">
                {/* ... (Terms of Service section is the same) ... */}
            </section>
        </div>
    );
};

export default SignIn;