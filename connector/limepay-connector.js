// Todo: Add some input validations
// Todo: Test connection with /status url
const HTTPRequester = require('./../clients/http-requester');
const ConnectionClient = require('./../clients/connection-client/connection-client');

class LimePayConnector {

    constructor(connectionInput) {
        this.connection = {
            authorization: "Basic " + Buffer.from(connectionInput.apiKey + ":" + connectionInput.secret).toString('base64'),
            environment: connectionInput.environment
        }
    }

    async connect() {
        let httpRequester = new HTTPRequester(this.connection);

        let connection = new ConnectionClient(httpRequester);
        await connection.test();

        return connection;
    }
}

module.exports = LimePayConnector;