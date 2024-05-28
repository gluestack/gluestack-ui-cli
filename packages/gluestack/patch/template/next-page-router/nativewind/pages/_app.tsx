import '@/styles/globals.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GluestackUIProvider mode="light">
      <Component {...pageProps} />
    </GluestackUIProvider>
  );
}
