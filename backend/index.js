// ==========================================
// 📦 CORE MODULE IMPORTS
// ==========================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ==========================================
// 🚀 APP INITIALIZATION
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🛡️ GLOBAL MIDDLEWARE LAYER REGISTER
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// 💾 DATABASE PIPELINE INITIALIZATION
// ==========================================
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms";

// ✨ FIXED: Stripped old, unsupported configuration objects to prevent termination loops
mongoose.connect(MONGO_URI)
    .then(() => console.log("💾 [Database Status]: MongoDB pipeline securely connected."))
    .catch((err) => {
        console.error("❌ Database connection critical drop:", err.message);
        process.exit(1);
    });

// ==========================================
// 📋 ROUTE ROUTING ENGINE IMPORTS
// ==========================================
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const roleRoutes = require('./routes/roles');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');
const attendanceRoutes = require('./routes/attendance'); // 👈 ✅ ADDED: Import attendance log router branch

// ==========================================
// 🚀 ENDPOINT GATEWAY ROUTING ATTACHMENTS
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/vacancies', require('./routes/vacancy'));
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes); // 👈 ✅ ADDED: Mounted the missing metrics route path layer!

// ==========================================
// 🛑 ERROR HANDLING GATES & SYSTEM SHIELDS
// ==========================================

// Catch-All 404 Route Handler Fallback
app.use((req, res, next) => {
    res.status(404).json({ message: "Requested application path layer endpoint not registered." });
});

// Global Interceptor System Crash Safeguard
app.use((err, req, res, next) => {
    console.error("Global System Crash Caught:", err.stack);
    res.status(500).json({ message: "Internal server runtime execution fault." });
});

// ==========================================
// 🚀 SYSTEM BOOT TRIGGER
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 [Server Boot]: System instance live on: http://localhost:${PORT}`);
});