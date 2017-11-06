'use strict';
var userss = "risabh.s";
const doc = require('../models/doc');
const user = require('../models/user');
const bcSdk = require('../query');
var ownsLedgerData = [];
var docArray = [];



exports.auditUser = (rapidID) => {
    return new Promise((resolve, reject) => {

        bcSdk.getMydocs({
            user: userss,
            rapidID: rapidID
        })



        .then((userdocs) => {

            var AuditLedgerData = userdocs.audittrail
            console.log(AuditLedgerData)
            var orgkeys = Object.keys(AuditLedgerData)
            console.log(orgkeys);

            user.find({
                "rapidID": orgkeys
            })

            .then((users) => {
                var orgnames = [];
                var timestamps = [];
                var rapiddocIDs = [];
                var doctype = [];
                for (let u = 0; u < orgkeys.length; u++) {

                    var orgname = users[u]._doc.orgname
                        //     orgnames.push(orgname)
                        //   console.log(orgnames)
                    var orgkey = orgkeys[u]
                    console.log(AuditLedgerData[orgkey])

                    for (var i = 0; i < AuditLedgerData[orgkey].length; i++) {
                        if (i % 2 == 0) {
                            timestamps.push(AuditLedgerData[orgkey][i])
                            orgnames.push(orgname)
                        } else {
                            rapiddocIDs.push(AuditLedgerData[orgkey][i])
                        }
                    }
                }
                console.log("timestamps            " + timestamps);
                console.log("rapiddocIDs           " + rapiddocIDs);
                const docids = rapiddocIDs
                console.log(docids)
                console.log(docids.length)
                doc.find({ "rapid_doc_ID": docids })

                .then((docs) => {
                    for (var i = 0; i < docs.length; i++) {
                        if (1 === 1) {
                            doctype.push(docs[i]._doc.docType)
                        }
                    }
                    console.log(doctype)

                    return resolve({
                        status: 201,
                        orgname: orgnames,
                        documentid: doctype,
                        timestamp: timestamps


                    })

                })
            })
        })




        .catch(err => {

            console.log("error occurred" + err);

            return reject({
                status: 500,
                message: ' invalid usertype tried to get into service !'
            });
        })

    })
};