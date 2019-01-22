let ERRORS = require('./../../errors/sdk-errors');

const BaseClient = require('./../base-client');
const CONNECTION_ROUTE = require('./../../constants/connection-routes.json');

class ConnectionClient extends BaseClient {

    async test() {
        await this.HTTPRequester.executeGETRequest(CONNECTION_ROUTE.ping);
        return true;
    }
}

module.exports = ConnectionClient;
