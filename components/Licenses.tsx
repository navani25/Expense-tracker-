import React from 'react';
import { Page } from '../types';
import Header from './common/Header';
import BackButton from './common/BackButton';

interface LicenseProps {
  setActivePage: (page: Page) => void;
}

const LicenseEntry: React.FC<{ name: string, license: string, url: string }> = ({ name, license, url }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">License: {license}</p>
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 dark:text-violet-400 hover:underline break-all">
      {url}
    </a>
  </div>
);

const Licenses: React.FC<LicenseProps> = ({ setActivePage }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <Header title="Open-Source Licenses" />
      <div className="p-4">
        <BackButton onClick={() => setActivePage(Page.LEGAL)} text="Back to Legal" />
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-6 text-gray-600 dark:text-gray-300">
          <p>This application is built using several open-source projects. We are grateful to the developers and communities who create and maintain them. Below is a list of the primary libraries used in this project.</p>
          
          <LicenseEntry 
            name="React"
            license="MIT License"
            url="https://github.com/facebook/react"
          />

          <LicenseEntry 
            name="Recharts"
            license="MIT License"
            url="https://github.com/recharts/recharts"
          />
          
          <LicenseEntry 
            name="Tailwind CSS"
            license="MIT License"
            url="https://github.com/tailwindlabs/tailwindcss"
          />

          <LicenseEntry 
            name="@google/genai"
            license="Apache-2.0 License"
            url="https://github.com/google/generative-ai-js"
          />
          
          <p className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
            For a complete list of dependencies and their licenses, please refer to the project's source code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Licenses;