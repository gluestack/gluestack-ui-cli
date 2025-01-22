import React from 'react';
import AuthLayout from '@app-launch-kit/modules/auth/components/AuthLayout';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <AuthLayout>
      <Slot />
    </AuthLayout>
  );
}
