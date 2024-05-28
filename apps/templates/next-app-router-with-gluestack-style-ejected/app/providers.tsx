'use client';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider>{children}</GluestackUIProvider>;
}
