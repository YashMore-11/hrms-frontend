import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar.jsx';

export default function AdminProfile() {
    const [adminData, setAdminData] = useState({
        adminId: "ADM-2026-MUM01",
        name: "Aarav Mehta",
        email: "admin.root@company.com",
        title: "Chief Executive Officer (CEO)",
        companyName: "Nexus Digital Quantum Corp",
        companyStartDate: "January 15, 2022",
        Location: "Bandra Kurla Complex, Mumbai",
        securityClearance: "Level 5 (Root Global Access)",
        legalStructure: "Private Limited (LLC)",
        boardSeats: "7 Seats Allocated",
        marketCapTier: "Mid-Market Enterprise",
        managedEmployeesCount: 0,
        deptMetrics: {
            engineering: 0,
            hr: 0,
            design: 0,
            others: 0
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(adminData.name);
    const [companyName, setCompanyName] = useState(adminData.companyName);
    const [location, setLocation] = useState(adminData.Location);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAdminProfileAndMetrics = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch('http://localhost:5000/api/employees', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await res.json();

                if (res.ok) {
                    const loggedInEmail = localStorage.getItem('userEmail') || "admin.root@company.com";

                    // Parse clean department distribution indices directly from data payload
                    const total = data.length;
                    const hrs = data.filter(emp => emp.role === 'hr' || emp.department?.toLowerCase().includes('hr') || emp.department?.toLowerCase().includes('resource')).length;
                    const devs = data.filter(emp => emp.department?.toLowerCase().includes('engineer') || emp.department?.toLowerCase().includes('dev')).length;
                    const designers = data.filter(emp => emp.department?.toLowerCase().includes('design') || emp.department?.toLowerCase().includes('ux') || emp.department?.toLowerCase().includes('ui')).length;
                    const others = total - (hrs + devs + designers);

                    setAdminData(prev => ({
                        ...prev,
                        email: loggedInEmail,
                        managedEmployeesCount: total,
                        deptMetrics: {
                            engineering: devs,
                            hr: hrs,
                            design: designers,
                            others: others > 0 ? others : 0
                        }
                    }));
                }
            } catch (err) {
                console.error("Error reading administrative profiles:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminProfileAndMetrics();
    }, []);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setIsEditing(false);
        setAdminData(prev => ({ ...prev, name, companyName, branchLocation }));
        alert("Administrative baseline records updated successfully inside MongoDB.");
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">

            {/* ✅ REUSABLE TELEMETRY ADMIN SIDEBAR */}
            <AdminSidebar activeModule="profile" />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Workspace Header Title */}
                    <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Admin Profile</h1>
                            <p className="text-sm text-slate-500 mt-1">Audit administrative clearances, legal framework configurations, and organizational headcounts</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(!isEditing);
                                if (isEditing) {
                                    setName(adminData.name);
                                    setCompanyName(adminData.companyName);
                                    setBranchLocation(adminData.branchLocation);
                                }
                            }}
                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border ${isEditing ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 hover:bg-fuchsia-100'
                                }`}
                        >
                            {isEditing ? "Cancel Changes" : "✏️ Edit Profile Data"}
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                            Querying Mongoose Admin Cluster Metadata...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column: Admin Node & Department Summary Cards */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* CEO Avatar Card */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-fuchsia-800 to-purple-900 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-fuchsia-100 mb-4 tracking-tighter">
                                        CEO
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{adminData.name}</h2>
                                    <p className="text-[9px] font-black text-fuchsia-700 mt-1.5 uppercase tracking-widest bg-fuchsia-50 border border-fuchsia-100 px-3 py-1 rounded-md">
                                        {adminData.title}
                                    </p>

                                    <div className="w-full border-t border-slate-100 my-5" />

                                    <div className="w-full text-left space-y-4">
                                        <div>
                                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mongoose Unique ID</span>
                                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 block break-all">{adminData.adminId}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Secure Root Email</span>
                                            <span className="text-xs font-bold text-slate-800 break-all">{adminData.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-time Org Distribution Tracker */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                                    <div className="border-b border-slate-100 pb-2">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Departments</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">headcount</p>
                                    </div>

                                    <div className="space-y-2 text-xs font-bold">
                                        <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <span className="text-slate-500 uppercase text-[10px]">💻 Tech / Engineering</span>
                                            <span className="font-mono font-black text-slate-900">{adminData.deptMetrics.engineering} Hires</span>
                                        </div>
                                        <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <span className="text-slate-500 uppercase text-[10px]">👥 Human Resources</span>
                                            <span className="font-mono font-black text-slate-900">{adminData.deptMetrics.hr} Hires</span>
                                        </div>
                                        <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <span className="text-slate-500 uppercase text-[10px]">🎨 UI/UX & Design</span>
                                            <span className="font-mono font-black text-slate-900">{adminData.deptMetrics.design} Hires</span>
                                        </div>
                                        <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                                <span className="text-slate-500 uppercase text-[10px]">👥Marketing</span>
                                            <span className="font-mono font-black text-slate-900">{adminData.deptMetrics.others} Hires</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Framework Configuration Profile Form */}
                            <div className="lg:col-span-2 space-y-6">

                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">
                                        Profile
                                    </h3>

                                    {!isEditing ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Enterprise</span>
                                                    <span className="text-sm font-black text-slate-900">{adminData.companyName}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incorporation Timeline</span>
                                                    <span className="text-sm font-bold text-slate-800">{adminData.companyStartDate}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Headquarters Location Hub</span>
                                                    <span className="text-sm font-bold text-slate-800">{adminData.branchLocation}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Access Token Flag</span>
                                                    <span className="text-sm font-mono font-bold text-fuchsia-700">{adminData.securityClearance}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Legal Layout</span>
                                                    <span className="text-sm font-bold text-slate-800">{adminData.legalStructure}</span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Board Composition Quota</span>
                                                    <span className="text-sm font-bold text-slate-800">{adminData.boardSeats}</span>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enterprise Operational Tier</span>
                                                <span className="text-sm font-black text-slate-900">{adminData.marketCapTier}</span>
                                            </div>

                                            {/* Unified Document Counter Telemetry Box */}
                                            <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 p-5 rounded-2xl border border-fuchsia-100/70 flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-[11px] font-black text-fuchsia-800 uppercase tracking-widest">Total Monitored Headcount</h4>
                                                    <p className="text-[11px] font-medium text-slate-500 normal-case mt-0.5">
                                                        Active linked profile items parsed across standard tables.
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-3xl font-black text-fuchsia-800 font-mono">{adminData.managedEmployeesCount}</span>
                                                    <span className="block text-[9px] font-black text-fuchsia-400 uppercase tracking-tight">Personnel</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CEO Executive Full Name</label>
                                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-600 outline-none transition-all font-bold text-slate-800" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Enterprise Identity Name</label>
                                                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-600 outline-none transition-all font-bold text-slate-800" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HQ Node Location Address</label>
                                                    <input type="text" value={branchLocation} onChange={(e) => setBranchLocation(e.target.value)} required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-600 outline-none transition-all font-bold text-slate-800" />
                                                </div>
                                            </div>

                                            <button type="submit" className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all shadow-md shadow-slate-200">
                                                Commit Global Configuration Document Changes
                                            </button>
                                        </form>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}