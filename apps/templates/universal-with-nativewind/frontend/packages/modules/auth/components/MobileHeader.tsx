import { HStack } from '@app-launch-kit/components/primitives/hstack';
import {
  ArrowLeftIcon,
  Icon,
} from '@app-launch-kit/components/primitives/icon';
import { Link, LinkText } from '@app-launch-kit/components/primitives/link';
import { Text } from '@app-launch-kit/components/primitives/text';

export const MobileHeader = ({ title }: { title?: string | undefined }) => {
  return (
    <HStack space="md" className="items-center p-3">
      <Link href=".." className="mt-1">
        <HStack space="sm" className="items-center">
          <Icon className="text-background-800" size="md" as={ArrowLeftIcon} />
          <Link href="/">
            <LinkText className="text-sm py-4">Go to home screen!</LinkText>
          </Link>
        </HStack>
      </Link>
      <Text>{title}</Text>
    </HStack>
  );
};
