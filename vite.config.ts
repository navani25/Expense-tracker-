import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      // --- முக்கிய மாற்றம் ---
      // உங்கள் Repo பெயர் 'Expense-tracker-' (கடைசியில் hyphen உள்ளது)
      // எனவே base பெயரிலும் அது இருக்க வேண்டும்.
      base: "/Expense-tracker-/", 

      server: {
        port: 3000,
        host: 'localhost',
      },
      plugins: [react()],
      define: {
        'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});