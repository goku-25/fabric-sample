'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../invoke');
var user = 'dhananjay.p';
var affiliation = 'vfm';

//exports is used here so that updateRequest can be exposed for router and invoke.js.
exports.updateProgram = (programid, status, transactionString) =>
    new Promise((resolve, reject) => {
        
        console.log("entering into updateRequest function.......!")
        
        const updateRequest = ({
            programid: programid,
            status: status,
            transactionString: transactionString,
        })
        
        bcSdk.updateRequest({ user: user, createProgram: updateRequest })

        .then(() => resolve({ "status": 200, "message": "Program updated Successfully" }))

        .catch(err => {

            if (err.code == 401) {

                reject({ "status": 401, "message": 'Request Already updated!' });

            } else {
                console.log("error occurred" + err);

                reject({ "status": 500, "message": 'Internal Server Error !' });
            }
        });
    });