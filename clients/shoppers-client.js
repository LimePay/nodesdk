const utils = require('../utils/utils');
const BaseClient = require('./base-client');

const ERRORS = require('./../errors/sdk-errors');
const SHOPPER_ROUTES = require('./../constants/shopper-routes.json');
const VENDOR_ROUTES = require('./../constants/vendor-routes.json');

class ShoppersClient extends BaseClient {

    /**
     * Creates new shopper for given organization. If property vendor is not provided, it uses the default vendor for the organization
     * @param {object} shopperData 
     */
    async create(shopperData) {
        // Creates Deep Copy of the provided creation data
        const bodyData = JSON.parse(JSON.stringify(shopperData));

        // if not specified, get vendorId
        if (!bodyData.vendor) {
            const response = await this.HTTPRequester.executeGETRequest(VENDOR_ROUTES.GET_ALL);

            if (response.data.length == 0) {
                throw ERRORS.NO_VENDOR_ERROR;
            }

            // Set the vendor to be the default one
            bodyData.vendor = response.data[0]._id;
        }

        const response = await this.HTTPRequester.executePOSTRequest(SHOPPER_ROUTES.CREATE, bodyData);
        return response.data;
    }


    async get(shopperId) {
        const shopperGETRoute = utils.buildRouteWithId(SHOPPER_ROUTES.GET, [shopperId]);
        const response = await this.HTTPRequester.executeGETRequest(shopperGETRoute);
        return response.data;
    }

    async getAll() {
        const response = await this.HTTPRequester.executeGETRequest(SHOPPER_ROUTES.GET_ALL);
        return response.data;
    }

    async update(shopperId, shopperData) {
        const shopperPATCHRoute = utils.buildRouteWithId(SHOPPER_ROUTES.PATCH, [shopperId]);
        const response = await this.HTTPRequester.executePATCHRequest(shopperPATCHRoute, shopperData);
        return response.data;
    }

    async delete(shopperId) {
        const shopperDELETERoute = utils.buildRouteWithId(SHOPPER_ROUTES.DELETE, [shopperId]);
        const response = await this.HTTPRequester.executeDELETERequest(shopperDELETERoute);
        return response.data;
    }

    async getWalletToken(shopperId) {
        const walletTokenRoute = utils.buildRouteWithId(SHOPPER_ROUTES.GET_WALLET_TOKEN, [shopperId]);
        const response = await this.HTTPRequester.executeGETRequest(walletTokenRoute);
        return response.data;
    }
}

module.exports = ShoppersClient;