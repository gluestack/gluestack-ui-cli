import React from 'react';
import { AuthGuard } from '@app-launch-kit/modules/auth/components/AuthGuard';
import AuthLayout from '@app-launch-kit/modules/auth/components/AuthLayout';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <AuthGuard protectedRoute={false}>
      <AuthLayout>
        <Slot />
      </AuthLayout>
    </AuthGuard>
  );
}
