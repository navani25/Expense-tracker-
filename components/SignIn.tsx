import React from 'react';
import { Page } from '../types';
import { useTranslation } from './LanguageProvider';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface SignInProps {
    setActivePage: (page: Page) => void;
    onGoogleLogin: (name?: string, email?: string, id?: string) => void;
}

// --- THIS IS THE CRITICAL FIX ---
// By creating a separate component for the button, we ensure the `useGoogleLogin` hook
// is called in a stable environment, which prevents the "Illegal constructor" crash.
const GoogleSignInButton: React.FC<{ onGoogleLogin: (name?: string, email?: string, id?: string) => void; }> = ({ onGoogleLogin }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.access_token}`,
                    },
                });
                
                if (res.ok) {
                    const userInfo: { name?: string, email?: string, sub?: string } = await res.json();
                    onGoogleLogin(userInfo.name, userInfo.email, userInfo.sub);
                } else {
                    throw new Error('Failed to fetch user info from Google.');
                }
            } catch (error) {
                console.error("❌ Google Sign-In Error (after success):", error);
                alert("Login successful, but could not retrieve your profile information. Please try again.");
            }
        },
        onError: (error) => {
            console.error("❌ Google Sign-In Error:", error);
            alert("Google Sign-In failed. Please check your browser console for details.");
        },
    });

    return (
        <button
            onClick={() => login()}
            className="w-full flex items-center justify-center py-3 px-4 bg-gray-800 hover:bg-black text-white rounded-full transition-colors duration-200 border border-gray-700 shadow-md dark:bg-white dark:text-gray-800 dark:hover:bg-gray-200"
        >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9.1 3.7l6.8-6.8C35.9 2.5 30.5 0 24 0 14.5 0 6.7 5.4 3 13.2l8.4 6.5C13.2 13.4 18.2 9.5 24 9.5z"></path>
                <path fill="#34A853" d="M46.2 25.4c0-1.7-.2-3.4-.5-5H24v9.5h12.5c-.5 3.1-2.1 5.7-4.7 7.5l7.9 6.1c4.6-4.3 7.3-10.4 7.3-18.1z"></path>
                <path fill="#FBBC05" d="M11.4 28.5c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-8.4-6.5C1.2 15.9 0 19.8 0 24s1.2 8.1 3 11.2l8.4-6.7z"></path>
                <path fill="#EA4335" d="M24 48c6.5 0 12-2.1 16-5.6l-7.9-6.1c-2.1 1.4-4.9 2.3-7.9 2.3-5.9 0-10.9-3.9-12.7-9.2L3 35.2C6.7 43 14.5 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span className="font-semibold text-base">Sign in with Google</span>
        </button>
    );
};


const SignIn: React.FC<SignInProps> = ({ setActivePage, onGoogleLogin }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col justify-center items-center h-full p-4 bg-white dark:bg-gray-900">
            <section className="text-center">
                <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 ring-4 ring-white dark:ring-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('sign_in')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto text-sm">
                    {t('sign_in_prompt')}
                </p>
            </section>

            <section className="mt-8 w-full max-w-xs flex justify-center">
                <GoogleSignInButton onGoogleLogin={onGoogleLogin} />
            </section>
            
            <section className="mt-8 w-full max-w-xs text-center">
                <div className="mt-8 text-xs text-gray-400 dark:text-gray-500">
                    By continuing, you agree to our <br/>
                    <button onClick={() => setActivePage(Page.TERMS_OF_SERVICE)} className="text-violet-500 dark:text-violet-400 hover:underline">Terms of Service</button>
                    <span> & </span>
                    <button onClick={() => setActivePage(Page.PRIVACY_POLICY)} className="text-violet-500 dark:text-violet-400 hover:underline">Privacy Policy</button>
                </div>
            </section>
        </div>
    );
};

export default SignIn;