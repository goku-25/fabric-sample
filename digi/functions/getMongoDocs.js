'use strict';
var user = "risabh.s";
const doc = require('../models/doc');
//const bcSdk = require('../src/blockchain/blockchain_sdk');



exports.getMongoDocs = (rapidID) => {
    return new Promise((resolve, reject) => {

       

                doc.find({
                        "rapidID": rapidID
                    })

                    .then((docs) => {
                        console.log(docs)

                     return resolve({
                            status: 201,
                            docs: docs
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
