import React from 'react';
import type { Expense, Income, BudgetData, Contact, Bank, Category } from './types';

// --- THIS IS THE CRITICAL FIX ---
// We now use 'localhost', which is the standard name for your own computer.
const API_BASE_URL = 'http://localhost:8000/api';

export const INITIAL_GUEST_EXPENSE_CATEGORIES: Category[] = [
    { name: "Accommodation", icon: "🛏️" }, { name: "Entertainment", icon: "🎤" },
    { name: "Groceries", icon: "🛒" }, { name: "Healthcare", icon: "🦷" },
    { name: "Insurance", icon: "🧯" }, { name: "Rent & Charges", icon: "🏠" },
    { name: "Restaurants & Bars", icon: "🍔" }, { name: "Shopping", icon: "🛍️" },
    { name: "Transport", icon: "🚖" }, { name: "Other", icon: "✋" },
];

export const INITIAL_GUEST_INCOME_CATEGORIES: Category[] = [
    { name: "Salary", icon: "💰" }, { name: "Gift", icon: "🎁" },
    { name: "Freelance", icon: "💼" }, { name: "Investment", icon: "📈" },
    { name: "Other", icon: "✋" },
];

export const api = {
  // Transactions
  fetchTransactions: async (userId: string) => {
    if (!userId) return [];
    const response = await fetch(`${API_BASE_URL}/transactions/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const { data } = await response.json();
    return data;
  },
  addTransaction: async (transactionData: any, userId: string) => {
    if (!userId) throw new Error('User ID is required');
    const response = await fetch(`${API_BASE_URL}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...transactionData, userId }),
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return await response.json();
  },
  updateTransaction: async (id: string | number, transactionData: any, userId: string) => {
    if (!userId) throw new Error('User ID is required');
    const response = await fetch(`${API_BASE_URL}/transaction/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...transactionData, userId }),
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return await response.json();
  },
  deleteTransaction: async (id: string | number, userId: string) => {
    if (!userId) throw new Error('User ID is required');
    const response = await fetch(`${API_BASE_URL}/transaction/${id}/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return await response.json();
  },

  // Categories
  fetchExpenseCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/expense-categories`);
    if (!response.ok) throw new Error('Failed to fetch expense categories');
    const { data } = await response.json();
    return data;
  },
  addExpenseCategory: async (newCategoryName: string): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/expense-category`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCategoryName }), });
    if (!response.ok) throw new Error('Failed to add expense category');
    return await response.json();
  },
  deleteExpenseCategory: async (categoryToDelete: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/expense-category/${encodeURIComponent(categoryToDelete)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete expense category');
  },

  fetchIncomeCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/income-categories`);
    if (!response.ok) throw new Error('Failed to fetch income categories');
    const { data } = await response.json();
    return data;
  },
  addIncomeCategory: async (newCategoryName: string): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/income-category`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCategoryName }), });
    if (!response.ok) throw new Error('Failed to add income category');
    return await response.json();
  },
  deleteIncomeCategory: async (categoryToDelete: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/income-category/${encodeURIComponent(categoryToDelete)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete income category');
  },
};


// --- OTHER CONSTANTS ---
export const INITIAL_ACCOUNTS: string[] = ["Cash", "Bank", "Wallet", "Credit Card", "UPI"];
export const CURRENCIES = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' }, { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }, { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];
export const LANGUAGES = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }, { code: 'de', name: 'Deutsch' },
    { code: 'hi', name: 'हिन्दी' }, { code: 'ja', name: '日本語' },
];
export const BANKS: Bank[] = [ /* ... bank data ... */ ];
export const BUDGET_DATA: BudgetData = { limit: 1500, spent: 0, remaining: 1500 };