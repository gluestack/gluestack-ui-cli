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
  CircleIcon,
  CheckIcon,
  Icon,
} from '@app-launch-kit/components/primitives/icon';
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from '@app-launch-kit/components/primitives/input';
import { Link, LinkText } from '@app-launch-kit/components/primitives/link';
import { Text } from '@app-launch-kit/components/primitives/text';
import { Grid, GridItem } from '@app-launch-kit/components/primitives/grid';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import config from '@app-launch-kit/config';
import { email } from '@app-launch-kit/utils/validators/email';
import { password } from '@app-launch-kit/utils/validators/password';
import { policy } from '@app-launch-kit/utils/validators/policy';
import { confirmPassword } from '@app-launch-kit/utils/validators/confirmPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@unitools/router';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useForm, Controller, MultipleFieldErrors } from 'react-hook-form';
import { Keyboard } from 'react-native';
import colors from 'tailwindcss/colors';
import { z } from 'zod';

// Import backend functions from the service folder
import { useAuth } from '@app-launch-kit/modules/auth';

import Footer from '@app-launch-kit/modules/auth/components/Footer';
// import { GoogleSignInButton } from '@app-launch-kit/modules/auth/components/GoogleSignInButton';

import { showToast } from '@app-launch-kit/components/common/Toast';

// Schema for sign-up form validation
export const signUpSchema = z.object({
  email,
  password,
  confirmpassword: confirmPassword,
  policy,
});

// Type for sign-up form data
export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    criteriaMode: 'all',
    mode: 'all',
  });

  const [isEmailFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setLoading] = useState(false);
  const passwordValidations = ['One number'];

  const toast = useToast();
  const { Service } = useAuth();
  const router = useRouter();
  const { routes } = config;

  const onSubmit = async (_data: SignUpSchemaType) => {
    try {
      // Check if passwords match
      if (_data.password === _data.confirmpassword) {
        setLoading(true);
        try {
          const response = await Service.signUpWithEmailPassword(
            _data.email,
            _data.password
          );

          if (response?.error) {
            throw new Error(response.error.message);
          }

          if (response.data?.user && response.data.session) {
            showToast(toast, {
              action: 'success',
              message:
                "You've successfully signed in. Please fill your profile to continue.",
            });
            reset();
            router.replace(`${routes.signIn.path}`);
          } else {
            throw new Error(
              'Sign-up response is missing user or session data.'
            );
          }
        } catch (error: any) {
          showToast(toast, {
            action: 'error',
            message: error.message || 'An unexpected error occurred.',
          });
        }
      } else {
        showToast(toast, {
          action: 'error',
          message: 'Passwords do not match',
        });
      }
    } catch (error: any) {
      // Handle errors
      showToast(toast, {
        action: 'error',
        message: error?.message || 'An unexpected error occurred.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => !showState);
  };

  const extractTypes = (types: MultipleFieldErrors | undefined) => {
    if (!types) return [];

    const extractedTypes: string[] = [];

    for (const key in types) {
      if (Array.isArray(types[key])) {
        const array = types[key] as string[];

        array.forEach((type) => {
          extractedTypes.push(type);
        });
      } else {
        extractedTypes.push(types[key] as string);
      }
    }

    return extractedTypes;
  };

  const isValid = (type: string, types: MultipleFieldErrors | undefined) => {
    const errorTypes = extractTypes(types);
    return !errorTypes.includes(type);
  };

  return (
    <VStack className="w-full gap-7 pb-16 md:pb-0 pt-10">
      <VStack space="xl">
        {/* Email input field */}
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired
        >
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="email"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({ email: value });
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
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Password input field */}
        <FormControl isInvalid={!!errors.password} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            defaultValue=""
            name="password"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({ password: value });
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
                  textContentType="oneTimeCode"
                />
                <InputSlot onPress={handleState} className="pr-3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          {errors?.password?.types && (
            <Grid
              className="gap-1 my-2"
              _extra={{
                className: 'grid-cols-8',
              }}
            >
              {passwordValidations.map((type, index) => (
                <GridItem
                  _extra={{
                    className: 'col-span-8 xs:col-span-4',
                  }}
                  key={index}
                >
                  <HStack className=" items-center">
                    {isValid(type, errors?.password?.types) ? (
                      <>
                        <Icon
                          as={CircleIcon}
                          className="fill-success-600 stroke-success-600 w-2 h-2 mr-2 shrink-0"
                        />
                        <Text className="text-xs md:text-sm text-success-600">
                          {type}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Icon
                          as={CircleIcon}
                          className="fill-typography-400 stroke-typography-400 w-2 h-2 mr-2 shrink-0"
                        />
                        <Text className="text-xs  md:text-sm text-typography-400">
                          {type}
                        </Text>
                      </>
                    )}
                  </HStack>
                </GridItem>
              ))}
            </Grid>
          )}
        </FormControl>

        {/* Confirm Password input field */}
        <FormControl isInvalid={!!errors.confirmpassword} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Confirm Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            defaultValue=""
            name="confirmpassword"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({ password: value });
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
                  placeholder="Re-enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  enterKeyHint="done"
                  textContentType="oneTimeCode"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleConfirmPwState} className="pr-3">
                  <InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.confirmpassword?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Remember Me checkbox */}
        <FormControl isInvalid={!!errors.policy}>
          <Controller
            name="policy"
            defaultValue={false}
            control={control}
            render={({ field: { onChange, value } }) => (
              <HStack className="items-center gap-1">
                <Checkbox
                  aria-label="policy"
                  size="sm"
                  value="policy"
                  isChecked={value}
                  onChange={onChange}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>I accept the</CheckboxLabel>
                </Checkbox>

                <HStack className="items-center">
                  <Link href={`${routes.termsOfService.path}`}>
                    <LinkText className="text-sm text-primary-700 xs:ml-1 group-hover/link:text-primary-800  group-active/link:text-primary-900 ">
                      Terms of Use
                    </LinkText>
                  </Link>
                  <Text> & </Text>
                  <Link href={`${routes.privacyPolicy.path}`}>
                    <LinkText className="text-sm text-primary-700 group-hover/link:text-primary-800  group-active/link:text-primary-900">
                      Privacy Policy
                    </LinkText>
                  </Link>
                </HStack>
              </HStack>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.policy?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      {/* Sign-up button */}
      <VStack>
        <Button
          className={`${authLoading ? 'opacity-40 gap-2' : 'opacity-100'}`}
          onPress={handleSubmit(onSubmit)}
          disabled={authLoading}
          focusable={!authLoading}
        >
          {authLoading && <ButtonSpinner color={colors.gray[500]} />}
          <ButtonText>Sign up</ButtonText>
        </Button>
        {/* Google sign-in button, you will see a different file for web and native with extensions GoogleSignInButton.web.tsx and GoogleSignInButton.tsx */}
        {/* <GoogleSignInButton /> */}
        <Footer
          footerLinkHref={`${config.routes.signInWithOtp.path}`}
          footerLinkText="Sign up with OTP"
        />
      </VStack>
      <Footer
        footerLinkHref={`${routes.signIn.path}`}
        footerLinkText="Login"
        footerText="Already have an account?"
      />
    </VStack>
  );
}
