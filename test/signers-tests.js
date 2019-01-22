const ethers = require('ethers');
const assert = require('assert');
const expect = require('chai').expect;
const errors = require('./../errors/sdk-errors')

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

const FiatPaymentSigner = require('./../payment-signers/fiat-signer.js');
const RelayedPaymentSigner = require('./../payment-signers/relayed-signer.js');

describe('Signers', () => {

    const nonce = "1234";
    const fundSigner = ethers.Wallet.createRandom();
    const escrowAddress = ethers.Wallet.createRandom().address;
    const addressToFund = ethers.Wallet.createRandom().address;
    const tokensToSend = ethers.utils.bigNumberify('1000000000'); // 0.000000001 tokens
    const weiToSend = ethers.utils.bigNumberify('1000000000000000000'); // 1 ether

    describe('Fiat Payment Signer', () => {
        it('Should initialize successfully a fiat payment signer', async () => {
            let fiatPaymentSigner = new FiatPaymentSigner(nonce, escrowAddress, addressToFund, tokensToSend, weiToSend);
            
            assert(fiatPaymentSigner instanceof FiatPaymentSigner, "FiatPaymentSigner has not been initialize correctly");
            assert(fiatPaymentSigner.messageToSign.constructor.name === 'Uint8Array', "FiatPaymentSigner hash is not correct after initialization");
        });

        it('[NEGATIVE] Should throw if try to initialize fiat payment signer with invalid parameters', async () => {
            function initFiatPaymentSigner() {
                new FiatPaymentSigner(nonce, escrowAddress, '1234', tokensToSend, weiToSend);
            }

            expect(initFiatPaymentSigner).to.throw();
        });

        it('Should sign fiat payment fund correctly', async () => {
            let fiatPaymentSigner = new FiatPaymentSigner(nonce, escrowAddress, addressToFund, tokensToSend, weiToSend)
            let signedFiatPaymentFund = await fiatPaymentSigner.sign(fundSigner);

            let signerAddress = ethers.utils.verifyMessage(fiatPaymentSigner.messageToSign, signedFiatPaymentFund);
            assert(signerAddress == fundSigner.address, "Recovered signer is different than expected one");
        });

        it('[NEGATIVE] Should throw if try to sign fiat payment fund with invalid ethers wallet', async () => {
            let fiatPaymentSigner = new FiatPaymentSigner(nonce, escrowAddress, addressToFund, tokensToSend, weiToSend);
            
            await fiatPaymentSigner.sign({"privateKey": "fake private key"}).should.be.rejectedWith(errors.INVALID_WALLET_CONFIG)
        });
    });

    describe('Relayed Payment Siger', () => {
        it('Should initialize successfully a relayed payment signer', async () => {
            let relayedPaymentSigner = new RelayedPaymentSigner(nonce, escrowAddress, addressToFund, weiToSend);

            assert(relayedPaymentSigner instanceof RelayedPaymentSigner, "RelayedPaymentSigner has not been initialize correctly");
            assert(relayedPaymentSigner.messageToSign.constructor.name === 'Uint8Array', "RelayedPaymentSigner hash is not correct after initialization");
        });

        it('[NEGATIVE] Should throw if try to initialize relayed payment signer with invalid parameters', async () => {
            function initRelayedPaymentSigner() {
                new RelayedPaymentSigner("fake nonce", escrowAddress, addressToFund, weiToSend);
            }

            expect(initRelayedPaymentSigner).to.throw();
        });

        it('Should sign relayed payment fund successfully', async () => {
            let relayedPaymentSigner = new RelayedPaymentSigner(nonce, escrowAddress, addressToFund, weiToSend);

            let signedRelayedPaymentFund = await relayedPaymentSigner.sign(fundSigner);

            let signerAddress = ethers.utils.verifyMessage(relayedPaymentSigner.messageToSign, signedRelayedPaymentFund);
            assert(signerAddress == fundSigner.address, "Recovered signer is different than expected one");
        });

        it('[NEGATIVE] Should throw if try to sign relayed payment fund with invalid ethers wallet', async () => {
            let relayedPaymentSigner = new RelayedPaymentSigner(nonce, escrowAddress, addressToFund, weiToSend);

            await relayedPaymentSigner.sign({"privateKey": "fake private key"}).should.be.rejectedWith(errors.INVALID_WALLET_CONFIG)
        });
    });

    it('Should give you a way to sign the ready-to-use hash without using the SDK', async () => {
        let fiatPaymentSigner = new FiatPaymentSigner(nonce, escrowAddress, addressToFund, tokensToSend, weiToSend);
        let relayedPaymentSigner = new RelayedPaymentSigner(nonce, escrowAddress, addressToFund, weiToSend);

        let fiatPaymentMessageHash = ethers.utils.solidityKeccak256(['uint256', 'address', 'address', 'uint256', 'uint256'], [nonce, escrowAddress, addressToFund, tokensToSend, weiToSend]);
        let relayedPaymentMessageHash = ethers.utils.solidityKeccak256(['uint256', 'address', 'address', 'uint256'], [nonce, escrowAddress, addressToFund, weiToSend]);

        // hexlify is used to convert an array to a hex due to easier comparison
        let expectedFiatPaymentMessage = ethers.utils.hexlify(ethers.utils.arrayify(fiatPaymentMessageHash));
        let expectedRelayedPaymentMessage = ethers.utils.hexlify(ethers.utils.arrayify(relayedPaymentMessageHash));

        assert(expectedFiatPaymentMessage == ethers.utils.hexlify(fiatPaymentSigner.messageToSign), "Fiat message to sign is not correct");
        assert(expectedRelayedPaymentMessage == ethers.utils.hexlify(relayedPaymentSigner.messageToSign), "Relayed message to sign is not correct");

        let manuallySignedFiatPaymentFund = await fundSigner.signMessage(fiatPaymentSigner.messageToSign);
        let manuallySignedRelayedPaymentFund = await fundSigner.signMessage(relayedPaymentSigner.messageToSign);

        let sdkSignedFiatPaymentFund = await fiatPaymentSigner.sign(fundSigner);
        let sdkSignedRelayedPaymentFund = await relayedPaymentSigner.sign(fundSigner);

        assert(manuallySignedFiatPaymentFund == sdkSignedFiatPaymentFund, "Fiat signed message is incorrect");
        assert(manuallySignedRelayedPaymentFund == sdkSignedRelayedPaymentFund, "Relayed signed message is incorrect");

    });
});