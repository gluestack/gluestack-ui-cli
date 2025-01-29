import React, { useEffect } from 'react';
import { config } from './config';
import { Appearance, ColorSchemeName, View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { colorScheme as colorSchemeNW, useColorScheme } from 'nativewind';

type ModeType = 'light' | 'dark' | 'system';

const getColorSchemeName = (
  colorScheme: ColorSchemeName,
  mode: ModeType
): 'light' | 'dark' => {
  if (mode === 'system') {
    return colorScheme ?? 'light';
  }
  return mode;
};

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: 'light' | 'dark' | 'system';
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const colorSchemeName = getColorSchemeName(colorScheme, mode);

  colorSchemeNW.set(mode);

  useEffect(() => {
    if (!Appearance.getColorScheme()) {
      Appearance.setColorScheme(colorScheme);
      setColorScheme('system');
    }
  }, [colorScheme]);

  return (
    <View
      style={[
        config[colorSchemeName],
        // eslint-disable-next-line react-native/no-inline-styles
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
