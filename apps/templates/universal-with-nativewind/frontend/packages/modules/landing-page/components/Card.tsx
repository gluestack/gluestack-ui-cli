import { Box } from '@app-launch-kit/components/primitives/box';
import {
  ChevronRightIcon,
  Icon,
} from '@app-launch-kit/components/primitives/icon';
import { Divider } from '@app-launch-kit/components/primitives/divider';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { Image } from '@app-launch-kit/components/primitives/image';
import { Link } from '@app-launch-kit/components/primitives/link';
import { Text } from '@app-launch-kit/components/primitives/text';
import { Pressable } from '@app-launch-kit/components/primitives/pressable';
import React from 'react';

const LandingPageCard = ({
  title,
  description,
  imageWeb,
  link,
}: {
  title: string;
  description: string;
  imageWeb: string;
  link: string;
}) => {
  return (
    <Box className="md:flex-1">
      <Link href={link} className="md:h-full" asChild>
        <Pressable className="pt-9 px-9 border border-solid border-outline-100 bg-background-0 rounded-2xl md:flex-1 md:h-full">
          <HStack className="w-full">
            <Text className="text-typography-900 text-2xl font-semibold leading-normal">
              {title}
            </Text>
            <Box className="ml-auto rounded-full w-10 h-10 bg-background-100 hover:bg-background-200 px-3 items-center justify-center">
              <Icon as={ChevronRightIcon} />
            </Box>
          </HStack>
          <Divider className="my-6 h-px bg-outline-200 self-stretch" />
          <Text className="mb-10 md:mb-16">{description}</Text>
          <Box className="md:mt-auto h-[200px] md:h-[330px]  items-baseline">
            <Image
              contentFit="contain"
              contentPosition="bottom"
              source={imageWeb}
              alt="payment fold image"
              className="rounded-t-2xl w-full h-full"
            />
          </Box>
        </Pressable>
      </Link>
    </Box>
  );
};

export default LandingPageCard;
