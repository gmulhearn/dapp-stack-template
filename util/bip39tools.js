require('dotenv').config()
const bip39 = require('bip39')
const { hdkey } = require('ethereumjs-wallet');

async function main() {
    console.log(bip39.validateMnemonic(process.env.MNEMONIC))

    const seed = await bip39.mnemonicToSeed(process.env.MNEMONIC)
    const hdwallet = hdkey.fromMasterSeed(seed);
    const path = "m/44'/60'/0'/0/0";
    const wallet = hdwallet.derivePath(path).getWallet();
    const address = `0x${wallet.getAddress().toString('hex')}`;
    const privKey = `${wallet.getPrivateKeyString()}`

    console.log(`Address: ${address} \nPrivate: ${privKey}`)
}

main()