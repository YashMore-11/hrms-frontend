const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    // 🛑 Global System Controls
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { 
        type: String, 
        default: 'System is currently undergoing scheduled maintenance. Please check back soon.' 
    },
    
    // 🧩 Module Toggles (Global)
    modules: {
        attendance: { type: Boolean, default: true },
        leave: { type: Boolean, default: true },
        payroll: { type: Boolean, default: true },
        performance: { type: Boolean, default: false },
        recruitment: { type: Boolean, default: false }
    },

    // ⚖️ Legal & Compliance (From your Settings Tab)
    termsAndConditions: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },

    // 📧 Notification Gateways (For Announcements)
    smtpSettings: {
        host: { type: String, default: '' },
        port: { type: Number, default: 587 },
        user: { type: String, default: '' },
        password: { type: String, default: '' }
    },
    smsSettings: {
        provider: { type: String, default: 'Twilio' }, // e.g., Twilio, Fast2SMS
        apiKey: { type: String, default: '' },
        senderId: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);