export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    cleartext?: boolean;
    url?: string;
  };
  plugins?: Record<string, any>;
}

const config: CapacitorConfig = {
  appId: 'gov.in.gramtrack.inspector',
  appName: 'GramTrack Field Inspector',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Geolocation: {
      permissions: ['location'],
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
  },
};

export default config;
