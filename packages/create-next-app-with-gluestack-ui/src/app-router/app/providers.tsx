'use client';

import { GluestackUIProvider, config } from '@gluestack-ui/themed';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GluestackUIProvider config={config.theme}>{children}</GluestackUIProvider>
  );
}
