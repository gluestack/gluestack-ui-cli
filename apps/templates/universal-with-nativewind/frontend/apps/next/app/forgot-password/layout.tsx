'use client';
import config from '@app-launch-kit/config';
import { useRouter } from '@unitools/router';
import AuthLayout from '@app-launch-kit/modules/auth/components/AuthLayout';
import { useAuth } from '@app-launch-kit/modules/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const { routes } = config;
  if (session?.user) {
    router.replace(`${routes.redirectAfterAuth.path}`);
  } else {
    return <AuthLayout>{children}</AuthLayout>;
  }
}
