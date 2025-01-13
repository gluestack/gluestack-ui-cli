import {
  Avatar,
  AvatarImage,
} from '@app-launch-kit/components/primitives/avatar';
import { Box } from '@app-launch-kit/components/primitives/box';
import { Divider } from '@app-launch-kit/components/primitives/divider';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { ColleaguesCards } from '@app-launch-kit/modules/dashboard/constants/dashboard';

const NewColleagues = () => {
  return (
    <VStack
      className="border border-outline-100 rounded-lg px-4 py-6 items-center justify-between"
      space="sm"
    >
      <Box className="self-start  w-full px-4">
        <Heading size="lg" className="text-typography-700">
          New Colleagues
        </Heading>
      </Box>
      <Divider />
      {ColleaguesCards.map((item, index) => {
        return (
          <HStack space="lg" key={index} className="w-full px-4 py-2">
            <Avatar className="bg-background-50 h-10 w-10">
              <AvatarImage
                className="h-full w-full"
                source={item.image}
                alt="avatar img"
                height="100%"
                width="100%"
              />
            </Avatar>
            <VStack>
              <Text className="text-typography-900 line-clamp-1">
                {item.title}
              </Text>
              <Text className="text-sm line-clamp-1">{item.position}</Text>
            </VStack>
          </HStack>
        );
      })}
    </VStack>
  );
};

export default NewColleagues;
