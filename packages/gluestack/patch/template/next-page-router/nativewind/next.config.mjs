import { withGluestackUI } from "@gluestack/ui-next-adapter";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["nativewind", "react-native-css-interop"],
};

export default withGluestackUI(nextConfig);
