import React from 'react';
import { Tabs } from 'expo-router';
import Header from '@app-launch-kit/modules/landing-page/components/Header';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { Box } from '@app-launch-kit/components/primitives/box';
import { useMediaQuery } from '@app-launch-kit/hooks/useMediaQuery';
import CustomTabBar from '@/components/tab/CustomTabBar';
import { Sidebar } from '@app-launch-kit/modules/dashboard/components/Sidebar';
import { SidebarIconsList } from '@app-launch-kit/modules/dashboard/constants/dashboard';
import { usePathname } from '@unitools/router';
import { Slot } from 'expo-router';
import { HStack } from '@app-launch-kit/components/primitives/hstack';

export default function TabLayout() {
  const pathname = usePathname();
  const [displayTabs] = useMediaQuery({
    maxWidth: 768,
  });
  return (
    <VStack className="h-full w-full bg-background-0">
      <Header />
      <HStack className="w-full h-full hidden md:flex">
        <Box className="hidden md:flex h-full">
          <Sidebar sideBarIcons={SidebarIconsList} currentPathName={pathname} />
        </Box>
        {!displayTabs && <Slot />}
      </HStack>

      {displayTabs && (
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
          tabBar={(props) => <CustomTabBar {...props} />}
        />
      )}
    </VStack>
  );
}
