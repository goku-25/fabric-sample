'use strict';

const user = require('../models/user');

exports.loginUser = (email, pin) =>

    new Promise((resolve, reject) => {



        user.find({
                "email": email
            })
            .then(users => {

                const dbpin = users[0].pin;
                console.log(users[0].pin)
                console.log(dbpin + "   " + users[0].pin)

                if (String(pin) === String(dbpin)) {

                    resolve({
                        status: 200,
                        message: email,
                        users: users[0]
                    });

                } else {

                    reject({
                        status: 402,
                        message: ' email or password wrong!'
                    });
                }
            })




            .then(users => {
                console.log(users)
                if (users.length == 0) {

                    reject({
                        status: 404,
                        message: 'User Not Found !'
                    });

                } else {

                    return users[0];

                }
            })


            .catch(err => reject({
                status: 401,
                message: 'user does not exist !'
            }));


    });