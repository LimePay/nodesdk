global.ethers = require('ethers');
const environments = require('./constants/environments');

const LimePayConnector = require('./connector/limepay-connector');

const PaymentsClient = require('./clients/payment-clients/payments-client');
const FiatPaymentsClient = require('./clients/payment-clients/fiat-payments-client');
const RelayedPaymentsClient = require('./clients/payment-clients/relayed-payments-client');
const ShoppersClient = require('./clients/shoppers-client');


class LimePaySDK {

    constructor(connectionClient) {
        this.connection = connectionClient;
        
        this.payments = new PaymentsClient(connectionClient.HTTPRequester);
        this.fiatPayment = new FiatPaymentsClient(connectionClient.HTTPRequester);
        this.relayedPayment = new RelayedPaymentsClient(connectionClient.HTTPRequester);

        this.shoppers = new ShoppersClient(connectionClient.HTTPRequester);
    }

    // Todo: Input validation
    static async connect(connectionInput) {
        let limePayConnector = new LimePayConnector(connectionInput);
        let connectionClient = await limePayConnector.connect();

        return new LimePaySDK(connectionClient);
    }
}



module.exports = {
    Environment: environments,
    connect: LimePaySDK.connect
}