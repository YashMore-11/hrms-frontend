const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Import centralized database module models
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');

// Import your global verification middleware
const verifyToken = require('../middleware/auth');

// ==========================================
// 📋 1. GET: Fetch All Employee Records
// ==========================================
// Base Path: GET http://localhost:5000/api/employees
router.get('/', verifyToken, async (req, res) => {
    try {
        const records = await Employee.find({}, '-password');
        res.json(records);
    } catch (err) {
        console.error("Database fetch error:", err);
        res.status(500).json({ message: "Error parsing database records" });
    }
});

// ==========================================
// 👑 2. GET: Team Leaders Options Pool
// ==========================================
// Base Path: GET http://localhost:5000/api/employees/team-leaders
router.get('/team-leaders', verifyToken, async (req, res) => {
    try {
        const leaders = await Employee.find({}, '_id name empId role');
        res.status(200).json(leaders);
    } catch (err) {
        console.error("Team leader mapping sync failure:", err);
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 🚀 3. POST: Collision-Free Sequential Onboarding
// ==========================================
// Base Path: POST http://localhost:5000/api/employees/create-employee
router.post('/create-employee', verifyToken, async (req, res) => {
    const {
        name, gender, age, email, password, role,
        department, phone, address, previousCompany,
        previousRole, yearsOfExperience, assignedLeader
    } = req.body;

    try {
        let existingEmployee = await Employee.findOne({ email: email.trim().toLowerCase() });
        if (existingEmployee) {
            return res.status(400).json({ message: "A worker with this email already exists" });
        }

        const currentYear = new Date().getFullYear();
        const yearPrefix = `EMP-${currentYear}-`;

        const employeesThisYear = await Employee.find(
            { empId: new RegExp(`^${yearPrefix}`) },
            { empId: 1 }
        );

        let nextSequenceNum = 1;
        if (employeesThisYear && employeesThisYear.length > 0) {
            const parsedSequenceNumbers = employeesThisYear.map(emp => {
                const parts = emp.empId.split('-');
                const sequenceTokenAsInt = parseInt(parts[2], 10);
                return isNaN(sequenceTokenAsInt) ? 0 : sequenceTokenAsInt;
            });
            nextSequenceNum = Math.max(...parsedSequenceNumbers) + 1;
        }

        const paddedSequence = String(nextSequenceNum).padStart(4, '0');
        const finalEmpId = `${yearPrefix}${paddedSequence}`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password.trim(), salt);

        const newWorker = new Employee({
            empId: finalEmpId,
            name,
            gender,
            age: Number(age) || 0,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role.toLowerCase(),
            department,
            phone,
            address,
            previousCompany: previousCompany || 'None',
            previousRole: previousRole || 'None',
            yearsOfExperience: yearsOfExperience || '0 Years',
            assignedLeader: assignedLeader || null,
            Admin: req.user.id,
            createdBy: req.user.id
        });

        await newWorker.save();

        await Admin.findByIdAndUpdate(
            req.user.id,
            { $push: { Employee: newWorker._id } }
        );

        res.status(201).json({
            message: `${role.toUpperCase()} account onboarded successfully with ID: ${finalEmpId}`,
            empId: finalEmpId
        });
    } catch (err) {
        console.error("Error inside onboarding process controller:", err);
        res.status(500).json({ message: "Server error creating personnel file" });
    }
});

// ==========================================
// 👤 4. GET: FETCH PROFILE FOR SELF-LOGGED USER
// ==========================================
// Base Path: GET http://localhost:5000/api/employees/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const workerRecord = await Employee.findById(req.user.id).select('-password');
        if (!workerRecord) {
            return res.status(404).json({ message: "Employee document entity not found." });
        }
        res.status(200).json(workerRecord);
    } catch (err) {
        console.error("Employee profile dynamic recovery drop:", err);
        res.status(500).json({ message: "Internal runtime error locating worker ledger profiles." });
    }
});

// ==========================================
// 👤 5. PUT: UPDATE PROFILE BY WORKER ACTION
// ==========================================
// Base Path: PUT http://localhost:5000/api/employees/profile
router.put('/profile', verifyToken, async (req, res) => {
    const {
        phone,
        address,
        role,
        department,
        previousCompany,
        previousRole, // ✅ Destructured correctly
        yearsOfExperience
    } = req.body;

    try {
        const updatedWorker = await Employee.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    phone: phone ? phone.trim() : "",
                    address: address ? address.trim() : "",
                    role: role ? role.trim().toLowerCase() : "employee",
                    department: department ? department.trim() : "",
                    previousCompany: previousCompany ? previousCompany.trim() : "None",
                    previousRole: previousRole ? previousRole.trim() : "None", // ✅ FIXED: Saved values cleanly
                    yearsOfExperience: yearsOfExperience ? yearsOfExperience.trim() : "0 Years"
                }
            },
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        if (!updatedWorker) {
            return res.status(404).json({ message: "Personnel workspace record is missing." });
        }

        res.status(200).json(updatedWorker);
    } catch (err) {
        console.error("Worker self-mutation write transaction failure:", err);
        res.status(500).json({ message: "Internal server fault committing changes down to cluster layer columns." });
    }
});

module.exports = router;