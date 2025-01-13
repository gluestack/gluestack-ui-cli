import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { cssInterop } from 'nativewind';
import { createIcon } from '@gluestack-ui/icon';

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: { width: true, height: true, fill: true },
  },
});

const MoonIcon: any = createIcon({
  Root: Svg,
  viewBox: '0 0 16 16',
  path: <Path d="M8 2a4.242 4.242 0 006 6 6 6 0 11-6-6z" />,
});

export default MoonIcon;
