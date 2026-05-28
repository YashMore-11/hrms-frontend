const express = require('express');
const router = express.Router();
const SecurityLog = require('../models/SecurityLog');
const UserSession = require('../models/UserSession');
const IpRule = require('../models/IpRule');
const verifyToken = require('../middleware/auth');

// ==========================================
// 📜 AUDIT TRAIL & LOGS STREAM (With Dynamic Filters)
// ==========================================
router.get('/logs', verifyToken, async (req, res) => {
    try {
        const { category, userRole, companyName } = req.query;
        let queryFilter = {};

        // Dynamic Filtering Core
        if (category) queryFilter.category = category;
        if (userRole) queryFilter.userRole = userRole;
        if (companyName) queryFilter.companyName = companyName;

        const logs = await SecurityLog.find(queryFilter).sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: "Failed to pull security logs", error: err.message });
    }
});

// ==========================================
// 👥 LIVE SESSIONS & FORCE LOGOUT ENGINE
// ==========================================

// Get All Live Sessions
router.get('/sessions', verifyToken, async (req, res) => {
    try {
        const activeSessions = await UserSession.find({ isActive: true }).sort({ updatedAt: -1 });
        res.status(200).json(activeSessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Force Terminate Any Active Session (Force Logout)
router.delete('/sessions/:id', verifyToken, async (req, res) => {
    try {
        await UserSession.findByIdAndDelete(req.params.id);
        
        // Push this termination inside audit logs trail
        await SecurityLog.create({
            category: 'ADMIN_ACTION',
            details: `Forced manual session termination for instance ID: ${req.params.id}`,
            severity: 'Warning'
        });

        res.status(200).json({ message: "Session forcefully terminated inside matrix" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 🛡️ IP FIREWALL MANAGEMENT (Whitelist / Blacklist)
// ==========================================

// Fetch Rules
router.get('/ip-rules', verifyToken, async (req, res) => {
    try {
        const rules = await IpRule.find().sort({ createdAt: -1 });
        res.status(200).json(rules);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add New IP Rule Constraints
router.post('/ip-rules', verifyToken, async (req, res) => {
    try {
        const { ipAddress, ruleType, reason } = req.body;
        const newRule = new IpRule({ ipAddress, ruleType, reason });
        await newRule.save();

        // Audit Trail entry
        await SecurityLog.create({
            category: 'IP_RULE_CHANGE',
            details: `Configured ${ruleType} rule policy for network node: ${ipAddress}`,
            severity: 'Info'
        });

        res.status(201).json({ message: "IP policy committed successfully", rule: newRule });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove Rule Constraint
router.delete('/ip-rules/:id', verifyToken, async (req, res) => {
    try {
        await IpRule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "IP rule context flushed." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 🚨 MOCK TRIGGER (Testing purpose for Alerts, Exports & Fails)
// ==========================================
router.post('/trigger-mock-event', verifyToken, async (req, res) => {
    try {
        const { category, details, severity } = req.body;
        const mockLog = await SecurityLog.create({ category, details, severity });
        res.status(201).json({ message: "Mock compliance telemetry injected", log: mockLog });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;