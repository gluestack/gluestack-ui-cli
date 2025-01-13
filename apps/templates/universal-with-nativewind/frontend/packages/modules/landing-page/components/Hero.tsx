import { Box } from '@app-launch-kit/components/primitives/box';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import {
  ExternalLinkIcon,
  Icon,
} from '@app-launch-kit/components/primitives/icon';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import HeroIcons from '@app-launch-kit/modules/landing-page/components/HeroIcons';
import LoginActionButtons from '@app-launch-kit/modules/landing-page/components/LoginActionButtons';
import { Link, LinkText } from '@app-launch-kit/components/primitives/link';
import { useRouter } from '@unitools/router';
import config from '@app-launch-kit/config';
import RouteCards from '@app-launch-kit/modules/landing-page/components/RouteCards';
import { useAuth } from '@app-launch-kit/modules/auth';

const LandingPageHero = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const { routes } = config;
  return (
    <VStack className="gap-8 md:gap-6 px-4 pt-16 w-full pb-8 md:pt-20 lg:pt-[120px] md:pb-10">
      <Box className="justify-center">
        <HStack className="items-center sm:self-center gap-1 md:hidden whitespace-nowrap">
          <Link href="https://docs.applaunchk.it/">
            <HStack className="items-center gap-1">
              <LinkText className="text-sm sm:text-lg text-primary-500 group-hover/link:text-primary-600 no-underline">
                View docs
              </LinkText>
              <Icon
                as={ExternalLinkIcon}
                className="stroke-background-800 sm:w-[18px] sm:h-[18px] h-4 w-4"
              />
            </HStack>
          </Link>
        </HStack>
        <Heading className="text-4xl xs:text-5xl md:text-6xl text-typography-950 xs:leading-[57px] md:leading-[70px] sm:text-center mt-5 md:mt-0">
          The Only Starter Kit You’ll Ever Need
        </Heading>
        <Text className="sm:text-center text-lg md:text-xl text-typography-600 mt-4 font-normal">
          Your Universal App Development starts here!
        </Text>
      </Box>
      <Box>
        <HeroIcons />
        {!userId && (
          <Box className="mt-6 sm:px-8 md:px-0">
            <LoginActionButtons />
          </Box>
        )}

        {userId && (
          <Button
            onPress={() => {
              router.replace(`${routes.redirectAfterAuth.path}`);
            }}
            className="mt-6 sm:self-center text-base font-semibold"
          >
            <ButtonText>Move to dashboard</ButtonText>
          </Button>
        )}
      </Box>

      <Box className="md:mt-[48px] lg:mt-[60px] sm:items-center gap-3 md:gap-4">
        <VStack className="sm:items-center gap-2">
          <Text className="text-typography-800 text-2xl md:text-3xl md:text-center font-roboto-bold">
            Explore different routes
          </Text>
          <Text className="text-typography-600 text-xl">
            Sign in to explore different routes available in the kit
          </Text>
        </VStack>
        <RouteCards />
      </Box>
    </VStack>
  );
};

export default LandingPageHero;
