import React from "react";

interface Props {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
}

const DarkModeToggle: React.FC<Props> = ({ enabled, setEnabled }) => {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      aria-label="Toggle dark mode"
      role="switch"
      aria-checked={enabled}
      // The track
      className={`relative inline-flex h-8 w-14 items-center rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:focus:ring-offset-gray-800 ${
        enabled
        ? "bg-violet-600 border-violet-600"
        : "bg-gray-200 dark:bg-gray-700 border-violet-500"
      }`}
    >
      {/* The sliding circle handle (thumb) */}
      <span
        className={`inline-flex h-[26px] w-[26px] transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          enabled ? "translate-x-[26px]" : "translate-x-1"
        }`}
      >
        {/* Icon container */}
        <span className="relative h-5 w-5">
          {/* Moon Icon (visible when enabled) */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
              enabled ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </span>
          {/* Sun Icon (visible when disabled) */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
              !enabled ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
};

export default DarkModeToggle;
