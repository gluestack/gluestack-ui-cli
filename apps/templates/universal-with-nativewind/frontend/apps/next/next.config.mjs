import { withGluestackUI } from '@gluestack/ui-next-adapter';
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias['@unitools/image'] = '@unitools/image-next';
    config.resolve.alias['@unitools/link'] = '@unitools/link-next';
    config.resolve.alias['@unitools/router'] = '@unitools/router-next';
    return config;
  },
  reactStrictMode: true,
  transpilePackages: [
    'nativewind',
    'react-native-css-interop',
    'react-native-country-codes-picker',
    '@app-launch-kit/components',
    'react-native-keyboard-aware-scroll-view',
    'react-native-otp-entry',
  ],
  experimental: {
    serverActions: {
      includeModule: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        hostname: 'images.unsplash.com',
      },
      {
        hostname: 'plus.unsplash.com',
      },
      {
        hostname: 'hqgprdxpnzjavrkdjmus.supabase.co',
      },
      {
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
};

export default withGluestackUI(nextConfig);
