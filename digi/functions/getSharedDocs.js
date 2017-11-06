'use strict';
var user = "risabh.s";
const doc = require('../models/doc');
const bcSdk = require('../query');
var ownsLedgerData = [];
var sharedDocs = [];


exports.getSharedDocs = (rapidID) => {
    return new Promise((resolve, reject) => {

        bcSdk.getSharedDocs({
            user: user,
            rapidID: rapidID
        })



        .then((userdocs) => {
            var docs2 = [];

            var shareLedgerData = userdocs.sharedwithme
            console.log(shareLedgerData);
            var userkeys = Object.keys(shareLedgerData)
            console.log(userkeys);
            console.log(userkeys.length);


            doc.find({
                "rapidID": userkeys
            })

            .then((docs) => {
                for (let u = 0; u < userkeys.length; u++) {

                    for (let i = 0; i < shareLedgerData[userkeys].length; i++) {


                        var userkey = userkeys

                        console.log("array of doc no got from ledger" + shareLedgerData[userkey][i])

                        for (let j = 0; j < docs.length; j++) {


                            if (docs[j]._doc.rapid_doc_ID === shareLedgerData[userkey][i]) {

                                docs2.push(docs[j])

                            }
                        }
                    }
                }
            })

            .then(() => {
                resolve({
                    status: 201,
                    sharedDocs: docs2
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
    })
};