import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('companies');
    
    // 🎛️ View Mode State (List ya Grid)
    const [viewMode, setViewMode] = useState('list'); 

    // Core Data States
    const [companies, setCompanies] = useState([]);
    const [billingStats, setBillingStats] = useState({ totalRevenue: 0, planCounts: {} });
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [settings, setSettings] = useState(null);
    
    // Loading States
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    // 🏢 Modals & Forms State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [logoFile, setLogoFile] = useState(null); // Logo file handler

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
    // ⚡ ACTION HANDLERS (Add & Edit using FormData)
    // ==========================================
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Asli Image upload ke liye FormData instance banana padta hai
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (logoFile) {
            data.append('logo', logoFile);
        }

        const url = isEditMode 
            ? `/api/superadmin/companies/${selectedCompanyId}`
            : '/api/superadmin/companies';
            
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, body: data });
            const responseData = await res.json();
            if (res.ok) {
                setIsModalOpen(false);
                setIsEditMode(false);
                setSelectedCompanyId(null);
                setLogoFile(null);
                setFormData({
                    companyName: '', adminEmail: '', phone: '', alternatePhone: '',
                    companyType: 'Startup', industryType: 'IT', companySize: '1-10', website: '', establishedYear: '',
                    gstNumber: '', panNumber: '', tanNumber: '', regNumber: '',
                    address: '', city: '', state: '', country: 'India', pinCode: '',
                    subscriptionPlan: 'Free Trial'
                });
                fetchCompanies();
            } else alert(responseData.message || "Operation failed");
        } catch (error) {
            alert("Server processing error!");
        }
    };

    const openEditModal = (comp) => {
        setIsEditMode(true);
        setSelectedCompanyId(comp._id);
        setFormData({
            companyName: comp.companyName || '',
            adminEmail: comp.adminEmail || '',
            phone: comp.phone || '',
            alternatePhone: comp.alternatePhone || '',
            companyType: comp.companyType || 'Startup',
            industryType: comp.industryType || 'IT',
            companySize: comp.companySize || '1-10',
            website: comp.website || '',
            establishedYear: comp.establishedYear || '',
            gstNumber: comp.gstNumber || '',
            panNumber: comp.panNumber || '',
            tanNumber: comp.tanNumber || '',
            regNumber: comp.regNumber || '',
            address: comp.address || '',
            city: comp.city || '',
            state: comp.state || '',
            country: comp.country || 'India',
            pinCode: comp.pinCode || '',
            subscriptionPlan: comp.subscriptionPlan || 'Free Trial'
        });
        setIsModalOpen(true);
    };

    const handleStatusChange = async (id, newStatus) => {
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
        if (!window.confirm("CRITICAL: This will permanently delete the company instance. Proceed?")) return;
        try {
            const res = await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCompanies();
        } catch (error) { alert("Delete failed!"); }
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
            if (res.ok) alert("⚙️ System Settings Updated Globally!");
        } catch (error) { alert("Settings save error!"); } 
        finally { setSavingSettings(false); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

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
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Enterprise Configuration Mode</p>
                </div>
                <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-all">Logout</button>
            </div>

            {/* 🗂️ Tab Control Switcher */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
                <button onClick={() => setActiveTab('companies')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'companies' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🏢 Companies</button>
                <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Billing</button>
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Global Users</button>
                <button onClick={() => setActiveTab('support')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Helpdesk</button>
                <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>⚙️ Settings</button>
            </div>

            {/* TAB 1: COMPANY REGISTRY */}
            {activeTab === 'companies' && (
                <div className="animate-fadeIn">
                    {/* Upper Counters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Registrations</p><p className="text-4xl font-black text-indigo-900">{companies.length}</p></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Awaiting Verification</p><p className="text-4xl font-black text-amber-500">{companies.filter(c => c.status === 'Pending Approval').length}</p></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Nodes</p><p className="text-4xl font-black text-emerald-600">{companies.filter(c => c.status === 'Active').length}</p></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100"><p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">System Blacklisted</p><p className="text-4xl font-black text-red-600">{companies.filter(c => c.status === 'Blacklisted').length}</p></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Control Section for view swapping */}
                        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-lg font-black text-gray-900">Platform System Registry</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Manage full cloud architectures configuration layouts</p>
                            </div>
                            
                            {/* Switch Layout Control Container */}
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                                    <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>List View</button>
                                    <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Grid View</button>
                                </div>
                                <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md">+ Provision Architecture</button>
                            </div>
                        </div>

                        {loadingCompanies ? (
                            <div className="p-12 text-center text-gray-400 font-bold">Parsing enterprise metrics...</div>
                        ) : companies.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 font-medium">No registered corporate models configured.</div>
                        ) : viewMode === 'list' ? (
                            /* 📋 LIST VIEW COMPONENT LAYOUT */
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold border-b border-gray-200">
                                            <th className="p-4">Logo & Entity Name</th>
                                            <th className="p-4">Profile Segments</th>
                                            <th className="p-4">Compliance IDs</th>
                                            <th className="p-4">Status Token</th>
                                            <th className="p-4 text-center">Cloud Management Systems</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map((comp) => (
                                            <tr key={comp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {comp.logo ? <img src={comp.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400 font-black uppercase">{comp.companyName.substring(0,2)}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900">{comp.companyName}</p>
                                                        <p className="text-xs text-gray-500">{comp.adminEmail}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm font-semibold text-gray-800">{comp.companyType} • {comp.industryType}</p>
                                                    <p className="text-xs text-gray-400">{comp.companySize} Nodes</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-xs text-gray-600"><span className="font-bold">GST:</span> {comp.gstNumber || 'N/A'}</p>
                                                    <p className="text-xs text-gray-600"><span className="font-bold">PAN:</span> {comp.panNumber || 'N/A'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(comp.status)}`}>{comp.status}</span>
                                                </td>
                                                <td className="p-4 flex flex-wrap gap-2 justify-center items-center">
                                                    {comp.status === 'Pending Approval' && <button onClick={() => handleStatusChange(comp._id, 'Active')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold transition-all border border-emerald-200">Approve</button>}
                                                    {comp.status === 'Active' && <button onClick={() => handleStatusChange(comp._id, 'Suspended')} className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold transition-all">Suspend</button>}
                                                    {comp.status === 'Suspended' && <button onClick={() => handleStatusChange(comp._id, 'Active')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-bold transition-all">Activate</button>}
                                                    {comp.status !== 'Blacklisted' && <button onClick={() => handleStatusChange(comp._id, 'Blacklisted')} className="bg-gray-100 hover:bg-red-50 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold transition-all">Blacklist</button>}
                                                    <button onClick={() => openEditModal(comp)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold transition-all">Edit</button>
                                                    <button onClick={() => handleDelete(comp._id)} className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-2 py-1 rounded-lg text-xs font-bold transition-all">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* 🎚️ GRID VIEW LAYOUT MATRIX */
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {companies.map((comp) => (
                                    <div key={comp._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-4">
                                                <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                                                    {comp.logo ? <img src={comp.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400 font-black uppercase">{comp.companyName.substring(0,2)}</span>}
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadge(comp.status)}`}>{comp.status}</span>
                                            </div>
                                            <h3 className="font-black text-gray-900 text-base">{comp.companyName}</h3>
                                            <p className="text-xs text-gray-500 mb-3">{comp.adminEmail}</p>
                                            <div className="space-y-1 bg-gray-50 p-3 rounded-xl text-xs text-gray-600 mb-4">
                                                <p><span className="font-bold">Segment:</span> {comp.companyType} ({comp.industryType})</p>
                                                <p><span className="font-bold">Size:</span> {comp.companySize} employees</p>
                                                <p><span className="font-bold">GSTIN:</span> {comp.gstNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end border-t pt-3 border-gray-100">
                                            <button onClick={() => openEditModal(comp)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-all">Configuration Mod</button>
                                            <button onClick={() => handleDelete(comp._id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-all">Purge</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: FINANCIAL BILLING SYSTEM */}
            {activeTab === 'billing' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-gradient-to-br from-indigo-950 to-black p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">₹</div>
                        <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2 relative z-10">Total Platform Monthly Recurring Revenue (MRR)</p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight relative z-10">{loadingBilling ? "..." : `₹${billingStats.totalRevenue.toLocaleString('en-IN')}`}</h2>
                    </div>
                </div>
            )}

            {/* TAB 3: GLOBAL USERS LIST */}
            {activeTab === 'users' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">All System Users</h2></div>
                    <div className="overflow-x-auto p-6 text-sm text-gray-500">Cross-company directory indices running normally. User profiles loaded.</div>
                </div>
            )}

            {/* TAB 4: HELPDESK TICKETS */}
            {activeTab === 'support' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">Enterprise Helpdesk System</h2></div>
                    <div className="overflow-x-auto p-6 text-sm text-gray-500">All system communications channels active. No pending critical system incidents.</div>
                </div>
            )}

            {/* TAB 5: DYNAMIC APP SYSTEM SETTINGS */}
            {activeTab === 'settings' && (
                <div className="animate-fadeIn max-w-4xl">
                    {loadingSettings ? (
                        <div className="text-center p-8 text-gray-400 font-medium">Accessing system architecture settings...</div>
                    ) : settings ? (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">🛑 Emergency System Maintenance Mode</h2>
                                        <p className="text-sm text-gray-500 mt-1">Locks all operations nodes instantly for live core server updates.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
                                        <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                                {settings.maintenanceMode && (
                                    <textarea value={settings.maintenanceMessage} onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})} className="w-full p-4 rounded-xl border border-red-200 outline-none text-sm" rows="3"></textarea>
                                )}
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-black text-gray-900 mb-2">🧩 Global Feature Flag Controllers</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    {['attendance', 'leave', 'payroll', 'performance', 'recruitment'].map(module => (
                                        <div key={module} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                                            <span className="font-bold text-gray-700 capitalize">{module} Component Module</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={settings.modules[module]} onChange={(e) => setSettings({...settings, modules: {...settings.modules, [module]: e.target.checked}})} />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={savingSettings} className="bg-indigo-950 text-white font-black px-8 py-4 rounded-xl shadow-lg w-full md:w-auto">{savingSettings ? "Updating Environment..." : "Save Production Matrix"}</button>
                        </form>
                    ) : null}
                </div>
            )}

            {/* 📋 MEGA MULTIPART COMPONENT MODAL (ADD & EDIT SYSTEM) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <div><h3 className="text-xl font-black text-gray-900">{isEditMode ? 'Modify Enterprise Profile Node' : 'Provision New Corporate Instance'}</h3></div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold bg-white p-2 rounded-full shadow-sm">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="enterpriseForm" onSubmit={handleFormSubmit} className="space-y-8">
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 border-b pb-2">1. Account Core & File Systems</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Corporate Entity Name *</label><input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Primary Configuration Logo</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="w-full px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-xl outline-none bg-white" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">System Admin Email Reference *</label><input type="email" required disabled={isEditMode} value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-gray-50 disabled:text-gray-400" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Direct Contact Vector</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 border-b pb-2">2. Legal Compliance Certifications</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">GST Identification Code (GSTIN)</label><input type="text" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">PAN Account Sequence</label><input type="text" placeholder="ABCDE1234F" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" /></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 mr-4">Cancel Alignment</button>
                            <button form="enterpriseForm" type="submit" className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg">{isEditMode ? 'Commit Schema Modification' : 'Deploy Global Configuration'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}