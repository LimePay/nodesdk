const Signer = require('./signer');

const SIGNATURE_VALUE_TYPES = ['uint256', 'address', 'uint256', 'address', 'uint256', 'uint256'];

class FiatSigner extends Signer {

    constructor(nonce, escrowAddress, gasPrice, addressToFund, weiToSend, tokensToSend) {
        super(SIGNATURE_VALUE_TYPES, [nonce, escrowAddress, gasPrice, addressToFund, weiToSend, tokensToSend]);
    }
}

module.exports = FiatSigner;
