import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
} from '@app-launch-kit/components/primitives/alert-dialog';
import { Icon, CloseIcon } from '@app-launch-kit/components/primitives/icon';
import { Text } from '@app-launch-kit/components/primitives/text';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';

const ResetPasswordModal = ({
  showAlertDialog,
  setShowAlertDialog,
  handleRedirect,
  handleRedirectToSignIn,
}: {
  showAlertDialog: boolean;
  setShowAlertDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleRedirect: () => void;
  handleRedirectToSignIn: () => void;
}) => {
  return (
    <AlertDialog
      isOpen={showAlertDialog}
      onClose={() => {
        setShowAlertDialog(false);
      }}
    >
      <AlertDialogBackdrop />
      <AlertDialogContent className="p-0">
        <AlertDialogHeader className="px-4 pt-4 pb-2">
          <Heading className="text-xl md:text-2xl tracking-[0.2px]">
            Reset link sent
          </Heading>
          <AlertDialogCloseButton
            onPress={() => {
              handleRedirectToSignIn();
            }}
          >
            <Icon as={CloseIcon} />
          </AlertDialogCloseButton>
        </AlertDialogHeader>
        <AlertDialogBody className="px-4 pb-4 pt-2">
          <Text className="test-sm md:text-lg font-normal">
            Your reset link has been sent to your email ID. Create a new
            password from the link
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter className="border-solid border-outline-300 border-t p-4">
          <Button
            variant="solid"
            action="positive"
            onPress={() => {
              handleRedirect();
            }}
          >
            <ButtonText>Back to home</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetPasswordModal;
