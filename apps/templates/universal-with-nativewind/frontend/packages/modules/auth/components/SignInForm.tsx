'use client';
import {
  Button,
  ButtonText,
  ButtonSpinner,
} from '@app-launch-kit/components/primitives/button';
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from '@app-launch-kit/components/primitives/checkbox';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@app-launch-kit/components/primitives/form-control';
import { HStack } from '@app-launch-kit/components/primitives/hstack';
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from '@app-launch-kit/components/primitives/input';
import { Link, LinkText } from '@app-launch-kit/components/primitives/link';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import config from '@app-launch-kit/config';
import { email } from '@app-launch-kit/utils/validators/email';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@unitools/router';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Keyboard } from 'react-native';
import colors from 'tailwindcss/colors';
import { z } from 'zod';

import Footer from '@app-launch-kit/modules/auth/components/Footer';
// import { GoogleSignInButton } from '@app-launch-kit/modules/auth/components/GoogleSignInButton';
import { showToast } from '@app-launch-kit/components/common/Toast';
import { CheckIcon } from '@app-launch-kit/components/primitives/icon';
import demoUser from '@app-launch-kit/modules/auth/constants/demoUserDetails';
import { useAuth } from '@app-launch-kit/modules/auth';

// Schema for sign-in form validation
const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  rememberme: z.boolean().optional(),
});

// Type for sign-in form data
type SignInSchemaType = z.infer<typeof signInSchema>;

// Sign-in form component
export default function SignInForm() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { Service } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { routes } = config;

  const onSubmit = async (_data: SignInSchemaType) => {
    setAuthLoading(true);
    try {
      const response = await Service.signInWithEmailPassword(
        _data.email,
        _data.password
      );
      if (response?.error) {
        // Handle error from the response
        showToast(toast, {
          action: 'error',
          message: response.error.message || 'An unexpected error occurred.',
        });
      } else if (response.data?.user && response.data.session) {
        // Handle successful sign-in
        reset(); // Reset the form after successful login
        router.replace(`${routes.redirectAfterAuth.path}`);
      } else {
        // Handle unexpected response structure
        showToast(toast, {
          action: 'error',
          message: 'Sign-in response is missing user or session data.',
        });
      }
    } catch (error: any) {
      // Handle errors from the try block
      showToast(toast, {
        action: 'error',
        message: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  return (
    <VStack className="w-full pb-16 md:pb-0 pt-10">
      <VStack space="xl">
        <FormControl isInvalid={!!errors.email} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="email"
            defaultValue={demoUser.email}
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({ email: value });
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  enterKeyHint="done"
                  type="text"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="password"
            defaultValue={demoUser.password}
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({ password: value });
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
                <InputSlot onPress={handleState} className="pr-3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.password?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <HStack className="justify-between">
          <Controller
            name="rememberme"
            defaultValue={false}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                aria-label="Remember me"
                size="sm"
                value="Remember me"
                isChecked={value}
                onChange={onChange}
                className="self-start"
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>Remember me</CheckboxLabel>
              </Checkbox>
            )}
          />

          <Link href={`${config.routes.forgotPassword.path}`}>
            <LinkText className="font-medium text-sm text-primary-700 group-hover/link:text-primary-800 group-active/link:text-primary-900">
              Forgot password?
            </LinkText>
          </Link>
        </HStack>
      </VStack>

      <VStack className="my-7" space="lg">
        <Button
          className={`${authLoading ? 'gap-2 opacity-40' : 'opacity-100'}`}
          onPress={handleSubmit(onSubmit)}
          disabled={authLoading}
          focusable={!authLoading}
        >
          {authLoading && <ButtonSpinner color={colors.gray[500]} />}
          <ButtonText>Log in</ButtonText>
        </Button>
        <Footer
          footerLinkHref={`${config.routes.signInWithOtp.path}`}
          footerLinkText="Login with OTP"
        />
      </VStack>
      <Footer
        footerLinkHref={`${config.routes.signUp.path}`}
        footerLinkText="Sign Up"
        footerText="Don't have an account?"
      />
    </VStack>
  );
}
