const PaymentsClient = require('./payments-client');
const RelayedSigner = require('../../payment-signers/relayed-signer');

const PAYMENT_ROUTES = require('./../../constants/payment-routes.json');
const ERRORS = require('./../../errors/sdk-errors');

class RelayedPaymentsClient extends PaymentsClient {

    async create(creationData, walletConfiguration) {
        return super._create(PAYMENT_ROUTES.CREATE_RELAYED, creationData, walletConfiguration);
    }

    // Implementation of an abstract method
    _computeAuthorizationSignature(signatureMetadata, fundTxData, walletConfiguration) {
        const { nonce, escrowAddress, shopperAddress } = signatureMetadata;

        if (!fundTxData.weiAmount) {
            throw ERRORS.INVALID_WEI_AMOUNT_PROVIDED;
        }

        try {
            const relayedSigner = new RelayedSigner(nonce, escrowAddress, shopperAddress, fundTxData.weiAmount);
            return relayedSigner.sign(walletConfiguration);
        } catch (error) {
            throw ERRORS.SIGNING_ERROR;
        }
    }
}

module.exports = RelayedPaymentsClient;
