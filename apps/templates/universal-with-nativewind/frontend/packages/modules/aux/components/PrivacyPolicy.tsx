import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import { VStack } from '@app-launch-kit/components/primitives/vstack';

const PrivacyPolicy = () => {
  return (
    <VStack className="bg-background-0 flex-1 p-9">
      <ScreenDescription
        title="Privacy Policy"
        description="User's Acknowledgment and Acceptance of Terms GeekyAnts India Private
            Ltd."
      />
    </VStack>
  );
};

export default PrivacyPolicy;
