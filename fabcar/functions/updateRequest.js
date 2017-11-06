'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../invoke');
var user = 'dhananjay.p';
var affiliation = 'supplychain';

//exports is used here so that updateRequest can be exposed for router and blockchainSdk file.
exports.updateRequest = (requestid, status, transactionString) =>
    new Promise((resolve, reject) => {
        
        console.log("entering into updateRequest function.......!")
        
        const updateRequest = ({
            requestid: requestid,
            status: status,
            transactionString: transactionString,
        })
        
        bcSdk.updateRequest({ user: user, RequestDetails: updateRequest })

        .then(() => resolve({ "status": 200, "message": "request updated Successfully" }))

        .catch(err => {

            if (err.code == 401) {

                reject({ "status": 401, "message": 'Request Already updated!' });

            } else {
                console.log("error occurred" + err);

                reject({ "status": 500, "message": 'Internal Server Error !' });
            }
        });
    });