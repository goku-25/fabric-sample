'use strict';

const reqdocs = require('../models/request');
//var bcSdk = require('../src/blockchain/blockchain_sdk');
const users = 'risabh.s';


exports.reqstDocs = (email,rapidID,orgname,docs,status) =>{

return    new Promise((resolve, reject) => {

        const request = new reqdocs({
            orgname:orgname,
            rapidID:rapidID,
            email:email,
            docs:docs,
            status:status,
            created_at: new Date(),
        });

        request.save()

            .then(() => resolve({
                status: 201,
                message: ' request sent Sucessfully !'
            }))
/*
            .then(() => bcSdk.createUser({
                user: users,
                UserDetails: newUser
            }))
*/
            .catch(err => {

                if (err.code == 11000) {

                    reject({
                        status: 409,
                        message: 'request Already sent !'
                    });

                } else {

                    reject({
                        status: 500,
                        message: 'Internal Server Error !'
                    });
                }
            });
    })};