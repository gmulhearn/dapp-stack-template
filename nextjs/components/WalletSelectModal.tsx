import { Button, Flex, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Wrap } from '@chakra-ui/react'
import React from 'react'
import { WALLET_TYPE } from '../core/ethereum/ethereum'

const WalletSelectModal = ({ isOpen, onClose, onSelectWalletType }: { isOpen: boolean, onClose: () => void, onSelectWalletType: (type: WALLET_TYPE) => void }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Select a Wallet</ModalHeader>
                <ModalCloseButton _focus={{
                    boxShadow: "none"
                }} />
                <ModalBody>
                    <Flex flexDirection="column" m={2}>
                        <Button mb={3} onClick={() => { onSelectWalletType(WALLET_TYPE.METAMASK) }}>
                            <HStack w="100%" justifyContent="center">
                                <Image
                                    src="/metamask_logo.png"
                                    alt="Metamask Logo"
                                    width={25}
                                    height={25}
                                    borderRadius="3px"
                                />
                                <Text>Metamask</Text>
                            </HStack>
                        </Button>
                        <Button mb={3} onClick={() => { onSelectWalletType(WALLET_TYPE.WALLET_CONNECT) }}>
                            <HStack w="100%" justifyContent="center">
                                <Image
                                    src="/walletconnect_logo.png"
                                    alt="WalletConnect Logo"
                                    width={25}
                                    height={25}
                                    borderRadius="3px"
                                />
                                <Text>WalletConnect</Text>
                            </HStack>
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default WalletSelectModal