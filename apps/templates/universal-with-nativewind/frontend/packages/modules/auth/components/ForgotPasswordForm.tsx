'use client';
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@app-launch-kit/components/primitives/form-control';
import { useRouter } from '@unitools/router';
import { InputField, Input } from '@app-launch-kit/components/primitives/input';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import config from '@app-launch-kit/config';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { email } from '@app-launch-kit/utils/validators/email';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Keyboard } from 'react-native';
import { z } from 'zod';
import { showToast } from '@app-launch-kit/components/common/Toast';
import ResetPasswordModal from '@app-launch-kit/modules/auth/components/ResetPasswordModal';
import { useAuth } from '@app-launch-kit/modules/auth';
import colors from 'tailwindcss/colors';
import React from 'react';

export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
const ForgotPasswordForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { routes } = config;
  const toast = useToast();
  const [authLoading, setAuthLoading] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const { Service } = useAuth();

  const onSubmit = async (_data: ForgotPasswordSchemaType) => {
    setAuthLoading(true);
    try {
      const response = await Service.resetPassword(
        _data.email,
        config.env.SITE_URL +
          config.auth.credentialsAuth.resetPasswordRedirectUri
      );

      if (response.error) {
        // Handle error from the response
        throw new Error(
          response.error.message || 'An unexpected error occurred.'
        );
      }

      // Handle successful password reset
      setShowAlertDialog(true);
      reset();
    } catch (error: any) {
      // Handle errors from the try block
      showToast(toast, {
        action: 'error',
        message: error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const handleRedirect = () => {
    setShowAlertDialog(false);
    router.push('/');
  };

  const handleRedirectToSignIn = () => {
    setShowAlertDialog(false);
    router.push(routes.signIn.path);
  };

  const router = useRouter();
  return (
    <VStack space="xl" className="w-full pt-5">
      <FormControl className="w-full" isInvalid={!!errors.email} isRequired>
        <FormControlLabel>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Controller
          defaultValue=""
          name="email"
          control={control}
          rules={{
            validate: async (value) => {
              try {
                await forgotPasswordSchema.parseAsync({ email: value });
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
                placeholder="Enter email"
                type="text"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={handleKeyPress}
                enterKeyHint="done"
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertTriangle} size="md" />
          <FormControlErrorText>{errors?.email?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
      <Button
        className={`${authLoading ? 'gap-2 opacity-40' : 'opacity-100'}`}
        onPress={handleSubmit(onSubmit)}
        disabled={authLoading}
        focusable={!authLoading}
      >
        {authLoading && <ButtonSpinner color={colors.gray[500]} />}
        <ButtonText className="text-sm">Send Link</ButtonText>
      </Button>
      <ResetPasswordModal
        showAlertDialog={showAlertDialog}
        setShowAlertDialog={setShowAlertDialog}
        handleRedirect={handleRedirect}
        handleRedirectToSignIn={handleRedirectToSignIn}
      />
    </VStack>
  );
};

export default ForgotPasswordForm;
