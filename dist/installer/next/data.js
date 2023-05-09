(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDataFiles = void 0;
    const getDataFiles = (folderName, gluestackConfigImportPath) => {
        const splitPath = folderName.split("/");
        if (splitPath[1] === "src") {
            splitPath.splice(1, 1);
        }
        const importPath = splitPath.join("/");
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
  import { GluestackUIProvider } from '../${importPath.slice(2)}';
  import { config } from '${gluestackConfigImportPath}/gluestack-ui.config';
  
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
    exports.getDataFiles = getDataFiles;
});
