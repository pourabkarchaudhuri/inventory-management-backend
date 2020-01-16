var path = require('path');
const mongoose = require('mongoose');
const dbConfig = require('../config/database.config');
const deviceModel = require('./model/devices');
const csvFilePath= 'DevicesList.csv'
const csv=require('csvtojson')
csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
    // console.log(JSON.stringify(jsonObj));
    mongoose.Promise = global.Promise;

    mongoose.connect(dbConfig.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Successfully connected to the database");    
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
    setTimeout(()=>{
        console.log("Triggering Push Now!");
        jsonObj.forEach((element)=>{
            setTimeout(()=>{
                pushToDatabase(element, (error, result)=>{
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log(result)
                    }
                })
            },5000)
        })
        // const employees = new employeeModel(req.body);

        // try {
        //     await employees.save();
        //     res.send(employees);
        // } catch (err) {
        //     res.status(500).send(err);
        // }
        
    }, 5000)
    
    /**
     * [
     * 	{a:"1", b:"2", c:"3"},
     * 	{a:"4", b:"5". c:"6"}
     * ]
     */ 
})


function pushToDatabase(element, callback){
    console.log(element)
    let payload = {
        deviceName: element.deviceName,
        macAddress: element.macAddress,
        serialNumber: element.serialNumber,
        category: element.category,
        procurementNumber: element.procurementNumber,
        procurementDate: element.procurementDate,
        comments: element.comments
    }
    const devices = new deviceModel(payload);

    try {
        devices.save();
        console.log(`Pushed data of device name ${payload.deviceName}`)
        callback(null, `${payload.deviceName} successfully pushed`)
    } catch (err) {
        console.log(`Error pushing date of device name ${payload.deviceName}`)
        callback(error, null);
    }
}
// Async / await usage
// const jsonArray=await csv().fromFile(csvFilePath);