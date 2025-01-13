'use client';
import React from 'react';

import RNImage from '@unitools/image';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { cssInterop } from 'nativewind';

const imageStyle = tva({
  base: 'max-w-full',
  variants: {
    size: {
      '2xs': 'h-6 w-6',
      'xs': 'h-10 w-10',
      'sm': 'h-16 w-16',
      'md': 'h-20 w-20',
      'lg': 'h-24 w-24',
      'xl': 'h-32 w-32',
      '2xl': 'h-64 w-64',
      'full': 'h-full w-full',
    },
  },
});

const UIImage = RNImage;

cssInterop(
  UIImage,
  // @ts-ignore
  RNImage?.displayName === 'NextImage' ? {} : { className: 'style' }
);

type ImageProps = VariantProps<typeof imageStyle> &
  React.ComponentProps<typeof UIImage>;
const Image = React.forwardRef<
  React.ElementRef<typeof UIImage>,
  ImageProps & { className?: string }
>(({ size = 'md', className, ...props }, ref) => {
  return (
    <UIImage
      className={imageStyle({ size, class: className })}
      {...props}
      //@ts-ignore
      ref={ref}
    />
  );
});

Image.displayName = 'Image';
export { Image };
