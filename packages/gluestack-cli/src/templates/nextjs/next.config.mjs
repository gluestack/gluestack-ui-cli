/** @type {import('next').NextConfig} */
import { withGluestackUI } from '@gluestack/ui-next-adapter';
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['nativewind', 'react-native-css-interop'],
};
export default withGluestackUI(nextConfig);
