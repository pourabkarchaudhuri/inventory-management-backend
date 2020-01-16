const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true
  },
  employeeId: {
    type: Number,
    required:true,
    validate(value) { 
      if (value <= 0) throw new Error("Employee ID cannot be negative or zero");
    }
  },
  employeeName:{
    type:String,
    required:true
  },
  serialNumber: {
    type: String,
    required: true
  },
  allocatedTime:{
    type: Date, default:  () => Date.now(),
  },
  deallocatedTime:{
    type:Date,
    default: null
  },
  allocatedStatus:{
    type: Boolean,
    default: false,
    required: true
  }
},
{
  collection: 'allocations'
});

const Allocation = mongoose.model("Allocation", AllocationSchema);
module.exports = Allocation;