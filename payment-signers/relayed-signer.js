const Signer = require('./signer');

const SIGNATURE_VALUE_TYPES = ['uint256', 'address', 'address', 'uint256'];

class RelayedSigner extends Signer {

    constructor(nonce, escrowAddress, addressToFund, weiToSend) {
        super(SIGNATURE_VALUE_TYPES, [nonce, escrowAddress, addressToFund, weiToSend]);
    }
}

module.exports = RelayedSigner;
