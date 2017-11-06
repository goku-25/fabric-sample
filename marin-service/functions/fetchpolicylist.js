'use strict';

//const user = require('../models/user');
var user = "dhananjay.p";
var getpolicy = "get";
const bcSdk = require('../query');

exports.fetch_Policy_list = (params) => {
    return new Promise((resolve, reject) => {
        bcSdk.FetchPolicylist({
            user: user,
            getpolicy: getpolicy
        })

        .then((policyArray) => {
            console.log("data in policyArray " + policyArray)
            return resolve({
                "status": true,
                "message": "fetched",
                "policylist": policyArray
            })
        })



        .catch(err => {

            if (err.code == 11000) {

                return reject({
                    "status": false,
                    "message": 'cant fetch !'
                });

            } else {
                console.log("error occurred" + err);

                return reject({
                    "status": false,
                    "message": 'Internal Server Error !'
                });
            }
        })
    })
};