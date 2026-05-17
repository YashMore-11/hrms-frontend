const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyStartDate: {
    type: Date,
    required: true
  },
  branchLocation: {
    type: String,
    required: true,
    trim: true
  },
  employeeQuotaTarget: {
    type: Number,
    default: 0
  },
  hasPaidTier: {
    type: Boolean,
    default: false
  },

  selectedPlanName: {
    type: String,
    default: 'None',
    trim: true
  },
  planPrice: {
    type: String,
    default: '0',
    trim: true
  },

  Employee: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);