import React from 'react';

export interface Expense {
  id: string;
  amount: number;
  vendor: string;
  category: string;
  date: string;
  notes: string;
  receiptUrl?: string;
}

export interface Income {
  id:string;
  amount: number;
  source: string;
  category: string;
  date: string;
  notes: string;
}

export interface Transfer {
  id: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  date: string;
  notes: string;
  category: string;
}

export interface BudgetData {
  limit: number;
  spent: number;
  remaining: number;
}

export interface CategoryBudget {
    category: string;
    limit: number;
    spent: number;
}

export type ExpenseFormData = Omit<Expense, 'id' | 'amount'> & { id?: string; amount: string | number };
export type IncomeFormData = Omit<Income, 'id' | 'amount'> & { id?: string; amount: string | number };
export type TransferFormData = Omit<Transfer, 'id' | 'amount'> & { id?: string; amount: string | number };
export type AnyTransactionFormData = ExpenseFormData | IncomeFormData | TransferFormData;
export type LoginProvider = 'google' | 'mobile' | 'email';

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'avatarColor'>;

export interface Bank {
  name: string;
  logo: React.ReactNode;
}

export interface Category {
  name: string;
  icon: string;
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  SUPPORT = 'SUPPORT',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  FORGOT_EMAIL = 'FORGOT_EMAIL',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  PROFILE_SETTINGS = 'PROFILE_SETTINGS',
  EXPENSE_CATEGORIES = 'EXPENSE_CATEGORIES',
  INCOME_CATEGORIES = 'INCOME_CATEGORIES',
  TRANSFER_CATEGORIES = 'TRANSFER_CATEGORIES',
  CURRENCY_SETTINGS = 'CURRENCY_SETTINGS',
  LANGUAGE_SETTINGS = 'LANGUAGE_SETTINGS',
  CONTACTS = 'CONTACTS',
  LEGAL = 'LEGAL',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  LICENSES = 'LICENSES',
  CONNECT_BANK = 'CONNECT_BANK',
  LINK_ACCOUNT = 'LINK_ACCOUNT',
  DEMO_REPORT = 'DEMO_REPORT',
}