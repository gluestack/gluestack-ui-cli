'use client';
import AuthLayout from '@app-launch-kit/modules/auth/components/AuthLayout';
import { AuthGuard } from '@app-launch-kit/modules/auth/components/AuthGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard protectedRoute={false}>
      <AuthLayout>{children}</AuthLayout>
    </AuthGuard>
  );
}
