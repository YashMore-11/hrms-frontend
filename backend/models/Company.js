const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: { 
        type: String, 
        required: true 
    },
    adminEmail: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone: { 
        type: String 
    },
    subscriptionPlan: { 
        type: String, 
        enum: ['Free Trial', 'Starter', 'Business', 'Enterprise'], 
        default: 'Free Trial' 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Suspended', 'Inactive'], 
        default: 'Active' 
    },
    totalEmployees: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); // timestamps automatically createdAt aur updatedAt add kar dega

module.exports = mongoose.model('Company', companySchema);