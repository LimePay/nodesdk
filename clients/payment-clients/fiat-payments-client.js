const PaymentsClient = require('./payments-client');
const FiatSigner = require('../../payment-signers/fiat-signer');

const utils = require('../../utils/utils');
const PAYMENT_ROUTES = require('./../../constants/payment-routes.json');
const ERRORS = require('./../../errors/sdk-errors');

class FiatPaymentsClient extends PaymentsClient {

    async create(creationData, walletConfiguration) {
        return super._create(PAYMENT_ROUTES.CREATE_FIAT, creationData, walletConfiguration);
    }

    async sendInvoice(paymentId) {
        let sendInvoiceForPaymentRoute = utils.buildRouteWithId(PAYMENT_ROUTES.SEND_INVOICE, [paymentId]);
        const result = await this.HTTPRequester.executeGETRequest(sendInvoiceForPaymentRoute);
        return result.data;
    }

    async getInvoice(paymentId) {
        let getInvoiceForPaymentRoute = utils.buildRouteWithId(PAYMENT_ROUTES.GET_INVOICE, [paymentId]);
        const result = await this.HTTPRequester.executeGETRequest(getInvoiceForPaymentRoute);
        return result.data;
    }

    async getReceipt(paymentId) {
        let getReceiptForPaymentRoute = utils.buildRouteWithId(PAYMENT_ROUTES.GET_RECEIPT, [paymentId]);
        const result = await this.HTTPRequester.executeGETRequest(getReceiptForPaymentRoute);
        return result.data;
    }

    // Implementation of an abstract method
    _computeAuthorizationSignature(signatureMetadata, fundTxData, walletConfiguration) {
        const { nonce, escrowAddress, shopperAddress } = signatureMetadata;
        const gasPrice = signatureMetadata.gasPrice || fundTxData.gasPrice;

        if (!fundTxData.tokenAmount){
            fundTxData.tokenAmount = 0
        }
        
        if (!fundTxData.weiAmount) {
            throw ERRORS.INVALID_TOKEN_AND_WEI_AMOUNT_PROVIDED;
        }

        try {
            const fiatSigner = new FiatSigner(nonce, escrowAddress, gasPrice, shopperAddress, fundTxData.tokenAmount, fundTxData.weiAmount);
            return fiatSigner.sign(walletConfiguration);
        } catch (error) {
            throw ERRORS.SIGNING_ERROR;
        }
    }
}

module.exports = FiatPaymentsClient;
