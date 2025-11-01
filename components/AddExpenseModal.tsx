// AddExpenseModal.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, ExpenseFormData, IncomeFormData, TransferFormData, AnyTransactionFormData, Contact, Category, Income, Transfer } from '../types';
import { useTranslation } from './LanguageProvider';

// Declare SpeechRecognition for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AddExpenseModalProps {
  mode: 'manual' | 'voice' | 'receipt';
  onClose: () => void;
  onSave: (data: AnyTransactionFormData | AnyTransactionFormData[]) => void;
  transactionToEdit: Expense | Income | Transfer | null;
  categories: Category[];
  incomeCategories: Category[];
  transferCategories: Category[]; // Kept in props for compatibility, but will be unused
  onAddCategory: (name: string) => void;
  onAddIncomeCategory: (name: string) => void;
  onAddTransferCategory: (name: string) => void; // Kept in props for compatibility
  transactionType: 'expense' | 'income'; // Removed 'transfer'
  accounts: string[];
  contacts: Contact[];
  userName: string;
}

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-center px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none ${
            active
            ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow'
            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
        }`}
    >
        {label}
    </button>
);

const AddCustomCategoryModal: React.FC<{
  onClose: () => void;
  onSave: (name: string) => void;
}> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xs mx-4 p-5">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Add Custom Category</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <div className="flex justify-end space-x-2 mt-5">
          <button onClick={onClose} className="py-2 px-4 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={() => onSave(name)} disabled={!name.trim()} className="py-2 px-4 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-400">Save</button>
        </div>
      </div>
    </div>
  );
};

const CategorySelectionModal: React.FC<{
  onClose: () => void;
  onSelect: (name: string) => void;
  onAddCustom: () => void;
  categories: Category[];
}> = ({ onClose, onSelect, onAddCustom, categories }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4">
      <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Select Category</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {/* viewBox explicitly correct */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <span className="text-xs text-center font-semibold text-violet-600 dark:text-violet-400">Add Custom</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CategoryPickerButton: React.FC<{ categoryName: string; onClick: () => void; categories: Category[]; }> = ({ categoryName, onClick, categories }) => {
  const category = categories.find(c => c.name === categoryName);
  return (
    <button type="button" onClick={onClick} className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 flex items-center justify-between">
      <span className="flex items-center min-w-0">
        <span className="mr-2 text-xl">{category?.icon || '🏷️'}</span>
        <span className="truncate">{category?.name || 'Select Category'}</span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 ml-2 flex-shrink-0">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
};

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ mode, onClose, onSave, transactionToEdit, categories, incomeCategories, transferCategories, onAddCategory, onAddIncomeCategory, onAddTransferCategory, transactionType, accounts, contacts, userName }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Listening...');
  const isEditing = transactionToEdit !== null;
  const { language } = useTranslation();
  
  type ActiveTab = 'expense' | 'income'; // Removed 'transfer'
  type ModalView = 'tabs' | 'voice' | 'receipt';

  // --- FIX: Correctly set initial tab based on edit/create mode ---
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (isEditing && transactionToEdit) {
        if ('source' in transactionToEdit) return 'income';
    }
    if (transactionType === 'income') return 'income';
    return 'expense';
  });
  
  const [view, setView] = useState<ModalView>(mode === 'manual' ? 'tabs' : mode);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddCustomCategoryModalOpen, setIsAddCustomCategoryModalOpen] = useState(false);

  const peopleList = [{ id: 'user', name: `${userName} (me)` }, ...contacts];
  
  const initialFormData = {
    amount: '',
    vendor: '',
    source: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    fromAccount: peopleList[0]?.name || '',
    toAccount: peopleList.filter(p => p.name !== (peopleList[0]?.name || ''))[0]?.name || '',
  };

  const [formData, setFormData] = useState<any>(initialFormData);
  
  useEffect(() => {
    setView(mode === 'manual' ? 'tabs' : mode);
    if (mode === 'receipt') {
      setReceiptImage(null);
    }
  }, [mode]);

  useEffect(() => {
    if (isEditing && transactionToEdit) {
      const baseData = {
        id: transactionToEdit.id,
        amount: transactionToEdit.amount.toString(),
        category: transactionToEdit.category || '',
        date: transactionToEdit.date || new Date().toISOString().split('T')[0],
        notes: transactionToEdit.notes || '',
      };
  
      let fullData = { ...initialFormData, ...baseData };
  
      if ('vendor' in transactionToEdit) {
        fullData.vendor = transactionToEdit.vendor || '';
        setActiveTab('expense');
      } else if ('source' in transactionToEdit) {
        fullData.source = transactionToEdit.source || '';
        setActiveTab('income');
      } 
      // Removed 'fromAccount' / 'transfer' logic
      
      setFormData(fullData);
      setView('tabs');
    } else {
        const defaultCategory = 
            activeTab === 'income' && incomeCategories.length > 0 ? incomeCategories[0].name :
            categories.length > 0 ? categories[0].name : '';
        setFormData({
            ...initialFormData,
            category: defaultCategory,
            fromAccount: peopleList[0]?.name || '',
            toAccount: peopleList.length > 1 ? peopleList[1].name : '',
        });
    }
  }, [transactionToEdit, isEditing, activeTab, categories, incomeCategories, transferCategories, userName, contacts]);

  const handleCategorySelect = (categoryName: string) => {
    setFormData(prev => ({ ...prev, category: categoryName }));
    setIsCategoryModalOpen(false);
  };

  const handleAddCustomCategory = (categoryName: string) => {
    if (activeTab === 'expense') onAddCategory(categoryName);
    else if (activeTab === 'income') onAddIncomeCategory(categoryName);
    // Removed transfer logic

    setFormData(prev => ({ ...prev, category: categoryName }));
    setIsAddCustomCategoryModalOpen(false);
    setIsCategoryModalOpen(false);
  };

  // ---------------------------
  // Helper: extract JSON from free text
  // ---------------------------
  function extractJSONFromText(text: string) : string | null {
    if (!text) return null;
    // try direct parse first
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return trimmed;
    }
    // try to find the first {...} or [...]
    const m = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return m ? m[0] : null;
  }

  // ---------------------------
  // parseTransactionWithAI: robust parsing and validation
  // ---------------------------
  const parseTransactionWithAI = useCallback(async (text: string) => {
    setStatusText(`Processing: "${text}"`);
    setIsProcessing(true);
    try {
      // NOTE: exposing API keys in frontend is unsafe.
      if (!process.env.API_KEY) {
        // proceed but warn; in production you should call your backend instead
        console.warn("API_KEY missing in environment. Calls to GoogleGenAI from the browser are discouraged.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      // --- FIX: Simplified schema, removed 'transfer' ---
      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            transactionType: {
              type: Type.STRING,
              description: 'Type of transaction, must be one of: "expense" or "income".',
              enum: ['expense', 'income'],
            },
            amount: { type: Type.NUMBER, description: 'Amount of the transaction.' },
            category: { type: Type.STRING },
            date: { type: Type.STRING },
            notes: { type: Type.STRING },
            vendor: { type: Type.STRING },
            source: { type: Type.STRING },
          },
        },
      };

      const systemInstruction = `You are an intelligent expense tracker assistant. Parse the user's text into a JSON array of transactions following the schema. Provide only JSON in the final output if possible.`;

      // Attempt to generate
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          systemInstruction: systemInstruction,
        }
      });

      // Response text could be in different places; prefer response.text, fallbacks below
      let rawText: string = '';
      if (typeof (response as any).text === 'string') {
        rawText = (response as any).text;
      } else if ((response as any).candidates && (response as any).candidates[0]?.content) {
        rawText = (response as any).candidates[0].content;
      } else if ((response as any).output && Array.isArray((response as any).output) && (response as any).output[0]?.content) {
        rawText = (response as any).output[0].content;
      } else {
        rawText = JSON.stringify(response);
      }

      // Try to extract JSON from maybe-verbose output
      const jsonStr = extractJSONFromText(rawText);
      if (!jsonStr) {
        throw new Error("AI did not return JSON that could be parsed.");
      }

      let parsedData: any = JSON.parse(jsonStr);

      // If returned a single object, wrap into array
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      // Basic validation: ensure at least one item has transactionType and amount
      const valid = parsedData.every((item: any) => {
        if (!item.transactionType || !['expense','income'].includes(item.transactionType)) return false; // Removed 'transfer'
        if (item.amount === undefined || item.amount === null || isNaN(Number(item.amount))) return false;
        return true;
      });

      if (!valid || parsedData.length === 0) {
        console.warn("Parsed data failed validation:", parsedData);
        throw new Error("AI returned data but it failed validation.");
      }

      // Normalize amount to number and ensure date format exists
      const normalized = parsedData.map((it: any) => ({
        ...it,
        amount: Number(it.amount),
        date: it.date ? it.date : new Date().toISOString().split('T')[0],
      }));

      // Success: hand it back
      onSave(normalized);
      setStatusText('Parsed successfully.');
    } catch (err: any) {
      console.error("AI parsing error:", err);
      setStatusText("Sorry, I couldn't understand that. Please try again or use manual entry.");
      // Do not auto-close the modal — let user retry or switch to manual
    } finally {
      setIsProcessing(false);
    }
  }, [onSave]);

  // Voice recognition effect with safer start/stop
  useEffect(() => {
    if (view === 'voice' && !isEditing) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatusText("Sorry, your browser doesn't support speech recognition.");
        setIsProcessing(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        parseTransactionWithAI(speechToText);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event);
        setStatusText(`Error in recognition: ${event?.error || 'unknown'}`);
        setIsProcessing(false);
      };

      try {
        recognition.start();
        setIsProcessing(true);
        setStatusText('Listening...');
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setStatusText("Failed to start speech recognition.");
        setIsProcessing(false);
      }
      
      return () => {
        try {
          // prefer abort if available
          if (recognition.stop) recognition.stop();
          if ((recognition as any).abort) (recognition as any).abort();
        } catch (e) {
          // ignore
        }
      };
    }
  }, [view, isEditing, parseTransactionWithAI, language]);

  // ---------------------------
  // parseReceiptWithAI: improved robustness
  // ---------------------------
  const parseReceiptWithAI = async (base64ImageData: string, mimeType: string) => {
    setIsProcessing(true);
    setStatusText('Analyzing receipt...');
    try {
        if (!process.env.API_KEY) {
          console.warn("API_KEY missing. Receipt parsing might fail if API requires it.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

        const imagePart = {
            inlineData: { mimeType, data: base64ImageData },
        };
        const textPart = { text: "Extract vendor, amount, date and a short notes/title from this receipt. Return only JSON." };
        const schema = {
            type: Type.OBJECT,
            properties: { vendor: { type: Type.STRING }, amount: { type: Type.NUMBER }, date: { type: Type.STRING }, notes: { type: Type.STRING }, },
            required: ['vendor', 'amount', 'date', 'notes']
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: { responseMimeType: 'application/json', responseSchema: schema },
        });

        // Like earlier, make parsing tolerant
        let rawText = typeof (response as any).text === 'string' ? (response as any).text : JSON.stringify(response);
        const jsonStr = extractJSONFromText(rawText);
        if (!jsonStr) throw new Error("No JSON returned by AI for receipt.");

        const parsedData = JSON.parse(jsonStr);

        if (parsedData?.amount) {
            setFormData(prev => ({
                ...prev,
                amount: parsedData.amount.toString(),
                vendor: parsedData.vendor || '',
                date: parsedData.date || new Date().toISOString().split('T')[0],
                notes: parsedData.notes || '',
                category: 'Other',
            }));
            setActiveTab('expense');
            setView('tabs');
            setStatusText('Receipt parsed. Please verify details.');
        } else {
            throw new Error("AI did not return valid data.");
        }
    } catch (err) {
        console.error("Receipt parsing error:", err);
        setStatusText("Sorry, I couldn't read that receipt. Please enter the details manually.");
        // keep modal open so user can retry
    } finally {
        setIsProcessing(false);
    }
  };

  const handleReceiptUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setReceiptImage(reader.result as string);
        parseReceiptWithAI(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          handleReceiptUpload(e.target.files[0]);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      let dataToSave: (AnyTransactionFormData & { transactionType: 'expense' | 'income' });

      if (activeTab === 'income') {
        const { amount, category, date, notes, source } = formData;
        dataToSave = { 
            transactionType: 'income', 
            amount, category, date, notes, source, 
            id: isEditing ? transactionToEdit?.id : undefined 
        };
      } else { // 'expense'
        const { amount, category, date, notes, vendor } = formData;
        dataToSave = { 
            transactionType: 'expense', 
            amount, category, date, notes, vendor, 
            id: isEditing ? transactionToEdit?.id : undefined 
        };
      }
      onSave(dataToSave);
  };

  const currentCategories = activeTab === 'income' ? incomeCategories : categories;
  
  const renderContent = () => {
    if (view === 'voice') {
      return ( <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]"> <div className="relative w-24 h-24 mb-6"> <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-50"></div> <div className="relative w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> </div> </div> <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{statusText}</p> <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">e.g., "Spent 20 dollars on coffee at Starbucks"</p> </div> );
    }
    
    if (view === 'receipt') {
        return ( <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]"> {!receiptImage ? ( <> <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 mb-4"> <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path> </svg> <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Upload a Receipt</h3> <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Let AI scan it and fill out the details for you.</p> <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*" className="hidden" /> <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500" > Select Image </button> </> ) : ( <> <div className="relative w-full max-h-48 mb-4 rounded-lg overflow-hidden"> <img src={receiptImage} alt="Receipt preview" className="w-full h-full object-contain" /> {isProcessing && ( <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white"> <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <p className="font-semibold">{statusText}</p> </div> )} </div> {statusText && !isProcessing && ( <p className="text-sm text-red-500 mb-4">{statusText}</p> )} <button onClick={() => setReceiptImage(null)} disabled={isProcessing} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50" > Choose another image </button> </> )} </div> );
    }
    
    if (view === 'tabs') {
      const saveButtonText = isEditing ? 'Update' : activeTab === 'income' ? 'Save Income' : 'Save Expense';
      return (
        <>
          <div className="p-4">
            {!isEditing && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg mb-4">
                  <TabButton label="Expense" active={activeTab === 'expense'} onClick={() => setActiveTab('expense')} />
                  <TabButton label="Income" active={activeTab === 'income'} onClick={() => setActiveTab('income')} />
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {activeTab === 'expense' && <> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Title</label> <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="e.g., Dinner with client" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" /> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Vendor</label> <input type="text" name="vendor" value={formData.vendor} onChange={handleInputChange} placeholder="e.g., Starbucks" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" /> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Amount</label> <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" required/> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Category</label> <CategoryPickerButton categoryName={formData.category} onClick={() => setIsCategoryModalOpen(true)} categories={categories} /> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date</label> <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" required/> </div> </> }

              {activeTab === 'income' && <> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Title</label> <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="e.g., Monthly Salary" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" /> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Source</label> <input type="text" name="source" value={formData.source} onChange={handleInputChange} placeholder="e.g., Client Project" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" /> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Amount</label> <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" required/> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Category</label> <CategoryPickerButton categoryName={formData.category} onClick={() => setIsCategoryModalOpen(true)} categories={incomeCategories} /> </div> <div> <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date</label> <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" required/> </div> </>}

                  {/* --- Transfer Section Removed --- */}

              <div className="pt-2">
                  <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-semibold">
                      {saveButtonText}
                  </button>
              </div>
            </form>
          </div>

          {isCategoryModalOpen && (
            <CategorySelectionModal 
              onClose={() => setIsCategoryModalOpen(false)}
              onSelect={handleCategorySelect}
              onAddCustom={() => setIsAddCustomCategoryModalOpen(true)}
              categories={currentCategories}
            />
          )}
          {isAddCustomCategoryModalOpen && (
            <AddCustomCategoryModal
              onClose={() => setIsAddCustomCategoryModalOpen(false)}
              onSave={handleAddCustomCategory}
            />
          )}
        </>
      );
    }
    return null;
  };

  const getTitle = () => {
    if (isEditing) return 'Edit Transaction';
    if (view === 'voice') return 'Voice Entry';
    if (view === 'receipt') return 'Upload Receipt';
    switch(activeTab) {
      case 'income': return 'Add Income';
      case 'expense':
      default:
        return 'Add Expense';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-auto">
            <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getTitle()}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>
            {renderContent()}
        </div>
    </div>
  );
};

export default AddExpenseModal;