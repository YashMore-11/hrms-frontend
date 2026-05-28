const express = require('express');
const router = express.Router();
const MasterData = require('../models/MasterData');
const verifyToken = require('../middleware/auth'); 

// 1. CREATE New Master Data Entry
router.post('/', verifyToken, async (req, res) => {
    try {
        const { category, name, description, isActive } = req.body;
        const newData = new MasterData({ category, name, description, isActive });
        await newData.save();
        res.status(201).json({ message: `${category} created successfully`, data: newData });
    } catch (err) {
        res.status(500).json({ message: "Error saving data", error: err.message });
    }
});

// 2. READ ALL Master Data (Category wise filter ke sath)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { category } = req.query; // Pata karne ke liye ki konsa tab khula hai
        const filter = category ? { category, companyId: null } : { companyId: null };
        const data = await MasterData.find(filter).sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data", error: err.message });
    }
});

// 3. UPDATE Master Data
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedData = await MasterData.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Updated successfully", data: updatedData });
    } catch (err) {
        res.status(500).json({ message: "Error updating data", error: err.message });
    }
});

// 4. DELETE Master Data
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await MasterData.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting data", error: err.message });
    }
});

module.exports = router;