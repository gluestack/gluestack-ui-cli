import {
  Button,
  ButtonText,
} from '@app-launch-kit/components/primitives/button';
import { Heading } from '@app-launch-kit/components/primitives/heading';
import { CloseIcon, Icon } from '@app-launch-kit/components/primitives/icon';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@app-launch-kit/components/primitives/modal';
import { Text } from '@app-launch-kit/components/primitives/text';
import React from 'react';

const LogoutModal = ({
  showModal,
  setShowModal,
  handleConfirm,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleConfirm: () => void;
}) => {
  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
      }}
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Logout</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} size="md" className="stroke-background-400" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Text>Are you sure you want to logout?</Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            action="secondary"
            className="mr-3"
            onPress={() => {
              setShowModal(false);
            }}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button
            size="sm"
            onPress={() => {
              handleConfirm();
            }}
          >
            <ButtonText>Log out</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogoutModal;
