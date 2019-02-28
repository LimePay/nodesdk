module.exports = {
    SIGNING_ERROR: {
        errorName: "SIGNING_ERROR",
        code: 100011,
        message: "Could not sign authorization signature. Invalid parameters provided."
    },
    WALLET_CONFIG_NOT_FOUND: {
        errorName: "WALLET_ERROR",
        code: 100012,
        message: 'Wallet configuration object is required but not provided'
    },
    INVALID_ENCRYPTED_WALLET: {
        errorName: "WALLET_ERROR",
        code: 100013,
        message: 'Cannot decrypt wallet. Invalid JSON Wallet provided'
    },
    INVALID_PRIVATE_KEY: {
        errorName: "WALLET_ERROR",
        code: 100014,
        message: 'Cannot initialise wallet. Invalid Private key provided'
    },
    INVALID_MNEMONIC: {
        errorName: "WALLET_ERROR",
        code: 100015,
        message: 'Cannot initialise wallet. Invalid Mnemonic provided'
    },
    INVALID_WALLET_CONFIG: {
        errorName: "WALLET_ERROR",
        code: 100016,
        message: 'Invalid wallet configuration provided'
    },
    INVALID_TOKEN_AND_WEI_AMOUNT_PROVIDED : {
        errorName: "VALIDATION_ERROR",
        code: 100017,
        message: 'Invalid fundTxData object provided. tokenAmount or weiAmount cannot be undefined'
    },
    INVALID_WEI_AMOUNT_PROVIDED: {
        errorName: "VALIDATION_ERROR",
        code: 100018,
        message: 'Invalid fundTxData object provided. weiAmount cannot be undefined'
    },
    NO_VENDOR_ERROR : {
        errorName: "NO_VENDOR_ERROR",
        code: 100019,
        message: "You are required to have vendor in order to perform this operation"
    },
    NO_FUND_TX_DATA_PROVIDED: {
        errorName: "VALIDATION_ERROR",
        code: 100111,
        message: 'fundTxData object cannot be undefined'
    }
}