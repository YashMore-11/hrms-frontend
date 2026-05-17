const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee'); // Adjust path to your schema file

// GET: http://localhost:5000/api/employees
router.get('/', async (req, res) => {
    try {
        const records = await Employee.find({}, '-password');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Error parsing database records" });
    }
});

module.exports = router;