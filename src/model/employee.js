const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employeeName: {
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
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true,
    validate(value) { 
        if (value <= 0) throw new Error("Phone Number ID cannot be negative or zero");
      }
  }
},
{
  collection: 'employees'
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;