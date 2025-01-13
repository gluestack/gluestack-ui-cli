import { GoogleIcon } from '@app-launch-kit/modules/auth/assets/icons/GoogleIcon';
import {
  Button,
  ButtonIcon,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import config from '@app-launch-kit/config';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useRouter } from '@unitools/router';

import { showToast } from '@app-launch-kit/components/common/Toast';
import { useAuth } from '@app-launch-kit/modules/auth';
import React from 'react';

export const GoogleSignInButton = () => {
  GoogleSignin.configure({
    scopes: config.auth.googleAuth.mobile.scopes, // what API you want to access on behalf of the user, default is email and profile
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    webClientId: config.env.google.CLIENT_ID_WEB, // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
    iosClientId: config.env.google.CLIENT_ID_IOS, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    hostedDomain: '', // specifies a hosted domain restriction
    googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
    openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
    profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
  });

  const toast = useToast();
  const { routes } = config;
  const router = useRouter();
  const { Service } = useAuth();
  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo;

      if (idToken) {
        const response = await Service.signInWithIdToken('google', idToken);

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
    } catch (error: any) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS ||
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        showToast(toast, {
          action: 'error',
          message: error.message,
        });
      } else {
        showToast(toast, {
          action: 'error',
          message: 'An error occurred during sign-in. Please try again.',
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      action="secondary"
      className="gap-4 mt-4"
      onPress={() => {
        googleSignIn();
      }}
    >
      <ButtonIcon as={GoogleIcon} />
      <ButtonText className="font-medium">Continue with Google</ButtonText>
    </Button>
  );
};
