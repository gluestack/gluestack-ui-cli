import { z } from 'zod';

type Route = { path: string; title: string };

export type ConfigProps = {
  routes: {
    signInWithOtp: Route;
    signIn: Route;
    signUp: Route;
    forgotPassword: Route;
    resetPassword: Route;
    redirectAfterAuth: Route;
    dashboard: Route;
    profile: Route;
    editProfile: Route;
    privacyPolicy: Route;
    termsOfService: Route;
    linkExpired: Route;
    notification: Route;
  };
  pathToRoute: Record<string, keyof ConfigProps['routes']>;
  auth: {
    credentialsAuth: {
      resetPasswordRedirectUri: string;
    };
    googleAuth: {
      mobile: {
        scopes: string[];
      };
      web: {
        redirectUri?: string;
      };
    };
  };
  env: {
    SITE_URL: string;
    supabase: {
      URL: string;
      ANON_KEY: string;
      FUNCTIONS_URL: string;
    };
    rest: {
      URL: string;
    };
    firebase: {
      API_KEY: string;
      AUTH_DOMAIN: string;
      PROJECT_ID: string;
      STORAGE_BUCKET: string;
      MESSAGING_SENDER_ID: string;
      APP_ID: string;
      FUNCTIONS_URL: string;
    };
    google: {
      CLIENT_ID_WEB: string;
      CLIENT_ID_IOS: string;
      CLIENT_ID_IOS_REVERSED: string;
      CLIENT_ID_ANDROID: string;
    };
  };
};

const envSchema = z.object({
  SITE_URL: z.string().url(),
  supabase: z.object({
    URL: z.string().url(),
    ANON_KEY: z.string(),
    FUNCTIONS_URL: z.string().url(),
  }),
  rest: z.object({
    URL: z.string().url(),
  }),
  firebase: z.object({
    API_KEY: z.string(),
    AUTH_DOMAIN: z.string(),
    PROJECT_ID: z.string(),
    STORAGE_BUCKET: z.string(),
    MESSAGING_SENDER_ID: z.string(),
    APP_ID: z.string(),
    FUNCTIONS_URL: z.string().url(),
  }),
  google: z.object({
    CLIENT_ID_WEB: z.string(),
    CLIENT_ID_IOS: z.string(),
    CLIENT_ID_IOS_REVERSED: z.string(),
    CLIENT_ID_ANDROID: z.string(),
  }),
});

const config: ConfigProps = {
  routes: {
    signIn: { path: '/signin', title: 'Sign In' },
    signInWithOtp: { path: '/otp-signin', title: 'OTP Sign In' },
    signUp: { path: '/signup', title: 'Sign Up' },
    forgotPassword: { path: '/forgot-password', title: 'Forgot Password' },
    resetPassword: { path: '/reset-password', title: 'Reset Password' },
    redirectAfterAuth: { path: '/home', title: 'Home' },
    dashboard: { path: '/home', title: 'Dashboard' },
    profile: { path: '/profile', title: 'Profile' },
    editProfile: { path: '/profile/edit', title: 'Edit Profile' },
    privacyPolicy: { path: '/privacy-policy', title: 'Privacy Policy' },
    termsOfService: { path: '/terms-of-service', title: 'Terms of Service' },
    linkExpired: { path: '/link-expired', title: 'Link Expired' },
    notification: { path: '/notification', title: 'Notification' },
  },
  pathToRoute: {
    '/signin': 'signIn',
    '/signup': 'signUp',
    '/forgot-password': 'forgotPassword',
    '/reset-password': 'resetPassword',
    '/home': 'redirectAfterAuth',
    '/profile': 'profile',
    '/profile/edit': 'editProfile',
    '/privacy-policy': 'privacyPolicy',
    '/terms-of-service': 'termsOfService',
    '/link-expired': 'linkExpired',
    '/notification': 'notification',
  },
  auth: {
    credentialsAuth: {
      resetPasswordRedirectUri: 'reset-password',
    },
    googleAuth: {
      mobile: {
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      },
      web: {
        redirectUri:
          process.env.EXPO_PUBLIC_SITE_URL ??
          process.env.NEXT_PUBLIC_SITE_URL ??
          '',
      },
    },
  },
  env: {
    SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.EXPO_PUBLIC_SITE_URL ??
      '',
    supabase: {
      URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.EXPO_PUBLIC_SUPABASE_URL ??
        '',
      ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
        '',
      FUNCTIONS_URL:
        process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ??
        process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL ??
        '',
    },
    rest: {
      URL:
        process.env.NEXT_PUBLIC_REST_BACKEND_URL ??
        process.env.EXPO_PUBLIC_REST_BACKEND_URL ??
        '',
    },
    firebase: {
      API_KEY:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
        '',
      AUTH_DOMAIN:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        '',
      PROJECT_ID:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
        '',
      STORAGE_BUCKET:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
        '',
      MESSAGING_SENDER_ID:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
        '',
      APP_ID:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
        '',
      FUNCTIONS_URL:
        process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ??
        process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_URL ??
        '',
    },
    google: {
      CLIENT_ID_WEB:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_WEB ??
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB ??
        '',
      CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ?? '',
      CLIENT_ID_IOS_REVERSED:
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS_REVERSED ?? '',
      CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID ?? '',
    },
  },
};

export const validateEnv = () => {
  return envSchema.safeParse(config.env);
};

export default config;
