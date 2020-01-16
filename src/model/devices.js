const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true
  },
  macAddress: {
    type: String,
    uppercase: true,
    default:null
  },
  serialNumber: {
    type: String,
    uppercase: true,
    default:null
  },
  category:{
    type: String,
    required: true
  },
  procurementNumber:{
    type: String,
    uppercase: true,
    default:null
  },
  procurementDate:{
    type: Date,
    default: null
  },
  comments:{
    type: String,
    default: null
  },
  inMaintenance:{
    type: Boolean,
    default: false
  },
  isAllocated:{
    type:Boolean,
    default: false
  }
},
{
  collection: 'devices'
});

const Device = mongoose.model("Device", DeviceSchema);
module.exports = Device;