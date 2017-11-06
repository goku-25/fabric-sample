'use strict';
var user = "risabh.s";
const request = require('../models/request');
//const bcSdk = require('../src/blockchain/blockchain_sdk');



exports.fetchrequest = (email) => {
    return new Promise((resolve, reject) => {

       

                request.find({
                        "email": email
                    })

                    .then((request) => {

                        resolve({
                            status: 201,
                            notifications: request
                        })
                    })
            })
            .catch(err => {

                console.log("error occurred" + err);

                return reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            })

};