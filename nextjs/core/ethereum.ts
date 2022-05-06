import { Greeter as GreeterContract } from './../../typechain/Greeter.d';
import { AVAX_TEST_CHAIN_CONFIG, CHAIN, getChainConfig, LOCAL_CHAIN_CONFIG } from './../config/chains';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers, Contract } from 'ethers';
import Greeter from "../resources/hardhat/artifacts/contracts/Greeter.sol/Greeter.json";
import DeployedMetadata from "../resources/hardhat/deployedMeta.json"
import { useEffect, useState } from 'react';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Cookie from 'js-cookie'
import { singletonHook } from 'react-singleton-hook';

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

export const requestConnectWalletMetaMask = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
    if (provider) {
        await provider.request({ method: "eth_requestAccounts" });
    } else {
        throw "no eth provider in browser."
    }
};

const walletConnectProvider = new WalletConnectProvider({
    rpc: {
        31337: LOCAL_CHAIN_CONFIG.rpcUrls[0],
        43113: AVAX_TEST_CHAIN_CONFIG.rpcUrls[0]
    },
    chainId: getProcessEnvChain()
})

export const requestConnectWalletConnect = async () => {

    await walletConnectProvider.enable();

    return walletConnectProvider
}

export const switchOrAddChainMetaMask = async (chain: CHAIN) => {
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

const clearMetaMaskListeners = async () => {
    const mmProvider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
    if (mmProvider) {
        mmProvider.removeAllListeners()
    }
}

export enum CONNECTION_STATUS {
    NO_METAMASK_PROVIDER,
    NOT_CONNECTED,
    CONNECTED
}

export enum WALLET_TYPE {
    METAMASK,
    WALLET_CONNECT,
    NONE
}

export enum CONNECTION_TYPE {
    METAMASK = "METAMASK",
    WALLET_CONNECT = "WALLET_CONNECT",
    NONE = "NONE"
}

const CONNECTION_TYPE_COOKIE = "WALLET_CONNECTION_TYPE"

const getGlobalConnectionType = (): CONNECTION_TYPE => {
    switch (Cookie.get(CONNECTION_TYPE_COOKIE)) {
        case CONNECTION_TYPE.METAMASK:
            return CONNECTION_TYPE.METAMASK
        case CONNECTION_TYPE.WALLET_CONNECT:
            return CONNECTION_TYPE.WALLET_CONNECT
        default:
            return CONNECTION_TYPE.NONE
    }
}

const setGlobalConnectionType = (type: CONNECTION_TYPE) => {
    Cookie.set(CONNECTION_TYPE_COOKIE, type)
}

const clearGlobalConnectionType = () => {
    Cookie.set(CONNECTION_TYPE_COOKIE, CONNECTION_TYPE.NONE)
}

const getProviderForConnectionType = async (connectionType: CONNECTION_TYPE): Promise<DAppProvider> => {
    const chain = getProcessEnvChain()
    const chainConfig = getChainConfig(chain)
    if (!chainConfig) {
        throw "Internal chain config error - no chain config found"
    }

    // use a default provider as backup
    let type = PROVIDER_TYPE.DEFAULT
    let providerOrSigner: ethers.providers.Provider | ethers.Signer = ethers.getDefaultProvider(chainConfig.rpcUrls[0])

    if (connectionType === CONNECTION_TYPE.METAMASK) {
        const ethProvider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
        if (ethProvider) {
            let provider = new ethers.providers.Web3Provider(ethProvider as any);
            const signer = provider.getSigner()
            const userChainId = Number(ethProvider.networkVersion).toString()
            const userChain = chainIntToChainEnum(Number(userChainId))

            if (userChain !== CHAIN.UNKNOWN && userChain === getProcessEnvChain()) {
                providerOrSigner = signer
                type = PROVIDER_TYPE.METAMASK
            }
        }
    } else if (connectionType === CONNECTION_TYPE.WALLET_CONNECT) {
        let provider = new ethers.providers.Web3Provider(walletConnectProvider)
        const signer = provider.getSigner()
        const userChain = chainIntToChainEnum(Number(walletConnectProvider.chainId))

        if (userChain !== CHAIN.UNKNOWN && userChain === getProcessEnvChain()) {
            providerOrSigner = signer
            type = PROVIDER_TYPE.WALLET_CONNECT
        }
    }

    return { providerOrSigner, type }
}

enum PROVIDER_TYPE {
    METAMASK = "METAMASK",
    WALLET_CONNECT = "WALLET_CONNECT",
    DEFAULT = "DEFAULT"
}

interface DAppProvider {
    providerOrSigner: ethers.providers.Provider | ethers.Signer,
    type: PROVIDER_TYPE
}

const useDappStatusImpl = () => {
    const [connectionType, setConnectionType] = useState<CONNECTION_TYPE>(CONNECTION_TYPE.NONE)
    const [connectionStatus, setConnectionStatus] = useState<CONNECTION_STATUS | undefined>(undefined)
    const [currentChain, setCurrentChain] = useState<CHAIN | undefined>(undefined)
    const [connectedAccount, setConnectedAccount] = useState<string | undefined>(undefined)
    const [provider, setProvider] = useState<DAppProvider | undefined>(undefined)
    const [dapp, setDapp] = useState<DappAPIs | undefined>(undefined)

    const setMetaMaskAccountStatus = async (accounts: any) => {
        if (!accounts || accounts.length <= 0) {
            setConnectionStatus(CONNECTION_STATUS.NOT_CONNECTED)
            setConnectedAccount(undefined)
        } else {
            setConnectionStatus(CONNECTION_STATUS.CONNECTED)
            setConnectedAccount(accounts[0])
        }
    }

    const requestConnectWallet = async (type: WALLET_TYPE) => {
        switch (type) {
            case WALLET_TYPE.METAMASK:
                await requestConnectWalletMetaMask()
                setGlobalConnectionType(CONNECTION_TYPE.METAMASK)
                setConnectionType(CONNECTION_TYPE.METAMASK)
                break
            case WALLET_TYPE.WALLET_CONNECT:
                await requestConnectWalletConnect()
                setGlobalConnectionType(CONNECTION_TYPE.WALLET_CONNECT)
                setConnectionType(CONNECTION_TYPE.WALLET_CONNECT)
                break
            case WALLET_TYPE.NONE:
                setGlobalConnectionType(CONNECTION_TYPE.NONE)
                setConnectionType(CONNECTION_TYPE.NONE)
                setConnectedAccount(undefined)
                setConnectionStatus(CONNECTION_STATUS.NOT_CONNECTED)
                break
            default:
                throw "cannot connect to this wallet type"
        }
    }

    const updateInitialConnectionState = () => {
        const globalConnectionType = getGlobalConnectionType()
        console.log("loaded previous connection state: ", globalConnectionType)
        if (globalConnectionType === CONNECTION_TYPE.METAMASK) {
            setConnectionType(CONNECTION_TYPE.METAMASK)
        } else if (globalConnectionType === CONNECTION_TYPE.WALLET_CONNECT) {
            setConnectionType(CONNECTION_TYPE.WALLET_CONNECT)
        }
    }

    useEffect(() => {
        // HANDLE SET UPS FOR DIFFERENT CONNECTION TYPES
        const effect = async () => {

            await clearMetaMaskListeners()

            if (connectionType === CONNECTION_TYPE.METAMASK) {
                // TRY METAMASK CONNECTION
                const ethProvider = await detectEthereumProvider() as MetaMaskInpageProvider | undefined;
                if (!ethProvider) {
                    setConnectionStatus(CONNECTION_STATUS.NO_METAMASK_PROVIDER)
                    clearGlobalConnectionType()
                    // do something else?
                    return
                }

                // initial connection and account status
                let accounts = await ethProvider.request({ method: "eth_accounts" }) as any
                await setMetaMaskAccountStatus(accounts)

                // subscribe to connection and account status
                console.log("creating accountsChanged listener")
                ethProvider.on("accountsChanged", async (accounts: any) => {
                    console.log("account change")
                    await setMetaMaskAccountStatus(accounts)
                });

                // get current chain
                let chain = await ethProvider.request({ method: "eth_chainId" }) as string;
                setCurrentChain(chainIntToChainEnum(parseInt(chain, 16)))

                console.log("creating chainChanged listener")
                ethProvider.on("chainChanged", (chainId) => {
                    console.log("chain change")
                    setCurrentChain(chainIntToChainEnum(parseInt(chainId as string, 16)))
                });
            } else if (connectionType === CONNECTION_TYPE.WALLET_CONNECT) {
                walletConnectProvider.enable()
                console.log("WALLET CONNECT INSTANCE ", walletConnectProvider.connected)
                console.log(walletConnectProvider)

                if (walletConnectProvider.accounts.length > 0) {
                    setConnectionStatus(CONNECTION_STATUS.CONNECTED)
                    setConnectedAccount(walletConnectProvider.accounts[0])
                } else {
                    setConnectionStatus(CONNECTION_STATUS.NOT_CONNECTED)
                    setConnectedAccount(undefined)
                }

                setCurrentChain(walletConnectProvider.chainId)
            }
        }
        effect()
    }, [connectionType])

    useEffect(() => {
        // SET PROVIDER ON CONNECTION TYPE, ACCOUNT AND CHAIN CHANGES
        const effect = async () => {
            setProvider(await getProviderForConnectionType(connectionType))
        }
        effect()
    }, [connectionType, connectedAccount, currentChain])

    // INIT
    useEffect(() => {
        updateInitialConnectionState()
    }, [])

    // SET DAPP ON PROVIDER CHANGES
    useEffect(() => {
        if (!provider) {
            return
        }
        console.log("provider changed", provider)
        setDapp(getDappAPI(provider))
    }, [provider])

    return {
        connectionStatus,
        connectionType,
        requestConnectWallet,
        connectedAccount,
        currentChain,
        switchOrAddChainMetaMask,
        dappAPI: dapp
    }
}

const voidFn = async (x: any) => { }
export const useDappStatus = singletonHook({
    connectionStatus: undefined,
    connectionType: CONNECTION_TYPE.NONE,
    requestConnectWallet: voidFn,
    connectedAccount: undefined,
    currentChain: undefined,
    switchOrAddChainMetaMask: switchOrAddChainMetaMask,
    dappAPI: undefined
}, useDappStatusImpl);

interface DappAPIs {
    isViewOnly: boolean,
    signer: ethers.providers.JsonRpcSigner | undefined,
    greeter: GreeterContract,
}
const getDappAPI = (dAppProvider: DAppProvider) => {
    const isViewOnly = dAppProvider.type === PROVIDER_TYPE.DEFAULT

    const chain = getProcessEnvChain()
    const chainConfig = getChainConfig(chain)
    if (!chainConfig) {
        throw "Internal chain config error - no chain config found"
    }
    try {
        const greeter = new Contract(
            (DeployedMetadata.Greeter as any)[chain].address,
            Greeter.abi,
            dAppProvider.providerOrSigner
        ) as unknown as GreeterContract

        return {
            isViewOnly: isViewOnly,
            signer: isViewOnly ? undefined : dAppProvider.providerOrSigner as ethers.providers.JsonRpcSigner,
            greeter
        }
    } catch (e: any) {
        console.error(e)
        return undefined
    }
}