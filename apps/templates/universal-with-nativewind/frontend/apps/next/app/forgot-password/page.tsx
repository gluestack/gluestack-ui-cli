import ForgotPasswordForm from '@app-launch-kit/modules/auth/components/ForgotPasswordForm';
import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';

export default function ForgotPassword() {
  return (
    <>
      <ScreenDescription
        title="Forgot Password?"
        description="Enter email ID associated with your account."
      />
      <ForgotPasswordForm />
    </>
  );
}
