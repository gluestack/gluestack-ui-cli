'use client';
import FullLogoLight from '@app-launch-kit/assets/icons/FullLogo/FullLogoLight';
import FullLogoDark from '@app-launch-kit/assets/icons/FullLogo/FullLogoDark';
import { Box } from '@app-launch-kit/components/primitives/box';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Link } from '@app-launch-kit/components/primitives/link';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';
import AuthenticatedHeader from '@app-launch-kit/modules/landing-page/components/AuthenticatedHeader';
import {
  ArrowLeftIcon,
  Icon,
  MoonIcon,
  SunIcon,
} from '@app-launch-kit/components/primitives/icon';
import { LinkText } from '@app-launch-kit/components/primitives/link';
import { ExternalLinkIcon } from '@app-launch-kit/components/primitives/icon';
import config from '@app-launch-kit/config';
import { usePathname, useRouter } from '@unitools/router';
import { Text } from '@app-launch-kit/components/primitives/text';
import { Pressable } from '@app-launch-kit/components/primitives/pressable';
import { useAuth } from '@app-launch-kit/modules/auth';

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const routePath = usePathname();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const routeTitle = config.pathToRoute[routePath];
  return (
    <Box
      className={`w-full z-1 border-b border-b-solid border-b-outline-50 py-4 bg-background-0 ${userId && routePath !== '/' ? 'flex md:hidden' : 'flex'} min-h-fit`}
    >
      <HStack className="items-center justify-between h-12 md:h-10 md:px-6 px-4">
        <HStack className="gap-2 items-center justify-between">
          <Box className="hidden md:flex">
            <Link href="/">
              {colorMode === 'light' ? (
                <Box className="w-[180px] h-[35px]">
                  <FullLogoLight />
                </Box>
              ) : (
                <Box className="w-[180px] h-[35px]">
                  <FullLogoDark />
                </Box>
              )}
            </Link>
          </Box>
          <Box className="md:hidden">
            {routePath === config.routes.redirectAfterAuth.path ||
            routePath === '/' ? (
              <Link href="/">
                {colorMode === 'light' ? (
                  <Box className="w-[180px] h-[35px]">
                    <FullLogoLight />
                  </Box>
                ) : (
                  <Box className="w-[180px] h-[35px]">
                    <FullLogoDark />
                  </Box>
                )}
              </Link>
            ) : (
              <HStack className="items-center gap-2">
                <Pressable
                  onPress={() => {
                    router.back();
                  }}
                >
                  <Icon size="xl" as={ArrowLeftIcon} />
                </Pressable>
                <Text className="font-roboto-bold text-2xl text-primary-500">
                  {config.routes[routeTitle]?.title}
                </Text>
              </HStack>
            )}
          </Box>
        </HStack>

        <HStack className="items-center sm:gap-4 gap-1">
          {userId ? (
            <AuthenticatedHeader />
          ) : (
            <>
              <Link
                href="https://docs.applaunchk.it/"
                className="hidden md:flex  border border-secondary-400 rounded px-4 py-[5px] group/link"
              >
                <HStack className="items-center gap-3">
                  <LinkText className="sm:text-base text-primary-500 group-hover/link:text-primary-600 no-underline group-active/link:text-primary-600 font-medium">
                    View docs
                  </LinkText>
                  <Icon
                    as={ExternalLinkIcon}
                    className="stroke-background-800 h-[18px] w-[18px]"
                  />
                </HStack>
              </Link>
              <Pressable
                onPress={toggleColorMode}
                className="items-center bg-background-50 rounded-full p-[10px]"
              >
                <Icon
                  as={colorMode === 'light' ? MoonIcon : SunIcon}
                  className="w-5 h-5"
                />
              </Pressable>
            </>
          )}
        </HStack>
      </HStack>
    </Box>
  );
}
