
import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, text = "Back" }) => {
  return (
    <button onClick={onClick} className="flex items-center text-sm text-violet-600 dark:text-violet-400 hover:underline mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      {text}
    </button>
  );
};

export default BackButton;
