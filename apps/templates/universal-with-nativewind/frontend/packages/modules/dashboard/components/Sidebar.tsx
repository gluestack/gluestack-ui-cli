import { useState, useContext } from 'react';
import { IIconComponentType } from '@app-launch-kit/components/primitives/icon';
import {
  Icon,
  MoonIcon,
  SunIcon,
  StarIcon,
} from '@app-launch-kit/components/primitives/icon';
import FullLogoLight from '@app-launch-kit/assets/icons/FullLogo/FullLogoLight';
import FullLogoDark from '@app-launch-kit/assets/icons/FullLogo/FullLogoDark';
import LogoLight from '@app-launch-kit/assets/icons/Logo/LogoLight';
import LogoDark from '@app-launch-kit/assets/icons/Logo/LogoDark';
import { Pressable } from '@app-launch-kit/components/primitives/pressable';
import { Box } from '@app-launch-kit/components/primitives/box';
import { Link } from '@app-launch-kit/components/primitives/link';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { Text } from '@app-launch-kit/components/primitives/text';
import { useRouter } from '@unitools/router';
import { LogOut } from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';
import { Divider } from '@app-launch-kit/components/primitives/divider';
import { ScrollView } from '@app-launch-kit/components/primitives/scroll-view';
import LogoutModal from '@app-launch-kit/modules/dashboard/components/LogoutModal';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';
import { showToast } from '@app-launch-kit/components/common/Toast';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { useAuth } from '@app-launch-kit/modules/auth';

type SidebarIconsList = {
  iconName: LucideIcon | IIconComponentType;
  iconText: string;
  routeName: string;
  isDisabled?: boolean;
};
export const Sidebar = ({
  sideBarIcons,
  currentPathName,
}: {
  sideBarIcons: SidebarIconsList[];
  currentPathName: string;
}) => {
  const toast = useToast();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const { Service } = useAuth();

  const handlePress = (routeName: string) => {
    router.push(routeName);
  };

  const handleLogout = () => {
    setShowModal(true);
  };

  const handleSignout = async () => {
    try {
      const response = await Service.signOut();

      if (response.error) {
        // Handle error from the response
        console.error('Sign out failed:', response.error.message);
        showToast(toast, {
          action: 'error',
          message: response.error.message || 'Sign out failed.',
        });
      } else {
        // Handle successful sign-out
        showToast(toast, {
          action: 'success',
          message: 'You have been signed out successfully.',
        });
      }
    } catch (error: any) {
      // Handle unexpected errors
      console.error('Sign out error:', error.message);
      showToast(toast, {
        action: 'error',
        message:
          error.message || 'An unexpected error occurred during sign out.',
      });
    }
  };

  const handleConfirm = () => {
    handleSignout();
    router.replace('/');
  };

  return (
    <>
      <VStack
        className="h-full flex-1 pb-2 pt-5 lg:pt-[24px] border-r border-outline-100 lg:w-[255px] xl:w-[280px]"
        space="xl"
      >
        <VStack space="sm" className=" px-2 lg:px-3 justify-between">
          <Box className="flex lg:hidden self-center mb-1 min-h-[48px]">
            <Link href="/">
              {colorMode === 'light' ? <LogoLight /> : <LogoDark />}
            </Link>
          </Box>
          <Box className="hidden lg:flex lg:px-4 lg:py-1 mb-1 min-h-[48px]">
            <Link href="/">
              {colorMode === 'light' ? <FullLogoLight /> : <FullLogoDark />}
            </Link>
          </Box>
          <ScrollView contentContainerClassName="flex-1">
            <VStack space="sm">
              {sideBarIcons.map((item: SidebarIconsList, index: number) => {
                const isDisabled = item.isDisabled ?? false;
                return (
                  <Pressable
                    onPress={
                      isDisabled
                        ? undefined
                        : () => handlePress(item.routeName as string)
                    }
                    disabled={isDisabled}
                    key={index}
                    className={`flex-row px-4 py-3 items-center gap-2 rounded lg:rounded-lg group/pressable ${isDisabled ? '' : 'hover:bg-background-50'} ${
                      currentPathName === item.routeName
                        ? 'bg-background-50'
                        : ''
                    }`}
                  >
                    <Icon
                      as={item.iconName}
                      className={`${currentPathName === item.routeName ? 'stroke-background-800' : 'stroke-background-600 '}`}
                    />
                    <Text
                      className={`hidden lg:flex  
                  text-base font-roboto-medium text-typography-600 ${
                    currentPathName === item.routeName
                      ? 'text-typography-800'
                      : ''
                  } `}
                    >
                      {item.iconText}
                    </Text>
                  </Pressable>
                );
              })}
            </VStack>
          </ScrollView>
        </VStack>
        <VStack className="mt-auto">
          <Pressable
            onPress={toggleColorMode}
            className="flex-row px-3 py-5 items-center gap-2 hover:bg-background-50 group/pressable justify-center lg:justify-start"
          >
            <Icon
              as={colorMode === 'light' ? MoonIcon : SunIcon}
              className="stroke-background-500 group-hover/pressable:stroke-background-700 group-active/pressable:stroke-background-800"
            />
            <Text className="hidden lg:flex text-typography-500 group-hover/pressable:text-typography-700 group-active/pressable:text-typography-800 text-base font-roboto-medium">
              Appearance
            </Text>
          </Pressable>
          <Divider className="border-outline-200" />
          <Pressable
            onPress={handleLogout}
            className="flex-row px-3 py-5 items-center gap-2 hover:bg-background-50 group/pressable justify-center lg:justify-start"
          >
            <Icon
              as={LogOut}
              className="stroke-background-500 group-hover/pressable:stroke-background-700 group-active/pressable:stroke-background-800"
            />
            <Text className="hidden lg:flex  text-typography-500 group-hover/pressable:text-typography-700 group-active/pressable:text-typography-800 text-base font-roboto-medium">
              Logout
            </Text>
          </Pressable>
        </VStack>
      </VStack>
      {showModal && (
        <LogoutModal
          showModal={showModal}
          setShowModal={setShowModal}
          handleConfirm={handleConfirm}
        />
      )}
    </>
  );
};
