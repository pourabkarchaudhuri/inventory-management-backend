const azureHandler = require('./azureHandler');

module.exports = {
    "recognizeFace": (image, cb) => {
        azureHandler.detect(image, (err, rekData) => {
            if (err) {
                console.log('error returned from DETECT API' + err);
                cb({
                    status: 400,
                    error: 'There is error from face API',
                    message: err

                }, null);
            } else {
                if (rekData.length == 0) {
                    // there are no face in image at all render camera capture page again
                    console.log("No face at all");
                    cb({
                        status: 400,
                        error: 'no face is there in image',
                        message: err

                    }, null);
                } else if (rekData.length > 1) {
                    console.log("More than one face in image");
                    cb({
                        status: 400,
                        error: 'there are more than one face in image',
                        message: error
                    }, null);
                } else {
                    azureHandler.identify(rekData[0].faceId, (error, identifyResult) => {
                        console.log(identifyResult);
                        if (error) {
                            console.log(error);
                            cb({
                                status: 400,
                                error: "There is error from face API",
                                message: error,

                            }, null);
                        } else {
                            if (identifyResult[0].candidates.length == 0) {
                                //there is a photo but person is not identified or not trained, render OTP page.
                                console.log('person is not registered');
                                cb({
                                    status: 400,
                                    error: 'person not registered or There is error from face API',
                                    message: err

                                }, null);
                            } else {
                                //PersonId received third API call to get Name
                                // console.log(identifyResult[0].candidates[0].personId);
                                azureHandler.getFace(identifyResult[0].candidates[0].personId, (faceError, finalResponse) => {
                                    if (faceError) {
                                        console.log(faceError);
                                        cb({
                                            status: 400,
                                            error: 'There is error from face API',
                                            message: err

                                        }, null);
                                    } else {
                                        cb(null, {
                                            status: 200,
                                            error: null,
                                            message: finalResponse
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    },
    "registerFace": (imageData, empId, cb) => {
        azureHandler.detect(imageData, (err, rekData) => {
            if (err) {
                console.log('error returned from DETECT API' + err);
                cb({
                    status: 400,
                    error: 'There is error from face API',
                    message: err
                }, null);
            } else {
                azureHandler.identify(rekData[0].faceId, (error, identifyResult) => {
                    console.log(identifyResult);
                    if (error) {
                        cb({
                            status: 400,
                            error: "There is error from face API",
                            message: error,
                        }, null);
                    } else {
                        if (identifyResult[0].candidates.length === 0) {
                            azureHandler.createPerson(empId.trim().toString(), (err, data) => {
                                if (err) {
                                    console.log(`Error in indexing face of ${empId}`, err);
                                    cb({
                                        status: 400,
                                        error: 'There is error from face API',
                                        message: err
                                    }, null);
                                } else {
                                    azureHandler.addFace(req.body.imageData, data.personId, (error, result) => {
                                        if (error) {
                                            console.log(`Error in indexing face of ${empId}`, error);
                                            cb({
                                                status: 400,
                                                error: 'There is error from face API',
                                                message: error
                                            }, null);
                                        } else if (result.hasOwnProperty('persistedFaceId')) {

                                            // Training the personGroup after adding the face.
                                            azureHandler.train((trainError, trainResult) => {
                                                if (trainError) {
                                                    console.log(`Error in Training`, JSON.stringify(trainError));
                                                    cb({
                                                        status: 400,
                                                        error: 'There is error in training.',
                                                        message: err
                                                    }, null);
                                                } else {
                                                    cb(null, {
                                                        status: 200,
                                                        error: null,
                                                        message: 'Training is successful, employee is added to the face API personGroup.'
                                                    });
                                                }
                                            })
                                        } else {
                                            console.log('error');
                                            cb({
                                                status: 400,
                                                error: 'There is error in face API.',
                                                message: err
                                            }, null);
                                        }
                                    })
                                }
                            })
                        } else {
                            // personId is there adding face to the person.
                            azureHandler.addFace(imageData, identifyResult[0].candidates[0].personId, (error, result) => {
                                if (error) {
                                    console.log(`Error in indexing face of ${empId}`, error);
                                    cb({
                                        status: 400,
                                        error: 'There is error in face API.',
                                        message: err
                                    }, null);
                                } else if (result.hasOwnProperty('persistedFaceId')) {
                                    azureHandler.train((trainError, trainResult) => {
                                        if (trainError) {
                                            console.log(`Error in Training`, JSON.stringify(trainError));
                                            cb({
                                                status: 400,
                                                error: 'There is error in training.',
                                                message: err
                                            }, null);
                                        } else {
                                            console.log("Training Done @@@@@@@@@@@");
                                            cb(null, {
                                                status: 200,
                                                error: null,
                                                message: "Training is successful, employee is added to the face API personGroup."
                                            });
                                        }
                                    });
                                } else {
                                    console.log('error');
                                }
                            })
                        }
                    }
                });
            }
        });
    }
}