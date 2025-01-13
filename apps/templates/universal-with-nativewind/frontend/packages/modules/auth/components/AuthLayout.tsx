import React from 'react';
import { Box } from '@app-launch-kit/components/primitives/box';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import Header from '@app-launch-kit/modules/landing-page/components/Header';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box className="bg-background-0 h-full w-full">
      <Header />
      <Box className="web:overflow-hidden md:justify-center items-center flex-1">
        <VStack className="md:shadow-hard-5 md:border md:border-outline-50 p-5 w-full md:w-[400px] md:rounded-3xl md:my-8 md:py-8 flex-1 md:flex-initial">
          {children}
        </VStack>
      </Box>
    </Box>
  );
};

export default AuthLayout;
