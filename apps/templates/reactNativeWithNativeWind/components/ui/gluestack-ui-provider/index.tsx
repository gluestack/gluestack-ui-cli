import { config } from "./config";
import { View } from "react-native";
import { OverlayProvider } from "@gluestack-ui/overlay";
import { ToastProvider } from "@gluestack-ui/toast";

export function GluestackUIProvider({
  mode = "light",
  children,
  ...props
}: {
  mode: "light" | "dark";
  children: any;
}) {
  return (
    <View
      style={[
        config[mode],
        { flex: 1, height: "100%", width: "100%" },
        // @ts-ignore
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
