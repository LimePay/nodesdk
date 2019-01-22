const assert = require('assert');
const ConnectionClient = require('./../clients/connection-client/connection-client');
const ShoppersClient = require('./../clients/shoppers-client');
const PaymentsClient = require('./../clients/payment-clients/payments-client');
const FiatPaymentsClient = require('./../clients/payment-clients/fiat-payments-client');
const RelayedPaymentsClient = require('./../clients/payment-clients/relayed-payments-client');
const LimePay = require('./../index');
const nock = require('nock');
const shoppersMock = require('./mocks/shoppersMock.json');
const vendorsMock = require('./mocks/vendorsMock.json');
const paymentsMock = require('./mocks/paymentsMock.json');
const SDK_ERRORS = require('./../errors/sdk-errors');
const sinon = require('sinon');

describe('Clients', () => {
    const url = "http://localhost/v1";
    let sdk;
    let executePOSTSpy;
    let executeGetSpy;

    beforeEach(async () => {
        nock(url)
            .get('/ping')
            .reply(200, {"response":"success"});

        nock(url)
            .get('/shoppers')
            .reply(200, shoppersMock.getAll);
        
        nock(url)
            .get(`/shoppers/${shoppersMock.shopper._id}`)
            .reply(200, shoppersMock.shopper);
        
        nock(url)
            .patch(`/shoppers/${shoppersMock.shopper._id}`)
            .reply(200, shoppersMock.updatedShopper);

        nock(url)
            .delete(`/shoppers/${shoppersMock.shopper._id}`)
            .reply(200);

        nock(url)
            .post('/shoppers')
            .reply(200, shoppersMock.shopper);
        
        nock(url)
            .get('/vendors')
            .reply(200, vendorsMock.vendors);

        nock(url)
            .get('/payments/metadata?shopperId=0')
            .reply(200, paymentsMock.shopperMetadata);

        nock(url)
            .post('/payments')
            .reply(200, paymentsMock.new_payment);

        nock(url)
            .get('/payments/0/invoice/preview')
            .reply(200, paymentsMock.invoiceTemplate);

        nock(url)
            .get('/payments/0/receipt')
            .reply(200, paymentsMock.receiptTemplate);

        nock(url)
            .get('/payments/0/invoice/')
            .reply(200);

        nock(url)
            .post('/payments/relayed')
            .reply(200, paymentsMock.new_payment);

        nock(url)
            .get('/payments/0')
            .reply(200, paymentsMock.new_payment);

        nock(url)
            .get('/payments')
            .reply(200, paymentsMock.getAll);

        nock(url)
            .get('/payments/0/invoice')
            .reply(200);

        sdk = await LimePay.connect({
            environment: url,
            apiKey: 'YOUR_API_KEY_HERE',
            secret: 'YOUR_API_SECRET_HERE'	
        });

        executeGetSpy = sinon.spy(sdk.connection.HTTPRequester, 'executeGETRequest');
        executePOSTSpy = sinon.spy(sdk.connection.HTTPRequester, 'executePOSTRequest');
        getSignatureMetadataSpy = sinon.spy(sdk.fiatPayment, '_getSignatureMetadata');
        computeAuthorizationSignatureSpy = sinon.spy(sdk.fiatPayment, '_computeAuthorizationSignature');
        
    });

    describe('Clients initialization', () => {
        it('Should initialize successfully a Shoppers client', async () => {
            assert(sdk.shoppers instanceof ShoppersClient, "ShoppersClient has not been initialize correctly");
        });

        it('Should initialize successfully a Payments client', async () => {
            assert(sdk.payments instanceof PaymentsClient, "PaymentsClient has not been initialize correctly");
        });

        it('Should initialize successfully a FiatPayments client', async () => {
            assert(sdk.fiatPayment instanceof FiatPaymentsClient, "FiatPaymentsClient has not been initialize correctly");
        });

        it('Should initialize successfully a RelayedPayments client', async () => {
            assert(sdk.relayedPayment instanceof RelayedPaymentsClient, "RelayedPaymentsClient has not been initialize correctly");
        });

        it('Should initialize successfully a Connection client', async () => {
            assert(sdk.connection instanceof ConnectionClient, "ConnectionClient has not been initialize correctly");
        });
    });

    describe('Shoppers client functionality', () => {
        it('Should get all shoppers successfully', async () => {  
            //Arrange
            let expectedCount = 2
            let expectedFirstShopperId = shoppersMock.getAll[0]._id
            let expectedFirstShopperFirstName = shoppersMock.getAll[0].firstName
            let expectedSecondShopperId = shoppersMock.getAll[1]._id
            let expectedSecondShopperFirstName = shoppersMock.getAll[1].firstName
    
            //Act
            let shoppers = await sdk.shoppers.getAll();

            //Assert
            sinon.assert.calledOnce(executeGetSpy);
            assert(shoppers.length == expectedCount, "Shoppers get all returned wrong count of shoppers.");
            assert(shoppers[0].firstName == expectedFirstShopperFirstName, "First shopper firstName is wrong");
            assert(shoppers[0]._id == expectedFirstShopperId, "First shopper id is wrong");
            assert(shoppers[1].firstName == expectedSecondShopperFirstName, "Second shopper firstName is wrong");
            assert(shoppers[1]._id == expectedSecondShopperId, "Second shopper id is wrong");
        });

        it('Create shopper successfully', async () => {  
            //Arrange
            let expectedShopperId = 2
            let expectedShopperVendor = shoppersMock.shopper.vendor
            let expectedShopperFirstName = shoppersMock.shopper.firstName
            let expectedShopperLastName = shoppersMock.shopper.lastName
            let expectedShopperEmail = shoppersMock.shopper.email
            let expectedShopperWalletAddress = shoppersMock.shopper.walletAddress
    
            //Act
            let shopper = await sdk.shoppers.create({
                "vendor": expectedShopperVendor,
                "firstName": expectedShopperFirstName,
                "lastName": expectedShopperLastName,
                "email" : expectedShopperEmail,
                "walletAddress" : expectedShopperWalletAddress,
            });

            //Assert
            assert(shopper._id == expectedShopperId, "Shopper id is wrong");
            assert(shopper.vendor == expectedShopperVendor, "Shopper vendor is wrong");
            assert(shopper.firstName == expectedShopperFirstName, "Shopper firstName is wrong");
            assert(shopper.lastName == expectedShopperLastName, "Shopper lastName is wrong");
            assert(shopper.email == expectedShopperEmail, "Shopper email is wrong");
            assert(shopper.walletAddress == expectedShopperWalletAddress, "Shopper walletAddress is wrong");
        });

        it('Create shopper without vendor successfully', async () => {  
            //Arrange
            let expectedShopperVendor = shoppersMock.shopper.vendor
            let expectedShopperFirstName = shoppersMock.shopper.firstName
            let expectedShopperLastName = shoppersMock.shopper.lastName
            let expectedShopperEmail = shoppersMock.shopper.email
            let expectedShopperWalletAddress = shoppersMock.shopper.walletAddress
    
            //Act
            let shopper = await sdk.shoppers.create({
                "firstName": expectedShopperFirstName,
                "lastName": expectedShopperLastName,
                "email" : expectedShopperEmail,
                "walletAddress" : expectedShopperWalletAddress,
            });

            //Assert
            sinon.assert.calledOnce(executeGetSpy);
            sinon.assert.calledOnce(executePOSTSpy);
            assert(shopper.vendor == expectedShopperVendor, "Shopper vendor is wrong");
            assert(shopper.firstName == expectedShopperFirstName, "Shopper firstName is wrong");
            assert(shopper.lastName == expectedShopperLastName, "Shopper lastName is wrong");
            assert(shopper.email == expectedShopperEmail, "Shopper email is wrong");
            assert(shopper.walletAddress == expectedShopperWalletAddress, "Shopper walletAddress is wrong");
        });

        it('[NEGATIVE] Create shopper when there are 0 vendors', async () => {  
            //Arrange
            nock.cleanAll();
            nock(url)
                .get('/vendors')
                .reply(200, []);

            let expectedShopperFirstName = shoppersMock.shopper.firstName
            let expectedShopperLastName = shoppersMock.shopper.lastName
            let expectedShopperEmail = shoppersMock.shopper.email
            let expectedShopperWalletAddress = shoppersMock.shopper.walletAddress
    
            let shopperData = {
                "firstName": expectedShopperFirstName,
                "lastName": expectedShopperLastName,
                "email" : expectedShopperEmail,
                "walletAddress" : expectedShopperWalletAddress,
            }

            //Act

            // Assert
            await sdk.shoppers.create(shopperData).should.be.rejectedWith(SDK_ERRORS.NO_VENDOR_ERROR)
        });

        it('Get shopper successfully', async () => {  
            //Arrange

            let expectedShopperId = shoppersMock.shopper._id
            let expectedShopperVendor = shoppersMock.shopper.vendor
            let expectedShopperFirstName = shoppersMock.shopper.firstName
            let expectedShopperLastName = shoppersMock.shopper.lastName
            let expectedShopperEmail = shoppersMock.shopper.email
            let expectedShopperWalletAddress = shoppersMock.shopper.walletAddress
    
            //Act
            let shopper = await sdk.shoppers.get(expectedShopperId);

            //Assert
            sinon.assert.calledOnce(executeGetSpy);
            assert(shopper._id == expectedShopperId, "Shopper id is wrong");
            assert(shopper.vendor == expectedShopperVendor, "Shopper vendor is wrong");
            assert(shopper.firstName == expectedShopperFirstName, "Shopper firstName is wrong");
            assert(shopper.lastName == expectedShopperLastName, "Shopper lastName is wrong");
            assert(shopper.email == expectedShopperEmail, "Shopper email is wrong");
            assert(shopper.walletAddress == expectedShopperWalletAddress, "Shopper walletAddress is wrong");
        });

        it('Patch shopper successfully', async () => {  
            //Arrange
            let shopperId = shoppersMock.shopper._id
            let expectedShopperFirstName = shoppersMock.updatedShopper.firstName
            let expectedShopperLastName = shoppersMock.updatedShopper.lastName
            let expectedShopperVendor = shoppersMock.shopper.vendor
            let expectedShopperEmail = shoppersMock.shopper.email
            let expectedShopperWalletAddress = shoppersMock.shopper.walletAddress
    
            //Act
            let shopper = await sdk.shoppers.update(shopperId, {
                "firstName": expectedShopperFirstName,
                "lastName": expectedShopperLastName,
            });

            //Assert
            assert(shopper.firstName == expectedShopperFirstName, "Shopper firstName is wrong");
            assert(shopper.lastName == expectedShopperLastName, "Shopper lastName is wrong");
            assert(shopper.vendor == expectedShopperVendor, "Shopper vendor is wrong");
            assert(shopper.email == expectedShopperEmail, "Shopper email is wrong");
            assert(shopper.walletAddress == expectedShopperWalletAddress, "Shopper walletAddress is wrong");

        });

        it('Delete shopper successfully', async () => {  
            //Arrange
            let shopperId = shoppersMock.shopper._id
    
            //Act
            let result = await sdk.shoppers.delete(shopperId);
            //todo fix it when delete returns proper result
            //Assert
            // assert(shopper.lastName == expectedShopperLastName, "Shopper lastName is wrong");
        });
    });

    describe('Fiat payment client functionality', () => {
        it('Should create payment with correct data successfully', async () => {  
            //Arrange
            let fiatPaymentData = {
                "currency" : "bgn",
                "shopper" : "0",
                "items" : ["item1", "item2"],
                "fundTxData" : 
                    {
                        "weiAmount": "123",
                        "tokenAmount":"123"
                    },
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act
            let payment = await sdk.fiatPayment.create(fiatPaymentData, signerWalletConfig);

            //Assert
            sinon.assert.calledOnce(executePOSTSpy);
            assert(payment.currency == fiatPaymentData.currency, "Payment currency is not correct.");
            assert(payment.shopper == fiatPaymentData.shopper, "Payment shopper is not correct.");
            assert(payment.items[0] == fiatPaymentData.items[0], "Payment item1 is not correct.");
            assert(payment.items[1] == fiatPaymentData.items[1], "Payment item2 is not correct.");
        });

        it('Should get a single payment successfully', async () => {  
            //Arrange

            let paymentId = paymentsMock.new_payment._id;
            let expectedShopper = paymentsMock.new_payment.shopper
            let expectedVendor = paymentsMock.new_payment.vendor
            let expectedType = paymentsMock.new_payment.type

            //Act
            let payment = await sdk.fiatPayment.get(paymentId);

            //Assert
            sinon.assert.calledOnce(executeGetSpy);
            assert(payment.shopper == expectedShopper, "Payment shopper is not correct.");
            assert(payment.vendor == expectedVendor, "Payment vendor is not correct.");
            assert(payment.type == expectedType, "Payment type is not correct.");
        });

        it('Should get all payments successfully', async () => {  
            //Arrange

            let expectedFirstId = paymentsMock.getAll[0]._id;
            let expectedFirstShopper = paymentsMock.getAll[0].shopper
            let expectedFirstVendor = paymentsMock.getAll[0].vendor
            let expectedFirstType = paymentsMock.getAll[0].type

            let expectedSecondId = paymentsMock.getAll[1]._id;
            let expectedSecondShopper = paymentsMock.getAll[1].shopper
            let expectedSecondVendor = paymentsMock.getAll[1].vendor
            let expectedSecondType = paymentsMock.getAll[1].type

            //Act
            let payments = await sdk.fiatPayment.getAll();

            //Assert
            sinon.assert.calledOnce(executeGetSpy);
            assert(payments[0]._id == expectedFirstId, "Payment id is not correct.");
            assert(payments[0].shopper == expectedFirstShopper, "Payment shopper is not correct.");
            assert(payments[0].vendor == expectedFirstVendor, "Payment vendor is not correct.");
            assert(payments[0].type == expectedFirstType, "Payment type is not correct.");

            assert(payments[1]._id == expectedSecondId, "Payment id is not correct.");
            assert(payments[1].shopper == expectedSecondShopper, "Payment shopper is not correct.");
            assert(payments[1].vendor == expectedSecondVendor, "Payment vendor is not correct.");
            assert(payments[1].type == expectedSecondType, "Payment type is not correct.");
        });

        it('[NEGATIVE] Shouldn\'t create payment with incorrect wei amount', async () => {  
            //Arrange
            let fiatPaymentData = {
                "currency" : "bgn",
                "shopper" : "0",
                "items" : ["item1", "item2"],
                "fundTxData" : 
                    {
                        "tokenAmount":"123"
                    },
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act

            //Assert
            await sdk.fiatPayment.create(fiatPaymentData, signerWalletConfig).should.be.rejectedWith(SDK_ERRORS.INVALID_TOKEN_AND_WEI_AMOUNT_PROVIDED)
        });

        it('[NEGATIVE] Shouldn\'t create payment without fundTxData', async () => {  
            //Arrange
            let fiatPaymentData = {
                "currency" : "bgn",
                "shopper" : "0",
                "items" : ["item1", "item2"],
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act

            //Assert
            await sdk.fiatPayment.create(fiatPaymentData, signerWalletConfig).should.be.rejectedWith(SDK_ERRORS.INVALID_TOKEN_AND_WEI_AMOUNT_PROVIDED)
        });

        it('[NEGATIVE] Should not compute authorizationSignature when already provided', async () => {  
            //Arrange
            let fiatPaymentData = {
                "currency" : "bgn",
                "shopper" : "0",
                "items" : ["item1", "item2"],
                "fundTxData": {
                    "authorizationSignature": null
                },
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act

            //Assert
            await sdk.fiatPayment.create(fiatPaymentData, signerWalletConfig).should.be.rejectedWith(SDK_ERRORS.NO_FUND_TX_DATA_PROVIDED)
            sinon.assert.calledOnce(getSignatureMetadataSpy)
            sinon.assert.calledOnce(computeAuthorizationSignatureSpy)
        });

        it('Should create payment with authorizationSignature', async () => {  
            //Arrange
            let fiatPaymentData = {
                "currency" : "bgn",
                "shopper" : "0",
                "items" : ["item1", "item2"],
                "fundTxData": {
                    "authorizationSignature": true
                },
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act
            let payment = await sdk.fiatPayment.create(fiatPaymentData, signerWalletConfig);

            //Assert
            sinon.assert.calledOnce(executePOSTSpy);
            sinon.assert.notCalled(getSignatureMetadataSpy)
            sinon.assert.notCalled(computeAuthorizationSignatureSpy)
            assert(payment.currency == fiatPaymentData.currency, "Fiat payment currency is wrong");
            assert(payment.shopper == fiatPaymentData.shopper, "Fiat payment shopper is wrong");
        });

        it('[NEGATIVE] Should throw sign error with invalid data', async () => {  
            //Arrange
            let fiatPaymentData = {
                "currency" : "bgn",
                "shopper" : "0",
                "items" : ["item1", "item2"],
                "fundTxData" : 
                    {
                        "weiAmount":"123",
                        "tokenAmount":"123"
                    },
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Assert
            assert.throws(sdk.fiatPayment._computeAuthorizationSignature.bind(this, {}, fiatPaymentData.fundTxData, signerWalletConfig), SDK_ERRORS.SIGNING_ERROR.message);
        });

        it('Send Invoice successfully', async () => {  
            //Act 
            //TODO: get a proper response 


            let result = await sdk.fiatPayment.sendInvoice(paymentsMock.new_payment._id);

            //Assert
            console.log(result)
        });

        it('Get Invoice', async () => {
            //Act 

            let result = await sdk.fiatPayment.getInvoice(paymentsMock.new_payment._id);

            //Assert 
            sinon.assert.calledOnce(executeGetSpy);
            assert(result.html == paymentsMock.invoiceTemplate.html, "Html is wrong");
        });

        it('Get Receipt', async () => {  
            //Act 

            let result = await sdk.fiatPayment.getReceipt(paymentsMock.new_payment._id);

            //Assert
            sinon.assert.calledOnce(executeGetSpy);
            assert(result.html == paymentsMock.receiptTemplate.html, "Html is wrong");
        });
    });

    describe('Relayed payment client functionality', () => {
        it('Should create payment with correct data successfully', async () => {  
            //Arrange
            let relayedPaymentData = {
                "shopper" : "0",
                "fundTxData" : {
                    "weiAmount" : "100"
                },
                "items" : ["item1", "item2"],
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act
            let payment = await sdk.relayedPayment.create(relayedPaymentData, signerWalletConfig);

            //Assert
            sinon.assert.calledOnce(executePOSTSpy);
            assert(payment.shopper == relayedPaymentData.shopper, "Payment shopper is not correct.");
            assert(payment.items[0] == relayedPaymentData.items[0], "Payment item1 is not correct.");
            assert(payment.items[1] == relayedPaymentData.items[1], "Payment item2 is not correct.");
        });

        it('[NEGATIVE] Shouldn\'t create payment without wei amount', async () => {  
            //Arrange
            let relayedPaymentData = {
                "shopper" : "0",
                "fundTxData" : {
                },
                "items" : ["item1", "item2"],
                "genericTransactions" : {
                    "to" : "0x123",
                    "gasPrice" : "123",
                    "gasLimit" : "321",
                    "functionName" : "funcN",
                    "functionParams" : "parm123"
                }
            }

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }
         
            //Act

            //Assert
            await sdk.relayedPayment.create(relayedPaymentData, signerWalletConfig).should.be.rejectedWith(SDK_ERRORS.INVALID_TOKEN_AND_WEI_AMOUNT_PROVIDED)
        });

        it('[NEGATIVE] Shouldn\'t create payment invalid sign data', async () => {  
            //Arrange
            let fundTxData = {
                "weiAmount" : "100"
            };

            let signerWalletConfig = {
                privateKey: 'A6B8FE6AC1322A67DB28626FFA23BD877880A49727045E9E4E470019BC56119D'
            }

            //Assert
            assert.throws(sdk.relayedPayment._computeAuthorizationSignature.bind(this, {}, fundTxData, signerWalletConfig), SDK_ERRORS.SIGNING_ERROR.message);
        });
    });
});