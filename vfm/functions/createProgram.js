
    'use strict';
    var express = require('express');
    var router = express.Router();
    var cors = require('cors');
    var bodyParser = require('body-parser');
    var bcSdk = require('../invoke');
    var user = 'dhananjay.p';
    var affiliation = 'vfm';
   
   //exports is used here so that createProgram can be exposed for router and invoke.js.
   exports.createProgram = (programid , status,InvolvedParties,transactionString) =>{
       return new Promise((resolve, reject) => {
           console.log("entering into createProgram function.....!")
           const newRequest = ({
               programid: programid,
               status: status,
               InvolvedParties: InvolvedParties,
               transactionString: transactionString
           });
           
           bcSdk.newRequest({ user: user, createProgram: newRequest })
   
           .then(() => resolve({ "status": 200, "message": "Program Initiated Successfully" }))
   
           .catch(err => {
   
               if (err.code == 401) {
   
                   reject({ "status": 401, "message": 'Request Already sent!' });
   
               } else {
                   console.log("error occurred" + err);
   
                   reject({ "status": 500, "message": 'Internal Server Error !' });
               }
           });
       });
   }