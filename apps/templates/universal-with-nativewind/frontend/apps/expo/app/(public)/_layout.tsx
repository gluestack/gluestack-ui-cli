import Header from '@app-launch-kit/modules/landing-page/components/Header';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { Slot } from 'expo-router';
import React from 'react';

const Layout = () => {
  return (
    <VStack className="h-full w-full bg-background-0">
      <Header />

      <VStack className="w-full flex-1">
        <Slot />
      </VStack>
    </VStack>
  );
};
export default Layout;
