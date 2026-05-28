import { useState, useEffect } from 'react';

export default function RoleManagement() {
    const [activeTab, setActiveTab] = useState('roles'); 
    const [roles, setRoles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [selectedRoleId, setSelectedRoleId] = useState(null);

    // ✅ Naya State: timeBasedAccess include kiya gaya hai
    const [formData, setFormData] = useState({
        roleName: '',
        scope: 'Global',
        subRoleCategory: 'None',
        permissions: [],
        timeBasedAccess: { isRestricted: false, startTime: '09:00', endTime: '18:00' }
    });

    const availablePermissions = [
        { id: 'manage_users', label: 'Manage Users & Staff' },
        { id: 'manage_roles', label: 'Manage Roles & Permissions' },
        { id: 'view_payroll', label: 'View Payroll & Salaries' },
        { id: 'approve_leaves', label: 'Approve/Reject Leaves' },
        { id: 'view_audit_logs', label: 'View Security Audit Logs' },
        { id: 'manage_company', label: 'Edit Company Settings' }
    ];

    useEffect(() => {
        fetchRoles();
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/rbac/roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setRoles(await res.json());
        } catch (err) { console.error("Failed to fetch roles", err); }
    };

    const fetchAuditLogs = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/rbac/audit-logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setAuditLogs(await res.json());
        } catch (err) { console.error("Failed to fetch logs", err); }
    };

    const handlePermissionToggle = (permId) => {
        if (modalMode === 'clone') return; 
        
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId) 
                ? prev.permissions.filter(p => p !== permId) 
                : [...prev.permissions, permId]
        }));
    };

    // ==========================================
    // 🎛️ MODAL OPENERS
    // ==========================================
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedRoleId(null);
        setFormData({ 
            roleName: '', scope: 'Global', subRoleCategory: 'None', permissions: [],
            timeBasedAccess: { isRestricted: false, startTime: '09:00', endTime: '18:00' }
        });
        setIsModalOpen(true);
    };

    const openEditModal = (role) => {
        setModalMode('edit');
        setSelectedRoleId(role._id);
        setFormData({ 
            roleName: role.roleName, 
            scope: role.scope, 
            subRoleCategory: role.subRoleCategory || 'None', 
            permissions: role.permissions,
            timeBasedAccess: role.timeBasedAccess || { isRestricted: false, startTime: '09:00', endTime: '18:00' }
        });
        setIsModalOpen(true);
    };

    const openCloneModal = (role) => {
        setModalMode('clone');
        setSelectedRoleId(role._id);
        setFormData({ 
            roleName: `${role.roleName} (Copy)`,
            scope: role.scope, 
            subRoleCategory: role.subRoleCategory || 'None', 
            permissions: role.permissions,
            timeBasedAccess: role.timeBasedAccess || { isRestricted: false, startTime: '09:00', endTime: '18:00' }
        });
        setIsModalOpen(true);
    };

    const handleSubmitRole = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            let url = 'http://localhost:5001/api/rbac/roles';
            let method = 'POST';
            let bodyData = { ...formData };

            if (modalMode === 'edit') {
                url = `http://localhost:5001/api/rbac/roles/${selectedRoleId}`;
                method = 'PUT';
            } 
            else if (modalMode === 'clone') {
                url = `http://localhost:5001/api/rbac/roles/${selectedRoleId}/clone`;
                method = 'POST';
                bodyData = { newRoleName: formData.roleName, targetCompanyId: null }; 
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bodyData)
            });

            const data = await res.json(); 

            if (res.ok) {
                const actionMsg = modalMode === 'edit' ? 'Updated' : modalMode === 'clone' ? 'Cloned' : 'Created';
                alert(`✅ Role ${actionMsg} Successfully!`);
                setIsModalOpen(false);
                fetchRoles(); 
            } else {
                alert(`❌ Failed: ${data.message || data.error || 'Server error'}`);
            }
        } catch (err) {
            console.error("Error processing role", err);
            alert("❌ Network Error: Backend se connect nahi ho pa raha.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Access Control</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global roles, permissions, and security audits.</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
                >
                    + Create New Role
                </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-zinc-800 pb-2">
                <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'roles' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    🛡️ Role Matrix
                </button>
                <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    📜 Audit Logs
                </button>
            </div>

            {/* TAB 1: ROLES */}
            {activeTab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.length === 0 && <div className="col-span-3 text-gray-400 p-8 text-center font-bold">No Roles Found. Create one!</div>}
                    {roles.map(role => (
                        <div key={role._id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                            <div>
                                {role.scope === 'Global' && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-lg text-gray-900 dark:text-white">{role.roleName}</h3>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{role.scope} Scope</span>
                                        {/* ✅ Time Restriction Badge */}
                                        {role.timeBasedAccess?.isRestricted && (
                                            <span className="ml-2 inline-block bg-orange-50 text-orange-600 border border-orange-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                                🕒 {role.timeBasedAccess.startTime} - {role.timeBasedAccess.endTime}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {/* ✅ Sub-role Badge */}
                                    {role.subRoleCategory && role.subRoleCategory !== 'None' && (
                                        <div className="mb-2">
                                            <span className="inline-block bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-1 rounded-full uppercase">
                                                {role.subRoleCategory === 'Super Admin Owner' ? '👑 God Mode' : role.subRoleCategory}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {role.subRoleCategory !== 'Super Admin Owner' && role.permissions.map(perm => (
                                        <span key={perm} className="inline-block bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-md mr-2 mb-2">
                                            {perm.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex gap-2 mt-4">
                                <button onClick={() => openEditModal(role)} className="flex-1 text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-lg hover:bg-indigo-100 transition-colors">Edit</button>
                                <button onClick={() => openCloneModal(role)} className="flex-1 text-xs font-bold text-gray-600 bg-gray-50 py-2 rounded-lg hover:bg-gray-200 transition-colors">Clone</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 2: AUDIT LOGS */}
            {activeTab === 'audit' && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-950 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Action By</th>
                                <th className="px-6 py-4">Action Type</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {auditLogs.length === 0 ? (
                                <tr><td colSpan="4" className="text-center p-8 text-gray-400">No recent security changes.</td></tr>
                            ) : (
                                auditLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{log.actionBy?.name || 'Admin'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-black">{log.actionType}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-zinc-400 text-xs">{log.details}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 🔥 MASTER DYNAMIC MODAL 🔥 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                {modalMode === 'edit' ? 'Edit Role Details' : modalMode === 'clone' ? 'Clone Existing Role' : 'Create New Role'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmitRole} className="space-y-6">
                            
                            {/* Row 1: Name & Scope */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role Name</label>
                                    <input type="text" required value={formData.roleName} onChange={e => setFormData({...formData, roleName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" placeholder="e.g., Senior HR" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Scope</label>
                                    <select disabled={modalMode === 'clone'} value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white focus:border-indigo-500 disabled:bg-gray-50">
                                        <option value="Global">Global (All Companies)</option>
                                        <option value="Company">Specific Company</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Sub-Roles & Time Access (NEW) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Super Admin Sub-Role</label>
                                    <select disabled={modalMode === 'clone'} value={formData.subRoleCategory} onChange={e => setFormData({...formData, subRoleCategory: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white focus:border-indigo-500 disabled:bg-gray-50">
                                        <option value="None">None (Standard Role)</option>
                                        <option value="Super Admin Owner">👑 Super Admin Owner</option>
                                        <option value="Billing Manager">Billing Manager</option>
                                        <option value="Support Staff">Support Staff</option>
                                        <option value="Content Manager">Content Manager</option>
                                        <option value="Analytics Viewer">Analytics Viewer</option>
                                    </select>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Restrict Login Time?</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" disabled={modalMode === 'clone'} checked={formData.timeBasedAccess.isRestricted} onChange={e => setFormData({...formData, timeBasedAccess: {...formData.timeBasedAccess, isRestricted: e.target.checked}})} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    {formData.timeBasedAccess.isRestricted && (
                                        <div className="flex gap-2 mt-2">
                                            <input type="time" disabled={modalMode === 'clone'} value={formData.timeBasedAccess.startTime} onChange={e => setFormData({...formData, timeBasedAccess: {...formData.timeBasedAccess, startTime: e.target.value}})} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-500 text-xs bg-white" />
                                            <span className="text-gray-400 self-center text-xs">to</span>
                                            <input type="time" disabled={modalMode === 'clone'} value={formData.timeBasedAccess.endTime} onChange={e => setFormData({...formData, timeBasedAccess: {...formData.timeBasedAccess, endTime: e.target.value}})} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-500 text-xs bg-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Permissions */}
                            <div>
                                <div className="flex justify-between mb-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Assign Permissions</label>
                                    {modalMode === 'clone' && <span className="text-xs text-orange-500 font-bold">Permissions are cloned from source</span>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800">
                                    {availablePermissions.map(perm => (
                                        <label key={perm.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors border border-transparent ${modalMode === 'clone' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white hover:border-gray-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                disabled={modalMode === 'clone' || formData.subRoleCategory === 'Super Admin Owner'}
                                                checked={formData.subRoleCategory === 'Super Admin Owner' ? true : formData.permissions.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                                className={`w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 ${(modalMode === 'clone' || formData.subRoleCategory === 'Super Admin Owner') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                            />
                                            <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors">
                                {modalMode === 'edit' ? '💾 Update Changes' : modalMode === 'clone' ? '👯 Clone Save' : '🚀 Save Role & Permissions'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}