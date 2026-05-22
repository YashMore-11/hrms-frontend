import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({
        totalStaff: 0,
        hrCount: 0,
        developerCount: 0,
        designCount: 0,
        otherCount: 0,
        activeShifts: 0
    });

    // Dynamic Hiring Quotas / Vacancy Targets based on typical branch targets
    const vacancyQuotas = [
        { department: "Engineering / Dev", filled: 0, target: 15, color: "bg-indigo-600" },
        { department: "Human Resources", filled: 0, target: 4, color: "bg-purple-600" },
        { department: "UI/UX Design", filled: 0, target: 5, color: "bg-pink-600" }
    ];

    const [vacancies, setVacancies] = useState(vacancyQuotas);
    const [systemLogs, setSystemLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAdminMetrics = async () => {
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
                    const total = data.length;
                    const hrs = data.filter(emp => emp.role === 'hr' || emp.department?.toLowerCase().includes('hr') || emp.department?.toLowerCase().includes('resource')).length;
                    const devs = data.filter(emp => emp.department?.toLowerCase().includes('engineer') || emp.department?.toLowerCase().includes('dev')).length;
                    const designers = data.filter(emp => emp.department?.toLowerCase().includes('design') || emp.department?.toLowerCase().includes('ux') || emp.department?.toLowerCase().includes('ui')).length;
                    const others = total - (hrs + devs + designers);

                    setMetrics({
                        totalStaff: total,
                        hrCount: hrs,
                        developerCount: devs,
                        designCount: designers,
                        otherCount: others > 0 ? others : 0,
                        activeShifts: Math.ceil(total * 0.85)
                    });

                    // Map dynamic fills against corporate targets to determine true remaining vacancies
                    setVacancies([
                        { department: "Engineering / Dev", filled: devs, target: 15, color: "bg-indigo-600" },
                        { department: "Human Resources", filled: hrs, target: 4, color: "bg-purple-600" },
                        { department: "UI/UX Design", filled: designers, target: 5, color: "bg-pink-600" }
                    ]);

                    const logs = data.slice(-3).reverse().map((emp, idx) => ({
                        id: idx,
                        text: `Account baseline generated successfully for ${emp.name} (${emp.role.toUpperCase()})`,
                        time: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'Live Sync'
                    }));
                    setSystemLogs(logs);
                }
            } catch (err) {
                console.error("Error reading branch indexes:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminMetrics();
    }, []);

    return (
        <div className="min-h-screen flex bg-white font-sans">
            <AdminSidebar activeModule="dashboard" />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Branch Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Audit active data collections, staff distributions, and system runtime history</p>
                    </div>

                    <button
                        onClick={() => navigate('/admin/create-user')}
                        className="px-5 py-3 rounded-xl text-[10px] bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest transition-all shadow-md shadow-gray-200"
                    >
                        ➕ Onboard New User
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
                        Compiling organizational system matrix...
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Top Scorecards Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Base Hires', value: metrics.totalStaff, context: 'Active Database Entries' },
                                { label: 'HR Allocations', value: metrics.hrCount, context: 'Management Administrators' },
                                { label: 'Engineering Tier', value: metrics.developerCount, context: 'Dev / Tech Personnel' },
                                { label: 'Expected On Duty', value: metrics.activeShifts, context: 'Standard Active Ratio' }
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</span>
                                    <span className="text-3xl font-black text-gray-900 block">{card.value}</span>
                                    <span className="block text-[10px] text-gray-400 font-bold mt-1 uppercase">{card.context}</span>
                                </div>
                            ))}
                        </div>

                        {/* NEW DETAILED ANALYTICS METRIC ROW: Chart Breakdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Department Wise Employee Count Bar Graph Map */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                                <div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Department Distribution Chart</h3>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-0.5">Real-time counts parsed from personnel records</p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {[
                                        { name: 'Engineering / Tech', count: metrics.developerCount, color: 'bg-indigo-800' },
                                        { name: 'Human Resources', count: metrics.hrCount, color: 'bg-purple-600' },
                                        { name: 'UI/UX & Design', count: metrics.designCount, color: 'bg-pink-600' },
                                        { name: 'General Support / Others', count: metrics.otherCount, color: 'bg-gray-400' }
                                    ].map((dept, idx) => {
                                        const percentage = metrics.totalStaff > 0 ? (dept.count / metrics.totalStaff) * 100 : 0;
                                        return (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-tight">
                                                    <span>{dept.name}</span>
                                                    <span className="font-mono text-gray-900 font-black">{dept.count} Staff ({Math.round(percentage)}%)</span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${dept.color} transition-all duration-500 rounded-full`}
                                                        style={{ width: `${percentage || 2}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Hiring Pipeline Target & Vacancy Gauges */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                                <div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Hiring Quotas & Vacancies</h3>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-0.5">Track remaining headcounts against corporate metrics</p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {vacancies.map((v, idx) => {
                                        const openPositions = v.target - v.filled;
                                        const vacancyRemaining = openPositions > 0 ? openPositions : 0;
                                        const progressPercentage = (v.filled / v.target) * 100;

                                        return (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-tight">
                                                    <span>{v.department}</span>
                                                    <span className="font-mono font-black text-indigo-800">
                                                        {vacancyRemaining === 0 ? "✨ CAP FILLED" : `${vacancyRemaining} Vacant Slots Open`}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-50 border border-gray-100 rounded-full overflow-hidden flex">
                                                    <div
                                                        className={`h-full ${v.color} transition-all duration-500`}
                                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[9px] font-mono font-black text-gray-400 uppercase">
                                                    <span>Current: {v.filled} Active</span>
                                                    <span>Target Cap: {v.target} Seats</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* System Log History Matrix Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Onboarding Operations</h3>
                                {systemLogs.length === 0 ? (
                                    <p className="text-xs text-gray-400 py-4 font-bold uppercase">No deployment entries found inside database records.</p>
                                ) : (
                                    <div className="divide-y divide-gray-100 text-xs font-bold text-gray-600">
                                        {systemLogs.map((log) => (
                                            <div key={log.id} className="py-3.5 flex justify-between items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[9px] font-black uppercase">SYSTEM_OK</span>
                                                    <span className="text-gray-700 normal-case">{log.text}</span>
                                                </div>
                                                <span className="font-mono text-gray-400 text-[10px] flex-shrink-0">{log.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Branch Framework</h3>
                                    <div className="space-y-3 font-bold text-xs text-gray-600 uppercase">
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400">Database Context</span>
                                            <span className="text-gray-800 font-mono">MongoDB Atlas</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400">Network Engine</span>
                                            <span className="text-gray-800 font-mono">Express REST</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400">Token Validation</span>
                                            <span className="text-gray-800 font-mono">HS256 JWT</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-900">
                                    <span className="block text-[10px] uppercase font-black tracking-widest text-indigo-700 mb-1">Security Clearance</span>
                                    <p className="text-[11px] font-medium leading-relaxed normal-case text-indigo-600">
                                        Your account has global creation privileges. You can provision staff profiles and assign functional domain roles.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}