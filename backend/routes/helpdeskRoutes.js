const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const FAQ = require('../models/FAQ');
const verifyToken = require('../middleware/auth');

// ==========================================
// 🎟️ TICKET HUB APIs (With Live Analytics & SLA)
// ==========================================

// 1. Fetch All Tickets + On-The-Fly Advanced Analytics
router.get('/tickets', verifyToken, async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });

        // Calculate metrics dynamically
        const totalVolume = tickets.length;
        const openCount = tickets.filter(t => t.status === 'Open').length;
        const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
        const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

        let totalResolutionTime = 0;
        let resolvedWithTimeCount = 0;

        tickets.forEach(t => {
            if (t.resolvedAt) {
                const hours = Math.abs(t.resolvedAt - t.createdAt) / 36e5; // ms to hours
                totalResolutionTime += hours;
                resolvedWithTimeCount++;
            }
        });

        const avgResolutionTime = resolvedWithTimeCount > 0 
            ? (totalResolutionTime / resolvedWithTimeCount).toFixed(1) 
            : 0;

        res.status(200).json({
            tickets,
            analytics: { totalVolume, openCount, inProgressCount, resolvedCount, avgResolutionTime }
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch support logs", error: err.message });
    }
});

// 2. Change Ticket Status (Open -> In Progress -> Resolved -> Closed)
router.put('/tickets/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { status };

        if (status === 'Resolved' || status === 'Closed') {
            updateData.resolvedAt = new Date();
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ message: "Status matrix shifted", ticket: updatedTicket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Assign Ticket to Support Agent/Staff
router.put('/tickets/:id/assign', verifyToken, async (req, res) => {
    try {
        const { staffName } = req.body;
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id, 
            { assignedTo: staffName, status: 'In Progress' }, 
            { new: true }
        );
        res.status(200).json({ message: "Staff assigned successfully", ticket: updatedTicket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Append Chat Message to Ticket Reply Thread
router.post('/tickets/:id/reply', verifyToken, async (req, res) => {
    try {
        const { message, sender } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) return res.status(404).json({ message: "Ticket stream not found" });

        ticket.replies.push({ sender, message });
        if (ticket.status === 'Open') ticket.status = 'In Progress';

        await ticket.save();
        res.status(200).json({ message: "Message securely synced", ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 📚 FAQ & KNOWLEDGE BASE APIs
// ==========================================
router.post('/faqs', verifyToken, async (req, res) => {
    try {
        const newFaq = new FAQ(req.body);
        await newFaq.save();
        res.status(201).json({ message: "FAQ added successfully", faq: newFaq });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/faqs', verifyToken, async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        res.status(200).json(faqs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;