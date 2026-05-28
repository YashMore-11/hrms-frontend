const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['Normal', 'Urgent', 'Emergency'], default: 'Normal' },
    targetAudience: { type: String, enum: ['All', 'Specific Companies', 'Specific Users'], default: 'All' },
    targetCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }], // If specific
    channels: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true }
    },
    status: { type: String, enum: ['Draft', 'Scheduled', 'Sent'], default: 'Sent' },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    readReceipts: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId }, 
        readAt: { type: Date, default: Date.now } 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);