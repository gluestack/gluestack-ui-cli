import React, { useMemo } from 'react';
import { createIcon } from '@gluestack-ui/icon';

const accessClassName = (style: any) => {
  const obj = style[0];
  const keys = Object.keys(obj); //will return an array of keys
  return obj[keys[1]];
};

const Svg = ({ style, className, ...props }: any) => {
  const calculateClassName = useMemo(() => {
    return className === undefined ? accessClassName(style) : className;
  }, [className, style]);

  return <svg {...props} className={calculateClassName} />;
};

const MoonIcon: any = createIcon({
  Root: Svg,
  viewBox: '0 0 16 16',
  path: <path d="M8 2a4.242 4.242 0 006 6 6 6 0 11-6-6z" />,
});

export default MoonIcon;
