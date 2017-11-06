'use strict';

const users = "risabh.s";
var bcSdk = require('../invoke');

exports.revokeAccess = (rapidID, rapid_doc_ID, orgID) =>

    new Promise((resolve, reject) => {


        const revokeAccess = ({

            rapidID: rapidID,
            rapid_doc_ID: rapid_doc_ID,
            orgID: orgID

        })

        bcSdk.revokeAccess({
            user: users,
            revokeAccess: revokeAccess
        })

        .then(() => resolve({
            status: 201,
            message: 'User Sucessfully revoked access for the doccument !'
        }))

        .catch(err => {

            if (err.code == 11000) {

                reject({
                    status: 409,
                    message: 'some error !'
                });

            } else {

                reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        });
    });