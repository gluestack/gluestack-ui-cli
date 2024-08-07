import '@/styles/globals.css';
import { config } from '../config/gluestack-ui.config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GluestackUIProvider config={config}>
      <Component {...pageProps} />
    </GluestackUIProvider>
  );
}
