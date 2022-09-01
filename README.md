# DApp Stack Template
The following project is designed to make bootstrapping EVM-based decentralized web applications as painless as possible. This project has the following stack:
* **Smart Contract Dev Framework:** Hardhat
* **Web Framework:** NextJS (TypeScript)
* **UI Framework:** Chakra-UI
* **EVM Interaction Framework:** Ethers with Typechain

# Set Up / Configure
Install packages with `hardhat` and `nextjs` via `npm install`

To run any hardhat processes, a mnenomic seed must be provided in your `hardhat/.env` file. Create a `.env` file in the `hardhat` directory with the following contents:
```
MNEMONIC=<12-24 word mnemonic seed phrase>
```

For the sake of this guide, you should install hardhat shorthand:
```
npm i -g hardhat-shorthand
```

To configure your desired deployment chains, update the `NEXT_PUBLIC_CHAIN_ID` variable within `.env.development` and `.env.production`. They are currently configured for localhost in development (i.e. via `npm run dev`) and avax testnet in production (i.e. via `npm start`).

# Work Flow Guide
## Smart Contract Development

*The following assumes you are operating within the `hardhat` directory*

The directory follows a standard hardhat file structure:
* `contracts`: Your Solidity smart contracts
* `scripts`: Scripts to run against your smart contracts or to deploy your smart contracts
* `test`: Chai testing suite 
* `hardhat.config.ts`: Hardhat configuration file - can add new networks in here
* `../artifacts`: A directory containing artifacts of your compiled and deployed contracts, including `typechain`.

### Contracts
First create your smart contracts within the `contracts` directory. An example `Greeter.sol` is provided. You can compile all contracts within `contracts` by running `hh compile`. This will generate the typechain typing within `../artifacts/typechain`.

### Local Deployment
Hardhat allows you to run a localhost EVM chain which you can deploy your contracts to for testing. To run the EVM chain, execute `hh node` in a seperate terminal.

Next to deploy your smart contracts, run the `deploy.ts` script targetting the `localhost` network:
```
hh run --network localhost scripts/deploy.ts
```

Currently this script is set to just deploy the `Greeter.sol` contract. To deploy your other contracts, you'll need to add them into the `deploy.ts` script - just follow the pattern seen for `Greeter`.

The `deploy.ts` script will also update a JSON metadata file within the `../artifacts` directory with information about the deployed contracts. This occurs during:
```js
updateDeployedContractData("Greeter", chainId, greeter.address)
```

For each contract you deploy, you should run this function to ensure the frontend has the most recent instance of your contracts.

This will also generate the contract JSON ABI within `../artifacts/hardhat`, which is then used by the frontend to connect with the contracts.

### Testing
You should, ofcourse, test all your Smart Contracts. This can be done by adding new scripts to the `test` directory. Copy the pattern shown in `index.ts` to get started. You can run these tests with `hh test`.

## Front End
### Chain/Contract Interactions
The front end uses the user's ethereum provider (metamask/walletconnect) to interact with smart contracts, or a default provider if a user does no have a provider installed/connected (view only though).

A custom hook has been written within `core/ethereum.ts`, `useDappStatus()` to provide core automatically updating variables and functions required for DApps.
The `useDappStatus` hook provides the following:
* `connectionStatus`: an enum describing whether the user as an ethereum provider connected or not.
* `connectedAccount`: a string hex address of the ethereum provider account connected (if any).
* `currentChain`: an enum of the current chain connected on the users ethereum provider (if any and if known).
* `requestConnectWallet`: a function which will request the user's ethereum provider to connect (if any).
* `requestSwitchChain`: a function which will request the user's ethereum provider to switch to the desired chain (if any).
* `dappAPI`: a object containing:
    * `signer`: the user's ethereum provider's signer account (if any). Used for signing messages if required.
    * `isViewOnly`: whether the DApp APIs can only be used for viewing (or if writing transactions is allowed to). View only is the case when a default provider is used instead of a user's ethereum provider.
    * `greeter`: An API for the `Greeter` smart contract on the desired chain with the given provider (either the user's ethereum provider or a default view-only provider). This is the main entry into smart contract interactions. See `nextjs/pages/playground/..` for example usages.

As you create new contracts, you should add them as a property to `dappAPI` copying the pattern in which it is done for the `dappAPI.greeter` property.

### Playground
A useful way to test smart contract interactions is through a dedicated playground/sandbox environment. One has been set up under `nextjs/pages/playground/..`. Following the same pattern as the existing `PlaygroundCard`, you can add additional cards to test and interact with your new contracts (which you should have added to the `dappAPI` object, see above ^).

### Navbar
A default navbar has been created within `nextjs/components/Navbar.tsx`. This navbar uses the `useDappStatus` hook to respond to connection and chain status changes. It also shows how the hook can be used to request connection and request chain switches.