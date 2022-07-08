import { Contract, ethers } from "ethers"
import { getChainConfig } from "../../config/chains"
import { DAppProvider, getProcessEnvChain, PROVIDER_TYPE } from "./ethereum"
import Greeter from "@hardhat-contracts/Greeter.sol/Greeter.json";
import { Greeter as GreeterContract } from '@typechain/Greeter';
import DeployedMetadata from "@hardhat-resources/deployedMeta.json"

export interface DappAPIs {
    isViewOnly: boolean,
    signer: ethers.providers.JsonRpcSigner | undefined,
    greeter: GreeterContract,
}
export const getDappAPI = (dAppProvider: DAppProvider): DappAPIs | undefined => {
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