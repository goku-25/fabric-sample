'use strict';

const doc = require('../models/doc');
const users = "risabh.s";
var bcSdk = require('../invoke');

exports.addDoc = (docType, docNo, rapid_doc_ID, rapidID, docinfo) =>

    new Promise((resolve, reject) => {


        const newDoc = new doc({
            docType: docType,
            docNo: docNo,
            rapidID: rapidID,
            rapid_doc_ID: rapid_doc_ID,
            docinfo: docinfo
        })

        newDoc.save()



        .then(() => resolve({
            status: 201,
            message: 'User Sucessfully added doccument !'
        }))

        .then(() => bcSdk.addDocument({
            user: users,
            docDetails: newDoc
        }))

        .catch(err => {

            if (err.code == 11000) {

                reject({
                    status: 409,
                    message: 'document already exists!'
                });

            } else {

                reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        });
    });