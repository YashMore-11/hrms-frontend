const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    companyName: { 
        type: String, 
        required: true 
    },
    adminEmail: { 
        type: String, 
        required: true 
    },
    // Aapka purana field - Enums updated as per Point 9 requirements (Bugs/Feedback added)
    issueType: {
        type: String,
        enum: ['Billing', 'Technical', 'Account', 'Feedback', 'Feature Request', 'Other'],
        default: 'Technical'
    },
    title: {
        type: String,
        default: 'Support Ticket Request'
    },
    description: { 
        type: String, 
        required: true 
    },
    // Status updated to include 'Closed' state as requested
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
        default: 'Open' 
    },
    // 👥 Ticket assignment to support staff
    assignedTo: { 
        type: String, 
        default: 'Unassigned' 
    },
    // 📶 Priority Management
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Urgent'], 
        default: 'Medium' 
    },
    // 💬 Live Chat & Reply Thread backup inside ticket
    replies: [{
        sender: { type: String, required: true }, // 'SuperAdmin' ya 'CompanyAdmin'
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    // ⏱️ SLA Tracking & Resolution Metrics
    resolvedAt: { type: Date },
    slaHours: { type: Number, default: 24 } // Default 24 Hours resolution target

}, { timestamps: true }); 

module.exports = mongoose.model('Ticket', ticketSchema);