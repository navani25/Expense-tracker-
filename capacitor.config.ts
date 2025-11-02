import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ledgerly.app', // <-- Your unique app ID
  appName: 'Ledgerly',       // <-- Your app's name
  webDir: 'dist',            // <-- The folder where your web app is built (Vite uses 'dist')
  server: {
    androidScheme: 'https'
  }
};

export default config;