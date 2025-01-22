import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Icon } from '@app-launch-kit/components/primitives/icon';
import { Pressable } from '@app-launch-kit/components/primitives/pressable';
import { Text } from '@app-launch-kit/components/primitives/text';
import { usePathname } from '@unitools/router';
import { bottomTabsList } from '@app-launch-kit/modules/dashboard/constants/dashboard';

export const MobileFooter = ({
  handlePress,
}: {
  handlePress: (route: string) => void;
}) => {
  const pathname = usePathname();
  return (
    <HStack className="bg-background-0 justify-evenly w-full sticky left-0 bottom-0 right-0 p-3 overflow-hidden items-center border-t border-outline-100 md:hidden">
      {bottomTabsList.map((item, index) => {
        const isSelected = item.route && pathname === '/' + item.route;
        const isDisabled = item.isDisabled ?? false;
        return (
          <Pressable
            key={index}
            className="flex-col gap-1 items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onPress={() => {
              handlePress(item.route);
            }}
            disabled={isDisabled}
          >
            <Icon
              as={item.iconName}
              size="lg"
              className={`${isSelected ? 'stroke-background-800' : 'stroke-background-500'}`}
            />
            <Text
              className={`text-xs ${isSelected ? 'font-roboto-medium text-typography-800' : ' text-typography-500'}`}
            >
              {item.iconText}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
};
