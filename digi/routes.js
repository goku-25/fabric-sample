'use strict';
var crypto = require('crypto');
var cors = require('cors');
const jwt = require('jsonwebtoken');
var fs = require('fs');

const auditUser = require('./functions/auditUser');

const getMongoDocs = require('./functions/getMongoDocs');
const approvedReject = require('./functions/approvedReject');
const requestDocs = require('./functions/requestDocs');
const register = require('./functions/register');
const doc = require('./functions/addDoc');
const fetchRequests = require('./functions/fetchRequests');
const registerOrg = require('./functions/registerorg');
const login = require('./functions/login');
const profile = require('./functions/profile');
const password = require('./functions/password');
const config = require('./config/config.json');
const user = require('./models/user');
const fetchUsersdocs = require('./functions/fetchUserdocs');
const shareDocument = require('./functions/sharedocument');
const revokeAccess = require('./functions/revokeAccess');
const getSharedDocs = require('./functions/getSharedDocs');
const removedocs = require('./functions/removedocs');

module.exports = router => {

    router.get('/', (req, res) => res.send("Welcome to digital identity !"));


    router.get('/rapidID', cors(), (req, res) => {
        const rapidID = getrapidID(req);
        res.send({
            "rapidId": rapidID
        })

    });



    router.post('/login', cors(), (req, res) => {

        const email = req.body.email;

        const pin = req.body.pin;


        if (!email) {

            res.status(400).json({
                message: 'Invalid Request !'
            });


        } else {

            login.loginUser(email, pin)

            .then(result => {



                if ('orgname' in result.users._doc) {

                    const token = jwt.sign(result, config.secret, {
                        expiresIn: 60000000000
                    })


                    res.status(result.status).json({
                        message: result.message,
                        token: token,
                         rapidID : result.users.rapidID,
                        usertype: "org",
                        username: result.users.orgname
                    });

                } else {
                    const token = jwt.sign(result, config.secret, {
                        expiresIn: 600000000000
                    })

                    res.status(result.status).json({
                        message: result.message,
                        token: token,
                         rapidID : result.users.rapidID,
                        usertype: "ind",
                        username: result.users.firstname
                    });
                }
            })

            .catch(err => res.status(err.status).json({
                message: err.message
            }));
        }
    });
      
     router.get('/getMongodocs',(req,res)=>{
                   
                 if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }
                const rapidID = getrapidID(req)

                if (!rapidID) {
            console.log(" invalid body ")
            return res.status(400).json({
                message: 'Invalid Request !'
            });

        }
                    getMongoDocs.getMongoDocs(rapidID)
                    .then(result=>{
                       res.status(result.status).json({
                        docs: result.docs
                    })
                })
                
                .catch(err => res.status(err.status).json({
                    message: err.message
                }).json({
                    status: err.status
                }));
            
        
    });
    
    router.post('/registerUser', cors(), (req, res) => {

        const firstname = req.body.firstname;
        console.log(firstname);
        const lastname = req.body.lastname;
        const email = req.body.email;
        console.log(email);
        const phone = req.body.phone;
        console.log(phone);
        const pin = req.body.pin;
        console.log(pin);
        const rapidID = crypto.createHash('sha256').update(email.concat(phone)).digest('base64');

        if (!firstname || !lastname || !email || !pin || !phone) {

            res.status(400).json({
                message: 'Invalid Request !'
            });

        } else {

            register.registerUser(firstname, lastname, email, phone, pin, rapidID)

            .then(result => {

                res.status(result.status).json({
                    message: result.message,
                    ind: true
                })
            })

            .catch(err => res.status(err.status).json({
                message: err.message
            }).json({
                status: err.status
            }));
        }
    });


    router.post('/requestdocs', (req, res) => {
       
            const email = req.body.email;
            const rapidID = getrapidID(req);
            const orgname = getorgname(req);
            const docs = req.body.docs;
            const status = req.body.status;
         //check if token is valid
            if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }
             //body required field validation
        if (!rapidID || !email || !status||!orgname) {
            console.log(" invalid body ")
            return res.status(400).json({
                message: 'Invalid Request !'
            });

        }
             
        requestDocs.reqstDocs(email, rapidID, orgname, docs, status)

                .then(result => {

                    res.status(result.status).json({
                        message: result.message,

                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }).json({
                    status: err.status
                }));
            });

    router.post('/approveReject', (req, res) => {
     
        const rapidID = getrapidID(req);
        const docTypes = req.body.docTypes;
       const OrgID = req.body.OrgID.text;
       //  const OrgID = req.body.OrgID;
        const status = req.body.status;
          //token validation
        if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }

        //status validation
        if (status !== "approved") {
            console.log(" status already approved ")
            return res.status(403).json({
                message: "request rejected"
            })
        }



        //body required field validation
        if (!rapidID || !docTypes || !status) {
            console.log(" invalid body ")
            return res.status(400).json({
                message: 'Invalid Request !'
            });

        }

        approvedReject.approvedReject(rapidID, OrgID, status, docTypes)
            .then((result) => {
                console.log("approval was successfull" + JSON.stringify(result))
                res.status(200).json({
                    message: result,
                })
            }).catch((err) => {
                res.status(502).json({
                        message: err.message
                    }).json({
                        status: err.status
                    }) // end of json
            }); // end of catch

    });
         router.post('/approveRejectDirect', (req, res) => {
     
        const rapidID = getrapidID(req);
        const docTypes = req.body.docTypes;
        const OrgID = req.body.OrgID;
        const status = req.body.status;
          //token validation
        if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }

        //status validation
        if (status !== "approved") {
            console.log(" status already approved ")
            return res.status(403).json({
                message: "request rejected"
            })
        }



        //body required field validation
        if (!rapidID || !docTypes || !status) {
            console.log(" invalid body ")
            return res.status(400).json({
                message: 'Invalid Request !'
            });

        }

        approvedReject.approvedReject(rapidID, OrgID, status, docTypes)
            .then((result) => {
                console.log("approval was successfull" + JSON.stringify(result))
                res.status(200).json({
                    message: result,
                })
            }).catch((err) => {
                res.status(502).json({
                        message: err.message
                    }).json({
                        status: err.status
                    }) // end of json
            }); // end of catch

    });


    
       

    router.get('/fetchrequests', (req, res) => {
           
                   if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }

            const email = getemail(req);

             if (!email) {
            console.log(" invalid body ")
            return res.status(400).json({
                message: 'Invalid Request !'
            });

        }
                fetchRequests.fetchrequest(email)

                .then(result => {
                    var activeRequest = [];
                    //  console.log("length of result array"+result.campaignlist.body.campaignlist.length);
                    for (let i = 0; i < result.notifications.length; i++) {

                        if (result.notifications[i].status === "request sent") {

                            activeRequest.push(result.notifications[i]);


                        } else if (result.notifications[i].status === "active") {

                            return res.json({
                                status: 409,
                                message: 'requests not found'
                            });


                        }
                    }
                    res.status(result.status).json({
                        message: result.message,
                        requests: activeRequest
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }).json({
                    status: err.status
                }));
            
      
    });
    

    router.post('/registerOrg', cors(), (req, res) => {

        const orgname = req.body.orgname;
        const email = req.body.email;
        const orgcontact = req.body.orgcontact;
        const pin = req.body.pin;
        const rapidID = crypto.createHash('sha256').update(email.concat(orgcontact)).digest('base64');


        if (!orgname || !email || !pin || !orgcontact || !rapidID || !orgname.trim() || !email.trim() || !pin.trim() || !orgcontact.trim()) {

            res.status(400).json({
                message: 'Invalid Request !'
            });

        } else {

            registerOrg.registerOrg(orgname, email, orgcontact, pin, rapidID)

            .then(result => {

                res.setHeader('Location', '/org/' + email);
                res.status(result.status).json({
                    message: result.message,
                    org: true
                })
            })

            .catch(err => res.status(err.status).json({
                message: err.message,
                status: err.status
            }));
        }
    });
    router.post('/addDoc', cors(), (req, res) => {

            const docType = req.body.docType;
            const docNo = req.body.docNo;
            const rapid_doc_ID = crypto.createHash('sha256').update(docNo).digest('base64');
            const rapidID = getrapidID(req);
            const docinfo = req.body.docinfo;
            
             if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }

             if (!docType||!docNo||!rapidID) {
            console.log(" invalid body ")
            return res.status(400).json({
                message: 'Invalid Request !'
            });

        }

                doc.addDoc(docType, docNo, rapid_doc_ID, rapidID, docinfo)

                .then(result => {


                    res.status(result.status).json({
                        message: result.message
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        
    });



    router.get('/getMydocs', cors(), (req, res) => {
        //token validation
        if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }
            const rapidID = getrapidID(req);

                if (!rapidID) {
                console.log("invalid json input")
                return res.status(400).json({
                message: 'invalid user,token not valid or found'
                })
                }

                fetchUsersdocs.fetchUsersdocs(rapidID)

                .then(result => {


                    res.status(result.status).json({
                        docObj: result.docArray,
                        message: "fetched successfully"
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

            })
            

    router.get('/auditUser', cors(), (req, res) => {
        if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }
            const rapidID = getrapidID(req);

            if (!rapidID) {
                console.log("invalid json input")
                return res.status(400).json({
                message: 'invalid user,token not valid or found'
                })
                }

                auditUser.auditUser(rapidID)

                .then(result => {


                    res.status(result.status).json({
                        org: result.orgname,
                        dates: result.timestamp,
                        doctypes: result.documentid,
                        message: "fetched successfully"
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
    });


    router.post('/removedocs', cors(), (req, res) => {
       if (!checkToken(req)) {
            console.log("invalid token")
            return res.status(401).json({
                message: "invalid token"
            })
        }
            const rapidID = getrapidID(req);
            const rapid_doc_ID1 = req.body.rapid_doc_ID;
            const rapid_doc_ID = crypto.createHash('sha256').update(rapid_doc_ID1).digest('base64');
           
            if (!rapidID || !rapid_doc_ID) {
                console.log("invalid json")
              return  res.status(400).json({
                    message: 'wrong json input'
                });

            }
                removedocs.removedocs(rapidID, rapid_doc_ID)

                .then(result => {


                    res.status(result.status).json({
                        message: result.message
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));           

    });

   
    router.get('/getSharedDocs', cors(), (req, res) => {
        if (checkToken(req)) {
            console.log("invalid token")
            const rapidID = getrapidID(req);
            if (!rapidID) {

                res.status(400).json({
                    message: 'invalid user,token not valid or found'
                });

            } else {

                getSharedDocs.getSharedDocs(rapidID)

                .then(result => {


                    res.status(result.status).json({
                        message: result.sharedDocs
                    })
                })

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

            }
        }

    });



    router.post('/revokeAccess', cors(), (req, res) => {
        const rapidID = getrapidID(req);
        const orgID = req.body.orgID;
        const rapid_doc_ID = req.body.rapid_doc_ID;

        if (!rapidID || !rapid_doc_ID || !orgID) {
            res.status(400).json({
                message: 'invalid user,token not valid or found'
            });
        } else {
            revokeAccess.revokeAccess(rapidID, rapid_doc_ID, orgID)

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
    router.get('/audit', cors(), function(req, res) {
        if (checkToken(req)) {

            console.log(req.body)

            res.send([{
                    "date": "25 july 2017",
                    "docType": "aadhar",
                    "org": "icici"
                },
                {
                    "date": "12 july 2017",
                    "docType": "aadhar",
                    "org": "hdfc"
                },
                {
                    "date": "10 july 2017",
                    "docType": "pan card",
                    "org": "icici"
                },
                {
                    "date": "2 july 2017",
                    "docType": "passport",
                    "org": "swiss bank"
                }
            ])
        } else {
            res.status(400).json({
                message: 'invalid user,token not valid or found'
            });

        }
    });


    router.put('changePassword', (req, res) => {

        if (checkToken(req)) {

            const oldPin = req.body.pin;
            const newPin = req.body.newPin;

            if (!oldPin || !newPin || !oldPin.trim() || !newPin.trim()) {

                res.status(400).json({
                    message: 'Invalid Request !'
                });

            } else {

                password.changePassword(req.params.id, oldPassword, newPassword)

                .then(result => res.status(result.status).json({
                    message: result.message
                }))

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

            }
        } else {

            res.status(401).json({
                message: 'Invalid Token !'
            });
        }
    });


    router.post('/forgotPassword', (req, res) => {

        const email = req.params.id;
        const token = req.body.token;
        const newPassword = req.body.password;

        if (!token || !newPassword || !token.trim() || !newPassword.trim()) {

            password.resetPasswordInit(email)

            .then(result => res.status(result.status).json({
                message: result.message
            }))

            .catch(err => res.status(err.status).json({
                message: err.message
            }));

        } else {

            password.resetPasswordFinish(email, token, newPassword)

            .then(result => res.status(result.status).json({
                message: result.message
            }))

            .catch(err => res.status(err.status).json({
                message: err.message
            }));
        }
    });

    function checkToken(req) {

        const token = req.headers['x-access-token'];

        if (token) {

            try {

                var decoded = jwt.verify(token, config.secret);

                return true;


            } catch (err) {

                return false;
            }

        } else {

            return false;
        }
    }

    function getrapidID(req) {

        const token = req.headers['x-access-token'];

        if (token) {

            try {

                var decoded = jwt.verify(token, config.secret);
                return decoded.users.rapidID;


            } catch (err) {

                return false;
            }

        } else {

            return false;
        }
    }

    function getorgname(req) {

        const token = req.headers['x-access-token'];

        if (token) {

            try {

                var decoded = jwt.verify(token, config.secret);
                var orgname = decoded.users.orgname;
                // var rapidID = decoded.users.rapidID;

                return orgname

            } catch (err) {

                return false;
            }

        } else {

            return false;
        }
    }

    function getemail(req) {

        const token = req.headers['x-access-token'];

        if (token) {

            try {

                var decoded = jwt.verify(token, config.secret);
                var email = decoded.users.email;


                return email



            } catch (err) {

                return false;
            }

        } else {

            return false;
        }
    }


}
