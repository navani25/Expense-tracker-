import React, { useState, useEffect } from 'react';
import { Page, LoginProvider } from '../types';
import DarkModeToggle from './DarkModeToggle';
import { LANGUAGES } from '../constants';
import { useTranslation } from './LanguageProvider';
import SignIn from './SignIn';
import ConfirmationModal from './ConfirmationModal';

interface SettingsProps {
    isUserSignedIn: boolean;
    onLogout: () => void;
    setActivePage: (page: Page) => void;
    setLoginProvider: (provider: LoginProvider) => void;
    userName: string;
    userEmail: string;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    profilePhoto: string | null;
    onGoogleLogin: (name?: string, email?: string, id?: string, credential?: string) => void;
}

const SettingsListItem: React.FC<{
    label: string;
    onClick: () => void;
}> = ({ label, onClick }) => (
     <button onClick={onClick} className="flex items-center justify-between w-full p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <span className="text-gray-800 dark:text-gray-200">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="12 5 19 12 12 19"></polyline></svg>
    </button>
);

const SignedInView: React.FC<Omit<SettingsProps, 'isUserSignedIn' | 'setLoginProvider' | 'onGoogleLogin'>> = ({ onLogout, setActivePage, userName, userEmail, profilePhoto, isDarkMode, setIsDarkMode }) => {
    const { t, language } = useTranslation();
    const currentLanguageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    
    // --- NEW NOTIFICATION LOGIC ---
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(() => {
        // Check if permission was already granted in a previous session
        return Notification.permission === 'granted';
    });

    const handleNotificationToggle = () => {
        const newPermissionState = !pushNotificationsEnabled;
        if (newPermissionState) {
            // Ask for permission if it's not already granted or denied
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        setPushNotificationsEnabled(true);
                        // Show a test notification
                        new Notification("Ledgerly Notifications", {
                            body: "You've successfully enabled notifications!",
                        });
                    }
                });
            } else if (Notification.permission === 'granted') {
                setPushNotificationsEnabled(true);
            }
        } else {
            // The user can't "un-grant" permission, but we can toggle our app's state
            // In a real app, you would tell your backend to stop sending notifications.
            setPushNotificationsEnabled(false);
        }
    };
    
    // Sync the toggle's visual state with the actual browser permission
    useEffect(() => {
        setPushNotificationsEnabled(Notification.permission === 'granted');
    }, []);

    const handleLogoutConfirm = () => {
        onLogout();
        setIsLogoutModalOpen(false);
    };

    return (
        <>
            <section className="text-center">
                 <button 
                    onClick={() => setActivePage(Page.PROFILE_PHOTO)}
                    className="relative w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 ring-4 ring-white dark:ring-gray-800 group"
                    aria-label="Change profile photo"
                 >
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-violet-600 flex items-center justify-center text-white text-4xl font-bold">
                            {userName.charAt(0)}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </div>
                </button>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{userName}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{userEmail}</p>
            </section>
            
            <section className="space-y-2">
                <h3 className="px-4 text-lg font-semibold text-gray-600 dark:text-gray-400">Profile</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <SettingsListItem label="Edit Profile Info" onClick={() => setActivePage(Page.PROFILE_SETTINGS)} />
                </div>
            </section>

            <section className="space-y-2">
                <h3 className="px-4 text-lg font-semibold text-gray-600 dark:text-gray-400">{t('manage')}</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <SettingsListItem label={t('expense_categories')} onClick={() => setActivePage(Page.EXPENSE_CATEGORIES)} />
                    <SettingsListItem label={t('income_categories')} onClick={() => setActivePage(Page.INCOME_CATEGORIES)} />
                </div>
            </section>

            <section className="space-y-2">
                <h3 className="px-4 text-lg font-semibold text-gray-600 dark:text-gray-400">{t('general')}</h3>
                 <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <SettingsListItem label={t('currency')} onClick={() => setActivePage(Page.CURRENCY_SETTINGS)} />
                    <SettingsListItem label={t('contacts')} onClick={() => setActivePage(Page.CONTACTS)} />
                    <SettingsListItem label={t('legal')} onClick={() => setActivePage(Page.LEGAL)} />
                </div>
            </section>
            
            <section className="space-y-2">
                <h3 className="px-4 text-lg font-semibold text-gray-600 dark:text-gray-400">Notifications</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between w-full p-4">
                        <span className="text-gray-800 dark:text-gray-200">Push Notifications</span>
                        <DarkModeToggle enabled={pushNotificationsEnabled} setEnabled={handleNotificationToggle} />
                    </div>
                </div>
            </section>

            <section className="space-y-2">
                <h3 className="px-4 text-lg font-semibold text-gray-600 dark:text-gray-400">{t('preferences')}</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActivePage(Page.LANGUAGE_SETTINGS)} className="flex items-center justify-between w-full p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span className="text-gray-800 dark:text-gray-200">{t('language')}</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500 dark:text-gray-400">{currentLanguageName}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </button>
                    <div className="flex items-center justify-between w-full p-4">
                        <span className="text-gray-800 dark:text-gray-200">{t('dark_mode')}</span>
                        <DarkModeToggle enabled={isDarkMode} setEnabled={setIsDarkMode} />
                    </div>
                </div>
            </section>

            <section>
                 <button onClick={() => setIsLogoutModalOpen(true)} className="w-full text-center py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    {t('log_out')}
                </button>
            </section>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                title="Confirm Log Out"
                message="Are you sure you want to log out? Your data is saved with your account."
                onConfirm={handleLogoutConfirm}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Log Out"
            />
        </>
    );
};


const Settings: React.FC<SettingsProps> = (props) => {
  const { isUserSignedIn, setActivePage, setLoginProvider, onGoogleLogin } = props;
  const { t } = useTranslation();

  if (!isUserSignedIn) {
    return <SignIn setActivePage={setActivePage} setLoginProvider={setLoginProvider} onGoogleLogin={onGoogleLogin} isDarkMode={props.isDarkMode} />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col">
      <header className="p-4 text-center sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 sm:hidden">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings_title')}</h1>
      </header>
      <main className="flex-1 p-4 space-y-8 sm:max-w-3xl sm:mx-auto sm:w-full sm:py-8">
        <SignedInView {...props} />
      </main>
    </div>
  );
};

export default Settings;