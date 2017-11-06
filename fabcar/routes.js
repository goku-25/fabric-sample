//here only routing is done
'use strict';
const newRequest = require('./functions/newRequest');
const updateRequest = require('./functions/updateRequest');
const readRequest = require('./functions/readRequest');
const readIndex = require('./functions/readIndex');
const cors = require('cors');
const nodemailer = require('nodemailer');
var request = require('request');
var mongoose = require('mongoose');
var image = require('./models/documents');
var dateTime = require('node-datetime');
var path = require('path');
var cloudinary = require('cloudinary').v2;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var crypto = require('crypto');
var cfenv = require('cfenv');
var express = require('express');

module.exports = router => {
    // file upload API
    cloudinary.config({
        cloud_name: 'rapidqubedigi',
        api_key:    '247664843254646',
        api_secret: 'NNP88tw2YEBofSww9bPK7AV9Jc0'

    });

    router.get('/location', cors(), (req, res1) => {
        console.log("entering into location tracker service ");

        var options = {
            url: 'https://academic.cloud.thingworx.com/Thingworx/Things/GpsTracker_kheteshrotangan/Properties?appKey=d50144fb-8674-44ea-83d4-aca709204753',
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Accept': 'application/json'
            },
          
        };
            request(options, function(err, result, body) {
                if (result && (result.statusCode === 200 || result.statusCode === 201 || result.statusCode === 401 || result.statusCode === 402 || result.statusCode === 404)) {
                   var mydata = JSON.parse(result.body)
                   
                   res1.status(result.statusCode).json({
                        
                       data : mydata.rows,
   
                    })
                }

            });
    });

    router.get('/routes', cors(), (req, res1) => {
        console.log("entering into IOT location tracker service ");
        
        var options = {
            url: 'https://maps.googleapis.com/maps/api/directions/json?origin=chennai&destination=nagpur&key=AIzaSyD7JZg6Xscem3tCd-oXMu1iGMO0wu6IzmA',
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                'Accept': 'application/json'
            },
          
        };
            request(options, function(err, result, body) {
                if (result && (result.statusCode === 200 || result.statusCode === 201 || result.statusCode === 401 || result.statusCode === 402 || result.statusCode === 404)) {
                   var mydata = JSON.parse(result.body)
                   
                   res1.status(result.statusCode).json({
                        
                       data : mydata,
   
                    })
                }

            });
        
    });

    // registerUser - routes user input to Regestration API.
    router.post('/registerUser', cors(), (req, res1) => {
        console.log("entering register function ");

        const email_id = req.body.email;

        console.log(email_id);
        const password_id = req.body.password;
        console.log(password_id);
        const userObjects = req.body.userObject;
        console.log(userObjects);
        const usertype_id = req.body.usertype;
        console.log(usertype_id);
        var json = {
            "email": email_id,
            "password": password_id,
            "userObject": userObjects,
            "usertype": usertype_id
        };

        var options = {
            url: 'https://apidigi.herokuapp.com/registerUser',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: json
        };


        if (!email_id || !password_id || !usertype_id) {

            res1.status(400).json({
                message: 'Invalid Request !'
            });

        } else {

            request(options, function(err, res, body) {
                if (res && (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 409)) {

                    res1.status(res.statusCode).json({
                        message: body.message
                    })
                }

            });
        }
    });

    // login -  routes user input to login API.
    router.post('/login', cors(), (req, res1) => {
        console.log("entering login function ");

        const emailid = req.body.email;
        console.log(emailid);
        const passwordid = req.body.password;
        console.log(passwordid);

        var json = {
            "email": emailid,
            "password": passwordid,

        };

        var options = {
            url: 'https://apidigi.herokuapp.com/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: json
        };


        if (!emailid || !passwordid) {

            res1.status(400).json({
                message: 'Invalid Request !'
            });

        } else {

            request(options, function(err, res, body) {
                if (res && (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 401 || res.statusCode === 402 || res.statusCode === 404)) {

                    res1.status(res.statusCode).json({
                        message: body.message,
                        token: body.token,
                        usertype: body.usertype,
                        userdetails: body.userDetails


                    })
                }

            });
        }
    });

    //newRequest -  routes user input to function newRequest. 
    router.post("/newRequest", (req, res) => {
        console.log("Routing User Input to newRequest Function.....!")
        var random_no = "";
        var possible = "0254548745486765468426879hgjguassaiooisjgdiooahvhghudrkhvdgi12041453205253200044525846abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 4; i++)
            random_no += possible.charAt(Math.floor(Math.random() * possible.length));

        var requestid = crypto.createHash('sha256').update(random_no).digest('base64');
        console.log("requestid"+requestid);
        var status = req.body.status;
        console.log("status"+status);
        var InvolvedParties = req.body.InvolvedParties;
        console.log("InvolvedParties"+InvolvedParties);
        var transactionString = JSON.stringify(req.body.transactionString);
        console.log("transactionString"+transactionString);
        if (!transactionString || !transactionString) {
            res.status(400).json({
                message: 'Invalid Request'
            });
        } else {

            newRequest.newRequest(requestid, status, InvolvedParties, transactionString)

                .then(result => {
                    res.status(result.status).json({
                        message: result.message
                        
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }
    });

    // updateRequest -  routes user input to function updateRequest.
    router.post("/updateRequest", (req, res) => {
        console.log("Routing User Input to updateRequest Function.....!")
        
        var requestid = req.body.requestid;
        var status = req.body.status;
        var transactionString = req.body.transactionString;

        if (!transactionString || !transactionString) {
            res.status(400).json({
                message: 'Invalid Request'
            })
        } else {
            updateRequest.updateRequest(requestid, status, transactionString)

                .then(result => {
                    res.status(result.status).json({
                        message: result.message,
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        }
    });

    // readRequest - query fetches user input given by user for newRequest.
    router.get("/readRequest", (req, res) => {
        var requestList = [];
      
        if (1 == 1) {
            
            const requestid1 = checkToken(req);
            const requestid = requestid1;
            

            readRequest.readRequest(requestid)
                .then(function(result) {
                   
                     return res.json({
                        "status":200,
                        "message": result.query
                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        } else {
            res.status(401).json({
                "status": false,
                message: 'cant fetch data !'
            });
        }
    });

    // readIndex - query fetches user input given by user for newRequest.
    router.get("/readIndex",cors(), (req, res) => {
        var requestList = [];
        if (1 == 1) {

        readIndex.readIndex({
            "user": "dhananjay.p",
            "getusers": "getusers"
        })
        .then(function(result) {
               
              return res.json({
                 "status": 200,
                 "message":  result.query
             });
         })
 
         .catch(err => res.status(err.status).json({
             message: err.message
         }));
        }else {
            res.status(401).json({
                "status": false,
                message: 'cant fetch data !'
            });
        }
    });

    // readStatus - query fetches all status with count.
    router.get("/readStatus",cors(), (req, res) => {
        var statusList = [];
        if (1 == 1) {

        readIndex.readIndex({
            "user": "dhananjay.p",
            "getusers": "getusers"
        })
        .then(function(result) {
            console.log(result.query.length)
            
            for (let i = 0; i < result.query.length; i++) {
        
            if (result.query[i].status == "claimRaised" || result.query[i].status == "claimRequested" || result.query[i].status == "NotDelivered" || result.query[i].status == "DoDelivered"|| result.query[i].status == "DOraised"|| result.query[i].status == "MaterialRequested"|| result.query[i].status == "PaymentInitiated"|| result.query[i].status == "QuotationRejected"|| result.query[i].status == "POraised"|| result.query[i].status == "PaymentReceived"|| result.query[i].status == "InvoiceRaised"|| result.query[i].status == "InvoiceApproved"||result.query[i].status =="QuotationRaised") {
                if (result.query[i].status == "claimRaised") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "claimRequested") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "NotDelivered") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "DoDelivered") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "DOraised") {
                    statusList.push(result.query[i].status);
                } else if (result.query[i].status == "MaterialRequested") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "PaymentInitiated") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)                    
                } else if (result.query[i].status == "QuotationRejected") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "POraised") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)    
                } else if (result.query[i].status == "PaymentReceived") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                } else if (result.query[i].status == "InvoiceRaised") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                }else if (result.query[i].status == "InvoiceApproved") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)
                }else if (result.query[i].status == "QuotationRaised") {
                    statusList.push(result.query[i].status);
                    console.log(statusList)                    
                }
                }
                var countstatus = count(statusList);
                console.log("countstatus" + JSON.stringify(countstatus[0].statuscount));
            }
              return res.json({
                 "status": 200,
                 statuscount: countstatus,
                //  open:open,
             });
         })
         .catch(err => res.status(err.status).json({
             message: err.message
         }));
        }else {
            res.status(401).json({
                "status": false,
                message: 'cant fetch data !'
            });
        }
    });

    // readCycle - query fetches open request status count as well closed request count. 
    router.get("/readCycle",cors(), (req, res) => {
        var OpenList = [];
        var ClosedList=[];
        if (1 == 1) {

        readIndex.readIndex({
            "user": "dhananjay.p",
            "getusers": "getusers"
        })
        .then(function(result) {
            
            for (let i = 0; i < result.query.length; i++) {
        
            if (result.query[i].status == "claimRaised" || result.query[i].status == "claimRequested" ||
             result.query[i].status == "NotDelivered" || result.query[i].status == "DoDelivered"||
             result.query[i].status == "DOraised"|| result.query[i].status == "MaterialRequested"|| 
             result.query[i].status == "PaymentInitiated"|| result.query[i].status == "QuotationRejected"|| 
             result.query[i].status == "POraised"|| result.query[i].status == "PaymentReceived"|| 
             result.query[i].status == "InvoiceRaised"|| result.query[i].status == "InvoiceApproved"||
             result.query[i].status =="QuotationRaised"||result.query[i].status =="QuotationRejected"||
             result.query[i].status =="PaymentReceived") {
                if (result.query[i].status == "claimRaised" ){
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "claimRequested") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "NotDelivered") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "DoDelivered") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "DOraised") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "MaterialRequested") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "PaymentInitiated") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "POraised") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "InvoiceRaised") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "InvoiceApproved") {
                    OpenList.push(result.query[i].status);
                } else if (result.query[i].status == "QuotationRaised") {
                    OpenList.push(result.query[i].status);
                } else if(result.query[i].status == "QuotationRejected") {
                    ClosedList.push(result.query[i].status);
                } else if (result.query[i].status == "PaymentReceived") {
                    ClosedList.push(result.query[i].status);
                } 
                }
               
                var countstatus = count(OpenList);
                var countstatus1=count(ClosedList);
                var Ostatus =[];
                var CStatus =[];
                for(let i=0;i<countstatus.length;i++){
                (Ostatus.push(countstatus[i].statuscount))
                }
                for(let a=0;a<countstatus1.length;a++){
                console.log("line 399",countstatus1.length);
                console.log( countstatus1[a]);
                console.log( countstatus1[a].statuscount);
                     (CStatus.push(countstatus1[a].statuscount))
                     console.log(CStatus);
                }
                var sum = Ostatus.reduce((a, b) => a + b, 0);
                console.log("Ostatus",sum);
                var sum1 = CStatus.reduce((a, b) => a + b, 0);
                console.log("CStatus",sum1);
            }
        
              return res.json({
                 "status": 200,
                 openStatus: sum,
                 closedStatus:sum1
             });
         })
         .catch(err => res.status(err.status).json({
             message: err.message
         }));
        }else {
            res.status(401).json({
                "status": false,
                message: 'cant fetch data !'
            });
        }
    });
    
 // uploadDocs - uploads files to cloudinary server.
    
    router.post('/UploadDocs', multipartMiddleware, function(req, res, next) {
      var url;
            console.log("req.files.image" + JSON.stringify(req.files));
            var imageFile = req.files.file.path;
    
    
           cloudinary.uploader.upload(imageFile,{
                    tags: 'express_sample'
                })
    
               .then(function(image) {
                    console.log('** file uploaded to Cloudinary service');
                    console.dir(image);
                   url = image.url;
               
    
                   return res.send({
                        url :url,
                       message: "files uploaded succesfully"
                        })
                    });
    
               
                })

    //------------------------------------ Functions ------------------------------------------ 
        
        function filterstatus(status) {
        
        if (1 == 1) {
                    
                    
            readIndex.readIndex({
                "user": "dhananjay.p",
                "getusers": "getusers"
            })
                    
            .then(function(result) {
                    
                    
            console.log("result" + result.query)
            var statusfilter = [];
                    
                    
            for (let i = 0; i < result.query.status.length; i++) {
            console.log("status" + status);
            console.log("statusledger" + result.query[i].status);
            if (result.query[i].status=== status) {
                    
            statusfilter.push(result.query[i].status);
            console.log("statusfilter" + statusfilter);
          }
                        }
            return statusfilter;
           })
                    
           .catch(err => res.status(err.status).json({
            message: err.message
           }));
                    
           } else {
               return res.status(401).json({
               message: 'cant fetch data !'
           });
                    
          }
    }
    
    function count(arr) {
        var statusname = [],
            statuscount = [],
            prev;
    
        arr.sort();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== prev) {
                statusname.push(arr[i]);
                statuscount.push(1);
            } else {
                statuscount[statuscount.length - 1]++;
            }
            prev = arr[i];
        }
        console.log("statusname" + statusname);
        var result = [];
        for (var status in statusname) {
    
    
            result.push({
                statusname: statusname[status],
                statuscount: statuscount[status]
            });
        }
    
        return result;
    }

    function checkToken(req) {

        const token = req.headers['authorization'];

        if (token) {

            try {
                 (token.length!=0)
                 return token
            } catch (err) {
                return false;
            }
        } else {
            return false;
        }
    }

    
// --------------------------Weather API---------------------------------------
 
//Security - helmet
var helmet = require('helmet');

//setup middleware
var app = express();
var ninetyDaysInMilliseconds = 7776000000;

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
var weather_host = appEnv.services["weatherinsights"] 
        ? appEnv.services["weatherinsights"][0].credentials.url // Weather credentials passed in
        : "https://5812af4a-b400-446f-a639-c665700dcbed:hQ6sKnTyIr@twcservice.mybluemix.net"; // or copy your credentials url here for standalone

function weatherAPI(path, qs, done) {
    var url = weather_host + path;
    console.log(url, qs);
    request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json"
        },
        qs: qs
    }, function(err, req, data) {
        if (err) {
            done(err);
        } else {
            if (req.statusCode >= 200 && req.statusCode < 400) {
                try {
                    done(null, JSON.parse(data));
                } catch(e) {
                    console.log(e);
                    done(e);
                }
            } else {
                console.log(err);
                done({ message: req.statusCode, data: data });
            }
        }
    });
}

//   api/forecast/daily - query fetches 7 days forecast from IBM weather data service.  
router.get('/api/forecast/daily', function(req, res) {
    var weatherData=[];
    var geocode = (req.query.geocode || "19.075984,72.877656").split(",");
    weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/daily/7day.json", {
        units: req.query.units || "e",
        language: req.query.language || "en-US"
    }, function(err, result) {
        if (err) {
        	console.log(err);
            res.send(err).status(400);
        } else {
            console.log("10 days Forecast");
            for(let i =0;i<result.forecasts.length;i++){
                weatherData.push({
                "max_temp":result.forecasts[i].max_temp,
                "min_temp":result.forecasts[i].min_temp,
                "narrative":result.forecasts[i].narrative,
                "Day":result.forecasts[i].dow
                })
        }
            res.json({
                "weatherData":weatherData
            });
        }
    });
});

// api/forecast/daily/3days - query fetches 3 days forecast from IBM weather data service.  
router.get('/api/forecast/daily/3days', function(req, res) {
    var weatherData=[];    
    var geocode = (req.query.geocode || "19.075984,72.877656").split(",");
    weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/daily/3day.json", {
        units: req.query.units || "e",
        language: req.query.language || "en-US"
    }, function(err, result) {
        if (err) {
        	console.log(err);
            res.send(err).status(400);
        } else {
            console.log("3 days Forecast");
            for(let i =0;i<result.forecasts.length;i++){
                weatherData.push({
                "max_temp":result.forecasts[i].max_temp,
                "min_temp":result.forecasts[i].min_temp,
                "narrative":result.forecasts[i].narrative,
                "Day":result.forecasts[i].dow
                })
        }
            res.json({"weatherData":weatherData});
        }
    });
});

// api/forecast/hourly - query fetches hourly forecast from IBM weather data service.
router.get('/api/forecast/hourly', function(req, res) {
    var geocode = (req.query.geocode || "19.075984,72.877656").split(",");
    weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/hourly/48hour.json", {
        units: req.query.units || "m",
        language: req.query.language || "en"
    }, function(err, result) {
        if (err) {
            res.send(err).status(400);
        } else {
        	console.log("24 hours Forecast");
            result.forecasts.length = 24;    // we require only 24 hours for UI
            res.json(result);
        }
    });
});


   //---------------------Mock Services For UI testing--------------------------
    
    // Login service for UI testing with predefined users.
    router.post("/mock/Login", (req, res) => {
        var email = req.body.email;
        var password = req.body.password;
        console.log(JSON.stringify(req.body))
        console.log(email);
        if (email === "man@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "Manufacturer"
            })
        } else if (email == "sup@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "Supplier"
            })
        } else if (email == "dis@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "Distributor"
            })
        } else if (email == "ret@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "retailer"
            })
        } else if (email == "log@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "logistics"
            })
        } else if (email == "bank@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "banker"
            })
        } else if (email == "ins@supply.com") {
            res.send({
                "message": "Login Successful",
                "status": true,
                "userType": "insurance"
            })
        }
    })

    // logout service for UI testing
    router.get("/mock/Logout", (req, res) => {

        res.send({
            "message": "Logout succesfully",
            "status": true

        })

    })

    // request service for NewRequest UI FORM 
    router.post("/mock/Request", (req, res) => {

        console.log(req.body);

        res.send({
            "message": "Request sent Successfully",
            "status": true,
            "details": req.body
        })


    })

    // updateRequest service for Update Request UI FORM
    router.post("/mock/Updaterequest", (req, res) => {
        console.log(req.body);
        res.send({
                "message": "updated your request",
                "status": true,
                "details": req.body
            }

        )
    })

    // update Transaction for transaction Update
    router.post("/mock/UpdateTransaction", (req, res) => {
        console.log(req.body);
        res.send({
                "message": "updated your request",
                "status": true,
                "details": req.body
            }

        )

    })

    // ReadTransaction returns dummy data data for the request.
    router.get("/mock/ReadTransaction", (req, res) => {



        res.send({

            "transactionlist": [{
                    "requesdid": "112",
                    "date": "01-may-2017",
                    "status": "PO raised"
                },
                {
                    "requesdid": "212",
                    "date": "04-may-2017",
                    "status": "Goods shipped"
                },
                {
                    "requesdid": "335",
                    "date": "07-may-2017",
                    "status": "Payment Initiated"
                }


            ]

        })

    })

    // readRequest service gives dummy data for the request
    router.get("/mock/Readrequest", (req, res) => {

        res.send({
            "requestno": "123809",
            "involved parties": ["mrf", "hundei", "fedex"],
            "transactionList": [{
                    "date": "2-may-2017-01:01:0000",
                    "updatedBy": "hundei",
                    "status": "Material request raised",
                    "intended-to": "mrf tyres",
                    "Quantity": "4000",
                    "deliverable required": "dec-2017"

                },
                {
                    "date": "3-may-2017-01:01:0000",
                    "updatedBy": "mrf",
                    "status": "Quotation raised",
                    "intended-to": "Hyundei",
                    "Quantity": "4000",
                    "cost": "500 per lot",
                    "last delivery": "dec-2017",
                    "delivery mode": "monthly",
                    "Attachment": "https://fileserver.org/?filename=xyz.pdf&fileid=3456"
                },
                {
                    "date": "4-may-2017-01:01:0000",
                    "updatedBy": "hyundei",
                    "status": "Purchase order raised",
                    "intended-to": "mrf tyres",
                    "Quantity": "4000",
                    "cost": "500 per lot",
                    "last delivery": "dec-2017",
                    "delivery mode": "monthly",
                    "Attachment": "https://fileserver.org/?filename=xyz.pdf&fileid=3456"
                }

            ]

        })


    })
}