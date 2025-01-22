'use client';
import DashboardActionItems from '@app-launch-kit/modules/dashboard/components/ActionItems';
import Leaves from '@app-launch-kit/modules/dashboard/components/Leaves';
import UpcomingHolidays from '@app-launch-kit/modules/dashboard/components/UpcomingHolidays';
import NewColleagues from '@app-launch-kit/modules/dashboard/components/NewColleagues';
import { Box } from '@app-launch-kit/components/primitives/box';
import { Grid, GridItem } from '@app-launch-kit/components/primitives/grid';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import { ScrollView } from '@app-launch-kit/components/primitives/scroll-view';
import { VStack } from '@app-launch-kit/components/primitives/vstack';

const HomeLandingPage = () => {
  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <VStack
          className="p-4 md:pb-4 md:px-10 md:pt-5 lg:pt-7 w-full"
          space="2xl"
        >
          <Heading className="hidden md:flex text-3xl text-typography-900 font-bold">
            Dashboard
          </Heading>
          <Heading size="2xl" className="flex md:hidden">
            Welcome
          </Heading>
          <DashboardActionItems />
          <Grid
            className="gap-5"
            _extra={{
              className: 'grid-cols-12',
            }}
          >
            <GridItem
              _extra={{
                className: 'col-span-12 md:col-span-6 lg:col-span-4',
              }}
            >
              <UpcomingHolidays />
            </GridItem>
            <GridItem
              _extra={{
                className: 'col-span-12 md:col-span-6 lg:col-span-4',
              }}
            >
              <Leaves />
            </GridItem>
            <GridItem
              _extra={{
                className: 'col-span-12 md:col-span-6 lg:col-span-4',
              }}
            >
              <NewColleagues />
            </GridItem>
          </Grid>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default HomeLandingPage;
