import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export default function ModalScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={20} fontWeight="bold">
        Modal
      </Text>
      <Box my={30} h={1} w="80%" />
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Box>
  );
}
