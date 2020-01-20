var request = require("request");
var fs = require('fs');
require('dotenv').config()

var dataURItoBuffer = function (dataURL, callback) {
    var buff = new Buffer(dataURL.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
    callback(buff);
};

module.exports = {
    'detect': (dataURL, cb) => {
        // var buff = new Buffer(dataURL.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
        // var options = { 
        //     method: 'POST',
        //     url: 'https://westus2.api.cognitive.microsoft.com/face/v1.0/detect',
        //     qs: 
        //     { returnFaceId: 'true',
        //         returnFaceLandmarks: 'false',
        //         recognitionModel: 'recognition_02',
        //         returnRecognitionModel: 'false' },
        //     headers: 
        //     { 
        //         // Host: 'westus2.api.cognitive.microsoft.com',
        //         'Ocp-Apim-Subscription-Key': '13743503a99c46bdbdfc6319d26b80de',
        //         'Content-Type': 'application/json' },
        //     body: { url: 'https://i.imgur.com/GDlbRE8.jpg' },
        //     json: true };
        dataURItoBuffer(dataURL, function (buff) {
            var options = {
                method: 'POST',
                url: 'https://westus2.api.cognitive.microsoft.com/face/v1.0/detect',
                qs:{
                    returnFaceId: 'true',
                    returnFaceLandmarks: 'false',
                    recognitionModel: 'recognition_02',
                    returnRecognitionModel: 'false'
                },
                headers:{
                    'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: buff
            };

            request(options, function (error, response, 
                body) {
                if (error) {
                    console.log(error);
                    cb(error, null);
                } else if (typeof body == 'string') {
                    body = JSON.parse(body);
                    if (body.hasOwnProperty('error')){
                        cb(body, null);
                    } else {
                        cb(null, body);
                    }
                } else {
                    if (body.hasOwnProperty('error')) {
                        cb(body.error.message, null);
                    } else {
                        cb(null, body);
                    }
                }
            });
        });

    },
    'identify': (faceId, cb) => {
        var options = {
            method: 'POST',
            url: 'https://westus2.api.cognitive.microsoft.com/face/v1.0/identify',
            headers: {
                'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}`,
                'Content-Type': 'application/json'
            },
            body: {
                personGroupId: process.env.PERSON_GROUP,
                faceIds: [faceId],
                maxNumOfCandidatesReturned: 1,
                confidenceThreshold: 0.89
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) {
                cb(error, null);
            } else if (typeof body == 'string') {
                body = JSON.parse(body);
                if (body.hasOwnProperty('error')){
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            } else {
                if (body.hasOwnProperty('error')){
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            }
        });
    },
    'getFace': (personId, cb) => {
        var request = require("request");

        var options = {
            method: 'GET',
            url: `https://westus2.api.cognitive.microsoft.com/face/v1.0/persongroups/${process.env.PERSON_GROUP}/persons/${personId}`,
            headers: {
                'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}`
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                cb(error, null);
            } else if (typeof body == 'string') {
                body = JSON.parse(body);
                if (body.hasOwnProperty('error')){
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            } else {
                if (body.hasOwnProperty('error')){
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            }
        });

    },

    'createPerson': (empId, cb) => {
        var options = { 
            method: 'POST',
            url: `https://westus2.api.cognitive.microsoft.com/face/v1.0/persongroups/${process.env.PERSON_GROUP}/persons`,
            headers: { 
                'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}`,
                'Content-Type': 'application/json'
            },
            body: { 
                name: empId,
                userData: 'User-provided data attached to the person.'
            },
            json: true 
        };

        request(options, function (error, response, body) {
            if (error) {
                cb(error, null);
            } else if (typeof body == 'string') {
                body = JSON.parse(body);
                if (body.hasOwnProperty('error')){
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            } else {
                if (body.hasOwnProperty('error')){
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            }
        });
    },

    'addFace': (dataURL, personId, cb) => {
        dataURItoBuffer(dataURL, function (buff) {
            var options = { 
                method: 'POST',
                url: `https://westus2.api.cognitive.microsoft.com/face/v1.0/persongroups/${process.env.PERSON_GROUP}/persons/${personId}/persistedfaces`,
                headers: {
                    'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}`,
                    'Content-Type': 'application/octet-stream'//application/octet-stream 
                },
                body: buff
            };

            request(options, function (error, response, body) {
                console.log(body);
                if (error) {
                    cb(error, null);
                } else if (typeof body == 'string') {
                    body = JSON.parse(body);
                    if (body.hasOwnProperty('error')){
                        console.log('inside error');
                        cb(body, null);
                    } else {
                        cb(null, body);
                    }
                } else {
                    if (body.hasOwnProperty('error')){
                        cb(body, null);
                    } else {
                        cb(null, body);
                    }
                }
            });
        });
    },

    'train': (cb) => {
        var options = { 
            method: 'POST',
            url: `https://westus2.api.cognitive.microsoft.com/face/v1.0/persongroups/${process.env.PERSON_GROUP}/train`,
            headers: {
                'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}` 
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                cb(error, null);
            } else if (typeof body == 'string') {
                // body = JSON.parse(body);
                if (body.hasOwnProperty('error')){
                    console.log('inside error');
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            } else {

                if (body.hasOwnProperty('error')) {
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            }
        });
    },
    'deletePerson': (personGroupId, personId, cb) => {
        var request = require("request");

        var options = { 
            method: 'DELETE',
            url: 'https://westus2.api.cognitive.microsoft.com/face/v1.0/persongroups/'+ personGroupId+'/persons/' + personId,
            headers: {
                'Ocp-Apim-Subscription-Key': `${process.env.FACE_API_SUBSCRIPTION_KEY}` 
            } 
        };

        request(options, function (error, response, body) {
            if (error) {
                cb(error, null);
            } else if (typeof body.error != undefined && body != '') {
                console.log("!!!!!!!!!")
                console.log(body)
                body = JSON.parse(body);
                if (body.hasOwnProperty('error')){
                    console.log('inside error');
                    cb(body, null);
                } else {
                    cb(null, body);
                }
            } else {
                cb(null, body)
            }
        });

    }
}
