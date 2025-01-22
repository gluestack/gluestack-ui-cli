'use client';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from '@unitools/router';
import {
  Avatar,
  AvatarImage,
} from '@app-launch-kit/components/primitives/avatar';
import {
  Icon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
} from '@app-launch-kit/components/primitives/icon';
import {
  Menu,
  MenuItem,
  MenuItemLabel,
} from '@app-launch-kit/components/primitives/menu';
import { Pressable } from '@app-launch-kit/components/primitives/pressable';
import { LogOut } from 'lucide-react-native';
import LogoutModal from '@app-launch-kit/modules/dashboard/components/LogoutModal';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';
import { showToast } from '@app-launch-kit/components/common/Toast';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { useAuth } from '@app-launch-kit/modules/auth';

const AuthenticatedHeader = () => {
  const toast = useToast();
  const router = useRouter();
  const [selectedMenuItem, setSelectedMenuItem] = useState<Set<string>>(
    new Set([])
  );
  const [showModal, setShowModal] = useState(false);
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { colorMode, toggleColorMode } = useColorMode();
  const { Service } = useAuth();

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

  const handleLogout = async () => {
    await handleSignout();
    router.replace('/');
  };

  return (
    <>
      <Menu
        selectedKeys={selectedMenuItem}
        // @ts-ignore
        size="lg"
        offset={5}
        placement="bottom right"
        selectionMode="single"
        onSelectionChange={(keys: any) => {
          setSelectedMenuItem(keys);
          const currentKey = Array.from(keys)[0];
          if (currentKey === 'Color mode') {
            toggleColorMode();
          } else if (currentKey === 'Logout') {
            setShowModal(true);
          }
        }}
        trigger={({ ...triggerProps }) => (
          <Pressable
            {...triggerProps}
            className="flex-row justify-center items-center gap-2 bg-background-50 rounded-full p-2"
          >
            <Avatar size="sm">
              <AvatarImage
                className="h-8 w-8"
                source={require('@app-launch-kit/assets/images/user-profile.svg')}
                contentFit="cover"
                alt="avatar img"
                height="100%"
                width="100%"
              />
            </Avatar>
            <Icon as={ChevronDownIcon} />
          </Pressable>
        )}
      >
        <MenuItem key="Color mode" textValue="Color mode">
          <Icon
            as={colorMode === 'light' ? MoonIcon : SunIcon}
            size="sm"
            className="background-background-500 mr-2"
          />
          <MenuItemLabel size="sm">Appearance</MenuItemLabel>
        </MenuItem>
        <MenuItem key="Logout" textValue="Logout">
          <Icon
            as={LogOut}
            size="sm"
            className="background-background-500 mr-2"
          />
          <MenuItemLabel size="sm">Logout</MenuItemLabel>
        </MenuItem>
      </Menu>
      {showModal && (
        <LogoutModal
          showModal={showModal}
          setShowModal={setShowModal}
          handleConfirm={handleLogout}
        />
      )}
    </>
  );
};

export default AuthenticatedHeader;
