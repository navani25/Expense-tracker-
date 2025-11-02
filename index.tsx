import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import { GoogleOAuthProvider } from '@react-oauth/google'; // <-- DELETE THIS LINE
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* --- REMOVE THE WRAPPER AROUND APP --- */}
    <App />
  </React.StrictMode>
);