import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rasie.purrfectthreads',
  appName: 'Purrfect Threads',
  webDir: 'dist',
  // Keep controls inside system bars, including older Android WebViews.
  // https://capacitorjs.com/docs/apis/system-bars
  plugins: { SystemBars: { insetsHandling: 'native' } }
};

export default config;
