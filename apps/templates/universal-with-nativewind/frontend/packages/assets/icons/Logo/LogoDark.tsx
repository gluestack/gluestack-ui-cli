import { cssInterop } from 'nativewind';
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

cssInterop(Svg, {
  className: {
    target: 'style',
    // @ts-ignore
    nativeStyleToProp: { width: true, height: true, fill: true },
  },
});

const LogoDark = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    {...props}
  >
    <Rect width="40" height="40" rx="20" fill="#1B1F2C" />
    <Path
      d="M10 28.8013L15 24.2559L20 28.8013L25 24.2559L30 28.8013"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 22.2544L15 17.709L20 22.2544L25 17.709L30 22.2544"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 15.7095L15 11.1641L20 15.7095L25 11.1641L30 15.7095"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default LogoDark;
