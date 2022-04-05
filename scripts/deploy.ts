import { HardhatRuntimeEnvironment } from 'hardhat/types';
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { updateDeployedContractData } from './util';

declare global {
  const hre: HardhatRuntimeEnvironment
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await ethers.getSigners();
  const chainId = String(hre.network.config.chainId)

  // We get the contract to deploy
  const Greeter = await ethers.getContractFactory("Greeter");

  console.log("Deploying contracts with the account:", deployer.address);

  // deploy contracts
  const greeter = await Greeter.deploy("Hello, Hardhat!");
  console.log("Greeter address:", greeter.address);
  updateDeployedContractData("Greeter", chainId, greeter.address)

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
