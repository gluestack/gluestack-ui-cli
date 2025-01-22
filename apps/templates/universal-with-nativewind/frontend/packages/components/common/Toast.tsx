import {
  CheckCircleIcon,
  Icon,
} from '@app-launch-kit/components/primitives/icon';
import { Toast, ToastTitle } from '@app-launch-kit/components/primitives/toast';
import { InterfaceToastProps } from '@gluestack-ui/toast/lib/typescript/types';
import { CircleX } from 'lucide-react-native';

interface ToastOptions {
  action?: 'success' | 'error' | 'warning' | 'info' | 'muted' | undefined;
  message?: string;
  placement?:
    | 'top left'
    | 'top right'
    | 'bottom left'
    | 'bottom right'
    | 'top'
    | 'bottom';
  duration?: number;
}

const defaultData: ToastOptions = {
  action: 'success',
  message: 'Done Successfully',
  placement: 'bottom right',
  duration: 3000,
};

export const showToast = (
  toast: {
    show: (props: InterfaceToastProps) => any;
    close: (id: string) => void;
    closeAll: () => void;
    isActive: (id: string) => boolean;
  },
  { action, message, placement, duration }: ToastOptions = {}
) => {
  const options: ToastOptions = {
    placement: placement || defaultData.placement,
    duration: duration || defaultData.duration,
  };
  return toast.show({
    ...options,
    render: ({ id }) => {
      const toastId = id.toString();
      return (
        <Toast
          nativeID={toastId}
          action={action}
          className="flex-row items-center"
        >
          <Icon
            as={action == 'success' ? CheckCircleIcon : CircleX}
            className={`mr-2 stroke-typography-0`}
          />
          <ToastTitle>{message}</ToastTitle>
        </Toast>
      );
    },
  });
};
