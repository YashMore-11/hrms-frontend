import { useState, useEffect } from 'react';

export default function SecurityAuditConsole() {
    const [activeSubTab, setActiveSubTab] = useState('logs'); // 'logs', 'sessions', 'firewall'
    const [logs, setLogs] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [ipRules, setIpRules] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters State
    const [filterCategory, setFilterCategory] = useState('');
    const [filterRole, setFilterRole] = useState('');

    // Form States
    const [ipForm, setIpForm] = useState({ ipAddress: '', ruleType: 'Blacklist', reason: '' });

    useEffect(() => {
        if (activeSubTab === 'logs') fetchAuditLogs();
        if (activeSubTab === 'sessions') fetchLiveSessions();
        if (activeSubTab === 'firewall') fetchIpRules();
    }, [activeSubTab, filterCategory, filterRole]);

    // ==========================================
    // 📡 DATA SYNCHRONIZERS
    // ==========================================
    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            let url = `http://localhost:5001/api/security/logs?`;
            if (filterCategory) url += `category=${filterCategory}&`;
            if (filterRole) url += `userRole=${filterRole}&`;

            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setLogs(await res.json());
        } catch (err) { console.error("Logs sync failed", err); }
        setLoading(false);
    };

    const fetchLiveSessions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/security/sessions', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setSessions(await res.json());
        } catch (err) { console.error("Sessions fetch failed", err); }
        setLoading(false);
    };

    const fetchIpRules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/security/ip-rules', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setIpRules(await res.json());
        } catch (err) { console.error("Firewall fetch failed", err); }
        setLoading(false);
    };

    // ==========================================
    // ⚡ ACTION INTERFACES
    // ==========================================
    const handleForceLogout = async (id) => {
        if (!window.confirm("🚨 WARNING: Forcefully terminate this active session layer immediately?")) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/security/sessions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("🔴 Session terminated. User forced out.");
                fetchLiveSessions();
            }
        } catch (err) { alert("Session dropping failed"); }
    };

    const handleAddIpRule = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/security/ip-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(ipForm)
            });
            if (res.ok) {
                alert("🛡️ Security Firewall Rules Committed!");
                setIpForm({ ipAddress: '', ruleType: 'Blacklist', reason: '' });
                fetchIpRules();
            }
        } catch (err) { alert("Firewall rule push failed"); }
    };

    const handleRemoveIpRule = async (id) => {
        if (!window.confirm("Flush this constraint from firewall registry?")) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/security/ip-rules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchIpRules();
            }
        } catch (err) { alert("Flushing failed"); }
    };

    // 🔥 SECURITY DATA INJECTION SIMULATOR (LIVE TESTING)
    const handleTriggerMockEvent = async (category, details, severity) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/security/trigger-mock-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ category, details, severity })
            });
            if (res.ok) {
                fetchAuditLogs();
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            
            {/* Header Matrix Hero */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-3xl text-white shadow-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="bg-red-500 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">SecOps Active</span>
                    <h1 className="text-3xl font-black tracking-tight mt-2">Security & Compliance Center</h1>
                    <p className="text-xs text-gray-400 mt-1">Real-time deep packet auditing, threat containment, and access gateways firewall.</p>
                </div>
                
                {/* Simulator Controls Wrapper */}
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <p className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">🚨 Telemetry Simulation Injection</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleTriggerMockEvent('LOGIN_FAILED', 'Failed login attempt detected from node 192.168.1.99', 'Warning')} className="bg-amber-600/20 hover:bg-amber-600 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors">⚠️ Login Failure</button>
                        <button onClick={() => handleTriggerMockEvent('SUSPICIOUS_ALERT', 'Security Breach Alert: Cross-Site Scripting (XSS) payload blocked.', 'Critical')} className="bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors">🛑 Breach Threat</button>
                        <button onClick={() => handleTriggerMockEvent('DATA_EXPORT', 'Mass compilation ledger exported: PayrollRegistry_Q2.xlsx', 'Info')} className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors">📄 Data Export</button>
                    </div>
                </div>
            </div>

            {/* Central Nav Segments */}
            <div className="flex gap-2 bg-white p-1.5 border border-gray-100 rounded-2xl w-fit shadow-sm mb-6">
                <button onClick={() => setActiveSubTab('logs')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'logs' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>📜 Unified Audit Trail</button>
                <button onClick={() => setActiveSubTab('sessions')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'sessions' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Live Active Sessions</button>
                <button onClick={() => setActiveSubTab('firewall')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'firewall' ? 'bg-indigo-950 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🛡️ Network Firewall Rules</button>
            </div>

            {/* VIEW 1: UNIFIED SECURITY AUDIT TRAIL */}
            {activeSubTab === 'logs' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-4 p-6">
                    
                    {/* Controls Row Dynamic Filtering Matrix */}
                    <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Audit Filter Category</label>
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border px-3 py-2 rounded-xl bg-white outline-none">
                                <option value="">All Categories</option>
                                <option value="ADMIN_ACTION">Admin Configuration</option>
                                <option value="LOGIN_SUCCESS">Successful Access</option>
                                <option value="LOGIN_FAILED">Login Failures</option>
                                <option value="SUSPICIOUS_ALERT">Threat Metrics</option>
                                <option value="DATA_EXPORT">Data Compilation Exports</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Role-based Filter Context</label>
                            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border px-3 py-2 rounded-xl bg-white outline-none">
                                <option value="">All Roles</option>
                                <option value="SuperAdmin">SuperAdmin Owners</option>
                                <option value="Admin">Tenant Company Admins</option>
                                <option value="HR">HR Managers</option>
                                <option value="Employee">Standard Corporate Staff</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Stream Frame */}
                    <div className="overflow-x-auto max-h-[55vh]">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                                    <th className="p-4">Timestamp Telemetry</th>
                                    <th className="p-4">Identity Context</th>
                                    <th className="p-4">Auditable Category</th>
                                    <th className="p-4">Operation Summary Details</th>
                                    <th className="p-4">Severity Badges</th>
                                </tr>
                            </thead> {/* ✅ Fixed typo here: changed from </footer> to </thead> */}
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold">Querying ledger records...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="5" className="p-12 text-center text-gray-400 font-medium">No system compliance logs recorded under this matching matrix. Trigger simulation data above!</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="p-4 text-gray-500 font-mono tracking-tight">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td className="p-4">
                                                <p className="font-black text-gray-900">{log.userEmail}</p>
                                                <p className="text-[10px] text-gray-400">{log.companyName} • <span className="font-semibold">{log.userRole}</span></p>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-gray-100 text-gray-700 font-black px-2 py-1 rounded text-[10px] tracking-wide">{log.category}</span>
                                            </td>
                                            <td className="p-4 text-gray-600 font-medium max-w-sm">{log.details}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${log.severity === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : log.severity === 'Warning' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{log.severity}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VIEW 2: LIVE RUNTIME USER SESSIONS */}
            {activeSubTab === 'sessions' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 space-y-4">
                    <h3 className="font-black text-slate-900 text-base">Active Environment Session Logs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sessions.length === 0 ? (
                            <div className="col-span-3 p-8 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed">No distinct user session layers identified outside your session bounds.</div>
                        ) : (
                            sessions.map(s => (
                                <div key={s._id} className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-black text-gray-900">{s.userName}</h4>
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] uppercase px-2 py-0.5 rounded">Live Socket</span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1 font-medium">
                                            <p>📧 {s.userEmail}</p>
                                            <p>🏬 {s.companyName} ({s.userRole})</p>
                                            <p className="font-mono text-[10px] pt-1">📍 IP: {s.ipAddress} • {s.deviceInfo}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleForceLogout(s._id)} className="w-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold py-2 rounded-xl text-xs mt-4">🔴 Force Kill Session</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* VIEW 3: NETWORK FIREWALL IPS LAWS */}
            {activeSubTab === 'firewall' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Rule Registry Form */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                        <h4 className="font-black text-gray-900 text-sm">Commit Firewall IP Policy</h4>
                        <form onSubmit={handleAddIpRule} className="space-y-4 text-xs font-semibold text-gray-700">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Target IP Node Address</label>
                                <input type="text" required value={ipForm.ipAddress} onChange={e => setIpForm({...ipForm, ipAddress: e.target.value})} className="w-full border p-3.5 rounded-xl outline-none" placeholder="e.g., 185.220.101.4" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Policy Enforcement Strategy</label>
                                <select value={ipForm.ruleType} onChange={e => setIpForm({...ipForm, ruleType: e.target.value})} className="w-full border p-3.5 bg-white rounded-xl outline-none">
                                    <option value="Blacklist">🚨 Blacklist & Drop Packets</option>
                                    <option value="Whitelist">✅ Whitelist Secure Core</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Enforcement Compliance Context</label>
                                <textarea rows="3" value={ipForm.reason} onChange={e => setIpForm({...ipForm, reason: e.target.value})} className="w-full border p-3.5 rounded-xl outline-none font-medium" placeholder="Justification log context details..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-950 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all">Apply Constraints</button>
                        </form>
                    </div>

                    {/* Rule Registry Output List */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm p-5 space-y-4">
                        <h4 className="font-black text-gray-900 text-sm">Active Layer Protection Constraints Matrix</h4>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                            {ipRules.length === 0 ? (
                                <div className="text-gray-400 p-8 text-center font-bold text-xs">No explicit custom IP routing rule sets committed.</div>
                            ) : (
                                ipRules.map(rule => (
                                    <div key={rule._id} className="p-4 rounded-xl border bg-gray-50/40 flex justify-between items-center hover:bg-white hover:shadow-sm transition-all">
                                        <div>
                                            <div className="flex gap-2 items-center mb-1">
                                                <span className="font-mono font-black text-sm text-gray-900">{rule.ipAddress}</span>
                                                <span className={`px-2 py-0.5 font-black text-[8px] uppercase tracking-wider rounded ${rule.ruleType === 'Whitelist' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{rule.ruleType}</span>
                                            </div>
                                            <p className="text-gray-500 text-xs font-medium">Reason context: {rule.reason}</p>
                                        </div>
                                        <button onClick={() => handleRemoveIpRule(rule._id)} className="text-gray-400 hover:text-red-600 transition-colors text-lg p-1">✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}