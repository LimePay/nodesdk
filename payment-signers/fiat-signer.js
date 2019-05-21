const Signer = require('./signer');

const SIGNATURE_VALUE_TYPES = ['uint256', 'address', 'uint256', 'address', 'uint256', 'uint256'];

class FiatSigner extends Signer {

    constructor(nonce, escrowAddress, addressToFund, gasPrice, tokensToSend, weiToSend) {
        super(SIGNATURE_VALUE_TYPES, [nonce, escrowAddress, gasPrice, addressToFund, tokensToSend, weiToSend]);
    }
}

module.exports = FiatSigner;
