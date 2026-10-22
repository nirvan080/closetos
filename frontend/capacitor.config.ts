import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.closetos.app',
  appName: 'ClosetOS',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    backgroundColor: '#090a0f',
  },
};

export default config;
