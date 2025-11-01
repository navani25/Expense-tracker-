import React from 'react';
import { Page, LoginProvider } from '../types';
import { useTranslation } from './LanguageProvider';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface SignInProps {
    setActivePage: (page: Page) => void;
    setLoginProvider: (provider: LoginProvider) => void;
    onGoogleLogin: (name?: string, email?: string, id?: string) => void;
    isDarkMode: boolean;
}

const SignIn: React.FC<SignInProps> = ({ setActivePage, onGoogleLogin, isDarkMode }) => {
    const { t } = useTranslation();

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            try {
                // Decode the JWT token to get user info
                const decoded: { name?: string, email?: string, sub?: string, given_name?: string, family_name?: string } = jwtDecode(credentialResponse.credential);
                
                // Try to construct a full name if 'name' isn't provided
                let fullName = decoded.name;
                if (!fullName && (decoded.given_name || decoded.family_name)) {
                    fullName = `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim();
                }
                
                onGoogleLogin(fullName, decoded.email, decoded.sub);
            } catch (error) {
                console.error("Error decoding JWT:", error);
                alert("Login successful, but could not retrieve your profile information. Please try again.");
            }
        } else {
            console.error("Google Sign-In Error: No credential returned.");
            alert("Google Sign-In failed. Please try again.");
        }
    };

    const handleError = () => {
        console.error("❌ Google Sign-In Error");
        alert("Google Sign-In failed. Please check your browser console for details.");
    };

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
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap // Enables the one-tap sign-in experience
                    theme={isDarkMode ? 'filled_black' : 'outline'}
                    shape="pill" // Matches the original button's rounded style
                    width="320px" // Ensure it fits the container
                />
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