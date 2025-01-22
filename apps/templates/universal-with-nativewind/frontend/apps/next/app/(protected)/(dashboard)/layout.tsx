'use client';
import React from 'react';
import { Box } from '@app-launch-kit/components/primitives/box';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { Sidebar } from '@app-launch-kit/modules/dashboard/components/Sidebar';
import { usePathname, useRouter } from '@unitools/router';
import { SidebarIconsList } from '@app-launch-kit/modules/dashboard/constants/dashboard';
import Header from '@app-launch-kit/modules/landing-page/components/Header';
import { MobileFooter } from '@app-launch-kit/modules/dashboard/components/MobileFooter';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handlePress = (route: string) => {
    router.push(`/${route}`);
  };
  return (
    <VStack className="h-screen w-screen bg-background-0">
      <Header />
      <HStack className="flex-1 w-full">
        <Box className="hidden md:flex h-full">
          <Sidebar sideBarIcons={SidebarIconsList} currentPathName={pathname} />
        </Box>
        {children}
      </HStack>
      <MobileFooter handlePress={handlePress} />
    </VStack>
  );
};
export default Layout;
