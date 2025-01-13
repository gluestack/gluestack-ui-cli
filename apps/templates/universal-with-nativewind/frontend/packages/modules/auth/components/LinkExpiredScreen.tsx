import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { useRouter } from '@unitools/router';

import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';

import config from '@app-launch-kit/config';

const LinkExpiredScreen = () => {
  const { routes } = config;
  const router = useRouter();
  return (
    <>
      <ScreenDescription
        title="Session Timeout"
        description="The link you're attempting to use has expired. Please sign in again to verify your identity. "
      />

      <Button
        onPress={() => {
          router.replace(`${routes.signIn.path}`);
        }}
      >
        <ButtonText>Re-authenticate</ButtonText>
      </Button>
    </>
  );
};

export default LinkExpiredScreen;
