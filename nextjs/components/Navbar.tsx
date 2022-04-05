import {
    Box,
    Flex,
    Avatar,
    Link,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    ColorMode,
    IconButton,
    Text,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import React, { useEffect } from 'react';
import { CONNECTION_STATUS, useDappStatus } from '../core/ethereum';

const Navbar = () => {

    const { colorMode, toggleColorMode } = useColorMode();
    const iconColor = {
        light: 'black',
        dark: 'white'
    }

    const {
        connectionStatus,
        requestConnectWallet,
        connectedAccount,
        currentChain,
        requestSwitchChain,
    } = useDappStatus()

    return (
        <Box bg={useColorModeValue('toolbarSurfaceLight', 'toolbarSurfaceDark')} px={4} as="nav" position="sticky" zIndex={10} top={0} borderBottom="1px" borderBottomColor={useColorModeValue('gray.300', 'gray.700')}>
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <Text>DApp</Text>

                <Flex alignItems={'center'}>
                    <Stack direction={'row'} spacing={7}>
                        <IconButton
                            aria-label="Toggle dark mode"
                            icon={useColorModeValue(<SunIcon />, <MoonIcon />)}
                            onClick={toggleColorMode}
                            color={iconColor[colorMode]}
                        />
                        {connectionStatus === CONNECTION_STATUS.CONNECTED ? (
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
                            <Button onClick={requestConnectWallet}>
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