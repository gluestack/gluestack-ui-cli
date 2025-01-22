import AuthLayout from '@app-launch-kit/modules/auth/components/AuthLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
