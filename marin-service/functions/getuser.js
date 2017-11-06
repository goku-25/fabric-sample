'use strict';

//const user = require('../models/user');
var user = "dhananjay.p";
var getusers = "getusers";
const bcSdk = require('../query');

exports.fetch_userlist = (params) => {
    return new Promise((resolve, reject) => {
        bcSdk.fetchUserlist({
            user: user,
            getusers: getusers
        })

        .then((userArray) => {
            console.log("data in userArray " + userArray)
            return resolve({
                "status": true,
                "message": "fetched",
                "usersdata": userArray.body
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
                    message: 'Internal Server Error !'
                });
            }
        })
    })
};