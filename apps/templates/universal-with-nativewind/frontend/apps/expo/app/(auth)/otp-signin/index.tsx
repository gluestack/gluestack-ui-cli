import React from 'react';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import SignInOTPForm from '@app-launch-kit/modules/auth/components/SignInOTPForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Platform } from 'react-native';

const SignInOTP = () => {
  return (
    <>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
        bounces={false}
        contentContainerStyle={{
          backgroundColor: 'bg-background-0',
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenDescription
          title="Login OTP"
          description="Access your account"
        />
        <SignInOTPForm />
      </KeyboardAwareScrollView>
    </>
  );
};

export default SignInOTP;
