'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../invoke');
var user = 'dhananjay.p';
var affiliation = 'marine';


exports.fetchPolicyQuotes = (id, consignmentWeight, consignmentValue, invoiceNo, modeofTransport, packingMode, contractType, policyType, consignmentType) =>
    new Promise((resolve, reject) => {
        const policy = ({
            id: id,
            consignmentWeight: consignmentWeight,
            consignmentValue: consignmentValue,
            invoiceNo: invoiceNo,
            modeofTransport: modeofTransport,
            packingMode: packingMode,
            contractType: contractType,
            policyType: policyType,
            consignmentType: consignmentType
            
        });

        bcSdk.FetchPolicy({ user: user, PolicyDetails: policy })

        .then(() => resolve({ "status": true, "message": "policy fetched" }))

        .catch(err => {

            if (err.code == 409) {

                reject({ "status": false, "message": 'already fetched' });

            } else {
                console.log("error occurred" + err);

                reject({ "status": false, "message": 'Internal Server Error !' });
            }
        });
    });