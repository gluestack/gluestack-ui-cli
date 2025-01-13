import {
  Button,
  ButtonText,
  ButtonSpinner,
} from '@app-launch-kit/components/primitives/button';
import {
  FormControl,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@app-launch-kit/components/primitives/form-control';
import {
  EyeIcon,
  EyeOffIcon,
} from '@app-launch-kit/components/primitives/icon';
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from '@app-launch-kit/components/primitives/input';
import { Text } from '@app-launch-kit/components/primitives/text';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import config from '@app-launch-kit/config';
import { password } from '@app-launch-kit/utils/validators/password';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@unitools/router';
import { AlertTriangle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Keyboard } from 'react-native';
import colors from 'tailwindcss/colors';
import { z } from 'zod';

import { showToast } from '@app-launch-kit/components/common/Toast';
import { useAuth } from '@app-launch-kit/modules/auth';

export const resetPasswordSchema = z.object({
  password,
  confirmpassword: password,
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = (params: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { Service } = useAuth();

  const router = useRouter();
  const { routes } = config;
  const toast = useToast();

  useEffect(() => {
    // Authenticate the user using the access token and refresh token
    const getSessionWithTokens = async () => {
      // if (accessToken && refreshToken) {
      try {
        const response = await Service.setSession(params);
        // Check for errors in the response
        if (response.error) {
          throw new Error(`Error signing in: ${response.error.message}`);
        }
        // Handle successful session setting
        if (response.data?.session) {
          // Log the session details for debugging
          // console.log('Session set successfully:', response.data.session);
        } else {
          throw new Error('Session data is missing after setting session.');
        }
      } catch (error: any) {
        console.error(error.message);
        showToast(toast, {
          action: 'error',
          message: error.message || 'An unexpected error occurred.',
        });
      }
      // }
    };
    // Call this function only when accessToken and refreshToken are available.
    // if (accessToken && refreshToken) {
    try {
      getSessionWithTokens();
    } catch (error: any) {
      showToast(toast, {
        action: 'error',
        message: error.message || 'An error occurred. Please try again.',
      });
      console.error(error);
    }
    // }
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (_data: ResetPasswordSchemaType) => {
    setAuthLoading(true);
    try {
      if (_data.password === _data.confirmpassword) {
        // Call the updateUser function with the password
        const response = await Service.updateUser({
          password: _data.password,
        });

        if (response.error) {
          throw new Error(
            response.error.message || 'Failed to update password.'
          );
        }

        if (response.data?.user) {
          showToast(toast, {
            action: 'success',
            message: 'Password updated successfully',
          });

          reset();
          router.replace(`${routes.signIn.path}`);
        } else {
          throw new Error('User data is missing after updating password.');
        }
      } else {
        showToast(toast, {
          action: 'error',
          message: 'Passwords do not match',
        });
      }
    } catch (error: any) {
      showToast(toast, {
        action: 'error',
        message: error.message || 'An error occurred. Please try again.',
      });
      console.error(error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const handlePasswordShowState = () => {
    setShowPassword((prev) => !prev);
  };

  const handleConfirmPasswordState = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <VStack className="w-full mt-6">
      <VStack space="xl" className="w-full">
        <FormControl isInvalid={!!errors.password} isRequired>
          <Controller
            defaultValue=""
            name="password"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await resetPasswordSchema.parseAsync({ password: value });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  autoCapitalize="none"
                  placeholder="Enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  enterKeyHint="done"
                  type={showPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handlePasswordShowState} className="mr-2">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors.password?.message}
            </FormControlErrorText>
          </FormControlError>
          <FormControlHelperText>
            <Text size="xs">Must be at least 8 characters</Text>
          </FormControlHelperText>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmpassword} isRequired>
          <Controller
            defaultValue=""
            name="confirmpassword"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await resetPasswordSchema.parseAsync({
                    confirmpassword: value,
                  });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Re-enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  enterKeyHint="done"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <InputSlot
                  onPress={handleConfirmPasswordState}
                  className="mr-2"
                >
                  <InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors.confirmpassword?.message}
            </FormControlErrorText>
          </FormControlError>
          <FormControlHelperText>
            <Text size="xs">Both passwords must match</Text>
          </FormControlHelperText>
        </FormControl>
      </VStack>
      <VStack className="mt-7 w-full" />
      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={authLoading}
        focusable={!authLoading}
        className={`${authLoading ? 'opacity-40 gap-0' : 'opacity-100 gap-2'}`}
      >
        {authLoading && <ButtonSpinner color={colors.white} />}
        <ButtonText className="text-sm">UPDATE PASSWORD</ButtonText>
      </Button>
    </VStack>
  );
};

export default ResetPasswordForm;
