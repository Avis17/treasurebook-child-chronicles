
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.632f20bb87da4eb8804e7a31bd06ee2d',
  appName: 'treasurebook-child-chronicles',
  webDir: 'dist',
  server: {
    url: 'https://632f20bb-87da-4eb8-804e-7a31bd06ee2d.lovableproject.com?forceHideBadge=true',
    cleartext: true
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
