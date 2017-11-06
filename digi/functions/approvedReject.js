'use strict';

const doc = require('../models/doc')
var bcSdk = require('../invoke');
const users = 'risabh.s';
const request = require('../models/request');



exports.approvedReject = (rapidID, OrgID, status, docTypes) => {

    return new Promise((resolve, reject) => {
        console.log("searching in mongo...")
        doc.find({
                "rapidID": rapidID
            }).then((docs) => {
                console.log(docs)
                var sharedDocDetails;
                var counter = 0;
                for (var i = 0; i < docs.length; i++) {
                    console.log(docs[i]._doc.docType);
                    console.log(docTypes);
                    for (let v = 0; v < docTypes.length; v++) {
                        console.log(docTypes.length)
                        console.log(docs[i]._doc.docType);
                        console.log(docTypes[v]);
                        if (docs[i]._doc.docType === docTypes[v]) {

                            var doc1 = docs[i].rapid_doc_ID;
                            console.log(doc1);
                            var rapid_doc_ID = doc1;

                            sharedDocDetails = {

                                "rapidID": rapidID,
                                "rapid_doc_ID": doc1,
                                "OrgID": OrgID,
                                "status": status

                            };
                        }

                        console.log(i + "calling sdk" + JSON.stringify(sharedDocDetails))

                        bcSdk.shareDocument({
                                user: users,
                                sharedDocs: sharedDocDetails
                            }).then((Sdkresponse) => {
                                console.log(counter)
                                if (counter === (docs.length - 1)) {
                                    resolve("success");
                                }
                                counter++;
                                console.log("bluemix success" + JSON.stringify(Sdkresponse))

                            })
                            .catch((err) => {
                                console.log("bluemix failed" + JSON.stringify(err))
                                reject("failed");
                            });

                    }
                }

            }) //find then ends here    
            .catch((err) => {
                console.log("promise failed" + err)
                reject(err)

            });

    })
};