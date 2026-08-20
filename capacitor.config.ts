import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ledgerly.app',
  appName: 'Ledgerly',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'ledgerly-sqlite',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for ledgerly"
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for ledgerly"
      }
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '381448198833-grkepoai0bqbtj2ntofc67hb4tqhd6ln.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
