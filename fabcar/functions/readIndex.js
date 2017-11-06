'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcSdk = require('../query');
var user = 'dhananjay.p';
var affiliation = 'supplychain';
var index = "index";

exports.readIndex = (params) => {
    return new Promise((resolve, reject) => {
        console.log("entering into readIndex function.....!")
        
        bcSdk.readIndex({
            user: user,
            index: index
        })

        .then((readIndexArray) => {
            console.log("data in IndexArray " + readIndexArray)
            return resolve({
                status: 201,                
                query: readIndexArray
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