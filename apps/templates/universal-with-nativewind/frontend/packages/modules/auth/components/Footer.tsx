'use client';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { LinkText, Link } from '@app-launch-kit/components/primitives/link';
import { Text } from '@app-launch-kit/components/primitives/text';

type FooterProps = {
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref: string;
};

export default function Footer(props: FooterProps) {
  return (
    <HStack space="xs" className="self-center">
      <Text size="md">{props.footerText}</Text>

      <Link href={props.footerLinkHref}>
        <LinkText
          className="font-medium text-primary-700 ml-1 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
          size="md"
        >
          {props.footerLinkText}
        </LinkText>
      </Link>
    </HStack>
  );
}
