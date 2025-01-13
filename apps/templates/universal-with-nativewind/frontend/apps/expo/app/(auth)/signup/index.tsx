import React from 'react';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import SignUpForm from '@app-launch-kit/modules/auth/components/SignUpForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Platform } from 'react-native';

const SignIn = () => {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      enableAutomaticScroll={Platform.OS === 'ios'}
      bounces={false}
      contentContainerStyle={{
        backgroundColor: 'bg-background-0',
      }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenDescription title="Sign up" description="Create your account" />
      <SignUpForm />
    </KeyboardAwareScrollView>
  );
};

export default SignIn;
