import { Box } from '@app-launch-kit/components/primitives/box';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { Divider } from '@app-launch-kit/components/primitives/divider';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { LeavesCards } from '@app-launch-kit/modules/dashboard/constants/dashboard';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

const Leaves = () => {
  return (
    <VStack
      className="border border-outline-100 rounded-lg px-4 py-6 items-center justify-between"
      space="sm"
    >
      <Box className="self-start  w-full px-4">
        <Heading size="lg" className="  text-typography-700">
          Your Leaves
        </Heading>
      </Box>
      <Divider />
      {LeavesCards.map((item, index) => {
        return (
          <HStack
            space="lg"
            key={index}
            className="w-full px-4 py-2 justify-between items-center flex-wrap"
          >
            <HStack space="xl" className="items-center">
              <Box
                className={cn(
                  'rounded-full h-10 w-10 items-center justify-center',
                  { 'bg-success-0': item.leaves !== 0 },
                  { 'bg-error-50': item.leaves === 0 }
                )}
              >
                <Text
                  className={cn(
                    { 'text-success-800': item.leaves !== 0 },
                    { 'text-error-700': item.leaves === 0 }
                  )}
                >
                  {item.leaves}
                </Text>
              </Box>
              <VStack>
                <Text className="text-typography-900 line-clamp-1">
                  {item.title}
                </Text>
                <Text className="text-sm line-clamp-1">{item.description}</Text>
              </VStack>
            </HStack>
            <Button
              isDisabled={item.isDisabled}
              variant="outline"
              action="secondary"
              size="xs"
            >
              <ButtonText>Apply</ButtonText>
            </Button>
          </HStack>
        );
      })}
    </VStack>
  );
};

export default Leaves;
