/** @type {import('next').NextConfig} */
import { withGluestackUI } from '@gluestack/ui-next-adapter';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gluestack-ui/themed'],
};

export default withGluestackUI(nextConfig);
