'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../invoke');
var user = 'dhananjay.p';
var affiliation = 'marine';

//exports is used here so that registerUser can be exposed for router and blockchainSdk file as well Mysql.
exports.registerUser = (uid, fname, lname, phone, email, usertype, password) =>
    new Promise((resolve, reject) => {
        const newUser = ({
            uid: uid,
            fname: fname,
            lname: lname,
            phone: phone,
            email: email,
            usertype: usertype,
            password: password
        });

        bcSdk.UserRegisteration({ user: user, UserDetails: newUser })

        .then(() => resolve({ "status": true, "message": "Registration Successfull" }))

        .catch(err => {

            if (err.code == 409) {

                reject({ "status": false, "message": 'User Already Registered !' });

            } else {
                console.log("error occurred" + err);

                reject({ "status": false, "message": 'Internal Server Error !' });
            }
        });
    });