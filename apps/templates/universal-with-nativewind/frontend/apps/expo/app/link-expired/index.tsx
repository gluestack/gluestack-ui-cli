import { useRouter } from '@unitools/router';
import React from 'react';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import config from '@app-launch-kit/config';

export default function LinkExpired() {
  const { routes } = config;
  const route = useRouter();
  return (
    <>
      <ScreenDescription
        title="Session Timeout"
        description="The link you're attempting to use has expired. Please sign in again to verify your identity. "
      />
      <Button
        className="mt-5"
        onPress={() => {
          route.push(`${routes.signIn.path}`);
        }}
      >
        <ButtonText>Re-authenticate</ButtonText>
      </Button>
    </>
  );
}
