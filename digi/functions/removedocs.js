'use strict';

var bcSdk = require('../invoke');
const user = 'risabh.s';
const doc = require('../models/doc');

exports.removedocs = (rapidID, rapid_doc_ID) =>

    new Promise((resolve, reject) => {

        const deleteDocs = ({
            rapidID: rapidID,
            rapid_doc_ID: rapid_doc_ID

        });

        bcSdk.removedocs({
            user: user,
            deleteDocs: deleteDocs
        })
        doc.deleteMany({ "rapid_doc_ID": rapid_doc_ID })

        .then(() => resolve({
            status: 201,
            message: 'doc deleted Sucessfully !'
        }))


        .catch(err => {

            reject({
                status: 500,
                message: 'Internal Server Error !'
            });
        })
    });