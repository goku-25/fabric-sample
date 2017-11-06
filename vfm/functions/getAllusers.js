'use strict';

const user = require('../models/user');

exports.getAllusers = () =>

   new Promise((resolve, reject) => {

    user.find({
        'userType': { $in: [
           'manufacturer','supplier','bank'
        ]
        }
    })
            .then(users => {
                 
                 console.log(users)
                   resolve({
                        status: 200,
                        message: users
                    })
                })

           .catch(err => reject({
                status: 500,
                message: 'register please!'
            }))


        });
