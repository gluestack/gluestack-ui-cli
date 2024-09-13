/** @type {import('next').NextConfig} */
import { withGluestackUI } from '@gluestack/ui-next-adapter';

const nextConfig = {
  reactStrictMode: true,
};

export default withGluestackUI(nextConfig);