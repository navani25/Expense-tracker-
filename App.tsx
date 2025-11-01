import React, { useState, useCallback, useEffect } from 'react';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Reports from './components/Reports';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import AddExpenseModal from './components/AddExpenseModal';
import ExpenseCategories from './components/ExpenseCategories';
import IncomeCategories from './components/IncomeCategories';
// import TransferCategories from './components/TransferCategories'; // Removed
import CurrencySettings from './components/CurrencySettings';
import LanguageSettings from './components/LanguageSettings';
import Contacts from './components/Contacts';
import Legal from './components/Legal';
import Login from './components/Login';
import Signup from './components/Signup';
import { Page, Expense, Income, Contact, Bank, Transfer, Category, AnyTransactionFormData, ExpenseFormData, IncomeFormData, TransferFormData, LoginProvider, ContactFormData } from './types';
import { CURRENCIES, BANKS, INITIAL_ACCOUNTS, api, INITIAL_GUEST_EXPENSE_CATEGORIES, INITIAL_GUEST_INCOME_CATEGORIES } from './constants';
import { useDarkMode } from './hooks/useDarkMode';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ConnectBank from './components/ConnectBank';
import LinkAccount from './components/LinkAccount';
import ProfilePhoto from './components/ProfilePhoto';
import ProfileSettings from './components/ProfileSettings';
import Support from './components/Support';
import { useTranslation } from './components/LanguageProvider';
import Sidebar from './components/Sidebar';
import ForgotEmail from './components/ForgotEmail';
import CreateAccount from './components/CreateAccount';
import ForgotPassword from './components/ForgotPassword';
import Licenses from './components/Licenses';
import SignInPromptModal from './components/SignInPromptModal';
import DemoReport from './components/DemoReport';
import ConfirmationModal from './components/ConfirmationModal';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

if (!Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    // This is the Client ID for the web application
    clientId: '381448198833-grkepoai0bqbtj2ntofc67hb4tqhd6ln.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

const LoadingSpinner: React.FC = () => ( <div className="flex items-center justify-center h-full"> <div className="relative"> <div className="w-16 h-16 border-4 border-violet-200 dark:border-violet-700 rounded-full"></div> <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div> </div> </div> );

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]); // Keep for data integrity, but remove UI
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  // const [transferCategories, setTransferCategories] = useState<Category[]>(TRANSFER_CATEGORIES); // Removed
  
  const [modalMode, setModalMode] = useState<'manual' | 'voice' | 'receipt' | null>(null);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense'); // Removed 'transfer'
  const [transactionToEdit, setTransactionToEdit] = useState<Expense | Income | Transfer | null>(null);

  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [loginProvider, setLoginProvider] = useState<LoginProvider | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useDarkMode();

  const [currency, setCurrency] = useState(CURRENCIES[0].code);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<string[]>(INITIAL_ACCOUNTS);

  const [isBankConnected, setIsBankConnected] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);


  const loadAllDataFromDB = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [fetchedTransactions, fetchedExpCategories, fetchedIncCategories] = await Promise.all([
        api.fetchTransactions(userId),
        api.fetchExpenseCategories(),
        api.fetchIncomeCategories(),
      ]);

      setExpenses(fetchedTransactions.filter((t: any) => t.transactionType === 'expense'));
      setIncome(fetchedTransactions.filter((t: any) => t.transactionType === 'income'));
      setTransfers(fetchedTransactions.filter((t: any) => t.transactionType === 'transfer'));
      
      setCategories(fetchedExpCategories);
      setIncomeCategories(fetchedIncCategories);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isUserSignedIn && userId) {
      loadAllDataFromDB();
      const savedPhoto = localStorage.getItem(`profilePhoto_${userId}`);
      if (savedPhoto) setProfilePhoto(savedPhoto);
    } else {
      setExpenses([]); setIncome([]); setTransfers([]); setProfilePhoto(null);
      setCategories(INITIAL_GUEST_EXPENSE_CATEGORIES);
      setIncomeCategories(INITIAL_GUEST_INCOME_CATEGORIES);
      setIsLoading(false);
    }
  }, [isUserSignedIn, userId, loadAllDataFromDB]);

  useEffect(() => {
    if (userId && profilePhoto) localStorage.setItem(`profilePhoto_${userId}`, profilePhoto);
  }, [profilePhoto, userId]);
  
  useEffect(() => {
    if (userId && userName && userEmail) {
        const profileData = { savedName: userName, savedEmail: userEmail };
        localStorage.setItem(`profileInfo_${userId}`, JSON.stringify(profileData));
    }
  }, [userName, userEmail, userId]);


  const handleLogin = useCallback((name?: string, email?: string, id?: string) => {
    const finalId = id || null;
    if (!finalId) return;

    const savedProfile = localStorage.getItem(`profileInfo_${finalId}`);
    let finalName = name || "User";
    let finalEmail = email || "user@example.com";
    if (savedProfile) {
        const { savedName, savedEmail } = JSON.parse(savedProfile);
        finalName = savedName || finalName;
        finalEmail = savedEmail || finalEmail;
    }
    
    setIsUserSignedIn(true);
    setUserName(finalName);
    setUserEmail(finalEmail);
    setUserId(finalId);
    
    setActivePage(Page.DASHBOARD);
  }, []);

  const handleGetStarted = useCallback(() => setHasSeenWelcome(true), []);
  
  const handleSaveProfile = (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`.trim();
    setUserName(fullName);
  };

  const handleOpenModal = useCallback((mode: 'manual' | 'voice' | 'receipt', type: 'expense' | 'income' = 'expense') => {
    if(!isUserSignedIn){ setIsSignInPromptOpen(true); return; }
    setTransactionType(type);
    setTransactionToEdit(null);
    setModalMode(mode);
  }, [isUserSignedIn]);

  const handleLogout = useCallback(() => {
    setIsUserSignedIn(false); setContacts([]); setIsBankConnected(false);
    setUserName(""); setUserEmail(""); setUserId(null);
    setActivePage(Page.DASHBOARD);
  }, []);
  
  const handleEditTransaction = useCallback((transaction: Expense | Income | Transfer) => {
    if ('vendor' in transaction) setTransactionType('expense');
    else if ('source' in transaction) setTransactionType('income');
    // Removed transfer logic
    setTransactionToEdit(transaction);
    setModalMode('manual');
  }, []);
  
  const handleDeleteTransaction = useCallback(async (id: string | number) => {
    if (!userId) return;
    
    setConfirmation({
        isOpen: true,
        title: "Delete Transaction",
        message: "Are you sure you want to permanently delete this transaction?",
        onConfirm: async () => {
            try { await api.deleteTransaction(id, userId); await loadAllDataFromDB(); } catch (error) { console.error("Failed to delete transaction:", error); alert("Could not delete the transaction."); }
            setConfirmation(null);
        }
    });
  }, [userId, loadAllDataFromDB]);
  
  // --- THIS IS THE DEFINITIVE FIX FOR THE SAVING BUG ---
  const handleSaveTransaction = useCallback(async (data: AnyTransactionFormData | AnyTransactionFormData[]) => {
      if (!userId) {
          alert("You must be signed in to save a transaction.");
          return;
      }

      const saveData = async (item: AnyTransactionFormData & { transactionType?: 'expense' | 'income' | 'transfer' }) => {
          const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
          if (isNaN(amount) || amount <= 0) {
              console.error("Invalid amount for item:", item);
              return;
          }

          // --- FIX: Trust the transactionType from the modal (AI or manual) ---
          let type = item.transactionType;
          if (!type) {
              // Fallback logic, though this shouldn't be hit with the modal fix
              if ('fromAccount' in item && 'toAccount' in item) {
                  type = 'transfer';
              } else if ('source' in item) {
                  type = 'income';
              } else {
                  type = 'expense';
              }
          }
          
          // --- User request: Do not save transfers from this flow ---
          if (type === 'transfer') {
              console.warn("Skipping transfer transaction:", item);
              return; // Simply don't save it
          }

          const transactionData = { ...item, transactionType: type, amount };
          
          try {
              if (item.id) { // Check if it's an edit
                  await api.updateTransaction(item.id, transactionData, userId);
              } else { // It's a new transaction
                  await api.addTransaction(transactionData, userId);
                  if (Notification.permission === 'granted') {
                    const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
                    new Notification("Transaction Saved", { body: `Successfully saved a new ${type} of ${currencySymbol}${amount.toFixed(2)}.`, });
                  }
              }
          } catch (error) {
              console.error("Failed to save transaction:", error);
              alert("Could not save the transaction.");
          }
      };

      if (Array.isArray(data)) {
        for (const item of data) { await saveData(item); }
      } else {
        await saveData(data);
      }
      
      await loadAllDataFromDB();
      setModalMode(null);
      setTransactionToEdit(null);
  }, [userId, loadAllDataFromDB, currency]); // Removed `transactionType` as a dependency

  const handleAddCategory = async (newCategoryName: string) => { try { await api.addExpenseCategory(newCategoryName); const fetched = await api.fetchExpenseCategories(); setCategories(fetched); } catch (e) { alert((e as Error).message); } };
  const handleDeleteCategory = async (categoryToDelete: string) => {
    setConfirmation({
        isOpen: true,
        title: "Delete Category",
        message: `Are you sure you want to delete "${categoryToDelete}"? This cannot be undone.`,
        onConfirm: async () => {
            try { await api.deleteExpenseCategory(categoryToDelete); const fetched = await api.fetchExpenseCategories(); setCategories(fetched); } catch (e) { alert((e as Error).message); }
            setConfirmation(null);
        }
    });
  };
  const handleAddIncomeCategory = async (newCategory: string) => { try { await api.addIncomeCategory(newCategory); const fetched = await api.fetchIncomeCategories(); setIncomeCategories(fetched); } catch (e) { alert((e as Error).message); } };
  const handleDeleteIncomeCategory = async (categoryToDelete: string) => {
    setConfirmation({
        isOpen: true,
        title: "Delete Category",
        message: `Are you sure you want to delete "${categoryToDelete}"? This cannot be undone.`,
        onConfirm: async () => {
            try { await api.deleteIncomeCategory(categoryToDelete); const fetched = await api.fetchIncomeCategories(); setIncomeCategories(fetched); } catch (e) { alert((e as Error).message); }
            setConfirmation(null);
        }
    });
  };
  // const handleAddTransferCategory = (newCategory: string) => { if (!transferCategories.find(c => c.name.toLowerCase() === newCategory.toLowerCase())) { setTransferCategories(prev => [...prev, { name: newCategory, icon: '🏷️' }]); } }; // Removed
  const handleAddContact = (contact: ContactFormData) => { const newContact: Contact = { ...contact, id: `c_${Date.now()}`, avatarColor: ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][Math.floor(Math.random() * 5)] }; setContacts(prev => [newContact, ...prev]); };
  const handleUpdateContact = (updatedContact: Contact) => setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  const handleDeleteContact = (contactId: string) => {
    setConfirmation({
        isOpen: true,
        title: "Delete Contact",
        message: "Are you sure you want to delete this contact?",
        onConfirm: () => {
            setContacts(prev => prev.filter(c => c.id !== contactId));
            setConfirmation(null);
        }
    });
  };
  const handleGoToSignIn = () => { setIsSignInPromptOpen(false); setActivePage(Page.SETTINGS); };

  const renderPage = () => {
    if (isLoading) { return <LoadingSpinner />; }
    const currentUserName = isUserSignedIn ? userName : "Welcome";
    switch (activePage) {
      case Page.DASHBOARD: return <Dashboard openModal={(mode) => handleOpenModal(mode, 'expense')} expenses={expenses} income={income} transfers={transfers} userName={currentUserName} setActivePage={setActivePage} currency={currency} onEditExpense={handleEditTransaction} />;
      case Page.HISTORY: return <History expenses={expenses} income={income} transfers={transfers} onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} onAdd={(type) => handleOpenModal('manual', type)} setActivePage={setActivePage} currency={currency} />;
      case Page.REPORTS: return <Reports expenses={expenses} isDarkMode={isDarkMode} isBankConnected={isBankConnected} setActivePage={setActivePage} setIsBankConnected={setIsBankConnected} currency={currency} />;
      case Page.SETTINGS: return <Settings isUserSignedIn={isUserSignedIn} onLogout={handleLogout} setActivePage={setActivePage} setLoginProvider={setLoginProvider} userName={userName} userEmail={userEmail} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} profilePhoto={profilePhoto} onGoogleLogin={handleLogin} />;
      case Page.LOGIN: return <Login onLogin={handleLogin} provider={loginProvider} setActivePage={setActivePage} />;
      case Page.SIGNUP: return <Signup onSignup={() => handleLogin()} setActivePage={setActivePage} />;
      case Page.SUPPORT: return <Support setActivePage={setActivePage} userName={userName} income={income} expenses={expenses} />;
       case Page.FORGOT_EMAIL: return <ForgotEmail setActivePage={setActivePage} />;
      case Page.CREATE_ACCOUNT: return <CreateAccount onSignup={handleLogin} setActivePage={setActivePage} />;
      case Page.FORGOT_PASSWORD: return <ForgotPassword setActivePage={setActivePage} />;
      case Page.PROFILE_SETTINGS: return <ProfileSettings setActivePage={setActivePage} currentName={userName} currentEmail={userEmail} onSave={handleSaveProfile} />;
      case Page.EXPENSE_CATEGORIES: return <ExpenseCategories setActivePage={setActivePage} categories={categories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />;
      case Page.INCOME_CATEGORIES: return <IncomeCategories setActivePage={setActivePage} categories={incomeCategories} onAddCategory={handleAddIncomeCategory} onDeleteCategory={handleDeleteCategory} />;
      // case Page.TRANSFER_CATEGORIES: return <TransferCategories setActivePage={setActivePage} categories={transferCategories.map(c => c.name)} onAddCategory={handleAddTransferCategory} />; // Removed
      case Page.CURRENCY_SETTINGS: return <CurrencySettings setActivePage={setActivePage} selectedCurrency={currency} setSelectedCurrency={setCurrency} />;
      case Page.LANGUAGE_SETTINGS: return <LanguageSettings setActivePage={setActivePage} />;
      case Page.CONTACTS: return <Contacts setActivePage={setActivePage} contacts={contacts} onAddContact={handleAddContact} onUpdateContact={handleUpdateContact} onDeleteContact={handleDeleteContact} />;
      case Page.LEGAL: return <Legal setActivePage={setActivePage} />;
      case Page.PRIVACY_POLICY: return <PrivacyPolicy setActivePage={setActivePage} />;
      case Page.TERMS_OF_SERVICE: return <TermsOfService setActivePage={setActivePage} />;
      case Page.LICENSES: return <Licenses setActivePage={setActivePage} />;
      case Page.CONNECT_BANK: return <ConnectBank setActivePage={setActivePage} banks={BANKS} onSelectBank={setSelectedBank} />;
      case Page.LINK_ACCOUNT: return <LinkAccount setActivePage={setActivePage} bank={selectedBank} onConnect={() => {setIsBankConnected(true); setActivePage(Page.REPORTS);}} />;
      case Page.PROFILE_PHOTO: return <ProfilePhoto setActivePage={setActivePage} currentPhoto={profilePhoto} onPhotoChange={setProfilePhoto} userName={userName} />;
      case Page.DEMO_REPORT: return <DemoReport setActivePage={setActivePage} isDarkMode={isDarkMode} />;
      default: return <Dashboard openModal={(mode) => handleOpenModal(mode, 'expense')} expenses={expenses} income={income} transfers={transfers} userName={currentUserName} setActivePage={setActivePage} currency={currency} onEditExpense={handleEditTransaction} />;
    }
  };

  if (!hasSeenWelcome) return <Welcome onGetStarted={handleGetStarted} />;
  
  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans">
        <div className="sm:flex h-full">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <div className="flex-1 flex flex-col min-w-0 relative">
            <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
              {renderPage()}
            </main>
            <BottomNav activePage={activePage} setActivePage={setActivePage} />
            
            {activePage === Page.SETTINGS && isUserSignedIn && (
              <button onClick={() => setActivePage(Page.SUPPORT)} className="fixed bottom-[60px] sm:bottom-6 sm:right-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 bg-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 transition-transform transform hover:scale-110 z-50" aria-label="Open support chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24" fill="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            )}
          </div>
        </div>

      {isSignInPromptOpen && ( <SignInPromptModal onClose={() => setIsSignInPromptOpen(false)} onSignIn={handleGoToSignIn} /> )}

      {confirmation?.isOpen && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation(null)}
        />
      )}

      {modalMode && (
          <AddExpenseModal
              mode={modalMode}
              onClose={() => setModalMode(null)}
              onSave={handleSaveTransaction}
              transactionToEdit={transactionToEdit}
              categories={categories}
              incomeCategories={incomeCategories}
              transferCategories={[]} // Pass empty array
              onAddCategory={handleAddCategory}
              onAddIncomeCategory={handleAddIncomeCategory}
              onAddTransferCategory={() => {}} // Pass empty function
              transactionType={transactionType}
              accounts={accounts}
              contacts={contacts}
              userName={userName}
          />
      )}
    </div>
  );
};

export default App;