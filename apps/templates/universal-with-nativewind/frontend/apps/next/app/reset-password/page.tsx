'use client';
import { useRouter } from '@unitools/router';
import ResetPasswordForm from '@app-launch-kit/modules/auth/components/ResetPasswordForm';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const getParams = () => {
      if (typeof window !== 'undefined') {
        let params = {};
        const hashParams = window.location.hash.substring(1);
        const queryParams = searchParams.toString();

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
    };

    getParams();
  }, [searchParams]);

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
