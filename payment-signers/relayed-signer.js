const Signer = require('./signer');

const SIGNATURE_VALUE_TYPES = ['uint256', 'address', 'uint256', 'address', 'uint256'];

class RelayedSigner extends Signer {

    constructor(nonce, escrowAddress, gasPrice, addressToFund, weiToSend) {
        super(SIGNATURE_VALUE_TYPES, [nonce, escrowAddress, gasPrice, addressToFund, weiToSend]);
    }
}

module.exports = RelayedSigner;
