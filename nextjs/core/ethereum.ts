import { Greeter as GreeterContract } from './../../typechain/Greeter.d';
import { CHAIN, getChainConfig } from './../config/chains';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers, Contract } from 'ethers';
import Greeter from "../resources/hardhat/artifacts/contracts/Greeter.sol/Greeter.json";
import DeployedMetadata from "../resources/hardhat/deployedMeta.json"
import { useEffect, useState } from 'react';

export const hasMetamask = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

    return Boolean(provider);
};

export const isConnected = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

    if (!provider) {
        return undefined
    }
    let accounts = await provider.request({ method: "eth_accounts" }) as any
    if (!accounts) {
        return false
    }
    return accounts.length > 0;
}

export const requestConnectWallet = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
    if (provider) {
        await provider.request({ method: "eth_requestAccounts" });
    }
};

const chainIntToChainEnum = (chainInt: number): CHAIN => {
    if (chainInt in CHAIN) {
        return chainInt as CHAIN
    } else {
        return CHAIN.UNKNOWN
    }
}

export const getCurrentChain = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

    if (provider) {
        let chain = await provider.request({ method: "eth_chainId" }) as string;

        return chainIntToChainEnum(parseInt(chain, 16));
    }
};

export const onChainChanged = async (callback: (chainId: CHAIN) => void) => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

    if (provider) {
        provider.on("chainChanged", (chainId) => {
            callback(chainIntToChainEnum(parseInt(chainId as string, 16)));
        });
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
        } else {
            setConnectionStatus(CONNECTION_STATUS.CONNECTED)
            setConnectedAccount(accounts[0])
        }
    }

    // TODO - can probably optimise this hook. Currently runs with each state update
    useEffect(() => {
        const effect = async () => {
            const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
            if (!provider) {
                setConnectionStatus(CONNECTION_STATUS.NO_PROVIDER)
            } else {
                // initial connection and account status
                let accounts = await provider.request({ method: "eth_accounts" }) as any
                await setAccountStatus(accounts)
                // subscribe to connection and account status
                provider.on("accountsChanged", async (accounts: any) => {
                    await setAccountStatus(accounts)
                });

                // get current chain
                let chain = await provider.request({ method: "eth_chainId" }) as string;
                setCurrentChain(chainIntToChainEnum(parseInt(chain, 16)))

                onChainChanged((chain) => { setCurrentChain(chain) })
            }
        }
        effect()
    })

    useEffect(() => {
        if (currentChain && connectedAccount) {
            const effect = async () => {
                const blockchain = await getBlockchain()
                setDapp(blockchain)
            }
            effect()
        }
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
    provider: ethers.providers.Web3Provider,
    greeter: GreeterContract
}

export const getBlockchain = async (): Promise<DappAPIs | undefined> => {
    const ethProvider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;

    if (ethProvider) {
        try {
            await ethProvider.request({ method: "eth_requestAccounts" });
            const provider = new ethers.providers.Web3Provider(ethProvider as any);
            const signer = provider.getSigner();

            let networkNum = Number(ethProvider.networkVersion).toString()

            const greeter = new Contract(
                (DeployedMetadata.Greeter as any)[networkNum].address,
                Greeter.abi,
                signer
            ) as GreeterContract

            return {
                provider: provider,
                greeter: greeter
            }
        } catch (e: any) {
            console.error(e)
            return undefined
        }
    }
}