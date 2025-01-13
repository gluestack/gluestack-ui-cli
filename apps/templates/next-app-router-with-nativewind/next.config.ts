import type { NextConfig } from "next";

import { withGluestackUI } from "@gluestack/ui-next-adapter";

const nextConfig: NextConfig = {
  transpilePackages: ["nativewind", "react-native-css-interop"],
};

export default withGluestackUI(nextConfig);
