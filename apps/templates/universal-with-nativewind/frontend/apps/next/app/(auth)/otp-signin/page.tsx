import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import SignInOTPForm from '@app-launch-kit/modules/auth/components/SignInOTPForm';
import { ScrollView } from '@app-launch-kit/components/primitives/scroll-view';

const SignInOTP = () => {
  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="items-center md:justify-center grow"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <ScreenDescription
          title="Login OTP"
          description="Access your account"
        />
        <SignInOTPForm />
      </ScrollView>
    </>
  );
};

export default SignInOTP;
