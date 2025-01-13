import { useToast } from '@app-launch-kit/components/primitives/toast';
import { Loading } from '@app-launch-kit/components/common/Loading';
import { showToast } from '@app-launch-kit/components/common/Toast';
import { useAuth } from '@app-launch-kit/modules/auth';
import React from 'react';

const AuthLoader = ({ children }: { children: any }) => {
  const { isLoading, error } = useAuth();
  const toast = useToast();

  if (error) {
    showToast(toast, {
      action: 'error',
      message: error.message || 'An error occurred. Please try again.',
    });
  }

  if (isLoading) {
    return <Loading />;
  }

  return children;
};

export default AuthLoader;
