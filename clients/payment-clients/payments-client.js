const utils = require('../../utils/utils');
const BaseClient = require('./../base-client');
const PAYMENT_ROUTES = require('./../../constants/payment-routes.json');
const ERRORS = require('./../../errors/sdk-errors');

class PaymentsClient extends BaseClient {

    async _create(route, creationData, walletConfiguration) {
        // Creates Deep Copy of the provided creation data
        let paymentData = JSON.parse(JSON.stringify(creationData));
        let fundTXData = paymentData.fundTxData;

        if (!fundTXData) {
            throw ERRORS.NO_FUND_TX_DATA_PROVIDED;
        }
        
        if (!fundTXData.authorizationSignature) {
            const signatureMetadata = await this._getSignatureMetadata(paymentData.shopper);
            const authorizationSignature = await this._computeAuthorizationSignature(signatureMetadata, fundTXData, walletConfiguration);
            fundTXData.nonce = signatureMetadata.nonce;
            fundTXData.authorizationSignature = authorizationSignature;
        }

        const response = await this.HTTPRequester.executePOSTRequest(route, paymentData);
        return response.data;
    };

    async _getSignatureMetadata(shopperId) {
        const url = `${PAYMENT_ROUTES.GET_SIGNATURE_METADATA}?shopperId=${shopperId}`;
        const response = await this.HTTPRequester.executeGETRequest(url);
        return response.data;
    }

    // TODO When called from fiatPayment, get only the fiatPayments. Same for relayed payments
    async get(paymentId) {
        const paymentGetRoute = utils.buildRouteWithId(PAYMENT_ROUTES.GET, [paymentId]);
        const response = await this.HTTPRequester.executeGETRequest(paymentGetRoute);
        return response.data;
    }

    // TODO When called from fiatPayment, get only the fiatPayments. Same for relayed payments
    async getAll() {
        const response = await this.HTTPRequester.executeGETRequest(PAYMENT_ROUTES.GET_ALL);
        return response.data;
    }
}

module.exports = PaymentsClient;