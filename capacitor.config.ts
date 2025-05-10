
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.treasurebook.app',
  appName: 'treasure-book',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4361EE",
      showSpinner: true,
      spinnerColor: "#FFFFFF"
    }
  }
};

export default config;
