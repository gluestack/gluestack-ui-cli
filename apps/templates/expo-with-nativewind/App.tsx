import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      <Home />
    </GluestackUIProvider>
  );
}
const Home = () => {
  return (
    <Box className="flex-1 bg-black items-center justify-center">
      <Text>
        Edit <Text className="font-semibold">./App.tsx</Text> to start working
        on your app!
      </Text>
      <StatusBar style="auto" />
    </Box>
  );
};
