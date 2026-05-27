import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    
    // 🎛️ Tabs & Views
    const [activeTab, setActiveTab] = useState('analytics');
    const [viewMode, setViewMode] = useState('list'); 

    // Core States
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

    // 🏢 Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [logoFile, setLogoFile] = useState(null); 

    const [formData, setFormData] = useState({
        companyName: '', adminEmail: '', phone: '', alternatePhone: '',
        companyType: 'Startup', industryType: 'IT', companySize: '1-10', website: '', establishedYear: '',
        gstNumber: '', panNumber: '', tanNumber: '', regNumber: '',
        address: '', city: '', state: '', country: 'India', pinCode: '',
        subscriptionPlan: 'Free Trial'
    });

    useEffect(() => {
        if (activeTab === 'companies' || activeTab === 'analytics') {
            fetchCompanies();
            fetchBillingStats();
        }
        else if (activeTab === 'billing') { fetchBillingStats(); fetchCompanies(); }
        else if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'support') fetchTickets();
        else if (activeTab === 'settings') fetchSettings();
    }, [activeTab]);

    // ==========================================
    // 📡 API FETCHERS
    // ==========================================
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try { const res = await fetch('/api/superadmin/companies'); if (res.ok) setCompanies(await res.json()); } 
        catch (error) { console.error("Error fetching companies:", error); } finally { setLoadingCompanies(false); }
    };
    const fetchBillingStats = async () => {
        setLoadingBilling(true);
        try { const res = await fetch('/api/superadmin/billing-stats'); if (res.ok) setBillingStats(await res.json()); } 
        catch (error) { console.error("Error fetching billing:", error); } finally { setLoadingBilling(false); }
    };
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try { const res = await fetch('/api/superadmin/users'); if (res.ok) setUsers(await res.json()); } 
        catch (error) { console.error("Error fetching users:", error); } finally { setLoadingUsers(false); }
    };
    const fetchTickets = async () => {
        setLoadingTickets(true);
        try { const res = await fetch('/api/superadmin/tickets'); if (res.ok) setTickets(await res.json()); } 
        catch (error) { console.error("Error fetching tickets:", error); } finally { setLoadingTickets(false); }
    };
    const fetchSettings = async () => {
        setLoadingSettings(true);
        try { const res = await fetch('/api/superadmin/settings'); if (res.ok) setSettings(await res.json()); } 
        catch (error) { console.error("Error fetching settings:", error); } finally { setLoadingSettings(false); }
    };

    // ==========================================
    // ⚡ ACTION HANDLERS
    // ==========================================
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => { data.append(key, formData[key]); });
        if (logoFile) data.append('logo', logoFile);

        const url = isEditMode ? `/api/superadmin/companies/${selectedCompanyId}` : '/api/superadmin/companies';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, body: data });
            const responseData = await res.json();
            if (res.ok) {
                setIsModalOpen(false); setIsEditMode(false); setSelectedCompanyId(null); setLogoFile(null);
                setFormData({
                    companyName: '', adminEmail: '', phone: '', alternatePhone: '',
                    companyType: 'Startup', industryType: 'IT', companySize: '1-10', website: '', establishedYear: '',
                    gstNumber: '', panNumber: '', tanNumber: '', regNumber: '',
                    address: '', city: '', state: '', country: 'India', pinCode: '',
                    subscriptionPlan: 'Free Trial'
                });
                fetchCompanies();
                fetchBillingStats();
            } else alert(responseData.message || "Operation failed");
        } catch (error) { alert("Server processing error!"); }
    };

    const openEditModal = (comp) => {
        setIsEditMode(true); setSelectedCompanyId(comp._id);
        setFormData({
            companyName: comp.companyName || '', adminEmail: comp.adminEmail || '', phone: comp.phone || '', alternatePhone: comp.alternatePhone || '',
            companyType: comp.companyType || 'Startup', industryType: comp.industryType || 'IT', companySize: comp.companySize || '1-10', website: comp.website || '', establishedYear: comp.establishedYear || '',
            gstNumber: comp.gstNumber || '', panNumber: comp.panNumber || '', tanNumber: comp.tanNumber || '', regNumber: comp.regNumber || '',
            address: comp.address || '', city: comp.city || '', state: comp.state || '', country: comp.country || 'India', pinCode: comp.pinCode || '',
            subscriptionPlan: comp.subscriptionPlan || 'Free Trial'
        });
        setIsModalOpen(true);
    };

    const handleStatusChange = async (id, newStatus) => {
        if (newStatus === 'Blacklisted' && !window.confirm("WARNING: Blacklist this company?")) return;
        try { const res = await fetch(`/api/superadmin/companies/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
            if (res.ok) { fetchCompanies(); fetchBillingStats(); } } catch (error) { alert("Status update failed!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: This will permanently delete the company instance. Proceed?")) return;
        try { const res = await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' });
            if (res.ok) { fetchCompanies(); fetchBillingStats(); } } catch (error) { alert("Delete failed!"); }
    };
    
    const handleImpersonate = async (id, companyName) => {
        if (!window.confirm(`⚠️ WARNING: Are you sure you want to securely log in as the HR Admin of ${companyName}?`)) return;
        try {
            const res = await fetch(`/api/superadmin/companies/${id}/impersonate`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.role);
                alert(`✅ Access Granted!\nRedirecting to ${companyName} HR Dashboard...`);
                navigate('/admin/Profile');
            } else { alert(data.message || "Impersonation Failed!"); }
        } catch (error) { alert("Network Error during impersonation."); }
    };

    const handleGenerateInvoice = (comp) => {
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(79, 70, 229); doc.text("SaaS Enterprise Platform", 14, 20);
        doc.setFontSize(10); doc.setTextColor(100); doc.text("TAX INVOICE", 14, 30); doc.text(`Invoice Number: INV-${Math.floor(Math.random() * 900000) + 100000}`, 14, 36); doc.text(`Billing Date: ${new Date().toLocaleDateString()}`, 14, 42);
        doc.setFontSize(12); doc.setTextColor(0); doc.text("Billed To:", 14, 55);
        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Company: ${comp.companyName}`, 14, 62); doc.text(`Email: ${comp.adminEmail}`, 14, 68); doc.text(`GSTIN: ${comp.gstNumber || 'Unregistered Entity'}`, 14, 74);
        
        let basePrice = 0;
        if(comp.subscriptionPlan === 'Starter') basePrice = 999;
        if(comp.subscriptionPlan === 'Business') basePrice = 2499;
        if(comp.subscriptionPlan === 'Enterprise') basePrice = 4999;
        
        const gstAmount = basePrice * 0.18; const totalAmount = basePrice + gstAmount;

        // 📊 NAYA SAFE AUTOTABLE CODE
        autoTable(doc, {
            startY: 85,
            head: [['Description', 'Billing Cycle', 'Amount (INR)']],
            body: [[`Software License - ${comp.subscriptionPlan} Tier`, 'Monthly', `Rs. ${basePrice.toFixed(2)}`], ['Platform IGST (18%)', '-', `Rs. ${gstAmount.toFixed(2)}`]],
            foot: [['Total Payable Amount', '', `Rs. ${totalAmount.toFixed(2)}`]],
            theme: 'grid', 
            headStyles: { fillColor: [30, 27, 75] }, 
            footStyles: { fillColor: [243, 244, 246], textColor: [0,0,0], fontStyle: 'bold' }
        });

        doc.setFontSize(9); doc.setTextColor(150); doc.text("This is a system-generated electronic invoice and requires no physical signature.", 14, doc.lastAutoTable.finalY + 20); doc.text("Thank you for choosing our Enterprise Platform.", 14, doc.lastAutoTable.finalY + 26);
        doc.save(`Invoice_${comp.companyName.replace(/\s+/g, '_')}_${new Date().getMonth()+1}Y26.pdf`);
    };

    const handleResolveTicket = async (id) => {
        try { const res = await fetch(`/api/superadmin/tickets/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Resolved' }) });
            if (res.ok) fetchTickets(); } catch (error) { alert("Ticket resolve failed!"); }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault(); setSavingSettings(true);
        try { const res = await fetch('/api/superadmin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
            if (res.ok) alert("⚙️ Core Platform Configurations Updated Globally!"); } catch (error) { alert("Settings save error!"); } finally { setSavingSettings(false); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const handleTestPayment = async () => {
        if (window.confirm("Simulate Razorpay Gateway Request? \n(Click OK to view Demo Success)")) {
            setTimeout(() => { alert(`✅ Payment Processed Successfully! \nTransaction ID: pay_test_${Math.floor(Math.random() * 100000000)}\n\n(Note: Connect real keys in backend for actual pop-up)`); }, 1000);
        }
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

    const pieColors = ['#94a3b8', '#3b82f6', '#8b5cf6', '#10b981']; 
    const safePlanCounts = billingStats?.planCounts || {};
    const safeCompanies = companies || [];
    const safeTotalRevenue = billingStats?.totalRevenue || 0;
    const paidCompanies = safeCompanies.filter(c => c.subscriptionPlan && c.subscriptionPlan !== 'Free Trial');
    const planData = Object.keys(safePlanCounts).map((key) => ({ name: key, value: safePlanCounts[key] })).filter(item => item.value > 0); 
    const statusCounts = safeCompanies.reduce((acc, comp) => { if(comp && comp.status) { acc[comp.status] = (acc[comp.status] || 0) + 1; } return acc; }, {});
    const statusData = Object.keys(statusCounts).map(key => ({ name: key, count: statusCounts[key] }));

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

            {/* 🗂️ Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
                <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-950 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}>📊 Analytics</button>
                <button onClick={() => setActiveTab('companies')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'companies' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🏢 Registry</button>
                <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Revenue</button>
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Global Users</button>
                <button onClick={() => setActiveTab('support')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Helpdesk</button>
                <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>⚙️ Core</button>
            </div>

            {/* TAB 0: 📊 ANALYTICS DASHBOARD */}
            {activeTab === 'analytics' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-2xl shadow-lg text-white">
                            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Total Network MRR</p>
                            <h2 className="text-4xl font-black">₹{safeTotalRevenue.toLocaleString('en-IN')}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Active Nodes</p>
                            <h2 className="text-4xl font-black text-gray-900">{safeCompanies.filter(c => c?.status === 'Active').length}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Registrations</p>
                            <h2 className="text-4xl font-black text-gray-900">{safeCompanies.length}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 mb-6">Subscription Distribution</h3>
                            {planData.length === 0 ? <div className="h-64 flex items-center justify-center text-gray-400 font-medium">Insufficient data</div> : (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={planData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                                {planData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                                            </Pie>
                                            <ChartTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 mb-6">Client Health Metrics</h3>
                            {statusData.length === 0 ? <div className="h-64 flex items-center justify-center text-gray-400 font-medium">Insufficient data</div> : (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <ChartTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: COMPANIES */}
            {activeTab === 'companies' && (
                <div className="animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                            <h2 className="text-lg font-black text-gray-900">Platform System Registry</h2>
                            <div className="flex gap-4">
                                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                                    <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>List</button>
                                    <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Grid</button>
                                </div>
                                <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">+ New Client</button>
                            </div>
                        </div>

                        {loadingCompanies ? <div className="p-12 text-center text-gray-400 font-bold">Loading...</div> : safeCompanies.length === 0 ? <div className="p-12 text-center text-gray-400 font-bold">No companies found.</div> : viewMode === 'list' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead><tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold border-b border-gray-200"><th className="p-4">Entity</th><th className="p-4">Profile</th><th className="p-4">Govt IDs</th><th className="p-4">Status</th><th className="p-4 text-center">Actions</th></tr></thead>
                                    <tbody>
                                        {safeCompanies.map(comp => (
                                            <tr key={comp._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="p-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {comp.logo ? <img src={comp.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400 font-black">{comp.companyName?.substring(0,2)}</span>}
                                                    </div>
                                                    <div><p className="font-black text-gray-900">{comp.companyName}</p><p className="text-xs text-gray-500">{comp.adminEmail}</p></div>
                                                </td>
                                                <td className="p-4"><p className="text-sm font-semibold">{comp.companyType} • {comp.industryType}</p><p className="text-xs text-gray-400">{comp.companySize} employees</p></td>
                                                <td className="p-4"><p className="text-xs"><span className="font-bold">GST:</span> {comp.gstNumber || 'N/A'}</p><p className="text-xs"><span className="font-bold">PAN:</span> {comp.panNumber || 'N/A'}</p></td>
                                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(comp.status)}`}>{comp.status}</span></td>
                                                <td className="p-4 flex flex-wrap gap-2 justify-center">
                                                    {comp.status === 'Active' && (
                                                        <button onClick={() => handleImpersonate(comp._id, comp.companyName)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-xs font-black shadow-sm transition-all border border-purple-200 flex items-center gap-1">
                                                            👁️ Login As
                                                        </button>
                                                    )}
                                                    {comp.status === 'Pending Approval' && <button onClick={() => handleStatusChange(comp._id, 'Active')} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-200">Approve</button>}
                                                    {comp.status === 'Active' && <button onClick={() => handleStatusChange(comp._id, 'Suspended')} className="bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold">Suspend</button>}
                                                    {comp.status === 'Suspended' && <button onClick={() => handleStatusChange(comp._id, 'Active')} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-bold">Activate</button>}
                                                    {comp.status !== 'Blacklisted' && <button onClick={() => handleStatusChange(comp._id, 'Blacklisted')} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">Blacklist</button>}
                                                    <button onClick={() => openEditModal(comp)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">Edit</button>
                                                    <button onClick={() => handleDelete(comp._id)} className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {safeCompanies.map(comp => (
                                    <div key={comp._id} className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                    {comp.logo ? <img src={comp.logo} className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400 font-black">{comp.companyName?.substring(0,2)}</span>}
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusBadge(comp.status)}`}>{comp.status}</span>
                                            </div>
                                            <h3 className="font-black text-gray-900">{comp.companyName}</h3>
                                            <p className="text-xs text-gray-500 mb-3">{comp.adminEmail}</p>
                                            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 space-y-1 mb-4">
                                                <p><span className="font-bold">Type:</span> {comp.companyType} ({comp.industryType})</p>
                                                <p><span className="font-bold">GST:</span> {comp.gstNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 border-t pt-3 border-gray-100">
                                            {comp.status === 'Active' && (
                                                <button onClick={() => handleImpersonate(comp._id, comp.companyName)} className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-black px-3 py-2 rounded-lg text-xs transition-colors border border-purple-200 mb-1">
                                                    👁️ Login As HR Admin
                                                </button>
                                            )}
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openEditModal(comp)} className="bg-gray-100 text-gray-800 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(comp._id)} className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 transition-colors">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: BILLING WITH PDF INVOICES */}
            {activeTab === 'billing' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-gradient-to-br from-indigo-950 to-black p-10 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="w-full md:w-auto relative z-10">
                            <div className="absolute top-0 left-0 opacity-10 text-9xl pointer-events-none -mt-8 -ml-4">₹</div>
                            <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2">Total Platform MRR</p>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tight">{loadingBilling ? "..." : `₹${safeTotalRevenue.toLocaleString('en-IN')}`}</h2>
                        </div>
                        <div className="relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 w-full md:w-auto">
                            <h3 className="text-xl font-black mb-1">Gateway Diagnostics</h3>
                            <p className="text-xs text-indigo-200 mb-5 max-w-xs">Simulate transaction to verify banking bridges.</p>
                            <button onClick={handleTestPayment} className="bg-white text-indigo-900 hover:bg-gray-100 font-black px-6 py-3.5 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 w-full justify-center">
                                💳 Test Checkout Flow
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-black text-gray-900">Subscription Ledgers & Invoices</h2>
                            <p className="text-xs text-gray-500 mt-1">Generate automated tax invoices for active enterprise clients.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold border-b border-gray-200">
                                        <th className="p-4">Billed Entity</th>
                                        <th className="p-4">Subscription Plan</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paidCompanies.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium">No active paid subscriptions found.</td></tr>
                                    ) : (
                                        paidCompanies.map((comp, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="p-4"><p className="font-black text-gray-900">{comp.companyName}</p><p className="text-xs text-gray-500">GST: {comp.gstNumber || 'N/A'}</p></td>
                                                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-black">{comp.subscriptionPlan}</span></td>
                                                <td className="p-4"><span className="text-emerald-600 text-xs font-bold">● Cleared</span></td>
                                                <td className="p-4 text-right"><button onClick={() => handleGenerateInvoice(comp)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all">📄 Download PDF</button></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: GLOBAL USERS */}
            {activeTab === 'users' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">All System Users</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Company</th><th className="p-4">Role</th><th className="p-4">Status</th></tr></thead>
                            <tbody>
                                {loadingUsers ? <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr> : (users || []).length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found.</td></tr> : users.map((user, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4 font-bold text-gray-900">{user?.name}</td>
                                        <td className="p-4 text-sm text-gray-500">{user?.email}</td>
                                        <td className="p-4 text-sm font-medium">{user?.company}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${user?.role === 'Admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}>{user?.role}</span></td>
                                        <td className="p-4"><span className="text-emerald-600 text-xs font-bold">● {user?.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: SUPPORT HELPDESK */}
            {activeTab === 'support' && (
                <div className="animate-fadeIn bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">Enterprise Helpdesk</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold"><th className="p-4">Company</th><th className="p-4">Issue Type</th><th className="p-4">Description</th><th className="p-4">Status</th><th className="p-4 text-center">Action</th></tr></thead>
                            <tbody>
                                {loadingTickets ? <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading tickets...</td></tr> : (tickets || []).length === 0 ? <tr><td colSpan="5" className="p-12 text-center text-gray-400 font-medium">No active tickets! 🎉</td></tr> : tickets.map((ticket) => (
                                    <tr key={ticket._id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4"><p className="font-bold">{ticket?.companyName}</p><p className="text-xs text-gray-500">{ticket?.adminEmail}</p></td>
                                        <td className="p-4"><span className="px-2 py-1 rounded text-[10px] font-black uppercase border bg-blue-50 text-blue-700">{ticket?.issueType}</span></td>
                                        <td className="p-4 text-sm max-w-xs truncate">{ticket?.description}</td>
                                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket?.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{ticket?.status}</span></td>
                                        <td className="p-4 text-center">
                                            {ticket?.status !== 'Resolved' ? <button onClick={() => handleResolveTicket(ticket._id)} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">Resolve</button> : <span className="text-gray-400 text-xs font-bold">Done ✓</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: SYSTEM SETTINGS WITH LEGAL & COMPLIANCE ENGINE */}
            {activeTab === 'settings' && (
                <div className="animate-fadeIn max-w-4xl">
                    {settings && (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            
                            {/* 1. Maintenance Mode */}
                            <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div><h2 className="text-xl font-black text-gray-900">🛑 Emergency Maintenance</h2><p className="text-sm text-gray-500 mt-1">Locks all operations nodes instantly.</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
                                        <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:bg-white after:rounded-full after:h-6 after:w-6 after:absolute after:top-[2px] after:left-[2px] peer-checked:bg-red-600 transition-all shadow-sm"></div>
                                    </label>
                                </div>
                                {settings.maintenanceMode && <textarea value={settings.maintenanceMessage} onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})} className="w-full p-4 rounded-xl border border-red-200 text-sm outline-none focus:ring-2 focus:ring-red-100" rows="3" />}
                            </div>
                            
                            {/* 2. Feature Flags */}
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-black text-gray-900 mb-6">🧩 Global Feature Flag Controllers</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['attendance', 'leave', 'payroll', 'performance', 'recruitment'].map(module => (
                                        <div key={module} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                            <span className="font-bold text-gray-700 capitalize">{module} Module</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={settings.modules?.[module] || false} onChange={(e) => setSettings({...settings, modules: {...settings.modules, [module]: e.target.checked}})} />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:bg-white after:rounded-full after:h-5 after:w-5 after:absolute after:top-[2px] after:left-[2px] peer-checked:bg-indigo-600 transition-all shadow-sm"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. NEW: LEGAL & POLICY ENGINE */}
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-black text-gray-900 mb-6">⚖️ Legal & Compliance Documents</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Platform Terms & Conditions</label>
                                        <textarea 
                                            value={settings.termsAndConditions || ''} 
                                            onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})} 
                                            className="w-full p-4 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px]" 
                                            placeholder="Enter global terms and conditions for all client tenants..." 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Global Privacy Policy</label>
                                        <textarea 
                                            value={settings.privacyPolicy || ''} 
                                            onChange={(e) => setSettings({...settings, privacyPolicy: e.target.value})} 
                                            className="w-full p-4 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px]" 
                                            placeholder="Enter SaaS privacy policy rules..." 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={savingSettings} className="bg-indigo-950 hover:bg-indigo-900 transition-colors text-white font-black px-8 py-4 rounded-xl shadow-lg w-full">{savingSettings ? "Updating Environment..." : "Save Production Matrix"}</button>
                        </form>
                    )}
                </div>
            )}

            {/* 📋 MEGA MODAL FOR ADD / EDIT */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                            <h3 className="text-xl font-black text-gray-900">{isEditMode ? 'Modify Enterprise Profile' : 'Provision New Client'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold bg-white p-2 rounded-full shadow-sm transition-colors">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="enterpriseForm" onSubmit={handleFormSubmit} className="space-y-8">
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase mb-4 border-b pb-2">1. Account & Billing</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Company Name *</label><input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Logo Upload</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none bg-white focus:border-indigo-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Admin Email *</label><input type="email" required disabled={isEditMode} value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-gray-50 disabled:text-gray-400" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Subscription Plan *</label>
                                            <select value={formData.subscriptionPlan} onChange={e => setFormData({...formData, subscriptionPlan: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                                <option value="Free Trial">Free Trial (₹0 / 30 Days)</option>
                                                <option value="Starter">Starter (₹999 / month)</option>
                                                <option value="Business">Business (₹2499 / month)</option>
                                                <option value="Enterprise">Enterprise (₹4999 / month)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase mb-4 border-b pb-2">2. Company Profile</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Type</label>
                                            <select value={formData.companyType} onChange={e => setFormData({...formData, companyType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-indigo-500">
                                                <option value="Startup">Startup</option><option value="SME">SME</option><option value="Enterprise">Enterprise</option><option value="MNC">MNC</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">Industry</label><input type="text" placeholder="e.g. IT, Healthcare" value={formData.industryType} onChange={e => setFormData({...formData, industryType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500" /></div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Size (Employees)</label>
                                            <select value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-indigo-500">
                                                <option value="1-10">1-10</option><option value="11-50">11-50</option><option value="51-200">51-200</option><option value="200+">200+</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-indigo-600 uppercase mb-4 border-b pb-2">3. Legal & KYC</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">GST Number</label><input type="text" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500" /></div>
                                        <div><label className="block text-xs font-bold text-gray-700 uppercase mb-2">PAN Number</label><input type="text" placeholder="ABCDE1234F" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500" /></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 mr-4 transition-colors">Cancel</button>
                            <button form="enterpriseForm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold px-8 py-3 rounded-xl shadow-lg">{isEditMode ? 'Update Client' : 'Register Client'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}