import React from 'react';
import { Slot } from 'expo-router';
import { AuthGuard } from '@app-launch-kit/modules/auth/components/AuthGuard';

const Layout = () => {
  return (
    <AuthGuard protectedRoute={true}>
      <Slot />
    </AuthGuard>
  );
};
export default Layout;
