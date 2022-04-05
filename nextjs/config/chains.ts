export enum CHAIN {
    LOCAL = 31337,
    MUMBAI = 80001,
    ONE_TEST = 1666700000,
    ONE = 1666600000,
    UNKNOWN = -1
}

interface ChainConfig {
    chainId: string,
    chainName: string,
    nativeCurrency: {
        name: string,
        symbol: string,
        decimals: number
    },
    rpcUrls: string[],
    blockExplorerUrls: string[]
}

export const MUMBAI_CHAIN_CONFIG: ChainConfig = {
    chainId: "0x13881",
    chainName: "Matic Testnet Mumbai",
    nativeCurrency: {
        name: "Matic",
        symbol: "tMATIC",
        decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.matic.today"],
    blockExplorerUrls: ["https://mumbai-explorer.matic.today"]
}

export const ONE_TEST_CHAIN_CONFIG: ChainConfig = {
    chainId: "0x6357d2e0",
    chainName: "Harmony Testnet Shard 0",
    nativeCurrency: {
        name: "ONE",
        symbol: "ONE",
        decimals: 18,
    },
    rpcUrls: ["https://api.s0.b.hmny.io"],
    blockExplorerUrls: ["https://explorer.pops.one/"]
}

export const getChainConfig = (chain: CHAIN): ChainConfig | undefined => {
    switch (chain) {
        case CHAIN.MUMBAI:
            return MUMBAI_CHAIN_CONFIG;
        case CHAIN.ONE_TEST:
            return ONE_TEST_CHAIN_CONFIG;
        default:
            return undefined;
    }
}