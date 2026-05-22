const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms";

mongoose.connect(MONGO_URI)
    .then(() => console.log("💾 [Database Status]: MongoDB pipeline securely connected."))
    .catch((err) => console.error("❌ Database connection critical drop:", err.message));


const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const roleRoutes = require('./routes/roles');
const employeeRoutes = require('./routes/employees');


app.use('/api/auth', authRoutes);            
app.use('/api/departments', departmentRoutes);   
app.use('/api/roles', roleRoutes);               
app.use('/api/employees', employeeRoutes);       

app.use((req, res, next) => {
    res.status(404).json({ message: "Requested application path layer endpoint not registered." });
});

app.use((err, req, res, next) => {
    console.error("Global System Crash Caught:", err.stack);
    res.status(500).json({ message: "Internal server runtime execution fault." });
});

app.listen(PORT, () => {
    console.log(`🚀 [Server Boot]: System instance live on: http://localhost:${PORT}`);
});

