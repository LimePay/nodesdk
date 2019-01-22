const Signer = require('./signer');

const SIGNATURE_VALUE_TYPES = ['uint256', 'address', 'address', 'uint256', 'uint256'];

class FiatSigner extends Signer {

    constructor(nonce, escrowAddress, addressToFund, tokensToSend, weiToSend) {
        super(SIGNATURE_VALUE_TYPES, [nonce, escrowAddress, addressToFund, tokensToSend, weiToSend]);
    }
}

module.exports = FiatSigner;
