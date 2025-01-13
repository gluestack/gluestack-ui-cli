'use client';
import { useBreakpointValue } from '@app-launch-kit/hooks/use-break-point-value';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';

type ScreenDescriptionProps = {
  title?: string;
  description?: string;
};

export default function ScreenDescription(props: ScreenDescriptionProps) {
  const headingSize =
    useBreakpointValue({ default: '2xl', md: '3xl' }) ?? undefined;
  return (
    <VStack className="md:items-center md:gap-2xl">
      <VStack space="md">
        <Heading size={headingSize} className="md:text-center">
          {props.title}
        </Heading>
        <Text className="md:text-center">{props.description}</Text>
      </VStack>
    </VStack>
  );
}
