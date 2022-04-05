const fs = require("fs");
const path = require("path");

const metadataFileName = path.join(__dirname, "../nextjs/resources/hardhat/deployedMeta.json");

export const updateDeployedContractData = (contractName: string, chainId: string, address: string) => {
    const deployedData = fs.readFileSync(metadataFileName);
    let deployedDataJson = JSON.parse(deployedData);

    if (deployedDataJson[contractName]) {
        deployedDataJson[contractName][chainId] = { address: address };
    } else {
        deployedDataJson[contractName] = { [chainId]: { address: address } };
    }
    fs.writeFileSync(metadataFileName, JSON.stringify(deployedDataJson, null, 2), (_: any) => { });
};

module.exports = { updateDeployedContractData }