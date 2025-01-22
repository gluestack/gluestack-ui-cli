import React from 'react';
import AuthLayout from '@app-launch-kit/modules/auth/components/AuthLayout';
import config from '@app-launch-kit/config';
import { useAuth } from '@app-launch-kit/modules/auth';
import { useRouter } from '@unitools/router';
import { Slot } from 'expo-router';

export default function Layout() {
  const { session } = useAuth();
  const router = useRouter();
  const { routes } = config;
  if (session?.user) {
    router.replace(`${routes.redirectAfterAuth.path}`);
  } else {
    return (
      <AuthLayout>
        <Slot />
      </AuthLayout>
    );
  }
}
