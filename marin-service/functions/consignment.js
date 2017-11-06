'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../invoke');
var user = 'dhananjay.p';
var affiliation = 'marine';


exports.consignmentDetail = (id, consignmentWeight, consignmentValue, policyName, sumInsured, premiumAmount, modeofTransport, packingMode, consignmentType, contractType, policyType, email, policyHolderName, userType, invoiceNo, policyNumber) =>
    new Promise((resolve, reject) => {
        const policy = ({

            id: id,
            consignmentWeight: consignmentWeight,
            consignmentValue: consignmentValue,
            policyName: policyName,
            sumInsured: sumInsured,
            premiumAmount: premiumAmount,
            modeofTransport: modeofTransport,
            packingMode: packingMode,
            consignmentType: consignmentType,
            contractType: contractType,
            policyType: policyType,
            email: email,
            policyHolderName: policyHolderName,
            userType: userType,
            invoiceNo: invoiceNo,
            policyNumber: policyNumber
        });

        bcSdk.consignmentdetail({ user: user, ConsignmentDetails: policy })

        .then(() => resolve({ "status": true, "message": "policy fetched" }))

        .catch(err => {

            if (err.code == 409) {

                reject({ "status": false, message: 'already fetched' });

            } else {
                console.log("error occurred" + err);

                reject({ "status": false, message: 'Internal Server Error !' });
            }
        });
    });