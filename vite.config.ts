import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      // --- IMPORTANT FIX FOR GITHUB PAGES ---
      base: "/Expense-tracker-/", // உங்கள் GitHub Repo பெயரை இங்கே சரியாக கொடுக்கவும்

      server: {
        port: 3000,
        host: 'localhost',
      },
      plugins: [react()],
      define: {
        'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});