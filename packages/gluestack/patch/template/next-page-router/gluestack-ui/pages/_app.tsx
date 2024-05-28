import "@/styles/globals.css";
import { config } from "@gluestack-ui/config"; // Optional if you want to use default theme
import { GluestackUIProvider } from "@gluestack-ui/themed";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GluestackUIProvider config={config}>
      <Component {...pageProps} />
    </GluestackUIProvider>
  );
}
