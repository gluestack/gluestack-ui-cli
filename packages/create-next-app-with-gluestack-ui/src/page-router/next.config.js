/** @type {import('next').NextConfig} */
const { withGluestackUI } = require("@gluestack/ui-next-adapter");

const nextConfig = {
  reactStrictMode: true,
  // transpilePackages: ["@gluestack-ui/react"],
};

module.exports = withGluestackUI(nextConfig);
