'use client';
import { Box } from '@app-launch-kit/components/primitives/box';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { FormControl } from '@app-launch-kit/components/primitives/form-control';
import { Input, InputField } from '@app-launch-kit/components/primitives/input';
import { Text } from '@app-launch-kit/components/primitives/text';
import { VStack } from '@app-launch-kit/components/primitives/vstack';
import { useState, useRef } from 'react';
import { Service } from '@app-launch-kit/modules/auth/providers';
import { IVerifyOTPFunction } from '../types/IAuthProvider';
import { useToast } from '@app-launch-kit/components/primitives/toast';
import { showToast } from '@app-launch-kit/components/common/Toast';
import { OtpInput } from 'react-native-otp-entry';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';

export default function SignInOTPForm() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [currentInput, setCurrentInput] = useState<'number' | 'otp'>('number');
  const [number, setNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const callBackRef = useRef<IVerifyOTPFunction | null>(null);

  const onSignUP = async () => {
    setIsLoading(true);
    const { data, error } = await Service.sendOTP(number);
    if (error) {
      showToast(toast, {
        action: 'error',
        message: error.message,
      });
      console.log('error', error);
    } else if (data) {
      showToast(toast, {
        action: 'success',
        message: 'OTP sent',
      });
      callBackRef.current = data.verifyOTP;
    }
    setCurrentInput('otp');
    setIsLoading(false);
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      if (callBackRef.current) {
        const { data, error } = await callBackRef.current(String(otp));
        if (error) {
          showToast(toast, {
            action: 'error',
            message: error.message,
          });
          console.log('error', error);
        } else if (data) {
          showToast(toast, {
            action: 'success',
            message: 'Login successful',
          });
          console.log('data', data);
        }
      }
    } catch (error: any) {
      console.log('Invalid code.', error);
      showToast(toast, {
        action: 'error',
        message: error.message,
      });
    }
    setIsLoading(false);
  };
  return (
    <FormControl>
      <VStack space="xl">
        <VStack space="xs">
          {currentInput === 'number' ? (
            <>
              <Text className="text-typography-500 leading-1">Number</Text>
              <Input>
                <InputField
                  type="text"
                  value={number}
                  onChangeText={setNumber}
                />
              </Input>
            </>
          ) : (
            <>
              <Text className="text-typography-500 leading-1">OTP</Text>
              <OtpInput
                disabled={isLoading}
                numberOfDigits={6}
                onTextChange={(text) => {
                  setOtp(text);
                }}
                textInputProps={{
                  accessibilityLabel: 'One-Time Password',
                }}
                onFilled={verifyOTP}
                theme={{
                  pinCodeContainerStyle: {
                    borderColor: '',
                    backgroundColor:
                      colorMode === 'dark' ? '#272625' : '#F6F6F6',
                    width: 50,
                    height: 50,
                  },
                  focusedPinCodeContainerStyle: {
                    borderColor: '',
                  },
                  pinCodeTextStyle: {
                    color: colorMode === 'dark' ? '#F5F5F5' : '#262627',
                    fontSize: 28,
                    lineHeight: 32.81,
                  },
                  focusStickStyle: {
                    backgroundColor:
                      colorMode === 'dark' ? '#F5F5F5' : '#262627',
                    height: 33,
                  },
                }}
              />
            </>
          )}
        </VStack>
        <Button
          isDisabled={isLoading}
          className="ml-auto"
          onPress={currentInput === 'number' ? onSignUP : verifyOTP}
        >
          <ButtonText className="text-typography-0">
            {currentInput === 'number' ? 'send OTP' : 'verify OTP'}
          </ButtonText>
        </Button>
      </VStack>
      {/* this is needed for the recaptcha verification for web for firebase */}
      <Box id="recaptcha-container" className="absolute bottom-0 right-0" />
      {/* this is needed for the recaptcha verification for web for firebase */}
    </FormControl>
  );
}
