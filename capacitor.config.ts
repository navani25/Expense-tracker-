// In capacitor.config.ts

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // --- THIS IS THE FIX ---
  appId: 'com.ledgerly.app', // Change 'Ledgerly' to 'ledgerly'
  appName: 'Ledgerly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;