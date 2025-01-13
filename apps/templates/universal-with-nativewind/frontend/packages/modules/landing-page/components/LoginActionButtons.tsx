import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import { useRouter } from '@unitools/router';
import config from '@app-launch-kit/config';
import React from 'react';

const ActionButtons = () => {
  const router = useRouter();
  const { routes } = config;

  return (
    <HStack className="md:self-center flex-wrap w-full sm:w-auto" space="md">
      <Button
        variant="outline"
        action="secondary"
        onPress={() => {
          router.push(`${routes.signIn.path}`);
        }}
        className="xs:px-6 flex-1 md:flex-initial  md:w-[180px] md:py-1"
      >
        <ButtonText>Login</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.push(`${routes.signUp.path}`);
        }}
        className="xs:px-6 flex-1 md:flex-initial md:w-[180px] md:py-1"
      >
        <ButtonText>Signup</ButtonText>
      </Button>
    </HStack>
  );
};

export default ActionButtons;
