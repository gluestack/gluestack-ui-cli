const getDataFiles = (folderName) => {
  const document = `
  import * as React from 'react';
  import { Html, Head, Main, NextScript } from 'next/document';
  import { AppRegistry } from 'react-native-web';
  import { flush } from '@dank-style/react';
  
  function Document() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
  
  Document.getInitialProps = async ({ renderPage }: any) => {
    AppRegistry.registerComponent('Main', () => Main);
    const { getStyleElement } = AppRegistry.getApplication('Main');
    const page = await renderPage();
    const styles = [getStyleElement(), ...flush()];
    return { ...page, styles: React.Children.toArray(styles) };
  };
  
  export default Document;
  `;

  const nextConfig = `
  /** @type {import('next').NextConfig} */
  const { withGluestackUI } = require('@gluestack/ui-next-adapter');
  
  const nextConfig = {
    reactStrictMode: true,
  };
  
  module.exports = withGluestackUI(nextConfig);
  `;

  const app = `
  import '@/styles/globals.css';
  import type { AppProps } from 'next/app';
  import { GluestackUIProvider } from '../${folderName}';
  import { config } from '../gluestack-ui.config';
  
  export default function App({ Component, pageProps }: AppProps) {
    return (
      <GluestackUIProvider config={config.theme}>
        <Component {...pageProps} />
      </GluestackUIProvider>
    );
  }
  `;
  return { document, nextConfig, app };
};

module.exports = { getDataFiles };
