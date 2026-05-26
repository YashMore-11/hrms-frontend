import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    
    // 🗂️ Tabs State
    const [activeTab, setActiveTab] = useState('companies');

    // 🏢 Companies State
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    
    // 💳 Billing State
    const [billingStats, setBillingStats] = useState({ totalRevenue: 0, planCounts: {} });
    const [loadingBilling, setLoadingBilling] = useState(false);

    // 👥 Global Users State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // 🎟️ Tickets State (NEW)
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        adminEmail: '',
        phone: '',
        subscriptionPlan: 'Free Trial'
    });

    useEffect(() => {
        if (activeTab === 'companies') fetchCompanies();
        else if (activeTab === 'billing') fetchBillingStats();
        else if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'support') fetchTickets();
    }, [activeTab]);

    // ==========================================
    // 📡 API FETCHERS
    // ==========================================
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
            const res = await fetch('/api/superadmin/companies');
            if (res.ok) setCompanies(await res.json());
        } catch (error) {
            console.error("Failed to fetch companies:", error);
        } finally {
            setLoadingCompanies(false);
        }
    };

    const fetchBillingStats = async () => {
        setLoadingBilling(true);
        try {
            const res = await fetch('/api/superadmin/billing-stats');
            if (res.ok) setBillingStats(await res.json());
        } catch (error) {
            console.error("Failed to fetch billing:", error);
        } finally {
            setLoadingBilling(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('/api/superadmin/users');
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // 👇 NEW FETCH FUNCTION FOR TICKETS
    const fetchTickets = async () => {
        setLoadingTickets(true);
        try {
            const res = await fetch('/api/superadmin/tickets');
            if (res.ok) setTickets(await res.json());
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    // ==========================================
    // ⚡ ACTION HANDLERS
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
                setFormData({ companyName: '', adminEmail: '', phone: '', subscriptionPlan: 'Free Trial' });
                fetchCompanies();
            } else alert(data.message || "Failed to add company");
        } catch (error) {
            alert("Error connecting to server!");
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            const res = await fetch(`/api/superadmin/companies/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchCompanies();
        } catch (error) {
            alert("Status update error!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("WARNING: Ye company permanently delete ho jayegi. Are you sure?")) return;
        try {
            const res = await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCompanies();
        } catch (error) {
            alert("Delete error!");
        }
    };

    // 👇 NEW TICKET RESOLVE HANDLER
    const handleResolveTicket = async (id) => {
        try {
            const res = await fetch(`/api/superadmin/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resolved' })
            });
            if (res.ok) fetchTickets(); // Table refresh
        } catch (error) {
            alert("Ticket resolve karne mein error aaya!");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans relative">
            {/* 🔝 Navbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Portal</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Global System God Mode</p>
                </div>
                <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                    Logout
                </button>
            </div>

            {/* 🗂️ TAB SWITCHER */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
                <button onClick={() => setActiveTab('companies')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'companies' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🏢 Companies</button>
                <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Billing</button>
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Global Users</button>
                <button onClick={() => setActiveTab('support')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Support Helpdesk</button>
            </div>

            {/* TAB 1: COMPANY MANAGEMENT */}
            {activeTab === 'companies' && (
                <div className="animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Companies</p>
                            <p className="text-4xl font-black text-indigo-700">{companies.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Companies</p>
                            <p className="text-4xl font-black text-emerald-600">{companies.filter(c => c.status === 'Active').length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Suspended / Inactive</p>
                            <p className="text-4xl font-black text-red-600">{companies.filter(c => c.status !== 'Active').length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-black text-gray-900">Registered Companies</h2>
                            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md">+ Add New Company</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                        <th className="p-4">Company Name</th>
                                        <th className="p-4">Admin Email</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingCompanies ? <tr><td colSpan="5" className="text-center p-8 text-gray-400">Loading data...</td></tr> : companies.length === 0 ? <tr><td colSpan="5" className="text-center p-8 text-gray-400 font-medium">No companies registered yet.</td></tr> : companies.map((comp) => (
                                        <tr key={comp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-gray-900">{comp.companyName}</td>
                                            <td className="p-4 text-sm text-gray-500">{comp.adminEmail}</td>
                                            <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{comp.subscriptionPlan}</span></td>
                                            <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${comp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{comp.status}</span></td>
                                            <td className="p-4 flex gap-2 justify-center">
                                                <button onClick={() => handleStatusToggle(comp._id, comp.status)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">{comp.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                                                <button onClick={() => handleDelete(comp._id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BILLING & REVENUE */}
            {activeTab === 'billing' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">₹</div>
                        <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2 relative z-10">Total Monthly Revenue (MRR)</p>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight relative z-10">{loadingBilling ? "..." : `₹${billingStats.totalRevenue.toLocaleString('en-IN')}`}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {['Free Trial', 'Starter', 'Business', 'Enterprise'].map(plan => (
                            <div key={plan} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{plan} Plan</p>
                                <p className="text-3xl font-black text-gray-900">{loadingBilling ? "-" : (billingStats.planCounts[plan] || 0)} <span className="text-sm text-gray-400 font-medium">companies</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: GLOBAL USERS */}
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

            {/* TAB 4: SUPPORT HELPDESK (NEW) */}
            {activeTab === 'support' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-black text-gray-900">Support Helpdesk</h2>
                            <p className="text-xs text-gray-500 mt-1">Manage issues reported by company admins</p>
                        </div>
                    </div>
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
                                            <p className="text-xs text-gray-400">All clients are currently happy.</p>
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
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${
                                                    ticket.issueType === 'Billing' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                    ticket.issueType === 'Technical' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                                    'bg-gray-50 border-gray-200 text-gray-700'
                                                }`}>
                                                    {ticket.issueType}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={ticket.description}>
                                                {ticket.description}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="p-4 flex justify-center">
                                                {ticket.status !== 'Resolved' ? (
                                                    <button 
                                                        onClick={() => handleResolveTicket(ticket._id)}
                                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                                    >
                                                        Mark Resolved
                                                    </button>
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

            {/* 📋 POP-UP MODAL FORM (Unchanged) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Add New Company</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 font-bold">✕</button>
                        </div>
                        <form onSubmit={handleAddCompany} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Company Name</label>
                                <input type="text" required value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Admin Email</label>
                                <input type="email" required value={formData.adminEmail} onChange={(e) => setFormData({...formData, adminEmail: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="admin@acme.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone</label>
                                <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="+91 9876543210" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subscription Plan</label>
                                <select value={formData.subscriptionPlan} onChange={(e) => setFormData({...formData, subscriptionPlan: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white">
                                    <option value="Free Trial">Free Trial</option>
                                    <option value="Starter">Starter (₹1,499)</option>
                                    <option value="Business">Business (₹5,999)</option>
                                    <option value="Enterprise">Enterprise (₹24,999)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all mt-4">Create Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}