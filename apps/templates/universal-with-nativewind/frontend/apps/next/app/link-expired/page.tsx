'use client';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { useRouter } from '@unitools/router';

import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
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
          route.push(`${routes.signIn}`);
        }}
      >
        <ButtonText>Re-authenticate</ButtonText>
      </Button>
    </>
  );
}
