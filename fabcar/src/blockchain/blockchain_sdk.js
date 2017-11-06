/*eslint-env node */
//this file acctually acts as a wrapper around a the chaincode
//it directly sends the data which it receives from webservices to chaincode..and then the data is stored it in ledger
"use strict";

/**
@author: dhananjay patil
@version: 3.0
@date: 04/02/2017
@Description: SDK to talk to blockchain using hfc
**/

var Promise = require('bluebird');
var config = require('config');

var logHelper = require('../logging/logging.js');
var logger = logHelper.getLogger('blockchain_sdk');
var validate = require('../utils/validation_helper.js');
var util = require('../utils/util.js');
var constants = require('../constants/constants.js');
var bcNetwork = require('../blockchain/blockchain_network.js');


var secure = true;
var retryLimit = 5;
var retryInterval = 2000;

//function  UserRegisteration calls sdk to store it in bluemix.
function UserRegisteration(params) {

    console.log("calling SDK for registration");
    return new Promise(function(resolve, reject) {
        var UserDetails;
        try {
            logHelper.logEntryAndInput(logger, 'UserRegisteration', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'UserRegisteration', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not create UserRegisteration. Invalid params' })
            }

            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'UserRegisteration', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not create UserRegisteration. Invalid user' })
            }

            UserDetails = params.UserDetails;

            if (!validate.isValidJson(UserDetails)) {
                logHelper.logError(logger, 'UserRegisteration', 'Invalid UserDetails');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not create  userRegisteration. Invalid json object' })
            }
            //here in function name we use the actual function name which is used for registeration i.e User_register
            //args: [UserDetails.name,UserDetails.email,UserDetails.phone,UserDetails.pan,UserDetails.aadhar,UserDetails.usertype,UserDetails.upi,UserDetails.passpin]})
            var reqSpec = getRequestSpec({ functionName: 'registerUser', args: [UserDetails.uid, UserDetails.fname, UserDetails.lname, UserDetails.phone, UserDetails.email, UserDetails.usertype, UserDetails.password] });
            recursiveInvoke({ requestSpec: reqSpec, user: user })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'UserRegisteration', 'Successfully registered user', resp.body);
                    return resolve({ statusCode: constants.SUCCESS, body: UserDetails });
                })

            .catch(function(err) {
                logHelper.logError(logger, 'UserRegisteration', 'Could not register user', err);
                return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
            });

        } catch (err) {
            logHelper.logError(logger, 'UserRegisteration', 'Could not register user application on blockchain ledger: ', err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
        }
    });
}

function fetchUserlist(params) {
    console.log(params, 'data in params for query method')
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logEntryAndInput(logger, 'fetch users details', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'fetch users details', 'Invalid params');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch users details. Invalid params'
                })
            }



            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'fetch users details of user', 'Invalid user');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch users details. Invalid user'
                })
            }


            var getusers = params.getusers;
            if (!validate.isValidString(getusers)) {
                logHelper.logError(logger, 'fetch users details of user', 'Invalid user');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch users details. Invalid user'
                })
            }
            var reqSpec = getRequestSpec({
                functionName: 'readuser',
                args: ["getusers"]
            });
            recursiveQuery({
                    requestSpec: reqSpec,
                    user: user
                })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'fetched users details', 'Successfully fetched users details', resp.body);
                    return resolve({
                        statusCode: constants.SUCCESS,
                        body: resp.body
                    });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'getpolicy', 'Could not fetch users details', err);
                    return reject({
                        statusCode: constants.INTERNAL_SERVER_ERROR,
                        body: 'Could not fetch users details'
                    });

                });

        } catch (err) {
            logHelper.logError(logger, 'fetchuserdetails', 'Could not fetch property ad ', err);
            return reject({
                statusCode: constants.INTERNAL_SERVER_ERROR,
                body: 'Could not fetch users details'
            });
        }
    });
}

function FetchPolicy(params) {

    console.log("calling SDK for fetchpolicy");
    return new Promise(function(resolve, reject) {
        var PolicyDetails;
        try {
            logHelper.logEntryAndInput(logger, 'fetchpolicy', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'fetchpolicy', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not  fetchpolicy. Invalid params' })
            }

            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'fetchpolicy', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not fetchpolicy. Invalid user' })
            }

            PolicyDetails = params.PolicyDetails;

            if (!validate.isValidJson(PolicyDetails)) {
                logHelper.logError(logger, 'fetchpolicy', 'Invalid UserDetails');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not fetchpolicy. Invalid json object' })
            }
            //here in function name we use the actual function name which is used for registeration i.e User_register
            //args: [UserDetails.name,UserDetails.email,UserDetails.phone,UserDetails.pan,UserDetails.aadhar,UserDetails.usertype,UserDetails.upi,UserDetails.passpin]})
            var reqSpec = getRequestSpec({ functionName: 'fetchPolicyQuotes', args: [PolicyDetails.id, PolicyDetails.consignmentWeight, PolicyDetails.consignmentValue, PolicyDetails.invoiceNo, PolicyDetails.modeofTransport, PolicyDetails.packingMode, PolicyDetails.contractType, PolicyDetails.policyType, PolicyDetails.consignmentType] });
            recursiveInvoke({ requestSpec: reqSpec, user: user })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'fetchpolicy', 'Successfully fetchpolicy', resp.body);
                    return resolve({ statusCode: constants.SUCCESS, body: PolicyDetails });
                })

            .catch(function(err) {
                logHelper.logError(logger, 'fetchpolicy', 'Could notfetchpolicy', err);
                return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not fetchpolicy' });
            });

        } catch (err) {
            logHelper.logError(logger, 'UserRegisteration', 'Could not register user application on blockchain ledger: ', err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
        }
    });
}

function FetchPolicylist(params) {
    console.log(params, 'data in params for query method')
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logEntryAndInput(logger, 'fetch policy details', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'fetch policy details', 'Invalid params');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch policy details. Invalid params'
                })
            }



            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'fetch policy details of user', 'Invalid user');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch policy details. Invalid user'
                })
            }


            var getpolicy = params.getpolicy;
            if (!validate.isValidString(getpolicy)) {
                logHelper.logError(logger, 'fetch policy details of user', 'Invalid user');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch policy details. Invalid user'
                })
            }
            var reqSpec = getRequestSpec({
                functionName: 'readuser',
                args: ["get"]
            });
            recursiveQuery({
                    requestSpec: reqSpec,
                    user: user
                })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'fetched policy details', 'Successfully fetched policy details', resp.body);
                    return resolve({
                        statusCode: constants.SUCCESS,
                        body: resp.body
                    });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'getpolicy', 'Could not fetch policy details', err);
                    return reject({
                        statusCode: constants.INTERNAL_SERVER_ERROR,
                        body: 'Could not fetch policy details'
                    });

                });

        } catch (err) {
            logHelper.logError(logger, 'fetchpolicydetails', 'Could not fetch property ad ', err);
            return reject({
                statusCode: constants.INTERNAL_SERVER_ERROR,
                body: 'Could not fetch policy details'
            });
        }
    });
}

function consignmentdetail(params) {

    console.log("calling SDK for policy");
    return new Promise(function(resolve, reject) {
        var ConsignmentDetails;
        try {
            logHelper.logEntryAndInput(logger, 'consignmentdetail', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'consignmentdetail', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not create consignmentdetail. Invalid params' })
            }

            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'consignmentdetail', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not create consignmentdetail. Invalid user' })
            }

            ConsignmentDetails = params.ConsignmentDetails;

            if (!validate.isValidJson(ConsignmentDetails)) {
                logHelper.logError(logger, 'consignmentdetail', 'Invalid ConsignmentDetails');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not create  consignmentdetail. Invalid json object' })
            }

            var reqSpec = getRequestSpec({ functionName: 'consignmentDetail', args: [ConsignmentDetails.id, ConsignmentDetails.consignmentWeight, ConsignmentDetails.consignmentValue, ConsignmentDetails.policyName, ConsignmentDetails.sumInsured, ConsignmentDetails.premiumAmount, ConsignmentDetails.modeofTransport, ConsignmentDetails.packingMode, ConsignmentDetails.consignmentType, ConsignmentDetails.contractType, ConsignmentDetails.policyType, ConsignmentDetails.email, ConsignmentDetails.policyHolderName, ConsignmentDetails.userType, ConsignmentDetails.invoiceNo, ConsignmentDetails.policyNumber] });
            recursiveInvoke({ requestSpec: reqSpec, user: user })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'consignmentdetail', 'Successfully registered user', resp.body);
                    return resolve({ statusCode: constants.SUCCESS, body: ConsignmentDetails });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'consignmentdetail', 'Could not register user', err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not post consignmentdetail ' });

                });

        } catch (err) {
            logHelper.logError(logger, 'UserRegisteration', 'Could not register user application on blockchain ledger: ', err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
        }
    });
}

function fetchConsignmentlist(params) {
    console.log(params, 'data in params for query method')
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logEntryAndInput(logger, 'fetch consignment details', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'fetch consignment details', 'Invalid params');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch consignment details. Invalid params'
                })
            }



            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'fetch users details of user', 'Invalid user');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch consignment details. Invalid user'
                })
            }


            var getconsignment = params.getconsignment;
            if (!validate.isValidString(getconsignment)) {
                logHelper.logError(logger, 'fetch consignment details of user', 'Invalid consignment');
                return reject({
                    statusCode: constants.INVALID_INPUT,
                    body: 'Could not fetch consignment details. Invalid consignment'
                })
            }
            var reqSpec = getRequestSpec({
                functionName: 'readuser',
                args: [getconsignment]
            });
            recursiveQuery({
                    requestSpec: reqSpec,
                    user: user
                })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'fetched consignment details', 'Successfully fetched users details', resp.body);
                    return resolve({
                        statusCode: constants.SUCCESS,
                        body: resp.body
                    });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'getconsignment', 'Could not fetch consignment details', err);
                    return reject({
                        statusCode: constants.INTERNAL_SERVER_ERROR,
                        body: 'Could not fetch consignment details'
                    });

                });

        } catch (err) {
            logHelper.logError(logger, 'fetchconsignmentlist', 'Could not fetch property ad ', err);
            return reject({
                statusCode: constants.INTERNAL_SERVER_ERROR,
                body: 'Could not fetch consignment details'
            });
        }
    });
}

function read(params) {
    console.log(params, 'data in params for query method')
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logEntryAndInput(logger, 'fetch key value details', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'fetch key value details', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not fetch campaign details. Invalid params' })
            }

            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, ' user', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not fetch campaign details. Invalid user' })
            }


            var helloworld = params.helloworld;
            if (!validate.isValidString(helloworld)) {
                logHelper.logError(logger, 'fetch campaign details of user', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not fetch campaign details. Invalid user' })
            }
            var reqSpec = getRequestSpec({ functionName: 'read', args: ["hello_world"] });
            recursiveQuery({ requestSpec: reqSpec, user: user })
                .then(function(resp) {
                    logHelper.logMessage(logger, 'fetched campaign details', 'Successfully fetched helloworld', resp.body);
                    return resolve({ statusCode: constants.SUCCESS, body: resp.body });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'helloworld', 'Could not fetch value', err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not fetch campaign details' });

                });

        } catch (err) {
            logHelper.logError(logger, 'can fetch value ', 'Could not fetch property ad ', err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not fetch campaign details' });
        }
    });
}


/**
Generates the request object for invoke and query calls using hfc
**/
function getRequestSpec(params) {

    if (!validate.isValidJson(params)) {
        logHelper.logError(logger, 'getRequestSpec', 'Invalid params');
        throw new Error("Invalid params");
    }

    var chaincodeID = config['chaincode']['id']; //util.getUserDefinedProperty(constants['BLOCKCHAIN_CHAINCODE'])['id'];
    if (!validate.isValidString(chaincodeID)) {
        logHelper.logError(logger, 'getRequestSpec', 'Invalid chaincodeID');
        throw new Error("Invalid chaincodeID");
    }

    var functionName = params.functionName;
    if (!validate.isValidString(functionName)) {
        logHelper.logError(logger, 'getRequestSpec', 'Invalid function name');
        throw new Error("Invalid function name");
    }

    var args = []

    if (validate.isValidArray(params.args)) {
        args = params.args;
    }

    //     var attributes = ['username', 'role']

    //   if(validate.isValidArray(params.attributes)){
    //     attributes = params.attributes;


    var spec = {
        chaincodeID: chaincodeID,
        fcn: functionName,
        args: args
            //  attrs: attributes
    }

    return spec;
}


/**
Performs query operation on blockchain
**/
function doQuery(params) {
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logEntryAndInput(logger, 'doQuery', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'doQuery', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not perform query. Invalid params' })
            }

            var requestSpec = params.requestSpec;
            if (!validate.isValidJson(requestSpec)) {
                logHelper.logError(logger, 'doQuery', 'Invalid requestSpec');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not perform query. Invalid requestSpec' })
            }

            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'doQuery', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not perform query. Invalid user' })
            }

            var chain = bcNetwork.getChain();
            var chainAsync = Promise.promisifyAll(chain);

            chainAsync.getMemberAsync(user)
                .then(function(member) {

                    var tx = member.query(requestSpec);
                    tx.on('submitted', function() {
                        logHelper.logMessage(logger, 'doQuery', 'Transaction for query submitted');
                    });

                    tx.on('complete', function(data) {
                        try {
                            logHelper.logMessage(logger, 'doQuery', 'data in data.result ', data.result);
                            var buffer = new Buffer(data.result);
                            logHelper.logMessage(logger, 'doQuery', 'data in buffer.tostring ', buffer.toString());
                            var jsonResp = (buffer.toString());
                            logHelper.logMessage(logger, jsonResp, 'json response in query line 218')
                            return resolve({ statusCode: constants.SUCCESS, body: jsonResp });
                        } catch (err) {
                            logHelper.logError(logger, 'doQuery', 'Could not parse query response', err);
                            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not parse query response ' });
                        }
                    });

                    tx.on('error', function(err) {
                        logHelper.logError(logger, 'doQuery', 'Could not perform query ', err);
                        return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not perform query ' });

                    });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'doQuery', 'Could not perform query ', err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not perform query ' });
                })

        } catch (err) {
            logHelper.logError(logger, 'doQuery', 'Could not perform query ', err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not perform query ' });
        }
    });

}


/**
Performs invoke operation on blockchain
**/
function doInvoke(params) {
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logEntryAndInput(logger, 'doInvoke', params);

            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'doInvoke', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not perform invoke. Invalid params' })
            }

            var requestSpec = params.requestSpec;
            if (!validate.isValidJson(requestSpec)) {
                logHelper.logError(logger, 'doInvoke', 'Invalid requestSpec');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not perform invoke. Invalid requestSpec' })
            }

            var user = params.user;
            if (!validate.isValidString(user)) {
                logHelper.logError(logger, 'doInvoke', 'Invalid user');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not perform invoke. Invalid user' })
            }

            var chain = bcNetwork.getChain();
            var chainAsync = Promise.promisifyAll(chain);


            chainAsync.getMemberAsync(user)
                .then(function(member) {

                    var tx = member.invoke(requestSpec);
                    tx.on('submitted', function(data) {
                        logHelper.logMessage(logger, 'doInvoke', 'Transaction for invoke submitted ', requestSpec);
                        return resolve({ statusCode: constants.SUCCESS, body: data });

                    });

                    tx.on('complete', function(data) {
                        logHelper.logMessage(logger, 'doInvoke', 'Transaction for invoke complete ', data);

                    });

                    tx.on('error', function(err) {
                        logHelper.logError(logger, 'doInvoke', 'Could not perform invoke ', err);
                        return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not perform invoke ' });

                    });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'doInvoke', 'Could not perform invoke ', err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not perform invoke ' });
                })

        } catch (err) {
            logHelper.logError(logger, 'doInvoke', 'Could not perform invoke ', err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not perform invoke ' });
        }
    });

}

//Performs register on Blockchain CA
function doRegister(params) {
    return new Promise(function(resolve, reject) {

        var username;
        try {
            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'registerUser', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not register user. Invalid params' })
            }

            username = params.username;
            if (!validate.isValidString(username)) {
                logHelper.logError(logger, 'registerUser', 'Invalid username');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not register user. Invalid username' })
            }

            var affiliation = params.affiliation;
            if (!validate.isValidString(affiliation)) {
                logHelper.logError(logger, 'registerUser', 'Invalid affiliation');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not register user. Invalid affiliation' })
            }

            var roles = params.roles;
            if (!validate.isValidArray(roles)) {
                roles = ['client'];
            }

            var enrollsecret
            var chain = bcNetwork.getChain();
            var reg = chain.getRegistrar();
            var chainAsync = Promise.promisifyAll(chain);

            chainAsync.getMemberAsync(username)
                .then(function(member) {
                    var memberAsync = Promise.promisifyAll(member);

                    var registrationRequest = {
                        enrollmentID: username,
                        attributes: [
                            { name: 'role', value: affiliation },
                            { name: 'username', value: username }
                        ],
                        affiliation: 'group1',
                        registrar: reg,
                        roles: roles

                    };

                    return memberAsync.registerAsync(registrationRequest);
                })
                .then(function(enrollsec) {
                    logHelper.logMessage(logger, 'registerUser', 'Successfully registered user on blockchain: ' + username);
                    enrollsecret = enrollsec;
                    return resolve({ statusCode: constants.SUCCESS, body: { password: enrollsecret } });

                })
                .catch(function(err) {
                    logHelper.logError(logger, 'registerUser', 'Could not register user on blockchain: ' + username, err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
                })
        } catch (err) {
            logHelper.logError(logger, 'registerUser', 'Could not register user on blockchain: ' + username, err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
        }
    });

}


//Enroll user with the Blockchain CA

function doLogin(params) {
    return new Promise(function(resolve, reject) {

        try {
            logHelper.logMethodEntry(logger, 'doLogin');
            if (!validate.isValidJson(params)) {
                logHelper.logError(logger, 'doLogin', 'Invalid params');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not login user. Invalid params' })
            }

            var username = params.username;
            if (!validate.isValidString(username)) {
                logHelper.logError(logger, 'doLogin', 'Invalid username');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not login user. Invalid username' })
            }

            var password = params.password;
            if (!validate.isValidString(password)) {
                logHelper.logError(logger, 'doLogin', 'Invalid account');
                return reject({ statusCode: constants.INVALID_INPUT, body: 'Could not login user. Invalid password' })
            }

            var chain = bcNetwork.getChain();
            var chainAsync = Promise.promisifyAll(chain);

            chainAsync.getMemberAsync(username)
                .then(function(member) {
                    var memberAsync = Promise.promisifyAll(member);
                    return memberAsync.enrollAsync(password);
                })
                .then(function(crypto) {
                    logHelper.logMessage(logger, 'doLogin', 'Successfully logged in user on blockchain: ' + username);
                    return resolve({ statusCode: constants.SUCCESS, body: crypto });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'doLogin', 'Could not login user on blockchain: ' + username, err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not login user' });
                });

        } catch (err) {
            logHelper.logError(logger, 'doLogin', 'Could not register user on blockchain: ' + username, err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not register user' });
        }
    });
}


//sometimes there is are issues while connecting to bluemix services at once.
// hence recursive functions are created with at maximum recurrance of 5
function recursiveRegister(params) {
    if (!validate.isValid(params.retryCounter)) {
        params.retryCounter = 0;
    } else {
        params.retryCounter = params.retryCounter + 1;
    }

    return doRegister(params).catch(function(err) {
        if (err.statusCode == constants.INVALID_INPUT || params.retryCounter > retryLimit) {
            logHelper.logError(logger, 'recursiveRegister', "Register Retries Exhausted", err)
            return Promise.reject(err);
        }
        return Promise.delay(retryInterval).then(function() {
            return recursiveRegister(params);
        });
    });
}

//sometimes there is are issues while connecting to bluemix services at once.
// hence recursive functions are created with at maximum recurrance of 5
function recursiveLogin(params) {
    if (!validate.isValid(params.retryCounter)) {
        params.retryCounter = 0;
    } else {
        params.retryCounter = params.retryCounter + 1;
    }

    return doLogin(params).catch(function(err) {
        if (err.statusCode == constants.INVALID_INPUT || params.retryCounter > retryLimit) {
            logHelper.logError(logger, 'recursiveLogin', "Login Retries Exhausted", err)
            return Promise.reject(err);
        }
        return Promise.delay(retryInterval).then(function() {
            return recursiveLogin(params);
        });
    });
}


//sometimes there is are issues while connecting to bluemix services at once.
// hence recursive functions are created with at maximum recurrance of 5
function recursiveInvoke(params) {
    if (!validate.isValid(params.retryCounter)) {
        params.retryCounter = 0;
    } else {
        params.retryCounter = params.retryCounter + 1;
    }

    return doInvoke(params).catch(function(err) {
        if (err.statusCode == constants.INVALID_INPUT || params.retryCounter > retryLimit) {
            logHelper.logError(logger, 'recursiveInvoke', "Invoke Retries Exhausted", err);
            return Promise.reject(err);
        }
        return Promise.delay(retryInterval).then(function() {
            logHelper.logError(logger, 'recursiveInvoke', "Invoke Retry " + params.retryCounter, err)
            return recursiveInvoke(params);
        });
    });
}

//sometimes there is are issues while connecting to bluemix services at once.
// hence recursive functions are created with at maximum recurrance of 5
function recursiveQuery(params) {
    if (!validate.isValid(params.retryCounter)) {
        params.retryCounter = 0;
    } else {
        params.retryCounter = params.retryCounter + 1;
    }

    return doQuery(params).catch(function(err) {
        if (err.statusCode == constants.INVALID_INPUT || params.retryCounter > retryLimit) {
            logHelper.logError(logger, 'recursiveQuery', "Query Retries Exhausted", err)
            return Promise.reject(err);
        }
        return Promise.delay(retryInterval).then(function() {
            logHelper.logError(logger, 'recursiveQuery', "Query Retry " + params.retryCounter, err)
            return recursiveQuery(params);
        });
    });
}

function isUserRegistered(params) {
    return new Promise(function(resolve, reject) {
        try {
            logHelper.logMethodEntry(logger, 'isUserRegistered');
            var username = params.username;
            var chain = bcNetwork.getChain();
            var chainAsync = Promise.promisifyAll(chain);

            chainAsync.getMemberAsync(username)
                .then(function(member) {
                    return resolve({ statusCode: constants.SUCCESS, body: member.isRegistered() });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'isUserRegistered', 'Could not get user registration status ' + username, err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not get user registration status' });
                });
        } catch (err) {
            logHelper.logError(logger, 'isUserRegistered', 'Could not get user registration status ' + username, err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not get user registration status' });
        }
    })

}

function isUserEnrolled(params) {
    return new Promise(function(resolve, reject) {
        try {
            logHelper.logMethodEntry(logger, 'isUserEnrolled');
            var username = params.username;
            var chain = bcNetwork.getChain();
            var chainAsync = Promise.promisifyAll(chain);

            chainAsync.getMemberAsync(username)
                .then(function(member) {
                    return resolve({ statusCode: constants.SUCCESS, body: member.isEnrolled() });
                })
                .catch(function(err) {
                    logHelper.logError(logger, 'isUserEnrolled', 'Could not get user enrollment status ' + username, err);
                    return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not get user enrollment status' });
                });
        } catch (err) {
            logHelper.logError(logger, 'isUserEnrolled', 'Could not get user enrollment status ' + username, err);
            return reject({ statusCode: constants.INTERNAL_SERVER_ERROR, body: 'Could not get user enrollment status' });
        }
    })

}

module.exports = {
    read: read,
    UserRegisteration: UserRegisteration,
    FetchPolicy: FetchPolicy,
    FetchPolicylist: FetchPolicylist,
    fetchUserlist: fetchUserlist,
    fetchConsignmentlist: fetchConsignmentlist,
    consignmentdetail: consignmentdetail,
    recursiveRegister: recursiveRegister,
    recursiveLogin: recursiveLogin,
    isUserEnrolled: isUserEnrolled,
    isUserRegistered: isUserRegistered
};