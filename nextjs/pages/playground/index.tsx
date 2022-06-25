import { Box, Button, ButtonSpinner, CircularProgress, Flex, Heading, Input, Spinner, Text, useStyleConfig, Wrap } from '@chakra-ui/react'
import React, { useState } from 'react'
import PageContainer from '../../components/PageContainer';
import { useDappStatus } from '../../core/ethereum/ethereum';

const PlaygroundCard = ({ children }: { children?: JSX.Element | JSX.Element[] }) => {
  const styles = useStyleConfig('Card')

  return (
    <Box w={['100%', '50%', '33%']} padding="0.5em">
      <Box sx={styles} padding="0.5em">
        {children}
      </Box>
    </Box>
  )
}

const Playground = () => {

  const { dappAPI } = useDappStatus()

  const [greeting, setGreeting] = useState<string | undefined>(undefined)
  const [greetingInput, setGreetingInput] = useState<string | undefined>(undefined)
  const [setGreetingLoading, setSetGreetingLoading] = useState(false)

  const getGreetingClicked = async () => {
    if (!dappAPI) return
    setGreeting(await dappAPI.greeter.greet())
  }

  const setGreetingClicked = async () => {
    if (!greetingInput || !dappAPI) return
    setSetGreetingLoading(true)
    try {
      const tx = await dappAPI.greeter.setGreeting(greetingInput)
      await tx.wait()
    } catch (e) {
      console.error(e)
    }
    setSetGreetingLoading(false)

  }

  return (
    <PageContainer>
      <Heading textAlign="center" mb="1em" size="lg">Testing</Heading>
      {dappAPI ? (
        <Wrap justify="center" spacing={0}>
          <PlaygroundCard>
            <Heading textAlign="center" size="md">Greeter Contract</Heading>
            <Flex justifyContent="center" m={3} flexDirection="column">
              <Text align="center">Greeting: {greeting}</Text>
              <Button mt={3}
                onClick={getGreetingClicked}
              >
                Get Greeting
              </Button>
              <Input mt={6} onChange={(e) => { setGreetingInput(e.target.value) }}>

              </Input>
              <Button mt={3} 
              onClick={setGreetingClicked} 
              isLoading={setGreetingLoading}
              disabled={dappAPI.isViewOnly}
              >
                Set Greeting
              </Button>
            </Flex>
          </PlaygroundCard>
        </Wrap>
      ) : (
        <Flex justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      )}

    </PageContainer>
  )
}

export default Playground