import { Greeter as GreeterContract } from './../../typechain/Greeter.d';
import { CHAIN, getChainConfig } from './../config/chains';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers, Contract } from 'ethers';
import Greeter from "../resources/hardhat/artifacts/contracts/Greeter.sol/Greeter.json";
import DeployedMetadata from "../resources/hardhat/deployedMeta.json"
import { useEffect, useState } from 'react';

export const getProcessEnvChain = (): CHAIN => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (!chainId) return CHAIN.UNKNOWN
    if (isNaN(Number(chainId))) return CHAIN.UNKNOWN
    return chainIntToChainEnum(Number(chainId))
}

const chainIntToChainEnum = (chainInt: number): CHAIN => {
    if (chainInt in CHAIN) {
        return chainInt as CHAIN
    } else {
        return CHAIN.UNKNOWN
    }
}

export const requestConnectWallet = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
    if (provider) {
        await provider.request({ method: "eth_requestAccounts" });
    }
};

export const switchOrAddChain = async (chain: CHAIN) => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

    if (provider) {
        let chainConfig = getChainConfig(chain)
        if (!chainConfig) {
            return undefined
        }
        try {
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainConfig.chainId }],
            });
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            // Also, -32601 occurs when failed on mobile
            if (switchError.code === 4902 || switchError.code === -32601) {
                await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [chainConfig],
                });
            } else {
                throw switchError
            }
        }
    }
};

export enum CONNECTION_STATUS {
    NO_PROVIDER,
    NOT_CONNECTED,
    CONNECTED
}

export const useDappStatus = () => {
    const [connectionStatus, setConnectionStatus] = useState<CONNECTION_STATUS | undefined>(undefined)
    const [currentChain, setCurrentChain] = useState<CHAIN | undefined>(undefined)
    const [connectedAccount, setConnectedAccount] = useState<string | undefined>(undefined)
    const [dapp, setDapp] = useState<DappAPIs | undefined>(undefined)

    const setAccountStatus = async (accounts: any) => {
        if (!accounts || accounts.length <= 0) {
            setConnectionStatus(CONNECTION_STATUS.NOT_CONNECTED)
            setConnectedAccount(undefined)
        } else {
            setConnectionStatus(CONNECTION_STATUS.CONNECTED)
            setConnectedAccount(accounts[0])
        }
    }

    useEffect(() => {
        const effect = async () => {
            const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

            // return if no provider
            if (!provider) {
                setConnectionStatus(CONNECTION_STATUS.NO_PROVIDER)
                return
            }

            // initial connection and account status
            let accounts = await provider.request({ method: "eth_accounts" }) as any
            await setAccountStatus(accounts)
            // subscribe to connection and account status
            console.log("creating accountsChanged listener")
            provider.on("accountsChanged", async (accounts: any) => {
                console.log("account change")
                await setAccountStatus(accounts)
            });

            // get current chain
            let chain = await provider.request({ method: "eth_chainId" }) as string;
            setCurrentChain(chainIntToChainEnum(parseInt(chain, 16)))

            console.log("creating chainChanged listener")
            provider.on("chainChanged", (chainId) => {
                console.log("chain change")
                setCurrentChain(chainIntToChainEnum(parseInt(chainId as string, 16)))
            });
        }
        effect()
    }, [])

    useEffect(() => {
        // if (currentChain && connectedAccount) {
        const effect = async () => {
            const blockchain = await getDappAPIs(connectedAccount)
            setDapp(blockchain)
        }
        effect()
        // }
    }, [connectedAccount, currentChain])

    return {
        connectionStatus,
        requestConnectWallet,
        connectedAccount,
        currentChain,
        requestSwitchChain: switchOrAddChain,
        dappAPI: dapp
    }
}

interface DappAPIs {
    isViewOnly: boolean,
    signer: ethers.providers.JsonRpcSigner | undefined,
    greeter: GreeterContract,
}

export const getDappAPIs = async (connectedAccount: string | undefined): Promise<DappAPIs | undefined> => {
    const chain = getProcessEnvChain()
    const chainConfig = getChainConfig(chain)
    if (!chainConfig) {
        throw "Internal chain config error - no chain config found"
    }

    // if user is connected and on the correct chain, use their signer. Else use a default provider
    let isViewOnly = true
    let providerOrSigner: ethers.providers.Provider | ethers.Signer = ethers.getDefaultProvider(chainConfig.rpcUrls[0])
    const ethProvider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
    if (ethProvider) {
        let provider = new ethers.providers.Web3Provider(ethProvider as any);
        const signer = provider.getSigner()
        const userChainId = Number(ethProvider.networkVersion).toString()
        const userChain = chainIntToChainEnum(Number(userChainId))

        if (connectedAccount && userChain !== CHAIN.UNKNOWN && userChain === getProcessEnvChain()) {
            console.log("using user ethereum provider")
            providerOrSigner = signer
            isViewOnly = false
        } else {
            console.log("using default provider")
            isViewOnly = true
        }
    }

    try {
        const greeter = new Contract(
            (DeployedMetadata.Greeter as any)[chain].address,
            Greeter.abi,
            providerOrSigner
        ) as GreeterContract

        return {
            isViewOnly: isViewOnly,
            signer: isViewOnly ? undefined : providerOrSigner as ethers.providers.JsonRpcSigner,
            greeter
        }
    } catch (e: any) {
        console.error(e)
        return undefined
    }
}