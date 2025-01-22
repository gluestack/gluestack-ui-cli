import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import SignUpForm from '@app-launch-kit/modules/auth/components/SignUpForm';
import { ScrollView } from '@app-launch-kit/components/primitives/scroll-view';

const SignIn = () => {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="items-center md:justify-center grow"
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <ScreenDescription title="Sign up" description="Create your account" />
      <SignUpForm />
    </ScrollView>
  );
};

export default SignIn;
