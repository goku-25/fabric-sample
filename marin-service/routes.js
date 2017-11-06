//here only routing is done

'use strict';

const register = require('./functions/register');
const fetchpolicy = require('./functions/fetchpolicy');
const consignment = require('./functions/consignment');
const fetchPolicylist = require('./functions/fetchpolicylist');
const fetchUserlist = require('./functions/getuser');
const fetchConsignmentlist = require('./functions/getconsignment');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
var dateTime = require('node-datetime');

// connection to database.
function BD() {
    var connection = mysql.createConnection({
        user: 'root',
        password: 'rpqb123',
        host: 'localhost',
        database: 'marine_db'
    });
    return connection;
}

// connection for nexmo free sms service
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

module.exports = router => {

    //registerUser- routes user input to function register.
    router.post("/user/registerUser", (req, res) => {
        var objBD = BD();
        objBD.connect();
        const id = Math.floor(Math.random() * (100000 - 1)) + 1;
        const uid = id.toString();
        const fname = req.body.fname;
        console.log("data in name:" + fname);
        const lname = req.body.lname;
        console.log("data in email:" + lname);
        const phone = req.body.phone;
        console.log("data in phone:" + phone);
        const email = req.body.email;
        console.log("data in email:" + email);
        const usertype = req.body.usertype;
        console.log("data in usertype:" + usertype);
        const password = req.body.password;
        console.log("data in pasword:" + password);

        if (!fname || !lname || !phone || !email || !usertype || !password || !fname.trim() || !lname.trim() || !phone.trim() ||
            !email.trim() || !usertype.trim() || !password.trim()) {
            //the if statement checks if any of the above paramenters are null or not..if is then it sends an error report.
            res.status(400).json({ message: 'Invalid Request !' });
        }
        var user = {
            fname: fname,
            lname: lname,
            phone: phone,
            email: email,
            usertype: usertype,
            password: password,
            status: "Inactive"
        };
        objBD.query('INSERT INTO user_detail SET ?', user, function(error) {
            if (error) {

            } else {
                var otp = "";
                var possible = "0123456789";
                for (var i = 0; i < 4; i++)
                    otp += possible.charAt(Math.floor(Math.random() * possible.length));
                var remoteHost = "192.168.0.12:3000";
                console.log("remote---------->",remoteHost);

                var encodedMail = new Buffer(req.body.email).toString('base64');
                var link = "http://" + remoteHost + "/user/verify?mail=" + encodedMail;
                var userResults, emailtosend, phonetosend, otptosend;
                
                objBD.query('select * from user_detail WHERE email = ?', [req.body.email], function(error, results, fields) {
                    
                    userResults = JSON.parse(JSON.stringify(results));
                    console.log("lol >----------->",userResults)
                    console.log("results: " + userResults[0].email);
                    console.log("results:" + userResults[0].phone);
                    emailtosend = userResults[0].email;
                    phonetosend = userResults[0].phone;
                    objBD.query('INSERT INTO verification( uid, otp,encodedMail) values ( ?, ?, ?)', [userResults[0].uid, otp, encodedMail], function(error, results, fields) {});

                    //after generating otp mail will be sent to regsitered user.
                    var mailOptions = {
                        transport: transporter,
                        from: '"Marin Service"<dhananjay.patil@rapidqube.com>',
                        to: emailtosend,
                        subject: 'Please confirm your Email account',
                        text: req.body.text,
                        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {}
                    });

                    //otp will be sent via sms to validate phone number.
                    otptosend = "OTP: " + otp;
                    nexmo.message.sendSms(
                        '919768135452', phonetosend, otptosend, { type: 'unicode' },
                        (err, responseData) => { if (responseData) { console.log(responseData) } }
                    );
                })
                register.registerUser(uid, fname, lname, phone, email, usertype, password)

                .then((result) => {
                    res.status(200).json({ "message": "true", "status": "Registration successful" });
                })


                .catch(err => res.status(err.status).json({ message: err.message }));
            }
        });
    });

    // getuser - query method fetches details stored in ledger. 
    router.get("/user/getuser", (req, res) => {

        if (1 == 1) {
            fetchUserlist.fetch_userlist({
                    "user": "dhananjay.p",
                    "getusers": "getusers"
                })
                .then(function(result) {
                    res.json({
                        message: "user detail fetched",
                        userList: result.usersdata

                    });
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        } else {

            res.status(401).json({
                message: 'cant fetch data !'
            });
        }
    });

    //verify-validates user emailid
    router.get("/user/verify", cors(), (req, res, next) => {
        var querymail = req.query.mail;
        console.log("URL: " + querymail);
        var objBD = BD();
        objBD.connect();

        objBD.query('SELECT * FROM verification WHERE encodedMail = ?', [querymail], function(error, results, fields) {
            if (error) {
                res.send({
                    "status": false,
                    "message": "error ocurred"
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

    //phoneverification- validates phone number
    router.post("/user/phoneverification", cors(), (req, res) => {
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
        });
    });

    //userLogin- on user input this service gets invoked
    router.post("/user/userLogin", cors(), (req, res) => {
        var objBD = BD();
        objBD.connect();
        console.log(req.body);
        var email = req.body.email;
        var password = req.body.password;
        objBD.query('SELECT * FROM user_detail WHERE email = ?', email, function(error, results, fields) {
            if (error) {
                res.send({
                    "status": false,
                    "token": "null",
                    "userType": "null",
                    "message": "error ocurred"
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
                            "userType": results[0].usertype,
                            "firstName": results[0].fname,
                            "lastName": results[0].lname,
                            "message": "Login Successfull"
                        });
                    } else {
                        res.send({
                            "status": false,
                            "token": "null",
                            "userType": "null",
                            "message": "Email and password does not match"
                        });
                    }
                } else {
                    res.send({
                        "status": false,
                        "token": "null",
                        "userType": "null",
                        "message": "Email does not exist"
                    });
                }
            }
        });
    });

    //fetchPolicyQuotes- routes user input to function fetchpolicy
    router.post("/user/fetchPolicyQuotes", (req, res) => {
        var objBD = BD();
        objBD.connect();
        var token = req.get('Authorization');
        if (!token || !token.trim()) {
            res.status(400).json({ "status": false, "message": 'token needed !' });
        }
        const consignmentWeight = (req.body.consignmentWeight).toString();
        const consignmentValue = (req.body.consignmentValue).toString();
        const invoiceNo = (req.body.invoiceNo).toString();
        const modeofTransport = (req.body.modeofTransport);
        const packingMode = req.body.packingMode;
        const contractType = req.body.contractType;
        const policyType = req.body.policyType;
        const consignmentType = req.body.consignmentType;

        if (!contractType || !contractType.trim()) {

            res.status(400).json({ message: 'Invalid Request !' });

        } else {
            objBD.query('SELECT * FROM user_session WHERE token = ?', token, function(error, results, fields) {

                var sr_no = (results);
                var id1 = results[0].uid;
                const id = id1.toString();

                var policy = {
                    consignmentWeight: consignmentWeight,
                    consignmentValue: consignmentValue,
                    invoiceNo: invoiceNo,
                    modeofTransport: modeofTransport,
                    packingMode: packingMode,
                    contractType: contractType,
                    policyType: policyType,
                    consignmentType: consignmentType,
                    uid: sr_no[0].uid
                }
                objBD.query('INSERT INTO savepolicy SET ? ', [policy], function(error) {});

                var policyList;
                var cifPolicy;
                var cisPolicy;
                var cipPolicy;
                var fobPolicy;

                if (policyType == "cifPolicy") {

                    policyList = [{
                            "policyName": "21st Century Insurance",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "3500",
                            "sumInsured": "50000",
                            "premiumPayment": "12000"
                        }, {
                            "policyName": "Alfa Corporation",
                            "Roadways": "False",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "True",
                            "premiumAmount": "4000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"

                        }, {
                            "policyName": "Bajaj Allianz",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "True",
                            "premiumAmount": "3000",
                            "sumInsured": "100000",
                            "premiumPayment": "15000"
                        }, {
                            "policyName": "American International Group",
                            "Roadways": "True",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "False",
                            "premiumAmount": "3750",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"

                        },
                        {
                            "policyName": "Cincinnati Financial",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "225000",
                            "premiumPayment": "55000"
                        },
                        {
                            "policyName": "ICICI Lombard",
                            "Roadways": "False",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "True",
                            "premiumAmount": "1500",
                            "sumInsured": "50000",
                            "premiumPayment": "6000"
                        }
                    ]

                } else if (policyType == "cisPolicy") {

                    policyList = [{
                            "policyName": "Darwin Professional Underwriters, Inc.",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "3000",
                            "sumInsured": "150000",
                            "premiumPayment": "60000"
                        },
                        {
                            "policyName": "Eastern Insurance Holdings, Inc.",
                            "Roadways": "False",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "True",
                            "premiumAmount": "5000",
                            "sumInsured": "225000",
                            "premiumPayment": "55000"
                        },
                        {
                            "policyName": "EMC Insurance Group, Inc.",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "True",
                            "premiumAmount": "5000",
                            "sumInsured": "725000",
                            "premiumPayment": "15000"
                        },
                        {
                            "policyName": "Everest Re Group, Ltd.",
                            "Roadways": "True",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"
                        },
                        {
                            "policyName": "First Mercury Financial Corporation",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "1000",
                            "sumInsured": "50000",
                            "premiumPayment": "12000"
                        }, {
                            "policyName": "Berkshire Hathaway",
                            "Roadways": "False",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "True",
                            "premiumAmount": "3000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"
                        }
                    ]

                } else if (policyType == "cipPolicy") {
                    policyList = [{
                            "policyName": "All India Insurance",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "1000",
                            "sumInsured": "50000",
                            "premiumPayment": "6000"
                        },
                        {
                            "policyName": "Oriental",
                            "Roadways": "False",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "True",
                            "premiumAmount": "5000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"
                        },
                        {
                            "policyName": "Bristol West Holdings",
                            "Roadways": "False",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "True",
                            "premiumAmount": "5000",
                            "sumInsured": "725000",
                            "premiumPayment": "15000"
                        },
                        {
                            "policyName": "Federated National Holding Company",
                            "Roadways": "True",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"
                        },
                        {
                            "policyName": "AmCOMP Incorporated",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "1000",
                            "sumInsured": "50000",
                            "premiumPayment": "12000"
                        },
                        {
                            "policyName": "Carolina Group",
                            "Roadways": "False",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "True",
                            "premiumAmount": "3000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"
                        }
                    ]

                } else if (policyType == "fobPolicy") {

                    policyList = [{
                            "policyName": "ICICI Lombard",
                            "Roadways": "False",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "True",
                            "premiumAmount": "1000",
                            "sumInsured": "50000",
                            "premiumPayment": "60000"
                        },
                        {
                            "policyName": "Oriental",
                            "Roadways": "True",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"
                        },
                        {
                            "policyName": "Everest Re Group, Ltd.",
                            "Roadways": "False",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "True",
                            "premiumAmount": "5000",
                            "sumInsured": "725000",
                            "premiumPayment": "15000"
                        },
                        {
                            "policyName": "Eastern Insurance Holdings, Inc.",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "125000",
                            "premiumPayment": "20000"

                        },
                        {
                            "policyName": "Maersk",
                            "Roadways": "True",
                            "Shipping": "False",
                            "Railway": "True",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "225000",
                            "premiumPayment": "55000"
                        },
                        {
                            "policyName": "21st Century Insurance",
                            "Roadways": "True",
                            "Shipping": "True",
                            "Railway": "False",
                            "Airways": "False",
                            "premiumAmount": "5000",
                            "sumInsured": "725000",
                            "premiumPayment": "15000"
                        }
                    ]

                }

                fetchpolicy.fetchPolicyQuotes(id, consignmentWeight, consignmentValue, invoiceNo, modeofTransport, packingMode, contractType, policyType, consignmentType)

                .then((result) => {
                        res.status(200).json({ "status": true, "message": "fetched", "policyList": policyList });
                    })
                    .catch(err => res.status(err.status).json({ message: err.message }));
            });
        }
    });

    //policylist- query fetches user input given by user for fetching policy.
    router.get("/user/policyList", (req, res) => {

        if (1 == 1) {
            fetchPolicylist.fetch_Policy_list({
                    "user": "dhananjay.p",
                    "get": "get"
                })
                .then(function(result) {


                    res.json({ "status": true, message: "policy detail fetched", policyList: result });
                    //res.json(result)
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        } else {

            res.status(401).json({
                "status": false,
                "message": "cant fetch data"

            });
        }
    });

    //Consignment-routes user input to function consignment
    router.post("/user/consignmentDetail", cors(), (req, res) => {
        var objBD = BD();
        objBD.connect();
        var token = req.get('Authorization');
        if (!token || !token.trim()) {
            res.status(400).json({ "status": false, "message": 'token needed !' });
        }

        const consignmentWeight = (req.body.consignmentWeight).toString();
        console.log("consignmentWeight:" + consignmentWeight);
        const consignmentValue = (req.body.consignmentValue).toString();
        console.log("consignmentValue:" + consignmentValue);
        const policyName = req.body.policyName;
        console.log("policyName:" + policyName);
        const sumInsured = (req.body.sumInsured).toString();
        console.log("sumInsured:" + sumInsured);
        const premiumAmount = (req.body.premiumAmount).toString();
        console.log("premiumAmount:" + premiumAmount);
        const modeofTransport = req.body.modeofTransport;
        console.log("modeofTransport" + modeofTransport);
        const packingMode = req.body.packingMode
        console.log("packingMode:" + packingMode);
        const consignmentType = req.body.consignmentType;
        console.log("consignmentType:" + consignmentType);
        const contractType = req.body.contractType;
        console.log("contractType:" + contractType);
        const policyType = req.body.policyType;
        console.log("policyType:" + policyType);
        const email = req.body.email;
        console.log("email:" + email);
        const policyHolderName = req.body.policyHolderName;
        console.log("policyHolderName:" + policyHolderName);
        const userType = req.body.userType;
        console.log("userType:" + userType);
        const invoiceNo = req.body.invoiceNo;
        console.log("invoiceNo:" + invoiceNo);
        var policyNumber = "";
        var possible = "01234567891011121314151617181920213031404151523548854547585474654987878";
        for (var i = 0; i < 10; i++)
            policyNumber += possible.charAt(Math.floor(Math.random() * possible.length));

        if (!consignmentWeight || !consignmentValue || !policyName || !sumInsured || !premiumAmount || !modeofTransport || !packingMode || !consignmentType || !contractType || !policyType || !email || !policyHolderName || !userType || !invoiceNo || !consignmentWeight.trim() || !consignmentValue.trim() || !policyName.trim() || !sumInsured.trim() || !premiumAmount.trim() || !modeofTransport.trim() || !packingMode.trim() || !consignmentType.trim() || !contractType.trim() || !policyType.trim() || !email.trim() || !policyHolderName.trim() || !userType.trim() || !invoiceNo.trim()) {

            res.status(400).json({ "status": false, "message": 'Invalid Request !' });

        } else {
            objBD.query('SELECT * FROM user_session WHERE token = ?', token, function(error, results, fields) {
                var sr_no = (results);
                var id1 = results[0].uid;
                const id = id1.toString();

                var udetail = {
                    uid: sr_no[0].uid,
                    consignmentWeight: consignmentWeight,
                    consignmentValue: consignmentValue,
                    policyName: policyName,
                    sumInsured: sumInsured,
                    premiumAmount: premiumAmount,
                    modeofTransport: modeofTransport,
                    packingMode: packingMode,
                    consignmentType: consignmentType,
                    contractType: contractType,
                    policyType: policyType,
                    email: email,
                    policyHolderName: policyHolderName,
                    userType: userType,
                    invoiceNo: invoiceNo,
                    policyNumber: policyNumber
                };

                objBD.query('INSERT INTO issuedpolicy SET ?', udetail, function(error) {});

                objBD.query('DELETE from savepolicy where uid = ? ', sr_no[0].uid, function(error) {});

                var userResults, emailtosend;

                objBD.query('select * from issuedpolicy WHERE email = ?', [req.body.email], function(error, results, fields) {

                    userResults = JSON.parse(JSON.stringify(results));
                    console.log("results: " + userResults[0].email);
                    emailtosend = userResults[0].email;

                    var mailOptions = {
                        transport: transporter,
                        from: '"Marin Service"<vikram.viswanathan@rapidqube.com>',
                        to: emailtosend,
                        subject: 'Insurance Confirmed',
                        text: req.body.text,
                        html: "Thank you for choosing Marin to insure your consignment. Please wait for 4-5 working days to receive your copy of the Insurance Policy Document"
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {}
                    });
                })
                consignment.consignmentDetail(id, consignmentWeight, consignmentValue, policyName, sumInsured, premiumAmount, modeofTransport, packingMode, consignmentType, contractType, policyType, email, policyHolderName, userType, invoiceNo, policyNumber)

                .then((result) => {
                        res.status(200).json({ "message": "true", "status": "success" });
                    })
                    .catch(err => res.status(err.status).json({ message: err.message }));
            });
        }
    });

    //fetchissuedpolicy - query fetches consignment user input given for payment of consignment.
    router.get("/user/fetchissuedpolicy", (req, res) => {
        var issuedPolicies = [];
        if (1 == 1) {
            var uid;
            var objBD = BD();
            objBD.connect();
            var token = req.get('Authorization');
            console.log("Token: " + token);

            objBD.query('SELECT * FROM user_session WHERE token = ?', [token], function(error, results, fields) {

                if (error) {
                    res.send({
                        "status": false,
                        "message": "error ocurred"
                    })
                } else {
                    var sr_no = (results);
                    var id1 = results[0].uid;
                    uid = id1;
                }
            })
            fetchConsignmentlist.fetch_consignmentlist({
                    "user": "dhananjay.p",
                    "getusers": "getusers"
                })
                .then(function(result) {
                    var date = dateTime.create();
                    var formatted = date.format('Y-m-d');
                    var filteredPolicy = [];
                    var filtereddata = [];
                    var IssuedPolicy_Details;
                    var bodystr = result.consignmentlist.body;
                    var bodyObj = JSON.parse(bodystr)
                    console.log("length" + bodyObj.consignmentlist.length);
                    for (let i = 0; i < bodyObj.consignmentlist.length; i++) {
                        if (bodyObj.consignmentlist[i].id === uid) {
                            filteredPolicy.push(bodyObj.consignmentlist[i]);
                            console.log(filteredPolicy.length)
                        }
                    }
                    for (let i = 0; i < filteredPolicy.length; i++) {

                        issuedPolicies.push({
                            "policyName": filteredPolicy[i].policyname,
                            "issuedDate": formatted,
                            "premiumAmount": filteredPolicy[i].premiumamount.toString(),
                            "issuedAmount": filteredPolicy[i].suminsured.toString(),
                            "policyHolderName": filteredPolicy[i].policyholdername,
                            "policyNumber": filteredPolicy[i].policynumber.toString(),
                            "agentName": filteredPolicy[i].usertype
                        });
                    }
                    return res.json({
                        "status": true,
                        "message": issuedPolicies
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

    //fetchsavepolicy- fetches saved policies for respective user on token
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
                    "message": results
                })
            });
        });
    });

    //userLogout- compares tokens taken from header with database data if it matches deletes token.
    router.get("/user/userLogout", cors(), (req, res) => {
        var objBD = BD();
        objBD.connect();
        var token = req.get('Authorization');
        console.log("Token: " + token);

        objBD.query('SELECT * FROM user_session WHERE token = ?', [token], function(error, results, fields) {
            if (error) {
                res.send({
                    "status": false,
                    "message": "error ocurred"
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
                        })
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
}