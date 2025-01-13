'use client';
import config from '@app-launch-kit/config';
import { useRouter } from '@unitools/router';
import { Loading } from '@app-launch-kit/components/common/Loading';
import { useEffect, useState } from 'react';
import { showToast } from '@app-launch-kit/components/common/Toast';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { useAuth } from '@app-launch-kit/modules/auth';
import React from 'react';

const AuthGuard = ({
  protectedRoute,
  children,
}: {
  protectedRoute: boolean;
  children: React.ReactNode;
}) => {
  const { session, isLoading, error } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { routes } = config;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (error) {
      showToast(toast, {
        action: 'error',
        message: error.message || 'An error occurred. Please try again.',
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (isMounted && !isLoading) {
      if (protectedRoute && !session?.user) {
        router.replace(`${routes.signIn.path}`);
      } else if (!protectedRoute && session?.user) {
        router.replace(`${routes.dashboard.path}`);
      }
    }
  }, [isMounted, isLoading, protectedRoute, session?.user, router, routes]);

  if (
    !isMounted ||
    isLoading ||
    (protectedRoute && !session?.user) ||
    (!protectedRoute && session?.user)
  ) {
    return <Loading />;
  }

  return children;
};

export { AuthGuard };
