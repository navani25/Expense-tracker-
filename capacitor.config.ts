import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ledgerly.app',
  appName: 'ledgerly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: "381448198833-4eao4v7ikh0k2o7pk0sbmpuhfgi9vouk.apps.googleusercontent.com",
      androidClientId: "381448198833-k10nqmcf7k7rj4ah1ru1jjkn4oi3bbvu.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;