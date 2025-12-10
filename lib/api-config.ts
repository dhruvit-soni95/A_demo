export const API_CONFIG = {
  TESSITURA_BASE_URL: process.env.EXPO_PUBLIC_TESSITURA_API_URL || '',
  TESSITURA_API_KEY: process.env.EXPO_PUBLIC_TESSITURA_API_KEY || '',
  TESSITURA_USERNAME: process.env.EXPO_PUBLIC_TESSITURA_USERNAME || '',
  TESSITURA_PASSWORD: process.env.EXPO_PUBLIC_TESSITURA_PASSWORD || '',
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  PATRONS: '/patrons',
  TICKETS: '/tickets',
  DONATIONS: '/donations',
  SUBSCRIPTIONS: '/subscriptions',
  MEMBERSHIPS: '/memberships',
  EVENTS: '/events',
};

export const isAPIConfigured = () => {
  return !!(
    API_CONFIG.TESSITURA_BASE_URL &&
    API_CONFIG.TESSITURA_API_KEY &&
    API_CONFIG.TESSITURA_USERNAME
  );
};
