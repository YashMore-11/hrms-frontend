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
        <div className="min-h-screen flex bg-[#f8fafc] font-sans">

            {/* REUSABLE TELEMETRY HR SIDEBAR */}
            <HRSidebar activeModule={viewTab === 'employees' ? 'ledger' : 'dashboard'} />

            {/* MAIN VIEW AREA */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">

                {/* TOP HEADER SECTION */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1e293b]">Hello Ananya</h1>
                        <p className="text-sm text-[#64748b] mt-0.5">Welcome to the HR management system</p>
                    </div>

                    {/* User profile actions & Search right block */}
                    <div className="flex items-center space-x-4 self-end sm:self-auto">
                        <button className="p-2.5 bg-white text-[#64748b] rounded-full border border-[#e2e8f0] hover:bg-gray-50 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <button className="p-2.5 bg-white text-[#64748b] rounded-full border border-[#e2e8f0] hover:bg-gray-50 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                        <div className="flex items-center space-x-3 pl-2">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-[#1e293b]">Yash More</p>
                                <p className="text-xs text-[#94a3b8]">Lead HR</p>
                            </div>
                            <div className="w-10 h-10 bg-[#e2e8f0] rounded-full flex items-center justify-center text-[#64748b] font-semibold border border-white shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Error Notice */}
                {error && (
                    <div className="p-4 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl uppercase tracking-wider">
                        ⚠️ {error}
                    </div>
                )}

                {/* VIEW A: OVERVIEW METRICS */}
                {viewTab === 'overview' && (
                    <div className="space-y-6">

                        {/* FOUR METRICS ROW */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* Card 1: Dark Variant */}
                            <div className="p-6 bg-[#161e2e] text-white rounded-[24px] shadow-sm flex flex-col justify-between min-h-[140px]">
                                <div className="flex items-center space-x-2 opacity-80">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-medium tracking-tight">Days in the company</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-4">
                                    <span className="text-4xl font-bold tracking-tight">418</span>
                                    <span className="text-xs font-medium text-[#38bdf8]">+7% last month</span>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="p-6 bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[140px]">
                                <div className="flex items-center space-x-2 text-[#64748b]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-medium tracking-tight">Projects in progress</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-4">
                                    <span className="text-4xl font-bold tracking-tight text-[#1e293b]">6</span>
                                    <span className="text-xs font-medium text-[#6366f1]">+1 last month</span>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="p-6 bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[140px]">
                                <div className="flex items-center space-x-2 text-[#64748b]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-medium tracking-tight">Completed projects</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-4">
                                    <span className="text-4xl font-bold tracking-tight text-[#1e293b]">28</span>
                                    <span className="text-xs font-medium text-[#6366f1]">+4 last month</span>
                                </div>
                            </div>

                            {/* Card 4 */}
                            <div className="p-6 bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[140px]">
                                <div className="flex items-center space-x-2 text-[#64748b]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-medium tracking-tight">Salary</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-4">
                                    <span className="text-4xl font-bold tracking-tight text-[#1e293b]">$5,450</span>
                                    <span className="text-xs font-medium text-[#10b981]">+25% last year</span>
                                </div>
                            </div>

                        </div>

                        {/* SPLIT SUB-GRID SYSTEM */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* Person Card */}
                            <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[260px]">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-[#1e293b]">Person</h3>
                                    <button className="text-xs font-medium text-[#94a3b8] hover:text-[#64748b]">Details</button>
                                </div>
                                <div className="flex items-center space-x-5 my-auto">
                                    <div className="w-16 h-16 bg-[#f1f5f9] rounded-xl flex items-center justify-center text-[#94a3b8]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-medium text-[#94a3b8] tracking-wider">First Name</p>
                                        <p className="text-base font-semibold text-[#1e293b] -mt-0.5">Rahul</p>
                                        <p className="text-[11px] uppercase font-medium text-[#94a3b8] tracking-wider mt-2">Last Name</p>
                                        <p className="text-base font-semibold text-[#1e293b] -mt-0.5">Sharma</p>
                                        <p className="text-[11px] uppercase font-medium text-[#94a3b8] tracking-wider mt-2">Position</p>
                                        <p className="text-sm font-bold text-[#1e293b] -mt-0.5">Backend Developer</p>
                                    </div>
                                </div>
                            </div>

                            {/* Working Format Card */}
                            <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[260px]">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-[#1e293b]">Working format</h3>
                                    <button className="text-xs font-medium text-[#94a3b8] hover:text-[#64748b]">Details</button>
                                </div>

                                {/* CSS Conic-Gradient Donut Chart simulation matching UI layout exactly */}
                                <div className="flex flex-col items-center justify-center my-auto space-y-5">
                                    <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
                                        style={{ background: 'conic-gradient(#10b981 0% 60%, #f59e0b 60% 90%, #3b82f6 90% 100%)' }}>
                                        <div className="w-[84px] h-[84px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                            <span className="text-xl font-bold text-[#1e293b]">418</span>
                                            <span className="text-[10px] text-[#94a3b8] -mt-0.5">Days</span>
                                        </div>
                                    </div>

                                    {/* Chart Labels */}
                                    <div className="flex items-center justify-center space-x-3 text-[11px] font-medium text-[#64748b]">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                                            <span>60% Office</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                                            <span>30% Hybrid</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                                            <span>10% Remote</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Schedule Card */}
                            <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between min-h-[260px]">
                                <h3 className="text-sm font-semibold text-[#1e293b]">Upcoming schedule</h3>

                                <div className="space-y-4 mt-4 my-auto">
                                    {/* Schedule Row 1 */}
                                    <div className="flex items-start space-x-4">
                                        <span className="text-xs font-bold text-[#1e293b] pt-0.5 w-10">10:00</span>
                                        <div className="pl-3 border-l-2 border-[#3b82f6]">
                                            <p className="text-[11px] font-medium text-[#94a3b8]">Head of Marketing</p>
                                            <p className="text-xs font-bold text-[#1e293b]">Product Demo</p>
                                        </div>
                                    </div>
                                    {/* Schedule Row 2 */}
                                    <div className="flex items-start space-x-4">
                                        <span className="text-xs font-bold text-[#1e293b] pt-0.5 w-10">11:30</span>
                                        <div className="pl-3 border-l-2 border-[#f59e0b]">
                                            <p className="text-[11px] font-medium text-[#94a3b8]">Creative Director</p>
                                            <p className="text-xs font-bold text-[#1e293b]">Campaign Brainstorm</p>
                                        </div>
                                    </div>
                                    {/* Schedule Row 3 */}
                                    <div className="flex items-start space-x-4">
                                        <span className="text-xs font-bold text-[#1e293b] pt-0.5 w-10">14:20</span>
                                        <div className="pl-3 border-l-2 border-[#10b981]">
                                            <p className="text-[11px] font-medium text-[#94a3b8]">CEO</p>
                                            <p className="text-xs font-bold text-[#1e293b]">Quarterly Review</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Database Logs or metrics placeholder layout */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#e2e8f0] shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Recent System Log Updates</h3>
                            <div className="divide-y divide-[#f1f5f9] text-xs text-[#64748b]">
                                <div className="py-3 flex justify-between font-medium"><span>New employee profiles parsed successfully into memory state</span><span className="font-mono text-[#94a3b8]">Live Sync</span></div>
                                <div className="py-3 flex justify-between font-medium"><span>Leave request submitted by backend developer queue node</span><span className="font-mono text-[#94a3b8]">3 Hours Ago</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW B: REAL-TIME EMPLOYEE LEDGER FROM MONGODB */}
                {viewTab === 'employees' && (
                    <div className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-xs font-semibold text-[#94a3b8] uppercase tracking-widest animate-pulse">
                                Parsing active database document collections...
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="p-12 text-center text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">
                                No personnel models found. Use the Admin Onboarding panel to populate the database.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs tracking-tight">
                                    <thead>
                                        <tr className="border-b border-[#e2e8f0] text-[#64748b] font-semibold bg-slate-50">
                                            <th className="p-4">Staff ID</th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">System Role</th>
                                            <th className="p-4">Department Division</th>
                                            <th className="p-4">Email Contact</th>
                                            <th className="p-4 text-right">Age</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f5f9] font-medium text-[#1e293b]">
                                        {employees.map((emp) => (
                                            <tr key={emp.empId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 font-mono text-xs text-gray-900">{emp.empId}</td>
                                                <td className="p-4 text-gray-900 font-semibold">{emp.name}</td>
                                                <td className="p-4">
                                                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[#64748b]">{emp.department}</td>
                                                <td className="p-4 text-[#94a3b8] lowercase font-normal">{emp.email}</td>
                                                <td className="p-4 text-right font-mono text-gray-900">{emp.age || 'N/A'}</td>
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
                            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-[24px] text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">
                                ✓ Leave approval queue completely cleared.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {leaveRequests.map((req) => (
                                    <div key={req.id} className="bg-white p-6 rounded-[24px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-base font-bold text-[#1e293b] tracking-tight">{req.name}</h4>
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
                                                        {req.type}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-[#94a3b8]">{req.days} Days Requested</span>
                                            </div>
                                            <div className="p-3.5 bg-slate-50 rounded-xl border border-[#e2e8f0] text-xs font-normal text-[#64748b]">
                                                <div className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider mb-1">Reason Statement</div>
                                                "{req.reason}"
                                            </div>
                                            <div className="text-[10px] font-mono font-medium text-[#94a3b8] uppercase tracking-tight">
                                                Requested Window: {req.timeline}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLeaveAction(req.id, 'Reject')}
                                                className="py-2.5 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleLeaveAction(req.id, 'Approve')}
                                                className="py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
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