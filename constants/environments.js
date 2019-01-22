const BASE_SANDBOX = 'http://sandbox-api.limepay.io';
const BASE_PRODUCTION = 'https://api.limepay.io';

module.exports = {
    Sandbox: {
        Default: `${BASE_SANDBOX}/v1`,
        v1: `${BASE_SANDBOX}/v1`
    },
    Production: {
        Default: `${BASE_PRODUCTION}/v1`,
        v1: `${BASE_PRODUCTION}/v1`
    }
}