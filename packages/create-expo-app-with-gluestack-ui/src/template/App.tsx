import { GluestackUIProvider, Text, Box, config } from "@gluestack-ui/react";

export default function App() {
  return (
    <GluestackUIProvider config={config.theme}>
      <Box width="100%" justifyContent="center" alignItems="center">
        <Text>Open up App.js to start working on your app!</Text>
      </Box>
    </GluestackUIProvider>
  );
}
