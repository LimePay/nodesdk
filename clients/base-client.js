class BaseClient {
    constructor(HTTPRequester) {
        Object.defineProperty(this, 'HTTPRequester', {
            value: HTTPRequester,
            writable: false
        });
    }
}

module.exports = BaseClient;
