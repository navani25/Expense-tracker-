import React, { useState, useEffect, useRef } from 'react';
import { Expense, Income, Transfer, AnyTransactionFormData, Contact, Category } from '../types';
import { useTranslation } from './LanguageProvider';
import { api } from '../constants';

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

interface AddExpenseModalProps {
  mode: 'manual' | 'voice' | 'receipt';
  onClose: () => void;
  onSave: (data: AnyTransactionFormData | AnyTransactionFormData[]) => void;
  transactionToEdit: Expense | Income | Transfer | null;
  expenseCategories: Category[];
  incomeCategories: Category[];
  onAddExpenseCategory: (name: string) => void;
  onAddIncomeCategory: (name: string) => void;
  transactionType: 'expense' | 'income';
  accounts: string[];
  contacts: Contact[];
  userName: string;
}

// --- Helper Components ---

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} className={`w-full text-center px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none ${active ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
    {label}
  </button>
);

const CategoryPickerButton: React.FC<{ categoryName: string; onClick: () => void; categories: Category[]; }> = ({ categoryName, onClick, categories }) => {
  const category = categories.find(c => c.name === categoryName);
  return (
    <button type="button" onClick={onClick} className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 flex items-center justify-between">
      <span className="flex items-center min-w-0">
        <span className="mr-2 text-xl">{category?.icon || '🏷️'}</span>
        <span className="truncate">{category?.name || 'Select Category'}</span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 ml-2 flex-shrink-0"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
  );
};

const CategorySelectionModal: React.FC<{ onClose: () => void; onSelect: (name: string) => void; onAddCustom: () => void; categories: Category[]; }> = ({ onClose, onSelect, onAddCustom, categories }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4">
      <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Select Category</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {categories.map(cat => (
            <button key={cat.name} onClick={() => onSelect(cat.name)} className="flex flex-col items-center justify-center space-y-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs text-center text-gray-600 dark:text-gray-300">{cat.name}</span>
            </button>
          ))}
          <button onClick={onAddCustom} className="flex flex-col items-center justify-center space-y-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50">
            <span className="text-2xl">➕</span>
            <span className="text-xs text-center font-semibold text-violet-600 dark:text-violet-400">Add New</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AddCustomCategoryModal: React.FC<{ onClose: () => void; onSave: (name: string) => void; }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xs mx-4 p-5">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">New Category</h3>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" autoFocus />
        <div className="flex justify-end space-x-2 mt-5">
          <button onClick={onClose} className="py-2 px-4 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={() => onSave(name)} disabled={!name.trim()} className="py-2 px-4 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-400">Save</button>
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ mode, onClose, onSave, transactionToEdit, expenseCategories, incomeCategories, onAddExpenseCategory, onAddIncomeCategory, transactionType, accounts, contacts, userName }) => {
  const isEditing = transactionToEdit !== null;
  const { language } = useTranslation();

  type ActiveTab = 'expense' | 'income';
  type ModalView = 'tabs' | 'voice' | 'receipt';

  const [activeTab, setActiveTab] = useState<ActiveTab>(transactionType);
  const [view, setView] = useState<ModalView>(mode === 'manual' ? 'tabs' : mode);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddCustomCategoryModalOpen, setIsAddCustomCategoryModalOpen] = useState(false);

  // Voice & AI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Listening...');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null); // Stores AI result before saving

  const recognitionRef = useRef<any>(null);

  const currentCategories = activeTab === 'income' ? incomeCategories : expenseCategories;
  const addCategoryHandler = activeTab === 'income' ? onAddIncomeCategory : onAddExpenseCategory;

  const initialFormData = { amount: '', vendor: '', source: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' };
  const [formData, setFormData] = useState<any>(initialFormData);

  // --- VOICE RECOGNITION FUNCTIONS ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setStatusText("Voice not supported."); return; }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText("Listening...");
      if (!transcript) setTranscript('');
      setPreviewData(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') setStatusText("Didn't hear anything. Tap mic.");
      else if (event.error === 'not-allowed') setStatusText("Permission denied.");
      else setStatusText("Stopped.");
      setIsListening(false);
    };

    recognition.onend = () => { setIsListening(false); };
    try { recognition.start(); } catch (e) { console.error(e); }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatusText("Tap to speak again");
    }
  };

  useEffect(() => {
    setActiveTab(transactionType);
    setView(mode === 'manual' ? 'tabs' : mode);
    if (mode === 'voice') {
      setTranscript('');
      setStatusText('Initializing...');
      setPreviewData(null);

      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [transactionType, mode]);

  useEffect(() => {
    if (isEditing && transactionToEdit) {
      const { id, amount, category, date, notes } = transactionToEdit;
      let fullData: any = { ...initialFormData, id, amount: amount.toString(), category: category || '', date: date || new Date().toISOString().split('T')[0], notes: notes || '' };
      if ('vendor' in transactionToEdit) fullData.vendor = transactionToEdit.vendor || '';
      if ('source' in transactionToEdit) fullData.source = transactionToEdit.source || '';
      setFormData(fullData);
    } else {
      const defaultCategory = currentCategories.length > 0 ? currentCategories[0].name : '';
      setFormData({ ...initialFormData, category: defaultCategory });
    }
  }, [transactionToEdit, isEditing, activeTab, incomeCategories, expenseCategories]);

  const handleCategorySelect = (categoryName: string) => {
    setFormData(prev => ({ ...prev, category: categoryName }));
    setIsCategoryModalOpen(false);
  };

  const handleAddCustomCategory = (categoryName: string) => {
    addCategoryHandler(categoryName);
    setFormData(prev => ({ ...prev, category: categoryName }));
    setIsAddCustomCategoryModalOpen(false);
    setIsCategoryModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFinal(formData, activeTab);
  };

  const saveFinal = (data: any, type: 'expense' | 'income') => {
    const dataToSave: AnyTransactionFormData & { transactionType: 'expense' | 'income' } = {
      transactionType: type,
      id: isEditing ? transactionToEdit?.id : undefined,
      ...data
    };
    onSave(dataToSave);
  };

  // --- AI INTELLIGENT PARSING VIA SECURE BACKEND ---
  const parseTransactionWithAI = async (text: string) => {
    if (!text.trim()) { setStatusText("Please speak or type something."); return; }

    setStatusText(`Processing...`);
    setIsProcessing(true);

    try {
      const finalData = await api.ai.parseTransaction(text);
      setPreviewData(finalData);
      setIsProcessing(false);
    } catch (err: any) {
      console.error("AI Error:", err);
      setStatusText(err.message || "Could not understand. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleProcessVoice = () => {
    stopListening();
    parseTransactionWithAI(transcript);
  };

  const handleConfirmPreview = () => {
    if (!previewData) return;
    const type = previewData.transactionType === 'income' ? 'income' : 'expense';
    saveFinal(previewData, type);
  };

  useEffect(() => { return () => { if (recognitionRef.current) recognitionRef.current.stop(); }; }, []);

  // --- RENDER VIEWS ---

  const renderVoiceView = () => {
    // If AI has processed data, show PREVIEW CARD
    if (previewData) {
      const isInc = previewData.transactionType === 'income';
      return (
        <div className="p-6 flex flex-col items-center animate-fade-in">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isInc ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isInc ?
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
            }
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{isInc ? 'Income Detected' : 'Expense Detected'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Is this correct?</p>

          <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Amount</span>
              <span className={`font-bold text-lg ${isInc ? 'text-green-600' : 'text-red-600'}`}>₹{previewData.amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">For</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{previewData.notes || previewData.vendor || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Category</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{previewData.category}</span>
            </div>
          </div>

          <div className="flex w-full gap-3">
            <button onClick={() => { setPreviewData(null); setStatusText("Tap mic to try again"); }} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors hover:bg-gray-300 dark:hover:bg-gray-600">
              Retry
            </button>
            <button onClick={handleConfirmPreview} className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none transition-all">
              Confirm & Save
            </button>
          </div>
        </div>
      );
    }

    // Default VOICE LISTENING UI
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[320px]">

        {/* Professional Pulsing Mic */}
        <div className="relative w-24 h-24 mb-6 cursor-pointer group" onClick={isListening ? stopListening : startListening}>
          {isListening && (
            <>
              <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-violet-400 rounded-full animate-pulse opacity-30 delay-75"></div>
            </>
          )}
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isListening ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 scale-110' : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:scale-105'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={isListening ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isListening ? "text-white" : "text-gray-500 dark:text-gray-400"}>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
        </div>

        <p className={`text-lg font-medium mb-3 transition-all ${isListening ? 'text-violet-600 dark:text-violet-400 animate-pulse' : 'text-gray-600 dark:text-gray-300'}`}>
          {statusText}
        </p>

        {/* Editable Transcript Box */}
        <div className="w-full max-w-xs mb-6 relative group">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onFocus={() => isListening && stopListening()} // Stop listening if user taps to edit
            placeholder="Try saying: 'Petrol 500'"
            className="w-full bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl min-h-[80px] text-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-all shadow-inner"
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">Tap to edit</span>
        </div>

        {/* Controls */}
        <div className="flex w-full gap-3 max-w-xs">
          <button onClick={() => setView('tabs')} className="flex-1 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Manual Input
          </button>
          {transcript && !isProcessing && (
            <button onClick={handleProcessVoice} className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none transition-all">
              Analyze
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderManualView = () => {
    const saveButtonText = isEditing ? 'Update Transaction' : activeTab === 'income' ? 'Add Income' : 'Add Expense';
    return (
      <div className="p-5">
        {!isEditing && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-6">
            <TabButton label="Expense" active={activeTab === 'expense'} onClick={() => setActiveTab('expense')} />
            <TabButton label="Income" active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div><label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider ml-1">Amount</label><div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span><input type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-xl font-bold text-gray-900 dark:text-gray-100 rounded-xl border-none focus:ring-2 focus:ring-violet-500 transition-all" required autoFocus /></div></div>

          {activeTab === 'expense' ? (
            <>
              <div><label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider ml-1">Title</label><input type="text" name="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. Lunch, Taxi" className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-violet-500" /></div>
              <div><label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider ml-1">Category</label><CategoryPickerButton categoryName={formData.category} onClick={() => setIsCategoryModalOpen(true)} categories={currentCategories} /></div>
            </>
          ) : (
            <>
              <div><label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider ml-1">Source / Title</label><input type="text" name="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. Freelance, Salary" className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-violet-500" /></div>
              <div><label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider ml-1">Category</label><CategoryPickerButton categoryName={formData.category} onClick={() => setIsCategoryModalOpen(true)} categories={currentCategories} /></div>
            </>
          )}

          <div><label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider ml-1">Date</label><input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-none focus:ring-2 focus:ring-violet-500" required /></div>

          <div className="pt-4"><button type="submit" className="w-full bg-violet-600 text-white py-3.5 rounded-xl hover:bg-violet-700 font-bold shadow-lg shadow-violet-200 dark:shadow-none transition-all active:scale-95">{saveButtonText}</button></div>
        </form>
      </div>
    );
  };

  const getTitle = () => {
    if (previewData) return 'Confirm Transaction';
    if (isEditing) return 'Edit Transaction';
    if (view === 'voice') return 'Voice Assistant';
    return activeTab === 'income' ? 'New Income' : 'New Expense';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between p-4 px-6 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div className="overflow-y-auto custom-scrollbar">
          {view === 'voice' ? renderVoiceView() : renderManualView()}
        </div>

        {isCategoryModalOpen && (<CategorySelectionModal onClose={() => setIsCategoryModalOpen(false)} onSelect={handleCategorySelect} onAddCustom={() => setIsAddCustomCategoryModalOpen(true)} categories={currentCategories} />)}
        {isAddCustomCategoryModalOpen && (<AddCustomCategoryModal onClose={() => setIsAddCustomCategoryModalOpen(false)} onSave={handleAddCustomCategory} />)}
      </div>
    </div>
  );
};

export default AddExpenseModal;