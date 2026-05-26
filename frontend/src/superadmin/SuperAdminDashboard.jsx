import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('companies');

    // States
    const [companies, setCompanies] = useState([]);
    const [billingStats, setBillingStats] = useState({ totalRevenue: 0, planCounts: {} });
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [settings, setSettings] = useState(null);
    
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    // 🏢 Enterprise Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '', adminEmail: '', phone: '', alternatePhone: '',
        companyType: 'Startup', industryType: 'IT', companySize: '1-10', website: '', establishedYear: '',
        gstNumber: '', panNumber: '', tanNumber: '', regNumber: '',
        address: '', city: '', state: '', country: 'India', pinCode: '',
        subscriptionPlan: 'Free Trial'
    });

    useEffect(() => {
        if (activeTab === 'companies') fetchCompanies();
        else if (activeTab === 'billing') fetchBillingStats();
        else if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'support') fetchTickets();
        else if (activeTab === 'settings') fetchSettings();
    }, [activeTab]);

    // ==========================================
    // 📡 API FETCHERS
    // ==========================================
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
            const res = await fetch('/api/superadmin/companies');
            if (res.ok) setCompanies(await res.json());
        } catch (error) { console.error("Error:", error); } 
        finally { setLoadingCompanies(false); }
    };

    const fetchBillingStats = async () => {
        setLoadingBilling(true);
        try {
            const res = await fetch('/api/superadmin/billing-stats');
            if (res.ok) setBillingStats(await res.json());
        } catch (error) { console.error("Error:", error); } 
        finally { setLoadingBilling(false); }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('/api/superadmin/users');
            if (res.ok) setUsers(await res.json());
        } catch (error) { console.error("Error:", error); } 
        finally { setLoadingUsers(false); }
    };

    const fetchTickets = async () => {
        setLoadingTickets(true);
        try {
            const res = await fetch('/api/superadmin/tickets');
            if (res.ok) setTickets(await res.json());
        } catch (error) { console.error("Error:", error); } 
        finally { setLoadingTickets(false); }
    };

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const res = await fetch('/api/superadmin/settings');
            if (res.ok) setSettings(await res.json());
        } catch (error) { console.error("Error:", error); } 
        finally { setLoadingSettings(false); }
    };

    // ==========================================
    // ⚡ ENTERPRISE ACTION HANDLERS
    // ==========================================
    const handleAddCompany = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/superadmin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({
                    companyName: '', adminEmail: '', phone: '', alternatePhone: '',
                    companyType: 'Startup', industryType: 'IT', companySize: '1-10', website: '', establishedYear: '',
                    gstNumber: '', panNumber: '', tanNumber: '', regNumber: '',
                    address: '', city: '', state: '', country: 'India', pinCode: '',
                    subscriptionPlan: 'Free Trial'
                });
                fetchCompanies();
            } else alert(data.message || "Failed to register company");
        } catch (error) {
            alert("Server connection error!");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (newStatus === 'Blacklisted' && !window.confirm("WARNING: Are you sure you want to BLACKLIST this company?")) return;
        try {
            const res = await fetch(`/api/superadmin/companies/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchCompanies();
        } catch (error) { alert("Status update failed!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL WARNING: This will permanently delete the company. Proceed?")) return;
        try {
            const res = await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCompanies();
        } catch (error) { alert("Delete failed!"); }
    };

    const handleResolveTicket = async (id) => {
        try {
            const res = await fetch(`/api/superadmin/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resolved' })
            });
            if (res.ok) fetchTickets();
        } catch (error) { alert("Ticket resolve failed!"); }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch('/api/superadmin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert("⚙️ System Settings Updated Successfully!");
            }
        } catch (error) {
            alert("Settings update failed!");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // ==========================================
    // 🎨 UI HELPERS
    // ==========================================
    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pending Approval': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Suspended': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Blacklisted': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans relative">
            {/* 🔝 Navbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Portal</h1>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Enterprise God Mode</p>
                </div>
                <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                    Logout
                </button>
            </div>

            {/* 🗂️ TAB SWITCHER */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
                <button onClick={() => setActiveTab('companies')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'companies' ? 'bg-indigo-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🏢 Companies</button>
                <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-indigo-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Billing</button>
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Global Users</button>
                <button onClick={() => setActiveTab('support')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-indigo-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Helpdesk</button>
                <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>⚙️ Settings</button>
            </div>

            {/* TAB 1: COMPANY MANAGEMENT */}
            {activeTab === 'companies' && (
                <div className="animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Companies</p>
                            <p className="text-4xl font-black text-indigo-900">{companies.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Approval</p>
                            <p className="text-4xl font-black text-amber-500">{companies.filter(c => c.status === 'Pending Approval').length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active</p>
                            <p className="text-4xl font-black text-emerald-600">{companies.filter(c => c.status === 'Active').length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Blacklisted</p>
                            <p className="text-4xl font-black text-red-600">{companies.filter(c => c.status === 'Blacklisted').length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-black text-gray-900">Enterprise Registry</h2>
                            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md">
                                + Register New Client
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold border-b border-gray-200">
                                        <th className="p-4">Company Details</th>
                                        <th className="p-4">Profile & Size</th>
                                        <th className="p-4">Govt IDs (PAN/GST)</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Admin Controls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingCompanies ? <tr><td colSpan="5" className="text-center p-8 text-gray-400">Loading enterprise data...</td></tr> : companies.length === 0 ? <tr><td colSpan="5" className="text-center p-8 text-gray-400 font-medium">No clients registered yet.</td></tr> : companies.map((comp) => (
                                        <tr key={comp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-black text-gray-900">{comp.companyName}</p>
                                                <p className="text-xs text-gray-500">{comp.adminEmail}</p>
                                                <p className="text-xs text-indigo-600 font-bold mt-1">{comp.subscriptionPlan}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-medium text-gray-800">{comp.companyType} • {comp.industryType}</p>
                                                <p className="text-xs text-gray-500">{comp.companySize} employees</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-gray-600"><span className="font-bold">GST:</span> {comp.gstNumber || 'N/A'}</p>
                                                <p className="text-xs text-gray-600"><span className="font-bold">PAN:</span> {comp.panNumber || 'N/A'}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(comp.status)}`}>{comp.status}</span>
                                            </td>
                                            <td className="p-4 flex flex-wrap gap-2 justify-center items-center">
                                                {comp.status === 'Pending Approval' && (
                                                    <button onClick={() => handleStatusChange(comp._id, 'Active')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-200">Approve</button>
                                                )}
                                                {comp.status === 'Active' && (
                                                    <button onClick={() => handleStatusChange(comp._id, 'Suspended')} className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Suspend</button>
                                                )}
                                                {comp.status === 'Suspended' && (
                                                    <button onClick={() => handleStatusChange(comp._id, 'Active')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Re-Activate</button>
                                                )}
                                                {comp.status !== 'Blacklisted' && (
                                                    <button onClick={() => handleStatusChange(comp._id, 'Blacklisted')} className="bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Blacklist</button>
                                                )}
                                                <button onClick={() => handleDelete(comp._id)} className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-2">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BILLING */}
            {activeTab === 'billing' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-black p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">₹</div>
                        <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2 relative z-10">Total Monthly Revenue (MRR)</p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight relative z-10">{loadingBilling ? "..." : `₹${billingStats.totalRevenue.toLocaleString('en-IN')}`}</h2>
                    </div>
                </div>
            )}
            
            {/* TAB 3: USERS */}
            {activeTab === 'users' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">All System Users</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Company</th><th className="p-4">Role</th><th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingUsers ? <tr><td colSpan="5" className="text-center p-8 text-gray-400">Loading...</td></tr> : users.length === 0 ? <tr><td colSpan="5" className="text-center p-8 text-gray-400 font-medium">No users found.</td></tr> : users.map((user, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="p-4 font-bold text-gray-900">{user.name}</td>
                                        <td className="p-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="p-4 text-sm font-medium text-gray-700">{user.company}</td>
                                        <td className="p-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${user.role === 'Admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>{user.role}</span></td>
                                        <td className="p-4"><span className={`text-xs font-bold ${user.status === 'Active' ? 'text-emerald-600' : 'text-amber-500'}`}>● {user.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: SUPPORT */}
            {activeTab === 'support' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">Support Helpdesk</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="p-4">Company & Reporter</th>
                                    <th className="p-4">Issue Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTickets ? (
                                    <tr><td colSpan="5" className="text-center p-8 text-gray-400">Loading tickets...</td></tr>
                                ) : tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12">
                                            <p className="text-gray-400 font-medium mb-1">No active support tickets! 🎉</p>
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-gray-900">{ticket.companyName}</p>
                                                <p className="text-xs text-gray-500">{ticket.adminEmail}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${ticket.issueType === 'Billing' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                                    {ticket.issueType}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={ticket.description}>
                                                {ticket.description}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="p-4 flex justify-center">
                                                {ticket.status !== 'Resolved' ? (
                                                    <button onClick={() => handleResolveTicket(ticket._id)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold transition-all">Mark Resolved</button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs font-bold py-2">Done ✓</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: SYSTEM SETTINGS (NEW!) */}
            {activeTab === 'settings' && (
                <div className="animate-fadeIn max-w-4xl">
                    {loadingSettings ? (
                        <div className="text-center p-8 text-gray-400 font-medium">Loading System Core Configurations...</div>
                    ) : settings ? (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            
                            {/* 🛑 Emergency Control Box */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                            🛑 Global Emergency Control
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">If enabled, no users will be able to log in. System will show a maintenance page.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                                {settings.maintenanceMode && (
                                    <div className="animate-fadeIn mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                        <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Display Message to Users</label>
                                        <textarea value={settings.maintenanceMessage} onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-600 outline-none bg-white text-sm" rows="3"></textarea>
                                    </div>
                                )}
                            </div>

                            {/* 🧩 Module Management */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-black text-gray-900 mb-2">🧩 Global Module Toggles</h2>
                                <p className="text-sm text-gray-500 mb-6">Turn off specific HRMS features globally for all clients (useful during bug fixes).</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['attendance', 'leave', 'payroll', 'performance', 'recruitment'].map(module => (
                                        <div key={module} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <span className="font-bold text-gray-700 capitalize">{module} Module</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={settings.modules[module]} onChange={(e) => setSettings({...settings, modules: {...settings.modules, [module]: e.target.checked}})} />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={savingSettings} className="bg-indigo-900 hover:bg-indigo-800 text-white font-black px-8 py-4 rounded-xl shadow-lg transition-all w-full md:w-auto">
                                {savingSettings ? "Saving Core..." : "Save System Settings"}
                            </button>
                        </form>
                    ) : null}
                </div>
            )}

            {/* 📋 MEGA ENTERPRISE FORM MODAL (Unchanged functionality) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <div><h3 className="text-xl font-black text-gray-900">Register New Client</h3></div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold bg-white p-2 rounded-full shadow-sm">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="enterpriseForm" onSubmit={handleAddCompany} className="space-y-8">
                                {/* Section 1 */}
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 border-b pb-2">1. Account & Billing</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Company Name *</label><input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Admin Email *</label><input type="email" required value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Plan</label>
                                            <select value={formData.subscriptionPlan} onChange={e => setFormData({...formData, subscriptionPlan: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white">
                                                <option value="Free Trial">Free Trial</option><option value="Starter">Starter</option><option value="Business">Business</option><option value="Enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 2 */}
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 border-b pb-2">2. Company Profile</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Type</label>
                                            <select value={formData.companyType} onChange={e => setFormData({...formData, companyType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white">
                                                <option value="Startup">Startup</option><option value="SME">SME</option><option value="Enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Industry</label><input type="text" value={formData.industryType} onChange={e => setFormData({...formData, industryType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300" /></div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Size</label>
                                            <select value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white">
                                                <option value="1-10">1-10</option><option value="51-200">51-200</option><option value="200+">200+</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 mr-4">Cancel</button>
                            <button form="enterpriseForm" type="submit" className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg">Save Client</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}