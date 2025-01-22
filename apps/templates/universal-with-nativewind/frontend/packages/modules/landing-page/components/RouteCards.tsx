import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { Text } from '@app-launch-kit/components/primitives/text';
import { Pressable } from '@app-launch-kit/components/primitives/pressable';
import { Icon } from '@app-launch-kit/components/primitives/icon';
import { useRouter } from '@unitools/router';
import { RouteCardsData } from '@app-launch-kit/modules/landing-page/constants/LandingPageData';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';

const RouteCards = () => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  return (
    <VStack className="md:gap-6 gap-4 md:flex-row md:flex-wrap mt-4 md:justify-center w-full mb-2">
      {RouteCardsData.map((item, index: number) => {
        return (
          <Pressable
            key={index}
            className="flex-col bg-background-50 md:p-6 p-4 md:gap-6 gap-3 rounded-lg md:max-w-[240px] w-full border-background-50 hover:border-outline-100 active:border-outline-200 border"
            onPress={() => {
              router.push(item.routeLink);
            }}
            disabled={item.isDisabled}
          >
            <Icon
              as={colorMode === 'light' ? item.lightIcon : item.darkIcon}
              className="md:w-10 md:h-10 w-8 h-8 stroke-background-700 fill-background-700"
            />
            <VStack className="gap-2">
              <Text className="text-typography-900 font-roboto-bold text-[18px]">
                {item.heading}
              </Text>
              <Text className="text-sm">{item.subtext}</Text>
            </VStack>
          </Pressable>
        );
      })}
    </VStack>
  );
};

export default RouteCards;
