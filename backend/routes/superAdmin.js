const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Admin = require('../models/Admin');       
const Employee = require('../models/Employee'); 
const Ticket = require('../models/Ticket');
const SystemSetting = require('../models/SystemSetting');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "HRMS_SUPER_SECRET_KEY@_123";
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const twilio = require('twilio');
const Announcement = require('../models/Announcement');
// const nodemailer = require('nodemailer'); // Uncomment after installing
// ==========================================
// 📢 GET: Fetch Notification History & Logs
// ==========================================
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch announcements", error: err.message });
    }
});

// ==========================================
// 🚀 POST: Create & Send Announcement
// ==========================================
router.post('/announcements', async (req, res) => {
    try {
        const { title, message, priority, targetAudience, targetCompanies, channels, scheduledAt } = req.body;

        const newAnnouncement = new Announcement({
            title, message, priority, targetAudience, targetCompanies, channels,
            status: scheduledAt ? 'Scheduled' : 'Sent',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            sentAt: scheduledAt ? null : new Date()
        });

        await newAnnouncement.save();

        // 🚨 EMERGENCY BROADCAST LOGIC
        if (priority === 'Emergency') {
            console.log("!!! TRIGGERING EMERGENCY PROTOCOLS !!!");
            // Here you would immediately fire your SMS/Email functions bypassing normal queues
        }

        // 📧 EMAIL DISPATCH LOGIC (Example structure)
        if (channels.email && !scheduledAt) {
            // 1. Fetch SMTP settings from SystemSetting DB
            // 2. Setup Nodemailer transporter
            // 3. Find target user emails based on targetAudience
            // 4. Send emails
            console.log("Simulating Email Dispatch to targets...");
        }

        res.status(201).json({ message: "Announcement processed successfully!", announcement: newAnnouncement });
    } catch (err) {
        res.status(500).json({ message: "Failed to create announcement", error: err.message });
    }
});

// Razorpay Instance (Aap apne asli Test Keys Razorpay Dashboard se nikal kar yahan daal sakte ho baad mein)
const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_YOUR_KEY_HERE', // Ise abhi dummy hi rehne do ya apna test key daalo
    key_secret: 'YOUR_SECRET_HERE',
});

// 📁 Uploads folder automatically banao agar nahi hai toh
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// 📸 Multer Storage Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 🏢 1. GET: Saari Companies ki List fetch karna
// ==========================================
router.get('/companies', async (req, res) => {
    try {
        // Nayi companies sabse upar aayengi (-1)
        const companies = await Company.find().sort({ createdAt: -1 });
        res.status(200).json(companies);
    } catch (err) {
        res.status(500).json({ message: "Companies fetch karne mein error aaya", error: err.message });
    }
});

// ==========================================
// 🔒 2. PUT: Company ka Status Update karna (Active/Suspended)
// ==========================================
router.put('/companies/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true } // Update hone ke baad naya data return karega
        );
        res.status(200).json({ message: "Company status updated successfully!", company: updatedCompany });
    } catch (err) {
        res.status(500).json({ message: "Status update fail ho gaya", error: err.message });
    }
});

// ==========================================
// 🗑️ 3. DELETE: Company ko System se Delete karna
// ==========================================
router.delete('/companies/:id', async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Company permanently deleted!" });
    } catch (err) {
        res.status(500).json({ message: "Delete karne mein error aaya", error: err.message });
    }
});

// ==========================================
// ➕ 4. POST: Nayi Company Register karna (WITH PASSWORD GENERATION)
// ==========================================
router.post('/companies', upload.single('logo'), async (req, res) => {
    try {
        const { adminEmail } = req.body;
        
        // 1. Check karo ki is email se koi pehle se toh nahi hai
        const existingCompany = await Company.findOne({ adminEmail });
        if (existingCompany) {
            return res.status(400).json({ message: "Is email se company already registered hai!" });
        }

        // 🔐 2. Naya Password ko encrypt (hash) karo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt); // Default Password for new companies

        // 3. Data copy karo aur password attach karo
        const companyData = { 
            ...req.body,
            password: hashedPassword // Encrypted password ab database mein jayega
        };
        
        // 4. Logo attach karo agar hai
        if (req.file) {
            companyData.logo = `/uploads/${req.file.filename}`;
        }

        // 5. Save kar do
        const newCompany = new Company(companyData);
        await newCompany.save();
        
        res.status(201).json({ message: "Company registered successfully!", company: newCompany });
    } catch (err) {
        res.status(500).json({ message: "Company add karne mein error aaya", error: err.message });
    }
});

// ==========================================
// 💳 GET: Billing & Revenue Stats
// ==========================================
router.get('/billing-stats', async (req, res) => {
    try {
        const companies = await Company.find();
        
        let totalRevenue = 0;
        let planCounts = {
            'Free Trial': 0,
            'Starter': 0,
            'Business': 0,
            'Enterprise': 0
        };

        companies.forEach(comp => {
            // Sirf Active ya Pending companies ka hi bill count karna hai (Blacklisted/Suspended ka nahi)
            if (comp.status !== 'Blacklisted') {
                const plan = comp.subscriptionPlan || 'Free Trial';
                
                // Plan ka count badhao
                if (planCounts[plan] !== undefined) {
                    planCounts[plan] += 1;
                }

                // Asli prices ke hisaab se Revenue jodna
                if (plan === 'Starter') totalRevenue += 999;
                else if (plan === 'Business') totalRevenue += 2499;
                else if (plan === 'Enterprise') totalRevenue += 4999;
            }
        });

        res.status(200).json({ totalRevenue, planCounts });
    } catch (err) {
        res.status(500).json({ message: "Billing stats fetch failed", error: err.message });
    }
});
// ==========================================
// 👥 6. GET: Global User Management (All Users)
// ==========================================
router.get('/users', async (req, res) => {
    try {
        // 1. Saare Admins fetch karo
        const admins = await Admin.find({}, 'name email companyName hasPaidTier createdAt');
        
        // 2. Saare Employees/HRs fetch karo
        const employees = await Employee.find({}, 'name email role createdAt');

        // 3. Data format karo taaki frontend ko ek jaisa structure mile
        const formattedAdmins = admins.map(a => ({
            id: a._id,
            name: a.name,
            email: a.email,
            role: 'Admin',
            company: a.companyName || 'N/A',
            status: a.hasPaidTier ? 'Active' : 'Pending Payment',
            date: a.createdAt
        }));

        const formattedEmployees = employees.map(e => ({
            id: e._id,
            name: e.name,
            email: e.email,
            role: (e.role && e.role.toUpperCase()) || 'EMPLOYEE',
            company: 'Internal Staff', // Employee schema mein company mapping ke hisaab se
            status: 'Active',
            date: e.createdAt
        }));

        // 4. Dono arrays ko combine (jod) do
        const allUsers = [...formattedAdmins, ...formattedEmployees];

        // 5. Naye users sabse upar dikhane ke liye sort karo
        allUsers.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).json({ message: "Global users fetch karne mein error aaya", error: err.message });
    }
});
// ==========================================
// 🎟️ 7. GET & PUT: Support Tickets Management
// ==========================================
// Saari tickets fetch karna
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({ message: "Tickets fetch karne mein error aaya", error: err.message });
    }
});

// Kisi ek ticket ka status change karna (Open -> Resolved)
router.put('/tickets/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        res.status(200).json({ message: "Ticket status updated!", ticket: updatedTicket });
    } catch (err) {
        res.status(500).json({ message: "Ticket update fail ho gaya", error: err.message });
    }
});
// ==========================================
// ⚙️ 8. GET & PUT: Global System Settings
// ==========================================
// Settings fetch karna (Agar nahi hai toh default bana dega)
router.get('/settings', async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = new SystemSetting();
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json({ message: "Settings fetch failed", error: err.message });
    }
});
// ==========================================
// 📝 9. PUT: Edit Company Details & Logo Upload
// ==========================================
router.put('/companies/:id', upload.single('logo'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Agar nayi image aayi hai, toh uska rasta (path) save karo
        if (req.file) {
            updateData.logo = `/uploads/${req.file.filename}`;
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true } // Update hone ke baad naya data return karega
        );

        if (!updatedCompany) return res.status(404).json({ message: "Company nahi mili!" });

        res.status(200).json({ message: "Company details updated successfully!", company: updatedCompany });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});
// ==========================================
// 💳 10. POST: Razorpay Payment Gateway (Test)
// ==========================================
router.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR

        const options = {
            amount: amount * 100, // Razorpay amount ko paise (paisa) mein leta hai, isliye * 100
            currency: "INR",
            receipt: `receipt_test_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (err) {
        res.status(500).json({ message: "Razorpay order creation failed", error: err.message });
    }
});

// ==========================================
// 🕵️‍♂️ POST: Impersonate Company Admin (God Mode v2)
// ==========================================
// 🔗 Aapke team ke Admin model ko import kar rahe hain

router.post('/companies/:id/impersonate', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({ message: "Company database mein nahi mili!" });
        }

        if (company.status === 'Blacklisted') {
            return res.status(403).json({ message: "Cannot impersonate a Blacklisted company!" });
        }

        // 🔍 1. Check karo ki Team ke Admin Database mein iska HR exist karta hai ya nahi
        let hrAdmin = await Admin.findOne({ email: company.adminEmail });
        
        // 🛠️ 2. THE MASTERSTROKE: Agar HR exist nahi karta, toh auto-create kar do!
        if (!hrAdmin) {
            hrAdmin = new Admin({
                adminId: `HR-${Math.floor(Math.random() * 10000)}`,
                name: `${company.companyName} HR (System Auto)`,
                email: company.adminEmail,
                password: company.password, // SuperAdmin wala hash password use kar rahe hain
                companyName: company.companyName,
                phone: company.phone || "0000000000",
                panId: company.panNumber || "PENDING",
                gstId: company.gstNumber || "PENDING",
                hasPaidTier: true,
                selectedPlanName: company.subscriptionPlan || 'Free Trial',
                planPrice: '0'
            });
            await hrAdmin.save();
            console.log("📍 [God Mode]: Auto-provisioned missing HR Admin profile in Team Database.");
        }

        // 🪄 3. MAGIC: Ab Asli Admin ID se naya token generate karo
        const token = jwt.sign(
            { id: hrAdmin._id, role: 'admin', email: hrAdmin.email },
            process.env.JWT_SECRET || "HRMS_SUPER_SECRET_KEY@_123",
            { expiresIn: '2h' } 
        );

        res.status(200).json({ 
            message: `Successfully logged in as ${company.companyName} HR!`,
            token: token,
            role: 'admin'
        });

    } catch (err) {
        console.error("Impersonate Error:", err);
        res.status(500).json({ message: "Impersonation API crashed", error: err.message });
    }
});
// Settings update karna (Maintenance Mode & Modules)
router.put('/settings', async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = new SystemSetting(req.body);
        } else {
            // Update existing values
            settings.maintenanceMode = req.body.maintenanceMode;
            settings.maintenanceMessage = req.body.maintenanceMessage;
            settings.modules = req.body.modules;
        }
        
        const updatedSettings = await settings.save();
        res.status(200).json({ message: "System settings updated successfully!", settings: updatedSettings });
    } catch (err) {
        res.status(500).json({ message: "Settings update failed", error: err.message });
    }
});
// ==========================================
// 📢 GET: Fetch Announcements & Logs
// ==========================================
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch announcements", error: err.message });
    }
});

// ==========================================
// 🚀 POST: Broadcast Notification Engine
// ==========================================
router.post('/announcements', async (req, res) => {
    try {
        const { title, message, priority, targetAudience, channels, scheduledAt } = req.body;

        // 1. Fetch Global Settings for API Keys & SMTP
        const settings = await SystemSetting.findOne();
        if (!settings) return res.status(400).json({ message: "System settings not configured!" });

        // 2. Save Announcement to Database
        const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
        const newAnnouncement = new Announcement({
            title, 
            message, 
            priority, 
            targetAudience, 
            channels,
            status: isScheduled ? 'Scheduled' : 'Sent',
            scheduledAt: isScheduled ? new Date(scheduledAt) : null,
            sentAt: isScheduled ? null : new Date()
        });
        await newAnnouncement.save();

        // 3. Determine Target Audience Emails & Phone Numbers
        let targetEmails = [];
        let targetPhones = [];

        if (targetAudience === 'All') {
            const admins = await Admin.find({}, 'email phone');
            const employees = await Employee.find({}, 'email phone');
            targetEmails = [...admins.map(a => a.email), ...employees.map(e => e.email)];
            targetPhones = [...admins.map(a => a.phone), ...employees.map(e => e.phone)];
        } else if (targetAudience === 'Admins') {
            const admins = await Admin.find({}, 'email phone');
            targetEmails = admins.map(a => a.email);
            targetPhones = admins.map(a => a.phone);
        }

        // Clean up empty/null values
        targetEmails = targetEmails.filter(email => email);
        targetPhones = targetPhones.filter(phone => phone);

        // 4. Create the Dispatch Function
        const dispatchNotifications = async () => {
            console.log(`🚀 Dispatching Broadcast: ${title}`);

            // 📧 EMAIL DISPATCH (Nodemailer)
            if (channels.email && targetEmails.length > 0 && settings.smtpSettings?.host) {
                try {
                    const transporter = nodemailer.createTransport({
                        host: settings.smtpSettings.host,
                        port: settings.smtpSettings.port,
                        secure: settings.smtpSettings.port === 465, 
                        auth: {
                            user: settings.smtpSettings.user,
                            pass: settings.smtpSettings.password
                        }
                    });

                    await transporter.sendMail({
                        from: `"System Admin" <${settings.smtpSettings.user}>`,
                        to: targetEmails, // Sends as a bulk list (consider bcc for privacy in production)
                        subject: priority === 'Emergency' ? `🚨 URGENT: ${title}` : title,
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #312e81;">${title}</h2>
                                <p style="font-size: 16px; color: #333;">${message}</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="font-size: 12px; color: #999;">This is an automated system broadcast. Please do not reply.</p>
                            </div>
                        `
                    });
                    console.log("✅ Emails sent successfully!");
                } catch (emailErr) {
                    console.error("❌ Email Dispatch Failed:", emailErr.message);
                }
            }

            // 📱 SMS DISPATCH (Twilio Example)
            if (channels.sms && targetPhones.length > 0 && settings.smsSettings?.apiKey) {
                try {
                    // Assuming Twilio: apiKey stores 'AccountSID:AuthToken'
                    const [accountSid, authToken] = settings.smsSettings.apiKey.split(':'); 
                    const client = twilio(accountSid, authToken);

                    // Twilio requires looping through numbers for bulk SMS
                    for (const phone of targetPhones) {
                        await client.messages.create({
                            body: `${title}: ${message}`,
                            from: settings.smsSettings.senderId || '+1234567890',
                            to: phone
                        });
                    }
                    console.log("✅ SMS sent successfully!");
                } catch (smsErr) {
                    console.error("❌ SMS Dispatch Failed:", smsErr.message);
                }
            }

            // Mark as sent if it was scheduled
            if (isScheduled) {
                newAnnouncement.status = 'Sent';
                newAnnouncement.sentAt = new Date();
                await newAnnouncement.save();
            }
        };

        // 5. Execute or Schedule
        if (isScheduled) {
            schedule.scheduleJob(new Date(scheduledAt), dispatchNotifications);
            res.status(201).json({ message: "Broadcast scheduled successfully!", announcement: newAnnouncement });
        } else {
            // Do not await dispatchNotifications so the API responds instantly while emails send in background
            dispatchNotifications(); 
            res.status(201).json({ message: "Broadcast dispatched successfully!", announcement: newAnnouncement });
        }

    } catch (err) {
        res.status(500).json({ message: "Failed to process announcement", error: err.message });
    }
});
// ==========================================
// 📢 GET: Fetch Announcements & Logs
// ==========================================
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch announcements", error: err.message });
    }
});

// ==========================================
// 🚀 POST: Broadcast Notification Engine
// ==========================================
router.post('/announcements', async (req, res) => {
    try {
        const { title, message, priority, targetAudience, channels, scheduledAt } = req.body;

        // 1. Fetch Global Settings for API Keys & SMTP
        const settings = await SystemSetting.findOne();
        if (!settings) return res.status(400).json({ message: "System settings not configured!" });

        // 2. Save Announcement to Database
        const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
        const newAnnouncement = new Announcement({
            title, 
            message, 
            priority, 
            targetAudience, 
            channels,
            status: isScheduled ? 'Scheduled' : 'Sent',
            scheduledAt: isScheduled ? new Date(scheduledAt) : null,
            sentAt: isScheduled ? null : new Date()
        });
        await newAnnouncement.save();

        // 3. Determine Target Audience Emails & Phone Numbers
        let targetEmails = [];
        let targetPhones = [];

        if (targetAudience === 'All') {
            const admins = await Admin.find({}, 'email phone');
            const employees = await Employee.find({}, 'email phone');
            targetEmails = [...admins.map(a => a.email), ...employees.map(e => e.email)];
            targetPhones = [...admins.map(a => a.phone), ...employees.map(e => e.phone)];
        } else if (targetAudience === 'Admins') {
            const admins = await Admin.find({}, 'email phone');
            targetEmails = admins.map(a => a.email);
            targetPhones = admins.map(a => a.phone);
        }

        // Clean up empty/null values
        targetEmails = targetEmails.filter(email => email);
        targetPhones = targetPhones.filter(phone => phone);

        // 4. Create the Dispatch Function
        const dispatchNotifications = async () => {
            console.log(`🚀 Dispatching Broadcast: ${title}`);

            // 📧 EMAIL DISPATCH (Nodemailer)
            if (channels.email && targetEmails.length > 0 && settings.smtpSettings?.host) {
                try {
                    const transporter = nodemailer.createTransport({
                        host: settings.smtpSettings.host,
                        port: settings.smtpSettings.port,
                        secure: settings.smtpSettings.port === 465, 
                        auth: {
                            user: settings.smtpSettings.user,
                            pass: settings.smtpSettings.password
                        }
                    });

                    await transporter.sendMail({
                        from: `"System Admin" <${settings.smtpSettings.user}>`,
                        to: targetEmails, // Sends as a bulk list (consider bcc for privacy in production)
                        subject: priority === 'Emergency' ? `🚨 URGENT: ${title}` : title,
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #312e81;">${title}</h2>
                                <p style="font-size: 16px; color: #333;">${message}</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="font-size: 12px; color: #999;">This is an automated system broadcast. Please do not reply.</p>
                            </div>
                        `
                    });
                    console.log("✅ Emails sent successfully!");
                } catch (emailErr) {
                    console.error("❌ Email Dispatch Failed:", emailErr.message);
                }
            }

            // 📱 SMS DISPATCH (Twilio Example)
            if (channels.sms && targetPhones.length > 0 && settings.smsSettings?.apiKey) {
                try {
                    // Assuming Twilio: apiKey stores 'AccountSID:AuthToken'
                    const [accountSid, authToken] = settings.smsSettings.apiKey.split(':'); 
                    const client = twilio(accountSid, authToken);

                    // Twilio requires looping through numbers for bulk SMS
                    for (const phone of targetPhones) {
                        await client.messages.create({
                            body: `${title}: ${message}`,
                            from: settings.smsSettings.senderId || '+1234567890',
                            to: phone
                        });
                    }
                    console.log("✅ SMS sent successfully!");
                } catch (smsErr) {
                    console.error("❌ SMS Dispatch Failed:", smsErr.message);
                }
            }

            // Mark as sent if it was scheduled
            if (isScheduled) {
                newAnnouncement.status = 'Sent';
                newAnnouncement.sentAt = new Date();
                await newAnnouncement.save();
            }
        };

        // 5. Execute or Schedule
        if (isScheduled) {
            schedule.scheduleJob(new Date(scheduledAt), dispatchNotifications);
            res.status(201).json({ message: "Broadcast scheduled successfully!", announcement: newAnnouncement });
        } else {
            // Do not await dispatchNotifications so the API responds instantly while emails send in background
            dispatchNotifications(); 
            res.status(201).json({ message: "Broadcast dispatched successfully!", announcement: newAnnouncement });
        }

    } catch (err) {
        res.status(500).json({ message: "Failed to process announcement", error: err.message });
    }
});
module.exports = router;