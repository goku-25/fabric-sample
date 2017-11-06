'use strict';

const users = "risabh.s";
var bcSdk = require('../invoke');

exports.shareDocument = (rapidID, rapid_doc_ID, orgID) =>

    new Promise((resolve, reject) => {


        const shareDoc = ({

            rapidID: rapidID,
            rapid_doc_ID: rapid_doc_ID,
            orgID: orgID

        })

        bcSdk.shareDocument({
            user: users,
            sharedDocDetails: shareDoc
        })

        .then(() => resolve({
            status: 201,
            message: 'User Sucessfully shared doccument !'
        }))

        .catch(err => {

            reject({
                status: 500,
                message: 'Internal Server Error !'
            });
        });
    });