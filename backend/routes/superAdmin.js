const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Admin = require('../models/Admin');       
const Employee = require('../models/Employee'); 
const Ticket = require('../models/Ticket');

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
// ➕ 4. POST: Nayi Company Register karna
// ==========================================
router.post('/companies', async (req, res) => {
    try {
        const { companyName, adminEmail, phone, subscriptionPlan } = req.body;
        
        // Check agar email pehle se exist karti hai
        const existingCompany = await Company.findOne({ adminEmail });
        if (existingCompany) {
            return res.status(400).json({ message: "Is email se company already registered hai!" });
        }

        const newCompany = new Company({
            companyName,
            adminEmail,
            phone,
            subscriptionPlan
        });

        await newCompany.save();
        res.status(201).json({ message: "Company successfully added!", company: newCompany });
    } catch (err) {
        res.status(500).json({ message: "Company add karne mein error aaya", error: err.message });
    }
});

// ==========================================
// 💳 5. GET: Subscription & Billing Stats
// ==========================================
router.get('/billing-stats', async (req, res) => {
    try {
        // Sirf unhi companies ko lenge jo 'Active' hain
        const companies = await Company.find({ status: 'Active' });

        // Har plan ka price set karte hain
        const planPrices = {
            'Free Trial': 0,
            'Starter': 1499,
            'Business': 5999,
            'Enterprise': 24999
        };

        let totalRevenue = 0;
        let planCounts = { 'Free Trial': 0, 'Starter': 0, 'Business': 0, 'Enterprise': 0 };

        companies.forEach(comp => {
            const plan = comp.subscriptionPlan || 'Free Trial';
            if (planCounts[plan] !== undefined) {
                planCounts[plan] += 1;
                totalRevenue += planPrices[plan];
            }
        });

        res.status(200).json({
            totalRevenue,
            planCounts
        });
    } catch (err) {
        res.status(500).json({ message: "Billing stats fetch karne mein error aaya", error: err.message });
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
module.exports = router;