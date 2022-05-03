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
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import React from 'react';
import { CONNECTION_STATUS, getProcessEnvChain, useDappStatus } from '../core/ethereum';
import HandymanIcon from '@mui/icons-material/Handyman';
import Link from 'next/link';

const Navbar = () => {

    const { colorMode, toggleColorMode } = useColorMode();
    const iconColor = {
        light: 'black',
        dark: 'white'
    }

    const {
        connectionStatus,
        requestConnectWalletMetaMask: requestConnectWallet,
        requestConnectWalletConnect,
        connectedAccount,
        switchOrAddChainMetaMask: requestSwitchChain,
        currentChain
    } = useDappStatus()

    const DESIRED_CHAIN = getProcessEnvChain()

    return (
        <Box bg={useColorModeValue('toolbarSurfaceLight', 'toolbarSurfaceDark')} px={4} as="nav" position="sticky" zIndex={10} top={0} borderBottom="1px" borderBottomColor={useColorModeValue('gray.300', 'gray.700')}>
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
                        {connectionStatus === CONNECTION_STATUS.CONNECTED ? (
                            currentChain === DESIRED_CHAIN ? (
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
                                        <br />
                                        <Center>
                                            <Avatar
                                                size={'2xl'}
                                                src={'https://avatars.dicebear.com/api/male/username.svg'}
                                            />
                                        </Center>
                                        <br />
                                        <Center>
                                            <p>{connectedAccount}</p>
                                        </Center>
                                        <br />
                                        <MenuDivider />
                                        <MenuItem>Account Settings</MenuItem>
                                        <MenuItem>Disconnect</MenuItem>
                                    </MenuList>
                                </Menu>
                            ) : (
                                <Button onClick={() => { requestSwitchChain(DESIRED_CHAIN) }}>
                                    Switch Chain
                                </Button>
                            )
                        ) : (
                            <Button onClick={requestConnectWalletConnect}>
                                Connect Wallet
                            </Button>
                        )}
                    </Stack>
                </Flex>
            </Flex>
        </Box>
    );
}

export default Navbar;