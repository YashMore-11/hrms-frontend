const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const verifyToken = require('../middleware/auth'); // Check kar lena aapka auth.js file isi path par hai na

// ==========================================
// 🔔 GET: Fetch User's In-App Notifications
// ==========================================
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role; 

        const query = {
            status: 'Sent',
            'channels.inApp': true,
            $or: [
                { targetAudience: 'All' }
            ]
        };

        if (userRole === 'admin' || userRole === 'Admin') {
            query.$or.push({ targetAudience: 'Admins' });
        }

        const announcements = await Announcement.find(query).sort({ createdAt: -1 }).limit(20);

        const formattedNotifications = announcements.map(ann => {
            const isRead = ann.readReceipts.some(receipt => receipt.userId.toString() === userId);
            return {
                id: ann._id,
                title: ann.title,
                message: ann.message,
                priority: ann.priority,
                date: ann.createdAt,
                isRead: isRead
            };
        });

        res.status(200).json(formattedNotifications);
    } catch (err) {
        res.status(500).json({ message: "Failed to load notifications", error: err.message });
    }
});

// ==========================================
// 👀 PUT: Mark Notification as Read
// ==========================================
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        await Announcement.findByIdAndUpdate(
            req.params.id,
            { 
                $addToSet: { readReceipts: { userId: userId, readAt: new Date() } } 
            }
        );

        res.status(200).json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark as read", error: err.message });
    }
});

module.exports = router;