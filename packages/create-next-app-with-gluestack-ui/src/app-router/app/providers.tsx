'use client';

import { GluestackUIProvider } from '@gluestack-ui/themed';

export function Providers({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider>{children}</GluestackUIProvider>;
}
