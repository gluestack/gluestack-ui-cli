import ScreenDescription from '@app-launch-kit/components/common/ScreenDescription';
import { VStack } from '@app-launch-kit/components/primitives/vstack';

const TermsOfService = () => {
  return (
    <VStack className="bg-background-0 flex-1 p-9">
      <ScreenDescription
        title="Terms of Service"
        description={`All the terms, conditions, and notices contained or referenced herein (the "Terms of Use"), as well as any other written agreement between us and you.`}
      />
    </VStack>
  );
};

export default TermsOfService;
