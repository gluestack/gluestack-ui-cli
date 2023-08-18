import '@/styles/globals.css';
import { GluestackUIProvider, config } from '@gluestack-ui/themed';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GluestackUIProvider config={config.theme}>
      <Component {...pageProps} />
    </GluestackUIProvider>
  );
}
