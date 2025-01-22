'use client';
import React from 'react';
import { AuthGuard } from '@app-launch-kit/modules/auth/components/AuthGuard';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthGuard protectedRoute={true}>{children}</AuthGuard>;
};
export default Layout;
