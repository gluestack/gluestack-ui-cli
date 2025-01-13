'use client';
import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';
import './globals.css';
import { GluestackUIProvider } from '@app-launch-kit/components/primitives/gluestack-ui-provider';
import AuthLoader from '@app-launch-kit/modules/landing-page/components/AuthLoader';
import StyledJsxRegistry from './registry';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { SessionContextProvider } from '@app-launch-kit/modules/auth';
import {
  ColorModeProvider,
  useColorMode,
} from '@app-launch-kit/utils/contexts/ColorModeContext';

const myFont = localFont({
  src: './../assets/fonts/SpaceMono-Regular.ttf',
});

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--roboto',
  subsets: ['latin'],
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { colorMode } = useColorMode();

  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico?v=4" />
      <title>AppLaunchKit</title>
      <body className={`${roboto.variable}`} style={{ display: 'flex' }}>
        <StyledJsxRegistry>
          <SessionContextProvider>
            <GluestackUIProvider mode={colorMode}>
              <OverlayProvider>
                <AuthLoader>{children}</AuthLoader>
              </OverlayProvider>
            </GluestackUIProvider>
          </SessionContextProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ColorModeProvider>
      <Layout>{children}</Layout>
    </ColorModeProvider>
  );
}
