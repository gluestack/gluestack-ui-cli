'use client';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import Header from '@app-launch-kit/modules/landing-page/components/Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <VStack className="h-full w-full bg-background-0 ">
      <Header />
      <VStack className="w-full flex-1">{children}</VStack>
    </VStack>
  );
};
export default Layout;
