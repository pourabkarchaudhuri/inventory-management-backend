const routes = require('express').Router();
const allocationModel = require('./model/allocation');
const employeeModel = require('./model/employee');
const deviceModel = require('./model/devices')
const faceAPI = require('./services/faceAPI');
const mailHandler = require('./services/mailer')

require('dotenv').config();


function ResponseBuilder(result, message){
  let response = {
    message: message,
    result: result
  }
  return response;
}

routes.get('/status', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

// Get all allocated devices list
routes.get('/allocate', async (req, res) => {
    const allocatedDevices = await allocationModel.find({});
  
    try {
      res.status(200).send(ResponseBuilder(allocatedDevices, `List of all ${allocatedDevices.length} allocated devices`));
    } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
    }
  });

// Get all allocated devices to one employee ID
routes.get('/allocate/:id', async (req, res) => {
  const allocatedDevices = await allocationModel.find({employeeId:req.params.id, allocatedStatus: true});

  try {
    if(allocatedDevices.length == 0){ 
      //No results
      res.status(404).send(ResponseBuilder(null, `No allocated devices mapped to employee with employeeID ${req.params.id}`));
    }
    else{
      res.status(200).send(ResponseBuilder(allocatedDevices, `List of all active ${allocatedDevices.length} devices allocated to employeeID ${req.params.id}`));
    }
    
  } catch (err) {
    res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

routes.post('/allocate', async (req, res) => {
    console.log(JSON.stringify(req.body))
    

    try {
        //Search devices by serial number and employee with empId
        let deviceToBeAllocated = await deviceModel.find({serialNumber:req.body.serialNumber, isAllocated:false});
        let employeeToWhomAllocated = await employeeModel.find({employeeId:req.body.employeeId});
        // console.log(deviceToBeAllocated)
        console.log("Device to be Allocated : " + JSON.stringify(deviceToBeAllocated))
        
        if(deviceToBeAllocated.length == 0){
          res.status(404).send(ResponseBuilder(null, `The device with serial number ${req.body.serialNumber} is not available for allocation`));
        }
        else{
          // No device exists
          if(employeeToWhomAllocated.length == 0){
            // No employee exists
            res.status(404).send(ResponseBuilder(null, `There is no employee with employeeId ${req.body.employeeId}`));
          }
          else{
            // Employee exists
            let allocatedDevices = new allocationModel({
              deviceName: deviceToBeAllocated[0].deviceName,
              employeeId: req.body.employeeId,
              serialNumber: deviceToBeAllocated[0].serialNumber,
              employeeName: employeeToWhomAllocated[0].employeeName,
              allocatedStatus: true
            });
            //Update device collection's allocation status
            await deviceModel.findByIdAndUpdate({ _id: deviceToBeAllocated[0]._id }, {isAllocated:true})
            //Save payload to allocation Collection
            await allocatedDevices.save();
            console.log("Sending mail...")
            //Send Mail

            

            const mailerService =  new mailHandler();

            let msg = `Hi ${employeeToWhomAllocated[0].employeeName},<br><br>Device <b>${deviceToBeAllocated[0].deviceName}</b> with serial number <b>${deviceToBeAllocated[0].serialNumber}</b> is allocated to you.<br><br>Remember to deallocate by EOD!<br><br>Thanks,<br>YODA - Device Manager`

            mailerService.Sendmail(employeeToWhomAllocated[0].email, process.env.MANAGER, msg, 'Device Allocation Alert', (err, result) => {
                console.log(`Mail sent : ${JSON.stringify(result)}`)
            })
            res.status(200).send(ResponseBuilder(allocatedDevices, `Device ${deviceToBeAllocated[0].deviceName} with serial number ${deviceToBeAllocated[0].serialNumber} is allocated to employeeID ${req.body.employeeId}`));
          }
          
        }
        

        
    } catch (err) {
        res.status(500).send(ResponseBuilder(err, 'error'));
    }
});

// deallocate by emp id
routes.post('/deallocate', async (req, res) => {
  console.log(JSON.stringify(req.body))
  

  try {
      //Search devices by serial number and employee with empId
      let allocationDetails = await allocationModel.find({serialNumber:req.body.serialNumber, allocatedStatus: true})
      let deviceToBeAllocated = await deviceModel.find({serialNumber:req.body.serialNumber, isAllocated:true});
      let employeeToWhomAllocated = await employeeModel.find({employeeId:req.body.employeeId});
      // console.log(deviceToBeAllocated)
      // console.log("Allocated Details : " + JSON.stringify(allocationDetails))
      // console.log("Device to be De-Allocated : " + JSON.stringify(deviceToBeAllocated))
      // console.log("Employee to whom allocated : " + JSON.stringify(employeeToWhomAllocated))

      if(deviceToBeAllocated.length == 0){
        res.status(404).send(ResponseBuilder(null, `The device with serial number ${req.body.serialNumber} is not allocated currently with employeeId ${employeeToWhomAllocated[0].employeeId}`));
      }
      else{
        // No device exists
        if(employeeToWhomAllocated.length == 0){
          // No employee exists
          res.status(404).send(ResponseBuilder(null, `There is no employee with employeeId ${req.body.employeeId}`));
        }
        else{
          // Employee exists
          // let deallocatedDevices = new allocationModel({
          //   allocatedStatus: false,
          //   deallocationTime: Date.now()
          // });
          //Update device collection's allocation status
          await allocationModel.findByIdAndUpdate({ _id: allocationDetails[0]._id }, {allocatedStatus:false, deallocatedTime: Date.now()})
          await deviceModel.findByIdAndUpdate({ _id: deviceToBeAllocated[0]._id }, {isAllocated:false})
          //Save payload to allocation Collection
          // await allocatedDevices.save();
          console.log("Sending mail...")
          const mailerService =  new mailHandler();
          let msg = `Hi ${employeeToWhomAllocated[0].employeeName},<br><br>Device <b>${deviceToBeAllocated[0].deviceName}</b> with serial number <b>${deviceToBeAllocated[0].serialNumber}</b> is deallocated from you.<br><br>Thanks,\nYODA - Device Manager`

          mailerService.Sendmail(employeeToWhomAllocated[0].email, process.env.MANAGER, msg, 'Device Deallocation Alert', (err, result) => {
              console.log(`Mail sent : ${JSON.stringify(result)}`)
          })
          res.status(200).send(ResponseBuilder(null, `Device ${deviceToBeAllocated[0].deviceName} with serial number ${deviceToBeAllocated[0].serialNumber} is deallocated from employeeID ${req.body.employeeId}`));
        }
        
      }
      

      
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});
//EMPLOYEE CRUD ROUTES
//employee get all
routes.get('/employee', async (req, res) => {
  const allEmployees = await employeeModel.find({});
  
  try {
    res.status(200).send(ResponseBuilder(allEmployees, `List of all ${allEmployees.length} employees`));
  } catch (err) {
    res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

//employee get by emp ID
routes.get('/employee/:id', async (req, res) => {
  const employee = await employeeModel.find({employeeId:req.params.id});
  
  try {
    if(employee.length == 0){
      //No results
      res.status(404).send(ResponseBuilder(null, `No record of employee with empID ${req.params.id}`));
    }
    else{
      res.status(200).send(ResponseBuilder(employee, `Details of employee with empID ${req.params.id}`));
    }
    
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

// create new employee
routes.post('/employee', async (req, res) => {
  console.log(JSON.stringify(req.body))
  const employeeDetails = new employeeModel(req.body);

  try {
      await employeeDetails.save();
      res.status(200).send(ResponseBuilder(employeeDetails, `New employee created`));
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

// update by emp id
routes.put('/employee/:id',async (req,res) => {
 
  try {
    let employee = await employeeModel.find({employeeId:req.params.id});
    if(employee.length == 0){
      //No record, so create new
      const employeeDetails = new employeeModel(req.body);
      await employeeDetails.save();
      res.status(200).send(ResponseBuilder(employeeDetails, `No prior record found for ${req.params.id}, so new employee created`));
    }
    else{
      //Record exists
      await employeeModel.findByIdAndUpdate({ _id: employee[0]._id }, req.body)
      res.status(200).send(ResponseBuilder([req.body], `Updated details for employee with empID ${req.params.id}`));
    }
    
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});


// delete by emp id
routes.delete('/employee/:id', async (req, res) => {
    try {
      let employee = await employeeModel.find({employeeId:req.params.id});
      // console.log(employee[0]._id)
      employee = await employeeModel.findByIdAndDelete(employee[0]._id)
      // await employeeModel.findByIdAndDelete
  
      if (!employee) res.status(404).send(ResponseBuilder(null, `No employee with empId ${req.params.id} exists`))
      res.status(200).send(ResponseBuilder(null, `Deleted employee with empId ${req.params.id}`))
    } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'))
    }
});

//DEVICE CRUD ROUTES
//devices get all
routes.get('/inventory', async (req, res) => {
  const allDevices = await deviceModel.find({});
  
  try {
    res.status(200).send(ResponseBuilder(allDevices, `List of all ${allDevices.length} devices`));
  } catch (err) {
    res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

routes.get('/device', async (req, res) => {
  // const allDevices = await deviceModel.find({});
  const activeUnallocatedDevices = await deviceModel.find({inMaintenance:false, isAllocated:false});
  try {
    res.status(200).send(ResponseBuilder(activeUnallocatedDevices, `List of all ${activeUnallocatedDevices.length} active unallocated devices`));
  } catch (err) {
    res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

//device get by device ID
routes.get('/device/:id', async (req, res) => {
  const device = await deviceModel.find({_id: req.params.id.toString()});
  
  try {
    if(device.length == 0){
      //No results
      res.status(404).send(ResponseBuilder(null, `No record of device with id ${req.params.id}`));
    }
    else{
      res.status(200).send(ResponseBuilder(device, `Details of device with id ${req.params.id}`));
    }
    
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

// create new device
routes.post('/device', async (req, res) => {
  console.log(JSON.stringify(req.body))
  const deviceDetails = new deviceModel(req.body);

  try {
      await deviceDetails.save();
      res.status(200).send(ResponseBuilder(deviceDetails, `New device created`));
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

// update by device id
routes.put('/device/:id',async (req,res) => {
 
  try {
    let device = await deviceModel.find({_id:req.params.id});
    if(device.length == 0){
      //No record, so create new
      const deviceDetails = new deviceModel(req.body);
      await deviceDetails.save();
      res.status(200).send(ResponseBuilder(deviceDetails, `No prior record found for ${req.params.id}, so new device created`));
    }
    else{
      //Record exists
      await deviceModel.findByIdAndUpdate({ _id: device[0]._id }, req.body)
      res.status(200).send(ResponseBuilder([req.body], `Updated details for device with deviceId ${req.params.id}`));
    }
    
  } catch (err) {
      res.status(500).send(ResponseBuilder(err, 'error'));
  }
});

// delete by device id
routes.delete('/device/:id', async (req, res) => {
  try {
    // let device = await deviceModel.find({_id:req.params.id});
    // console.log(employee[0]._id)
    device = await deviceModel.findByIdAndDelete(req.params.id)
    // await employeeModel.findByIdAndDelete

    if (!device) res.status(404).send(ResponseBuilder(null, `No device with deviceId ${req.params.id} exists`))
    res.status(200).send(ResponseBuilder(null, `Deleted device with deviceId ${req.params.id}`))
  } catch (err) {
    res.status(500).send(ResponseBuilder(err, 'error'))
  }
});



routes.post('/recognize', (req, res) => {
  // get face and recognize
  faceAPI.recognizeFace(req.body.image, (err, result) => {
    console.log(result);
    res.send(result);
  });
})

routes.post('/trainperson', (req, res) => {
  faceAPI.registerFace(req.body.image, req.body.empId.toString(), (err, result) => {
    console.log(result);
    if (err) {
      res.status(503).send(err);
    } else {
      res.send(result);
    }
  });
});
module.exports = routes;