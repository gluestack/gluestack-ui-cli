import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import SignInForm from '@app-launch-kit/modules/auth/components/SignInForm';
import { ScrollView } from '@app-launch-kit/components/primitives/scroll-view';

const SignIn = () => {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="items-center md:justify-center grow"
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <ScreenDescription title="Sign in" description="Access your account" />
      <SignInForm />
    </ScrollView>
  );
};

export default SignIn;
