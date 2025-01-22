import { Avatar } from '@app-launch-kit/components/primitives/avatar';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { Grid, GridItem } from '@app-launch-kit/components/primitives/grid';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Icon } from '@app-launch-kit/components/primitives/icon';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { HeadingCards } from '@app-launch-kit/modules/dashboard/constants/dashboard';
import { useRouter } from '@unitools/router';

const DashboardActionItems = () => {
  const router = useRouter();
  return (
    <Grid
      className="gap-5"
      _extra={{
        className: 'grid-col-12',
      }}
    >
      {HeadingCards.map((item, index) => {
        return (
          <GridItem
            _extra={{
              className: 'col-span-12 md:col-span-6 lg:col-span-4',
            }}
            key={index}
          >
            <HStack
              space="md"
              className="border border-outline-100 rounded-lg p-4 items-center justify-between"
            >
              <HStack space="xl" className="items-center">
                <Avatar className="bg-background-50 h-10 w-10">
                  <Icon as={item.iconName} />
                </Avatar>
                <VStack>
                  <Text className="font-semibold text-typography-900 line-clamp-1">
                    {item.title}
                  </Text>
                  <Text className="line-clamp-1">{item.description}</Text>
                </VStack>
              </HStack>
              <Button
                size="xs"
                onPress={() => {
                  router.push(item.routeName);
                }}
                isDisabled={item.isDisabled}
              >
                <ButtonText>View</ButtonText>
              </Button>
            </HStack>
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default DashboardActionItems;
