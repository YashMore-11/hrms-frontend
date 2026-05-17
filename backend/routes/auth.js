const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your separate collection models
const Superadmin = require('../models/Superadmin');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// ✅ FIXED: Hardened fallback string matching your exact configuration keys perfectly
const JWT_SECRET = process.env.JWT_SECRET || "HRMS_SUPER_SECRET_KEY@_123";

// ==========================================
// 🚀 AUTOMATED SUPERADMIN SEED ENGINE (Runs on File Init)
// ==========================================
(async () => {
  try {
    const rootExist = await Superadmin.findOne({ email: "ceo@company.com" });
    if (!rootExist) {
      const salt = await bcrypt.genSalt(10);
      const standardHashedPassword = await bcrypt.hash("supersecretpassword", salt);

      const defaultRoot = new Superadmin({
        name: "Global CEO Root",
        email: "ceo@company.com",
        password: standardHashedPassword,
        admin: []
      });
      await defaultRoot.save();
      console.log("📍 [System Seed]: Superadmin credentials safely verified/inserted into database collection.");
    }
  } catch (err) {
    console.error("System Seeder failed:", err.message);
  }
})();

// ==========================================
// 1. UNIVERSAL LOGIN ROUTE (For all roles)
// ==========================================
router.post('/login', async (req, res) => {
  // ✅ Applied explicit sanitization to drop formatting spaces added by client environments
  const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password ? req.body.password.trim() : "";
  const { role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Parameters missing: email, password, and role required." });
  }

  try {
    let user = null;

    // Direct the query to look inside the correct database collection table
    if (role === 'superadmin') {
      user = await Superadmin.findOne({ email });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email });

      // PAYMENT GATEKEEPER CHECK: Drop authentication if payment setup was incomplete or bypassed
      if (user && !user.hasPaidTier) {
        return res.status(402).json({
          message: "Account activation incomplete. Please complete your business plan checkout to gain platform access."
        });
      }
    } else if (role === 'employee' || role === 'hr') {
      user = await Employee.findOne({ email });

      // Safety Check: Avoid role privilege escalations if an employee tries using the HR layout context
      if (user && role === 'hr' && user.role !== 'hr') {
        return res.status(403).json({ message: "Access Denied: You are not registered as an HR Manager" });
      }
    }

    // If no record exists for that email in the selected table
    if (!user) {
      return res.status(400).json({ message: "Invalid email or credentials" });
    }

    // Verify password match using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or credentials" });
    }

    // Determine return role (fallback to requested role configuration parameter if user.role is unset)
    const activeRole = user.role || role;

    // Generate a secure token containing the user's Mongo ID and verified role context
    const token = jwt.sign(
      { id: user._id, role: activeRole },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 24 hours
    );

    // Send the pass token and payload variables back to your frontend localStorage handler
    res.json({
      message: "Login successful",
      token,
      role: activeRole,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    console.error("Authentication Error:", err);
    res.status(500).json({ message: "Server error during authentication" });
  }
});

// ==========================================
// 2. ADMIN REGISTRATION & PLAN CHECKOUT ROUTE
// ==========================================
router.post('/create-admin', async (req, res) => {
  const {
    adminId,
    name,
    email,
    password,
    phone,
    companyName,
    companyStartDate,
    branchLocation,
    employeeQuotaTarget,
    selectedPlanName,
    planPrice,
    hasPaidTier
  } = req.body;

  try {
    let existingAdmin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: "An Admin with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const newAdmin = new Admin({
      adminId,
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
      companyName,
      companyStartDate,
      branchLocation,
      employeeQuotaTarget: Number(employeeQuotaTarget) || 0,
      hasPaidTier: hasPaidTier || false,
      selectedPlanName: selectedPlanName || 'None',
      planPrice: planPrice || '0',
      Employee: []
    });

    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "Admin account initialized and corporate workspace activated!",
      token,
      role: 'admin'
    });

  } catch (err) {
    console.error("Error creating Admin profile:", err);
    res.status(500).json({ message: "Server error creating Admin profile" });
  }
});

// ==========================================
// 3. ADMIN CREATES EMPLOYEE / HR ROUTE
// ==========================================
router.post('/create-employee', async (req, res) => {
  const {
    empId,
    name,
    gender,
    age,
    email,
    password,
    role,
    department,
    phone,
    address,
    previousCompany,
    yearsOfExperience
  } = req.body;

  try {
    let existingEmployee = await Employee.findOne({ email: email.trim().toLowerCase() });
    if (existingEmployee) {
      return res.status(400).json({ message: "A worker with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const newWorker = new Employee({
      empId,
      name,
      gender: gender || 'Male',
      age: Number(age) || 0,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      department,
      phone,
      address,
      previousCompany: previousCompany || 'None',
      yearsOfExperience: yearsOfExperience || '0 Years'
    });

    await newWorker.save();
    res.status(201).json({ message: `${role.toUpperCase()} account created successfully!` });

  } catch (err) {
    console.error("Error creating personnel entry:", err);
    res.status(500).json({ message: "Server error creating personnel file" });
  }
});

module.exports = router;