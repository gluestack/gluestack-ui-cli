import ResetPasswordForm from '@app-launch-kit/modules/auth/components/ResetPasswordForm';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from '@unitools/router';

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState<any>(null);
  useEffect(() => {
    Linking.getInitialURL()
      .then(async (url) => {
        if (url) {
          let params = {};
          const hashParams = url.split('#')[1];
          const queryParams = url.split('?')[1];
          if (hashParams) {
            params = {
              ...params,
              ...Object.fromEntries(new URLSearchParams(hashParams)),
            };
          }
          if (queryParams) {
            params = {
              ...params,
              ...Object.fromEntries(new URLSearchParams(queryParams)),
            };
          }
          setToken(params);
        }
      })
      .catch((error) => {
        console.error('Error getting initial URL:', error);
      });
  }, []);

  if (!token) {
    router.push('/link-expired');
  }

  return (
    <>
      <ScreenDescription
        title="Create new password"
        description="Your new password must be different from previously used passwords"
      />
      <ResetPasswordForm {...token} />
    </>
  );
}
