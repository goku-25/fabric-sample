var mysql = require('mysql');
var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var http = require('http');
var https = require('https');

//database connection done here.
function BD() {
    var connection = mysql.createConnection({
        user: 'root',
        password: 'rpqb123',
        host: 'localhost',
        database: 'marine_db'
    });
    return connection;
}
//connection To Sms API
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: '6a64ffbc',
    apiSecret: '38c40b9428f981e1'
});
// connection to email API 
var transporter = nodemailer.createTransport("SMTP", {
    host: 'smtp.ipage.com',
    port: 587,
    secure: true,
    auth: {
        user: "dhananjay.patil@rapidqube.com",
        pass: "Rpqb@12345"
    }
});

//registerUser link stores user input in database. 
router.post("/user/registerUser", function(req, res) {
    var objBD = BD();
    objBD.connect();
    console.log(req.body.email)
    console.log(req.body.password)
    console.log(req.body.usertype)

    var user = {
        fname: req.body.fname,
        lname: req.body.lname,
        phone: req.body.phone,
        email: req.body.email,
        usertype: req.body.usertype,
        password: req.body.password,
        status: "Inactive"
    };

    objBD.query('INSERT INTO user_detail SET ?', user, function(error) {
        if (error) {
            res.send({
                "status": false,
                "message": "try again"
            })
        } else {
            //To validate email and phone number of user otp will be send via sms and mail.
            var otp = "";
            var possible = "0123456789";
            for (var i = 0; i < 4; i++)
                otp += possible.charAt(Math.floor(Math.random() * possible.length));
            var remoteHost = "192.168.0.16:3000";
            console.log(remoteHost);
            var encodedMail = new Buffer(req.body.email).toString('base64');
            var link = "http://" + remoteHost + "/marine/user/verify?mail=" + encodedMail;
            var userResults, emailtosend, phonetosend, otptosend;

            objBD.query('select * from user_detail WHERE email = ?', [req.body.email], function(error, results, fields) {
                userResults = JSON.parse(JSON.stringify(results));
                console.log("results: " + userResults[0].email);
                console.log("results:" + userResults[0].phone);
                emailtosend = userResults[0].email;
                phonetosend = userResults[0].phone;
                objBD.query('INSERT INTO verification( uid, otp,encodedMail) values ( ?, ?, ?)', [userResults[0].uid, otp, encodedMail], function(error, results, fields) {});

                //after generating otp mail will be sent to regsitered user.
                var mailOptions = {
                    transport: transporter,
                    from: '"Dhananjay"<dhananjay.patil@rapidqube.com>',
                    to: emailtosend, //req.body.to, 
                    subject: 'Please confirm your Email account',
                    text: req.body.text,
                    html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);

                    }
                    console.log("Message sent: " + info.messageId);
                });

                //otp will be sent via sms to validate phone number.
                otptosend = "OTP: " + otp;
                nexmo.message.sendSms(
                    '919768135452', phonetosend, otptosend, { type: 'unicode' },
                    (err, responseData) => { if (responseData) { console.log(responseData) } }
                );
                return res.json({
                    "status": true,
                    "message": "Registration Successfull"
                });
            });
        }
    });
});

//verify link will validate user email here.
router.get('/user/verify', function(req, res, next) {
    var querymail = req.query.mail;
    console.log("URL: " + querymail);
    var objBD = BD();
    objBD.connect();

    objBD.query('SELECT * FROM verification WHERE encodedMail = ?', [querymail], function(error, results, fields) {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            var resultLength = JSON.parse(JSON.stringify(results));
            if (resultLength.length > 0) {
                if (resultLength[0].encodedMail === querymail) {
                    console.log(querymail);
                    res.send({
                        "status": true,
                        "message": "verification Successfull"
                    });
                } else {
                    res.send({
                        "status": false,
                        "message": "already verified"
                    });
                }
            }
        }
    });
});

//phoneverification link will validate phone number
router.post('/user/phoneverification', function(req, res) {
    var objBD = BD();
    objBD.connect();

    var otp = req.body.otp;
    console.log(otp);

    objBD.query('SELECT * FROM verification where otp=?', [otp], function(error, results, fields) {
        if (error) {
            res.send({
                "status": false,
                "message": "error"
            })
        } else {
            var otplength = JSON.parse(JSON.stringify(results));
            console.log(results);
            if (otplength.length > 0) {
                if (otplength[0].otp === otp) {
                    console.log(otp);
                    console.log(otplength[0].uid);
                    objBD.query('UPDATE user_detail Set status ="Active" where uid= ? ', otplength[0].uid, function(error, results, fields) {});

                    res.send({
                        "status": true,
                        "message": "phone number verified"
                    });
                } else {
                    res.send({
                        "status": false,
                        "message": "phone number is invalid"
                    });
                }
            }
        }
    })
});

//userLogin link compares userinput with database data and gives response as token.
router.post("/user/userLogin", cors(), function(req, res) {
    var objBD = BD();
    objBD.connect();
    console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    objBD.query('SELECT * FROM user_detail WHERE email = ?', [email], function(error, results, fields) {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            var resultLength = JSON.parse(JSON.stringify(results));
            if (resultLength.length > 0) {
                if (resultLength[0].password === password) {
                    var token = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789rapidqubepvtltd";
                    for (var i = 0; i < 10; i++)
                        token += possible.charAt(Math.floor(Math.random() * possible.length));
                    console.log(token);

                    objBD.query('INSERT INTO user_session( uid, token) values ( ?, ?)', [resultLength[0].uid, token], function(error, results, fields) {});
                    res.send({
                        "status": true,
                        "token": token,
                        "message": "Login Successfull"
                    });
                } else {
                    res.send({
                        "status": false,
                        "token": "null",
                        "message": "Email and password does not match"
                    });
                }
            } else {
                res.send({
                    "status": false,
                    "token": "null",
                    "message": "Email does not exist"
                });
            }
        }
    });
});

//userLogout link compares tokens taken from header with database if it matches deletes token.
router.get("/user/userLogout", cors(), function(req, res) {
    var objBD = BD();
    objBD.connect();
    var token = req.get('Authorization');
    console.log("Token: " + token);

    objBD.query('SELECT * FROM user_session WHERE token = ?', [token], function(error, results, fields) {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            var resultLength = JSON.parse(JSON.stringify(results));
            if (resultLength.length > 0) {
                if (resultLength[0].token === token) {
                    console.log(token);
                    objBD.query('delete  from user_session where uid = ?', [resultLength[0].uid, token], function(error, results, fields) {});
                    console.log(token);
                    res.send({
                        "status": true,
                        "message": "Logout Successfull"
                    });
                } else {
                    res.send({
                        "status": false,
                        "message": "already ended session"
                    });
                }
            }
        }

    });
});

// get link displays  all stored data 
router.get("/user/get", cors(), function(req, res) {
    var objBD = BD();
    objBD.connect();

    objBD.query('select * from user_detail ', function(error, vals, fields) {
        var temp = JSON.stringify(vals);
        var userdetail = JSON.parse(temp);
        return res.json({
            users: userdetail,
            error: false
        });
    });
});

//fetchPolicyQuotes link will fetch policies as per user requirement
router.post("/user/fetchPolicyQuotes", function(req, res) {
    var objBD = BD();
    objBD.connect();
    var token = req.get('Authorization');
    const consignmentWeight = req.body.consignmentWeight;
    console.log("consignmentWeight" + consignmentWeight);
    const consignmentValue = req.body.consignmentValue;
    console.log("consignmentvalue" + consignmentValue);
    const contractType = req.body.contractType;
    console.log("contractType" + contractType);
    const policyType = req.body.policyType;
    console.log("policyType" + policyType);

    objBD.query('SELECT * FROM user_session WHERE token = ?', token, function(error, results, fields) {
        var id = JSON.parse(JSON.stringify(results));

        var policy = {
            consignmentWeight: consignmentWeight,
            consignmentValue: consignmentValue,
            contractType: contractType,
            policyType: policyType,
            uid: id[0].uid
        }
        objBD.query('INSERT INTO savepolicy SET ? ', [policy], function(error) {});
        // objBD.query('UPDATE savepolicy SET (consignmentWeight,consignmentValue,contractType,policyType), values(?,?,?,?) ,  policy.consignmentWeight, policy.consignmentValue, policy.contractType, policy.policyType, WHERE uid = ? ,id[0].uid', function(error) {});

        var policyList;
        var cifPolicy;
        var cisPolicy;
        var cipPolicy;
        var fobPolicy;

        if (policyType == "cifPolicy") {

            policyList = [{
                    "policyName": "Marine Insurance",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "False",
                    "premiumAmount": "3,500",
                    "sumInsured": "50,000",
                    "premiumPayment": "12k"
                }, {
                    "policyName": "Blue Dart",
                    "Roadways": "False",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "True",
                    "premiumAmount": "4,000",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                }, {
                    "policyName": "DHFL",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "True",
                    "premiumAmount": "3,000",
                    "sumInsured": "1,00,000",
                    "premiumPayment": "15k"
                }, {
                    "policyName": "Blue Dart",
                    "Roadways": "True",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "False",
                    "premiumAmount": "3,750",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                },
                {
                    "policyName": "Maersk",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "False",
                    "premiumAmount": "5,000",
                    "sumInsured": "2,25,000",
                    "premiumPayment": "55k"

                },
                {
                    "policyName": "ICICI Lombard",
                    "Roadways": "False",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "True",
                    "premiumAmount": "1,500",
                    "sumInsured": "50,000",
                    "premiumPayment": "6k"
                }
            ]

        } else if (policyType == "cisPolicy") {

            policyList = [{
                    "policyName": "ICICI Insurance",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "False",
                    "premiumAmount": "3,000",
                    "sumInsured": "1,50,000",
                    "premiumPayment": "60k"
                }, {
                    "policyName": "Maersk",
                    "Roadways": "False",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "True",
                    "premiumAmount": "5,000",
                    "sumInsured": "2,25,000",
                    "premiumPayment": "55k"

                }, {
                    "policyName": "Doodle",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "True",
                    "premiumAmount": "5,000",
                    "sumInsured": "7,25,000",
                    "premiumPayment": "15k"
                }, {
                    "policyName": "MineDart",
                    "Roadways": "True",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "False",
                    "premiumAmount": "5,000",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                },
                {
                    "policyName": "Marine Insurance",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "False",
                    "premiumAmount": "1,000",
                    "sumInsured": "50,000",
                    "premiumPayment": "12k"
                }, {
                    "policyName": "Blue Dart",
                    "Roadways": "False",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "True",
                    "premiumAmount": "3,000",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                }
            ]

        } else if (policyType == "cipPolicy") {
            policyList = [{
                    "policyName": "All India Insurance",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "False",
                    "premiumAmount": "1,000",
                    "sumInsured": "50,000",
                    "premiumPayment": "6k"
                }, {
                    "policyName": "wizCraft",
                    "Roadways": "False",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "True",
                    "premiumAmount": "5,000",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                }, {
                    "policyName": "DreamWork",
                    "Roadways": "False",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "True",
                    "premiumAmount": "5,000",
                    "sumInsured": "7,25,000",
                    "premiumPayment": "15k"
                }, {
                    "policyName": "Emirates",
                    "Roadways": "True",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "False",
                    "premiumAmount": "5,000",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                },
                {
                    "policyName": "Marine Insurance",
                    "Roadways": "True",
                    "Shipping": "False",
                    "Railway": "True",
                    "Airways": "False",
                    "premiumAmount": "1,000",
                    "sumInsured": "50,000",
                    "premiumPayment": "12k"
                }, {
                    "policyName": "Blue Dart",
                    "Roadways": "False",
                    "Shipping": "True",
                    "Railway": "False",
                    "Airways": "True",
                    "premiumAmount": "3,000",
                    "sumInsured": "1,25,000",
                    "premiumPayment": "20k"

                }
            ]

        } else if (policyType == "fobPolicy") {

            policyList = [{
                "policyName": "ICICI Lombard",
                "Roadways": "False",
                "Shipping": "False",
                "Railway": "True",
                "Airways": "True",
                "premiumAmount": "1,000",
                "sumInsured": "50,000",
                "premiumPayment": "6k"
            }, {
                "policyName": "Oriental",
                "Roadways": "True",
                "Shipping": "True",
                "Railway": "False",
                "Airways": "False",
                "premiumAmount": "5,000",
                "sumInsured": "1,25,000",
                "premiumPayment": "20k"

            }, {
                "policyName": "DHFL",
                "Roadways": "False",
                "Shipping": "True",
                "Railway": "False",
                "Airways": "True",
                "premiumAmount": "5,000",
                "sumInsured": "7,25,000",
                "premiumPayment": "15k"
            }, {
                "policyName": "Harwlett Packards",
                "Roadways": "True",
                "Shipping": "False",
                "Railway": "True",
                "Airways": "False",
                "premiumAmount": "5,000",
                "sumInsured": "1,25,000",
                "premiumPayment": "20k"

            }, {
                "policyName": "Maersk",
                "Roadways": "True",
                "Shipping": "False",
                "Railway": "True",
                "Airways": "False",
                "premiumAmount": "5,000",
                "sumInsured": "2,25,000",
                "premiumPayment": "55k"

            }, {
                "policyName": "Doodle",
                "Roadways": "True",
                "Shipping": "True",
                "Railway": "False",
                "Airways": "False",
                "premiumAmount": "5,000",
                "sumInsured": "7,25,000",
                "premiumPayment": "15k"
            }]

        }
        return res.json({
            "policyList": policyList
        });
    });

});
//fetchsavepolicy will fetch saved policies for respective user on token
router.get("/user/fetchSavePolicy", function(req, res) {
    var objBD = BD();
    objBD.connect();
    var token = req.get('Authorization');
    objBD.query('SELECT * FROM user_session WHERE token = ?', token, function(error, results, fields) {
        var id = JSON.parse(JSON.stringify(results));
        var uid = id[0].uid;
        objBD.query('SELECT * FROM savepolicy WHERE uid = ?', [uid], function(error, results, fields) {
            res.send({
                "status": true,
                "results": results
            });
        });
    });
});


module.exports = router;