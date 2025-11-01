import React, { useState, useMemo } from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

interface ProfileSettingsProps {
  setActivePage: (page: Page) => void;
  currentName: string;
  currentEmail: string;
  onSave: (firstName: string, lastName: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ setActivePage, currentName, currentEmail, onSave }) => {
  // Split the full name into first and last for the form
  const nameParts = useMemo(() => {
    const parts = currentName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  }, [currentName]);

  const [firstName, setFirstName] = useState(nameParts.firstName);
  const [lastName, setLastName] = useState(nameParts.lastName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(firstName, lastName);
    setActivePage(Page.SETTINGS);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Edit Profile" />
      <div className="p-4">
        <BackButton onClick={() => setActivePage(Page.SETTINGS)} text="Back to Settings" />
        
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={currentEmail}
              className="w-full mt-1 px-3 py-2 bg-gray-200 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
              readOnly
              disabled
            />
             <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your email is linked to your Google account and cannot be changed.</p>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;