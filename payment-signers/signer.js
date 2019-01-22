const ERRORS = require('./../errors/sdk-errors');
const initWalletFromConfiguration = require('../utils/utils').initWalletFromConfiguration;
const ethers = require('ethers')
class Signer {

    constructor(paramTypes, paramValues) {
        const messageHash = ethers.utils.solidityKeccak256(paramTypes, paramValues);
        this.messageToSign = ethers.utils.arrayify(messageHash);
    }

    async sign(walletConfiguration) {
        let wallet = await initWalletFromConfiguration(walletConfiguration);
        let signedPaymentFund = await wallet.signMessage(this.messageToSign);
        return signedPaymentFund;
    }
}

module.exports = Signer;
