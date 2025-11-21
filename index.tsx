import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HashRouter } from 'react-router-dom'; // இதை புதிதாக சேர்த்துள்ளேன்

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

console.log("Attempting to initialize Google OAuth with Client ID:", GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
    // GitHub Pages-ல் .env வேலை செய்யாது என்பதால், Alert வராமல் தடுக்கலாம்.
    console.warn("Warning: Google Client ID is missing.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
        <LanguageProvider>
            {/* HashRouter முக்கியம் - இதுதான் GitHub Pages-ல் ரவுட்டிங் பிழையை தடுக்கும் */}
            <HashRouter>
                <App />
            </HashRouter>
        </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);