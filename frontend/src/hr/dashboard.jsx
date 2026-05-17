import { useState, useEffect } from 'react';
import HRSidebar from '../components/HRSidebar'; // Clean shortcut reference to your shared sidebar

export default function HRDashboard() {
    const [employees, setEmployees] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([
        { id: 1, name: "Gautam", type: "Casual Leave", timeline: "2026-06-01 to 2026-06-03", days: 3, reason: "Family function travel" },
        { id: 2, name: "Chetana", type: "Medical Leave", timeline: "2026-05-20 to 2026-05-22", days: 2, reason: "Surgical alignment recovery" }
    ]);
    const [viewTab, setViewTab] = useState('overview'); // 'overview', 'employees', 'leaves'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. FETCH ACTUAL DATABASE EMPLOYEES ON COMPONENT MOUNT OR TAB SWITCH
    useEffect(() => {
        if (viewTab === 'employees' || viewTab === 'overview') {
            const fetchEmployees = async () => {
                setIsLoading(true);
                setError('');
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
                    if (!res.ok) throw new Error(data.message || 'Failed to sync employee records.');

                    setEmployees(data || []);
                } catch (err) {
                    console.error("Database Connection Error:", err);
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchEmployees();
        }
    }, [viewTab]);

    const handleLeaveAction = (id, action) => {
        alert(`Leave application request #${id} has been ${action}ed successfully.`);
        setLeaveRequests(prev => prev.filter(req => req.id !== id));
    };

    return (
        /* MAIN CONTAINER: Pure White Background */
        <div className="min-h-screen flex bg-white font-sans">

            {/* REUSABLE TELEMETRY HR SIDEBAR */}
            <HRSidebar activeModule={viewTab === 'employees' ? 'ledger' : 'dashboard'} />

            {/* MAIN VIEW AREA */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8">

                <div className="border-b border-slate-100 pb-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                        {viewTab === 'overview' && "Analytics Dashboard"}
                        {viewTab === 'employees' && "Personnel Records"}
                        {viewTab === 'leaves' && "Leave Management Desk"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {viewTab === 'overview' && "Monitor high-level staff counts, outstanding alerts, and daily attendance statistics."}
                        {viewTab === 'employees' && "Review comprehensive organizational details for registered staff models."}
                        {viewTab === 'leaves' && "Audit, authenticate, and commit action verdicts on pending workforce leave pipelines."}
                    </p>
                </div>

                {/* Global Error Notice */}
                {error && (
                    <div className="p-4 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-700 rounded-xl uppercase tracking-wider">
                        ⚠️ {error}
                    </div>
                )}

                {/* VIEW A: OVERVIEW METRICS */}
                {viewTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Total Onboarded Staff', value: isLoading ? '...' : `${employees.length} Personnel`, context: 'Active inside MongoDB index', color: 'text-teal-600' },
                                { label: 'Leave Requests Queue', value: `${leaveRequests.length} Open Profiles`, context: 'Action required by EOD', color: 'text-amber-600' },
                                { label: 'Today Availability Metric', value: '96.4% Online', context: '0 Unexcused absences flagged', color: 'text-indigo-600' }
                            ].map((card, idx) => (
                                <div key={idx} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</span>
                                    <span className={`text-2xl font-black block ${card.color}`}>{card.value}</span>
                                    <span className="block text-[11px] font-bold text-slate-400 mt-1">{card.context}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent System Log Updates</h3>
                            <div className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                                <div className="py-3 flex justify-between"><span>New employee profiles parsed successfully into memory state</span><span className="font-mono text-slate-400">Live Sync</span></div>
                                <div className="py-3 flex justify-between"><span>Leave request submitted by backend developer queue node</span><span className="font-mono text-slate-400">3 Hours Ago</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW B: REAL-TIME EMPLOYEE LEDGER FROM MONGODB */}
                {viewTab === 'employees' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                Parsing active database document collections...
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                No personnel models found. Use the Admin Onboarding panel to populate the database.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px] uppercase tracking-tight">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 font-black tracking-widest bg-slate-50">
                                            <th className="p-4">Staff ID</th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">System Role</th>
                                            <th className="p-4">Department Division</th>
                                            <th className="p-4">Email Contact</th>
                                            <th className="p-4 text-right">Age</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                                        {employees.map((emp) => (
                                            <tr key={emp.empId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 font-mono font-black text-slate-900">{emp.empId}</td>
                                                <td className="p-4 text-slate-900 text-sm normal-case font-bold">{emp.name}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${emp.role === 'hr' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                        }`}>
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500 normal-case">{emp.department}</td>
                                                <td className="p-4 text-slate-400 lowercase font-medium">{emp.email}</td>
                                                <td className="p-4 text-right font-mono font-black text-slate-900">{emp.age || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW C: LEAVE APPLICATION DESK */}
                {viewTab === 'leaves' && (
                    <div className="space-y-6">
                        {leaveRequests.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-3xl text-xs font-black text-slate-400 uppercase tracking-widest">
                                ✓ Leave approval queue completely cleared.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {leaveRequests.map((req) => (
                                    <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-base font-black text-slate-900 tracking-tight">{req.name}</h4>
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100 rounded">
                                                        {req.type}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs font-black text-slate-400">{req.days} Days Requested</span>
                                            </div>
                                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600">
                                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Reason Statement</div>
                                                "{req.reason}"
                                            </div>
                                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">
                                                Requested Window: {req.timeline}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLeaveAction(req.id, 'Reject')}
                                                className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleLeaveAction(req.id, 'Approve')}
                                                className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-50"
                                            >
                                                Approve Leave
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}