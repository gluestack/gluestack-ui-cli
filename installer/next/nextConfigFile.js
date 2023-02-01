/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  'react-native-web',
  '@dank-style/react',
  '@dank-style/css-injector',
  '@universa11y/provider',
  '@react-native-aria/overlays',
  '@universa11y/overlay',
  '@react-native-aria/utils',
  '@universa11y/react-native-aria',
  '@universa11y/toast',
  '@universa11y/transitions',
]);

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    config.module.rules.push({
      test: /\.ttf$/,
      loader: 'url-loader',
    });

    return config;
  },
};

module.exports = withPlugins([withTM], nextConfig);
