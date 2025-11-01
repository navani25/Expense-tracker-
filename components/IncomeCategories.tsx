
import React, { useState } from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

interface IncomeCategoriesProps {
  setActivePage: (page: Page) => void;
  categories: string[];
  onAddCategory: (newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
}

const AddCategoryModal: React.FC<{
  onClose: () => void;
  onSave: (name: string) => void;
  title: string;
}> = ({ onClose, onSave, title }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave(categoryName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const CategoryItem: React.FC<{ label: string; onDelete: () => void }> = ({ label, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
    <button onClick={onDelete} className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium">Delete</button>
  </div>
);

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="text-center p-8 my-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm animate-fade-in-up">
        <div className="w-20 h-20 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Track Your Income Streams</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
            Add categories like 'Salary', 'Freelance', or 'Investment' to better understand your earnings.
        </p>
        <button
            onClick={onAdd}
            className="py-3 px-6 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
            Add First Category
        </button>
    </div>
);

const IncomeCategories: React.FC<IncomeCategoriesProps> = ({ setActivePage, categories, onAddCategory, onDeleteCategory }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSaveCategory = (name: string) => {
    onAddCategory(name);
    setShowAddModal(false);
  };
  
  const handleDelete = (category: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      onDeleteCategory(category);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Income Categories" />
      <div className="p-4">
        <BackButton onClick={() => setActivePage(Page.SETTINGS)} text="Back to Settings" />

        {categories.length > 0 ? (
          <>
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
              {categories.map(category => (
                <CategoryItem key={category} label={category} onDelete={() => handleDelete(category)} />
              ))}
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 px-4 flex items-center justify-center space-x-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Add New Category</span>
            </button>
          </>
        ) : (
          <EmptyState onAdd={() => setShowAddModal(true)} />
        )}
      </div>
      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveCategory}
          title="Add Income Category"
        />
      )}
    </div>
  );
};

export default IncomeCategories;
