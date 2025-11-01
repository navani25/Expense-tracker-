import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// --- VERIFICATION STEP ---
// This will print your Client ID to the browser's developer console.
console.log("Attempting to initialize Google OAuth with Client ID:", GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
    alert("CRITICAL ERROR: Missing Google Client ID. Please make sure the VITE_GOOGLE_CLIENT_ID is set in your .env file.");
    throw new Error("Missing Google Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);