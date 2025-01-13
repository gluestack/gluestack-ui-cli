import { GoogleIcon } from '@app-launch-kit/modules/auth/assets/icons/GoogleIcon';
import {
  Button,
  ButtonIcon,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import config from '@app-launch-kit/config';
import { useRouter } from '@unitools/router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

import { showToast } from '@app-launch-kit/components/common/Toast';

import { useAuth } from '@app-launch-kit/modules/auth';

WebBrowser.maybeCompleteAuthSession();

export const GoogleSignInButton = () => {
  const googleConfig = {
    redirectUri: config.env.SITE_URL,
    webClientId: config.env.google.CLIENT_ID_WEB,
  };

  const [request, response, promptAsync] =
    Google.useIdTokenAuthRequest(googleConfig);
  const toast = useToast();
  const { routes } = config;
  const router = useRouter();
  const { Service } = useAuth();
  useEffect(() => {
    const handleAuthResponse = async () => {
      try {
        if (response?.type === 'success') {
          const {
            params: { id_token },
          } = response;

          if (id_token) {
            // Call signInWithIdToken with 'google' provider and id_token
            const response = await Service.signInWithIdToken(
              'google',
              id_token
            );

            if (response.error) {
              throw new Error(response.error.message);
            }

            if (response.data?.session) {
              router.replace(`${routes.redirectAfterAuth.path}`);
            } else {
              showToast(toast, {
                action: 'error',
                message: 'Sign-in response is missing session data.',
              });
            }
          } else {
            throw new Error('No ID token present!');
          }
        } else if (
          response?.type === 'dismiss' ||
          response?.type === 'cancel'
        ) {
          showToast(toast, {
            action: 'error',
            message: 'Google Sign-In cancelled',
          });
        }
      } catch (error: any) {
        showToast(toast, {
          action: 'error',
          message: error.message || 'An unexpected error occurred.',
        });
      }
    };

    handleAuthResponse();
  }, [response]);

  return (
    <Button
      variant="outline"
      action="secondary"
      className="gap-4 mt-4"
      onPress={() => {
        promptAsync();
      }}
    >
      <ButtonIcon as={GoogleIcon} />
      <ButtonText className="font-medium">Continue with Google</ButtonText>
    </Button>
  );
};
