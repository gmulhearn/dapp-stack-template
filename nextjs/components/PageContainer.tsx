import { Flex } from '@chakra-ui/react'
import React from 'react'
import Navbar from './Navbar'

const PageContainer = ({ children }: { children?: JSX.Element | JSX.Element[] }) => {
    return (
        <>
            <Navbar />
            <Flex as="main" justifyContent="center" flexDirection="column" px={[0, 4, 4]} mt={[4, 8, 8]}>
                {children}
            </Flex>
        </>
    )
}

export default PageContainer