import {
    Box,
    Flex,
    Avatar,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    IconButton,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    HStack,
    Image,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import React from 'react';
import { CONNECTION_STATUS, CONNECTION_TYPE, getProcessEnvChain, useDappStatus, WALLET_TYPE } from '../core/ethereum';
import HandymanIcon from '@mui/icons-material/Handyman';
import Link from 'next/link';
import WalletSelectModal from './WalletSelectModal';

const Navbar = () => {

    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const iconColor = {
        light: 'black',
        dark: 'white'
    }

    const {
        connectionStatus,
        connectionType,
        requestConnectWallet,
        connectedAccount,
        switchOrAddChainMetaMask: requestSwitchChain,
        currentChain
    } = useDappStatus()

    const DESIRED_CHAIN = getProcessEnvChain()

    const onSelectWalletType = (walletType: WALLET_TYPE) => {
        onClose()
        requestConnectWallet(walletType)
    }

    return (
        <Box bg={useColorModeValue('toolbarSurfaceLight', 'toolbarSurfaceDark')} px={4} as="nav" position="sticky" zIndex={10} top={0} borderBottom="1px" borderBottomColor={useColorModeValue('gray.300', 'gray.700')}>
            <WalletSelectModal isOpen={isOpen} onClose={onClose} onSelectWalletType={onSelectWalletType} />
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <Text>DApp</Text>

                <Flex alignItems={'center'}>
                    <Stack direction={'row'} spacing={7}>
                        <Link href="/playground">
                            <IconButton
                                aria-label="Playground"
                                icon={<HandymanIcon />}
                                color={iconColor[colorMode]}
                            />
                        </Link>
                        <IconButton
                            aria-label="Toggle dark mode"
                            icon={useColorModeValue(<SunIcon />, <MoonIcon />)}
                            onClick={toggleColorMode}
                            color={iconColor[colorMode]}
                        />
                        {connectionStatus === CONNECTION_STATUS.CONNECTED && connectedAccount ? (
                            <>
                                {currentChain === DESIRED_CHAIN ? (<></>) : (
                                    <Button onClick={() => { requestSwitchChain(DESIRED_CHAIN) }}>
                                        Switch Chain
                                    </Button>
                                )}
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        rounded={'full'}
                                        variant={'link'}
                                        cursor={'pointer'}
                                        minW={0}>
                                        <Avatar
                                            size={'sm'}
                                            src={'https://avatars.dicebear.com/api/male/username.svg'}
                                        />
                                    </MenuButton>
                                    <MenuList alignItems={'center'}>
                                        <Center>
                                            <Avatar
                                                size={'2xl'}
                                                src={'https://avatars.dicebear.com/api/male/username.svg'}
                                            />
                                        </Center>
                                        <Text textAlign="center" m={3}>{connectedAccount.slice(0, 7) + "..." + connectedAccount.slice(-4)}</Text>
                                        {connectionType === CONNECTION_TYPE.METAMASK ? (
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
                                        ) : connectionType === CONNECTION_TYPE.WALLET_CONNECT ? (
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
                                        ) : (<></>)}
                                        <MenuDivider />
                                        <MenuItem justifyContent="center" onClick={() => { requestConnectWallet(WALLET_TYPE.NONE) }}>
                                            <Text marginInline={3}>Disconnect</Text>
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </>
                        ) : (
                            <Button onClick={onOpen}>
                                Connect
                            </Button>
                        )}
                    </Stack>
                </Flex>
            </Flex>
        </Box>
    );
}

export default Navbar;