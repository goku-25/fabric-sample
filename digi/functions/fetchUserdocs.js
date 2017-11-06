'use strict';
var user = "risabh.s";
const doc = require('../models/doc');
const bcSdk = require('../query');
var ownsLedgerData = [];
var docArray = [];



exports.fetchUsersdocs = (rapidID) => {
    return new Promise((resolve, reject) => {

        bcSdk.getMydocs({
            user: user,
            rapidID: rapidID
        })



        .then((userdocs) => {
                console.log(JSON.stringify(userdocs))
                ownsLedgerData = userdocs.owns
                console.log(ownsLedgerData);

                //    for (let i = 0; i < ownsLedgerData.length; i++) {
                doc.find({
                    "rapid_doc_ID": ownsLedgerData
                })

                .then((docs) => {

                    resolve({
                        status: 201,
                        docArray: docs
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