
import React, { useState, useEffect } from 'react';
import { Contact, ContactFormData } from '../types';

interface AddContactModalProps {
  onClose: () => void;
  onSave: (contact: ContactFormData | Contact) => void;
  contactToEdit?: Contact | null;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onSave, contactToEdit }) => {
  const isEditing = !!contactToEdit;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isEditing && contactToEdit) {
      setName(contactToEdit.name);
      setEmail(contactToEdit.email);
    }
  }, [contactToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      if (isEditing && contactToEdit) {
        onSave({ ...contactToEdit, name, email });
      } else {
        onSave({ name, email });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{isEditing ? 'Edit Contact' : 'Add New Contact'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
              Cancel
            </button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-violet-600 text-white hover:bg-violet-700 font-semibold">
              {isEditing ? 'Save Changes' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
