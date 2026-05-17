const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  // Core Identity
  empId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  gender: { type: String, require: true, trim: true },
  age: { type: Number, required:true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  
  // Role separates HR from standard staff
  role: { type: String, required: true, enum: ['employee', 'hr'], default: 'employee' },
  department: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },

  // Profile Specifics
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  profilePhoto: { type: String, default: null },

  // Background
  previousCompany: { type: String, default: 'None' },
  yearsOfExperience: { type: String, default: '0 Years' },
  Admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' } // The specific Admin who hired them
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);