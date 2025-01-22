import { Avatar } from '@app-launch-kit/components/primitives/avatar';
import { Box } from '@app-launch-kit/components/primitives/box';
import { Divider } from '@app-launch-kit/components/primitives/divider';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Icon } from '@app-launch-kit/components/primitives/icon';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { HolidaysCards } from '@app-launch-kit/modules/dashboard/constants/dashboard';

const UpcomingHolidays = () => {
  return (
    <VStack
      className="border border-outline-100 rounded-lg px-4 py-6 items-center justify-between"
      space="sm"
    >
      <Box className="self-start  w-full px-4">
        <Heading size="lg" className="text-typography-700">
          Upcoming Holidays
        </Heading>
      </Box>
      <Divider />
      {HolidaysCards.map((item, index) => {
        return (
          <HStack space="lg" key={index} className="w-full px-4 py-2">
            <Avatar className="bg-background-50 h-10 w-10">
              <Icon as={item.icon} />
            </Avatar>
            <VStack>
              <Text className="text-typography-900 line-clamp-1">
                {item.title}
              </Text>
              <Text className="text-sm line-clamp-1">{item.description}</Text>
            </VStack>
          </HStack>
        );
      })}
    </VStack>
  );
};

export default UpcomingHolidays;
