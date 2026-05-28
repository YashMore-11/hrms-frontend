const Role = require('../models/Role');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userRole = await Role.findById(req.user.roleId);

            if (!userRole) {
                // ✅ English Translation Done
                return res.status(403).json({ message: "Access Denied: No role assigned to your account." });
            }

            // 1. Time-Based Access Check
            if (userRole.timeBasedAccess && userRole.timeBasedAccess.isRestricted) {
                const currentTime = new Date();
                const currentHour = currentTime.getHours(); 
                const currentMin = currentTime.getMinutes();
                
                const [startH, startM] = userRole.timeBasedAccess.startTime.split(':').map(Number);
                const [endH, endM] = userRole.timeBasedAccess.endTime.split(':').map(Number);

                const nowInMinutes = currentHour * 60 + currentMin;
                const startInMinutes = startH * 60 + startM;
                const endInMinutes = endH * 60 + endM;

                if (nowInMinutes < startInMinutes || nowInMinutes > endInMinutes) {
                    // ✅ English Translation Done
                    return res.status(403).json({ 
                        message: `Access Denied: Outside restricted working hours (${userRole.timeBasedAccess.startTime} to ${userRole.timeBasedAccess.endTime}).` 
                    });
                }
            }

            // 2. The Ultimate Super Admin Bypass
            if (userRole.subRoleCategory === 'Super Admin Owner') {
                return next();
            }

            // 3. Specific Permission Check
            if (!userRole.permissions.includes(requiredPermission)) {
                 // ✅ English Translation Done
                 return res.status(403).json({ 
                     message: `Access Denied: You lack the '${requiredPermission}' permission.` 
                 });
            }

            next();

        } catch (err) {
            res.status(500).json({ message: "RBAC Verification Failed", error: err.message });
        }
    };
};

module.exports = checkPermission;