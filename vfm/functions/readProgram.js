'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../query');
var user = 'dhananjay.p';
var affiliation = 'supplychain';
var programid=programid;

exports.readProgram = (programid) => {
    return new Promise((resolve, reject) => {
        console.log("entering into readRequest function.......!")
        
        bcSdk.readRequest({
            programid: programid 
        })

        .then((requestarray) => {
            console.log("data in requestArray " + requestarray)

            return resolve({
                status: 200,
                query: requestarray
            })
        })

        .catch(err => {

            if (err.code == 401) {

                return reject({
                    status: 401,
                    message: 'cant fetch !'
                });

            } else {
                console.log("error occurred" + err);

                return reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        })
    })
};