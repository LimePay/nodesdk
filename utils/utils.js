const ethers = require('ethers');
const ERRORS = require('./../errors/sdk-errors');
const assert = require('assert');

function buildRouteWithId(routeTemplate, ids) {
    let idTemplateRegex = /:id/g;

    while (idTemplateRegex.exec(routeTemplate)) {
        routeTemplate = routeTemplate.replace(idTemplateRegex, ids.pop());
    }

    return routeTemplate;
}

/*
    From decrypted wallets we support only ethers.js wallets
*/
const initWalletFromConfiguration = async function (configuration) {

    if (!configuration) {
        throw ERRORS.WALLET_CONFIG_NOT_FOUND;
    }
    
    if (configuration.encryptedWallet) {
        return initWalletByJSON(configuration.encryptedWallet.jsonWallet, configuration.encryptedWallet.password);
    } else if (configuration.decryptedWallet && configuration.decryptedWallet instanceof ethers.Wallet) {
        return configuration.decryptedWallet;
    } else if (configuration.privateKey) {
        return initWalletByPrivateKey(configuration.privateKey);
    } else if (configuration.mnemonic) {
        return initWalletByMnemonic(configuration.mnemonic);
    } else {
        throw ERRORS.INVALID_WALLET_CONFIG;
    }

    async function initWalletByJSON(json, password) {
        try {
            return await ethers.Wallet.fromEncryptedJson(json, password);
        } catch (error) {
            throw ERRORS.INVALID_ENCRYPTED_WALLET;
        }
    }

    function initWalletByPrivateKey(privateKey) {
        try {
            return new ethers.Wallet(privateKey);
        } catch (error) {
            throw ERRORS.INVALID_PRIVATE_KEY;
        }
    }

    function initWalletByMnemonic(mnemonicConfiguration) {
        try {
            if (mnemonicConfiguration.nonEnglishLocaleWorldList) {
                return ethers.Wallet.fromMnemonic(mnemonicConfiguration.mnemonic, null, mnemonicConfiguration.nonEnglishLocaleWorldList);
            } else {
                return ethers.Wallet.fromMnemonic(mnemonicConfiguration.mnemonic);
            }
        } catch (error) {
            throw ERRORS.INVALID_MNEMONIC;
        }
    }
}

module.exports = {
    buildRouteWithId,
    initWalletFromConfiguration
}

