import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    const [settings, setSettings] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    
    // 🎟️ Advanced Helpdesk States
    const [helpdeskTickets, setHelpdeskTickets] = useState([]);
    const [helpdeskFaqs, setHelpdeskFaqs] = useState([]);
    const [helpdeskAnalytics, setHelpdeskAnalytics] = useState({ totalVolume: 0, openCount: 0, inProgressCount: 0, resolvedCount: 0, avgResolutionTime: 0 });
    const [helpdeskSubTab, setHelpdeskSubTab] = useState('tickets'); // 'tickets' ya 'faqs'
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMsg, setReplyMsg] = useState('');
    const [staffName, setStaffName] = useState('');
    const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });

    // Loading States
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingHelpdesk, setLoadingHelpdesk] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: '', message: '', targetAudience: 'All', priority: 'Normal',
        channels: { inApp: true, email: false, sms: false }
    });
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

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
        else if (activeTab === 'support') fetchHelpdeskHub(); 
        else if (activeTab === 'settings') fetchSettings();
        else if (activeTab === 'broadcast') fetchAnnouncements();
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
    const fetchHelpdeskHub = async () => {
        setLoadingHelpdesk(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/helpdesk/tickets', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setHelpdeskTickets(data.tickets || []);
                if(data.analytics) setHelpdeskAnalytics(data.analytics);
            }
            const faqRes = await fetch('/api/helpdesk/faqs', { headers: { 'Authorization': `Bearer ${token}` } });
            if (faqRes.ok) setHelpdeskFaqs(await faqRes.json());
        } catch (error) { console.error("Error syncing helpdesk:", error); } finally { setLoadingHelpdesk(false); }
    };
    const fetchSettings = async () => {
        setLoadingSettings(true);
        try { const res = await fetch('/api/superadmin/settings'); if (res.ok) setSettings(await res.json()); } 
        catch (error) { console.error("Error fetching settings:", error); } finally { setLoadingSettings(false); }
    };
    const fetchAnnouncements = async () => {
        setLoadingAnnouncements(true);
        try { const res = await fetch('/api/superadmin/announcements'); if (res.ok) setAnnouncements(await res.json()); } 
        catch (error) { console.error("Error fetching announcements:", error); } finally { setLoadingAnnouncements(false); }
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

    const handleStatusShift = async (id, nextStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/helpdesk/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated.ticket);
                fetchHelpdeskHub();
            }
        } catch (err) { alert("Error shifting status matrix"); }
    };

    const handleAssignStaff = async (e, id) => {
        e.preventDefault();
        if(!staffName) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/helpdesk/tickets/${id}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ staffName })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated.ticket);
                setStaffName('');
                fetchHelpdeskHub();
                alert("🎯 Support agent allocated successfully!");
            }
        } catch (err) { alert("Assignment failed"); }
    };

    const handleSendReply = async (e, id) => {
        e.preventDefault();
        if(!replyMsg.trim()) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/helpdesk/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: replyMsg, sender: 'SuperAdmin' })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated.ticket);
                setReplyMsg('');
                fetchHelpdeskHub();
            }
        } catch (err) { alert("Message delivery failed"); }
    };

    const handleCreateFaq = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/helpdesk/faqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(faqForm)
            });
            if (res.ok) {
                alert("📚 Knowledge Base FAQ Document Indexed!");
                setFaqForm({ question: '', answer: '', category: 'General' });
                fetchHelpdeskHub();
            }
        } catch (err) { alert("FAQ save error"); }
    };
    
    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        setSendingBroadcast(true);
        try {
            const res = await fetch('/api/superadmin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(broadcastData)
            });
            const data = await res.json();
            if (res.ok) {
                alert("✅ Broadcast Sent Successfully!");
                setBroadcastData({ title: '', message: '', targetAudience: 'All', priority: 'Normal', channels: { inApp: true, email: false, sms: false } });
                fetchAnnouncements(); 
            } else alert("❌ Failed to send: " + data.message);
        } catch (error) { alert("Network error while sending broadcast."); } finally { setSendingBroadcast(false); }
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

            {/* 🗂️ Tabs & Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit items-center">
                <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-950 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}>📊 Analytics</button>
                <button onClick={() => setActiveTab('companies')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'companies' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🏢 Registry</button>
                <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Revenue</button>
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Global Users</button>
                <button onClick={() => setActiveTab('support')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Helpdesk</button>
                <button onClick={() => setActiveTab('broadcast')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'broadcast' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>📢 Broadcast</button>
                <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>⚙️ Core</button>
                
                <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>
                
                <Link to="/superadmin/roles" className="px-5 py-2.5 rounded-xl text-sm font-black transition-all bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 hover:scale-105 shadow-sm flex items-center gap-2">
                    🔐 Access & Roles
                </Link>
                <Link to="/superadmin/master-data" className="px-5 py-2.5 rounded-xl text-sm font-black transition-all bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:scale-105 shadow-sm flex items-center gap-2">
                    🗂️ Master Data
                </Link>
                <Link to="/superadmin/security" className="px-5 py-2.5 rounded-xl text-sm font-black transition-all bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 hover:scale-105 shadow-sm flex items-center gap-2">
                    🛡️ Security & Logs
                </Link>
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

            {/* TAB 1: COMPANIES REGISTRY */}
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

            {/* TAB 2: REVENUE / BILLING */}
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

            {/* TAB 4: HELPDESK HUB */}
            {activeTab === 'support' && (
                <div className="animate-fadeIn space-y-6">
                    {/* Helpdesk Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md">
                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Total System Tickets</p>
                            <h2 className="text-3xl font-black">{helpdeskAnalytics.totalVolume}</h2>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Awaiting Triage</p>
                            <h2 className="text-2xl font-black text-red-600">{helpdeskAnalytics.openCount} Open</h2>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Diagnostic Pipeline</p>
                            <h2 className="text-2xl font-black text-amber-600">{helpdeskAnalytics.inProgressCount} Active</h2>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Resolution Time</p>
                            <h2 className="text-2xl font-black text-indigo-600">{helpdeskAnalytics.avgResolutionTime} Hours</h2>
                        </div>
                    </div>

                    {/* Nested Sub Tabs */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                        <button onClick={() => setHelpdeskSubTab('tickets')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${helpdeskSubTab === 'tickets' ? 'bg-white text-indigo-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>🎟️ Inbound Tickets ({helpdeskTickets.length})</button>
                        <button onClick={() => setHelpdeskSubTab('faqs')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${helpdeskSubTab === 'faqs' ? 'bg-white text-indigo-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>📚 FAQ Directory ({helpdeskFaqs.length})</button>
                    </div>

                    {helpdeskSubTab === 'tickets' && (
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Tickets Stream Table */}
                            <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm w-full">
                                <div className="overflow-x-auto max-h-[50vh]">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100"><th className="p-4">Tenant Client</th><th className="p-4">Issue Domain</th><th className="p-4">Description Payload</th><th className="p-4">Assigned Agent</th><th className="p-4">Status</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {helpdeskTickets.length === 0 ? (
                                                <tr><td colSpan="5" className="p-12 text-center text-gray-400 font-bold text-sm">No active client tickets in stream! 🎉</td></tr>
                                            ) : (
                                                helpdeskTickets.map(t => (
                                                    <tr key={t._id} onClick={() => setSelectedTicket(t)} className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${selectedTicket?._id === t._id ? 'bg-indigo-50/80 font-semibold' : ''}`}>
                                                        <td className="p-4">
                                                            <p className="font-black text-gray-900">{t.companyName}</p>
                                                            <p className="text-[10px] text-gray-400">{t.adminEmail}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px] mr-1">{t.issueType}</span>
                                                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${t.priority === 'Urgent' || t.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>{t.priority || 'Medium'}</span>
                                                        </td>
                                                        <td className="p-4 max-w-xs truncate text-gray-600">{t.description}</td>
                                                        <td className="p-4 font-semibold text-gray-500">👤 {t.assignedTo}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[9px] tracking-wider border ${t.status === 'Open' ? 'bg-red-50 text-red-600 border-red-100' : t.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{t.status}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Chat Console Workspace */}
                            <div className="w-full lg:w-80 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm min-h-[40vh] flex flex-col justify-between">
                                {selectedTicket ? (
                                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start border-b pb-2 mb-2">
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-xs">{selectedTicket.companyName} Console</h4>
                                                </div>
                                                <div className="flex gap-1">
                                                    {selectedTicket.status !== 'Resolved' && <button onClick={() => handleStatusShift(selectedTicket._id, 'Resolved')} className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-2 py-0.5 rounded">Resolve</button>}
                                                </div>
                                            </div>

                                            {/* Agent Allocation Form */}
                                            <form onSubmit={(e) => handleAssignStaff(e, selectedTicket._id)} className="flex gap-1.5 mb-3 bg-gray-50 p-1.5 rounded-xl border">
                                                <input type="text" value={staffName} onChange={e => setStaffName(e.target.value)} required placeholder="Support Agent Name" className="flex-1 text-[11px] px-2 py-1 bg-white border rounded outline-none" />
                                                <button type="submit" className="bg-indigo-950 text-white text-[9px] font-black px-2.5 rounded uppercase">Assign</button>
                                            </form>

                                            {/* Chat Thread Panel */}
                                            <div className="bg-gray-50 p-2.5 rounded-xl border max-h-40 overflow-y-auto space-y-2 text-[10px]">
                                                <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                                                    <p className="font-bold text-indigo-950">🚨 Initial payload description:</p>
                                                    <p className="text-gray-700 mt-0.5">{selectedTicket.description}</p>
                                                </div>
                                                {selectedTicket.replies?.map((r, i) => (
                                                    <div key={i} className={`p-2 rounded-lg border ${r.sender === 'SuperAdmin' ? 'bg-white ml-2' : 'bg-blue-50/50 mr-2'}`}>
                                                        <p className="font-black text-gray-900 text-[9px]">{r.sender === 'SuperAdmin' ? '👑 HQ Support' : '👤 Client Admin'}</p>
                                                        <p className="text-gray-700 mt-0.5">{r.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Messaging Engine Inputs */}
                                        <form onSubmit={(e) => handleSendReply(e, selectedTicket._id)} className="pt-2 border-t flex gap-1.5">
                                            <input type="text" required value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Type patch message stream..." className="flex-1 text-[11px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white" />
                                            <button type="submit" className="bg-indigo-950 text-white px-3 rounded-lg text-xs font-bold">Drop</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 font-bold m-auto text-[11px] py-8">
                                        🔮 Select a live tenant ticket stream above to deploy patches, assign agents, or load chat threads.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {helpdeskSubTab === 'faqs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            {/* FAQ Creation Box */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                                <h4 className="font-black text-gray-900 text-sm">Index Knowledge Base Doc</h4>
                                <form onSubmit={handleCreateFaq} className="space-y-3.5 text-xs font-semibold">
                                    <div>
                                        <label className="block text-[9px] uppercase font-black text-gray-400 mb-1">Knowledge Question</label>
                                        <input type="text" required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full border p-3 rounded-xl outline-none text-gray-800" placeholder="e.g., How to configure custom PF deductions?" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] uppercase font-black text-gray-400 mb-1">Resolution Answer Payload</label>
                                        <textarea required rows="3" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full border p-3 rounded-xl outline-none text-gray-800 font-medium" placeholder="Step-by-step resolution details..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] uppercase font-black text-gray-400 mb-1">Module Category Domain</label>
                                        <select value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})} className="w-full border p-3 bg-white rounded-xl outline-none text-gray-800">
                                            <option value="General">General Platform</option><option value="Billing">Billing Accounts</option><option value="Attendance">Attendance Modules</option><option value="Payroll">Payroll Processors</option><option value="Troubleshooting">Core Troubleshooting</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-950 hover:bg-black font-black uppercase text-white py-3 rounded-xl shadow-md transition-colors tracking-wider text-[10px]">Index Document Base</button>
                                </form>
                            </div>

                            {/* FAQ Directory Table */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
                                <h4 className="font-black text-gray-900 text-sm">Indexed Help Manual Directory</h4>
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                                    {helpdeskFaqs.length === 0 ? (
                                        <div className="text-gray-400 p-8 text-center font-bold text-xs">No documentation indexed yet. Use the left panel to register instructions manuals.</div>
                                    ) : (
                                        helpdeskFaqs.map(f => (
                                            <div key={f._id} className="p-3.5 rounded-xl border bg-gray-50/40 hover:bg-white hover:border-gray-200 transition-all">
                                                <div className="flex justify-between mb-1"><span className="bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">{f.category} Node</span></div>
                                                <h5 className="font-black text-gray-900 text-xs mb-0.5">Q: {f.question}</h5>
                                                <p className="text-gray-600 text-xs font-medium pl-3 border-l border-indigo-200">A: {f.answer}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 6: 📢 GLOBAL BROADCAST ENGINE */}
            {activeTab === 'broadcast' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-1">Send Global Broadcast</h2>
                        <p className="text-xs text-gray-500 mb-6">Push notifications, emails, and SMS to your entire tenant network.</p>
                        
                        <form className="space-y-4" onSubmit={handleBroadcastSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Announcement Title *</label>
                                    <input type="text" required value={broadcastData.title} onChange={e => setBroadcastData({...broadcastData, title: e.target.value})} placeholder="e.g., Scheduled Maintenance Downtime" className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                                </div> {/* ✅ Fixed layout syntax error here */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Message Body *</label>
                                    <textarea required rows="4" value={broadcastData.message} onChange={e => setBroadcastData({...broadcastData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Type your message here..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Target Audience</label>
                                    <select value={broadcastData.targetAudience} onChange={e => setBroadcastData({...broadcastData, targetAudience: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-indigo-500">
                                        <option value="All">All Companies (Global)</option>
                                        <option value="Specific">Specific Companies</option>
                                        <option value="Admins">Only HR Admins</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Priority Level</label>
                                    <select value={broadcastData.priority} onChange={e => setBroadcastData({...broadcastData, priority: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none bg-white focus:border-indigo-500">
                                        <option value="Normal">Normal</option>
                                        <option value="Urgent">Urgent (Highlight in App)</option>
                                        <option value="Emergency">🚨 Emergency (Bypass DND)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex flex-wrap gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={broadcastData.channels.inApp} onChange={e => setBroadcastData({...broadcastData, channels: {...broadcastData.channels, inApp: e.target.checked}})} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-bold text-gray-700">In-App Notification</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={broadcastData.channels.email} onChange={e => setBroadcastData({...broadcastData, channels: {...broadcastData.channels, email: e.target.checked}})} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-bold text-gray-700">Email Dispatch</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={broadcastData.channels.sms} onChange={e => setBroadcastData({...broadcastData, channels: {...broadcastData.channels, sms: e.target.checked}})} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-bold text-gray-700">SMS Gateway</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" disabled={sendingBroadcast} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors text-white font-bold px-8 py-3 rounded-xl shadow-lg">
                                    {sendingBroadcast ? '🚀 Sending...' : '🚀 Send Broadcast'}
                                </button>
                            </div>
                        </form>    
                    </div>

                    {/* Broadcast Logs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-black text-gray-900">Broadcast Logs & Read Receipts</h2></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold border-b border-gray-200">
                                        <th className="p-4">Date</th><th className="p-4">Title</th><th className="p-4">Target</th><th className="p-4">Channels</th><th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingAnnouncements ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading broadcasts...</td></tr>
                                    ) : (announcements || []).length === 0 ? (
                                        <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">No announcements broadcasted yet.</td>
                                        </tr>
                                    ) : (
                                        announcements.map((ann, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="p-4 text-sm font-semibold text-gray-700">{new Date(ann.createdAt).toLocaleString()}</td>
                                                <td className="p-4 font-black text-gray-900">{ann.title}</td>
                                                <td className="p-4 text-sm text-gray-600">{ann.targetAudience}</td>
                                                <td className="p-4 text-xs font-bold text-gray-500">
                                                    {ann.channels?.inApp && 'In-App '}{ann.channels?.email && 'Email '}{ann.channels?.sms && 'SMS'}
                                                </td>
                                                <td className="p-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase">{ann.status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: SYSTEM CORE CONFIGS */}
            {activeTab === 'settings' && (
                <div className="animate-fadeIn max-w-4xl">
                    {settings && (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
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

                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-black text-gray-900 mb-6">⚖️ Legal & Compliance Documents</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Platform Terms & Conditions</label>
                                        <textarea value={settings.termsAndConditions || ''} onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})} className="w-full p-4 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px]" placeholder="Enter global terms..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Global Privacy Policy</label>
                                        <textarea value={settings.privacyPolicy || ''} onChange={(e) => setSettings({...settings, privacyPolicy: e.target.value})} className="w-full p-4 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px]" placeholder="Enter privacy rules..." />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={savingSettings} className="bg-indigo-950 hover:bg-indigo-900 transition-colors text-white font-black px-8 py-4 rounded-xl shadow-lg w-full">{savingSettings ? "Updating Environment..." : "Save Production Matrix"}</button>
                        </form>
                    )}
                </div>
            )}

            {/* 📋 MEGA MODAL FOR ADD / EDIT COMPANIES */}
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
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 mr-4 transition-colors">Cancel</button> {/* ✅ Fixed window contexts loop */}
                            <button form="enterpriseForm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-black px-8 py-3 rounded-xl shadow-lg">{isEditMode ? 'Update Client' : 'Register Client'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}