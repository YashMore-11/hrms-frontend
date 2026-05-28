import { useState, useEffect } from 'react';

export default function SupportHelpdesk() {
    const [tickets, setTickets] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [analytics, setAnalytics] = useState({ totalVolume: 0, openCount: 0, inProgressCount: 0, resolvedCount: 0, avgResolutionTime: 0 });
    const [subTab, setSubTab] = useState('tickets'); 
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMsg, setReplyMsg] = useState('');
    const [staffName, setStaffName] = useState('');
    const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });

    useEffect(() => {
        loadHelpdeskHub();
    }, []);

    const loadHelpdeskHub = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/helpdesk/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets);
                if(data.analytics) setAnalytics(data.analytics);
            }

            const faqRes = await fetch('http://localhost:5001/api/helpdesk/faqs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (faqRes.ok) setFaqs(await faqRes.json());
        } catch (err) { console.error("Helpdesk syncing error", err); }
    };

    const handleStatusShift = async (id, nextStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/helpdesk/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated.ticket);
                loadHelpdeskHub();
            }
        } catch (err) { alert("Error shifting status matrix"); }
    };

    const handleAssignStaff = async (e, id) => {
        e.preventDefault();
        if(!staffName) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/helpdesk/tickets/${id}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ staffName })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated.ticket);
                setStaffName('');
                loadHelpdeskHub();
                alert("🎯 Support staff allocated successfully!");
            }
        } catch (err) { alert("Assignment failed"); }
    };

    const handleSendReply = async (e, id) => {
        e.preventDefault();
        if(!replyMsg.trim()) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/helpdesk/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: replyMsg, sender: 'SuperAdmin' })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated.ticket);
                setReplyMsg('');
                loadHelpdeskHub();
            }
        } catch (err) { alert("Message drop failed"); }
    };

    const handleCreateFaq = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5001/api/helpdesk/faqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(faqForm)
            });
            if (res.ok) {
                alert("📚 Knowledge Base Updated!");
                setFaqForm({ question: '', answer: '', category: 'General' });
                loadHelpdeskHub();
            }
        } catch (err) { alert("FAQ save error"); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            
            {/* Core Support Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg">
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Total Network Tickets</p>
                    <h2 className="text-4xl font-black">{analytics.totalVolume}</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Awaiting Resolution</p>
                    <h2 className="text-3xl font-black text-red-600">{analytics.openCount} Open</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Diagnostics Pipeline</p>
                    <h2 className="text-3xl font-black text-amber-600">{analytics.inProgressCount} Active</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Resolution SLA</p>
                    <h2 className="text-3xl font-black text-indigo-600">{analytics.avgResolutionTime} Hours</h2>
                </div>
            </div>

            {/* Sub Nav Modifiers */}
            <div className="flex gap-3 mb-6 bg-white p-2 border border-gray-100 rounded-2xl w-fit shadow-sm">
                <button onClick={() => setSubTab('tickets')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'tickets' ? 'bg-indigo-950 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>🎟️ Ticket Registry ({tickets.length})</button>
                <button onClick={() => setSubTab('faqs')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${subTab === 'faqs' ? 'bg-indigo-950 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>📚 Knowledge Base / FAQ ({faqs.length})</button>
            </div>

            {subTab === 'tickets' && (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* Tickets Stream Table */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-50">
                            <h3 className="font-black text-gray-900 text-base">Inbound Operations Stream</h3>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100"><th className="p-4">Tenant Client</th><th className="p-4">Type / Priority</th><th className="p-4">Description Matrix</th><th className="p-4">Allocation</th><th className="p-4">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tickets.map(t => (
                                        <tr key={t._id} onClick={() => setSelectedTicket(t)} className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${selectedTicket?._id === t._id ? 'bg-indigo-50/60 font-medium' : ''}`}>
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Panel: Active Workspace Chat / Action Engine */}
                    <div className="w-full lg:w-96 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm sticky top-6 min-h-[50vh] flex flex-col justify-between">
                        {selectedTicket ? (
                            <div className="space-y-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start border-b pb-3 mb-3">
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm">{selectedTicket.companyName} Workspace</h4>
                                            <p className="text-[10px] text-gray-400">SLA Cap: {selectedTicket.slaHours} Hours</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {selectedTicket.status !== 'Resolved' && <button onClick={() => handleStatusShift(selectedTicket._id, 'Resolved')} className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-1 rounded-md">Resolve</button>}
                                            {selectedTicket.status !== 'Closed' && <button onClick={() => handleStatusShift(selectedTicket._id, 'Closed')} className="bg-gray-100 text-gray-600 font-bold text-[10px] px-2 py-1 rounded-md">Close</button>}
                                        </div>
                                    </div>

                                    {/* Assignment Matrix Sub-Form */}
                                    <form onSubmit={(e) => handleAssignStaff(e, selectedTicket._id)} className="flex gap-2 mb-4 bg-gray-50 p-2 rounded-xl border">
                                        <input type="text" value={staffName} onChange={e => setStaffName(e.target.value)} required placeholder="Support Agent Name" className="flex-1 px-2.5 py-1.5 text-xs bg-white border rounded-lg outline-none" />
                                        <button type="submit" className="bg-indigo-950 text-white text-[10px] font-black px-3 rounded-lg uppercase">Allocate</button>
                                    </form>

                                    {/* Conversation Replies Panel Block */}
                                    <div className="bg-gray-50 p-3 rounded-2xl border max-h-48 overflow-y-auto space-y-3 scrollbar-thin text-[11px]">
                                        <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                                            <p className="font-bold text-indigo-950">🚨 Initial Diagnostic payload:</p>
                                            <p className="text-gray-700 mt-1">{selectedTicket.description}</p>
                                        </div>
                                        {selectedTicket.replies?.map((r, i) => (
                                            <div key={i} className={`p-2.5 rounded-xl border ${r.sender === 'SuperAdmin' ? 'bg-white border-gray-200 ml-4' : 'bg-blue-50/50 border-blue-100 mr-4'}`}>
                                                <p className="font-black text-gray-900 text-[10px]">{r.sender === 'SuperAdmin' ? '👑 Support Desk HQ' : '👤 Client Admin'}</p>
                                                <p className="text-gray-700 mt-0.5">{r.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Live Reply Messaging Engine */}
                                <form onSubmit={(e) => handleSendReply(e, selectedTicket._id)} className="pt-4 border-t mt-4 flex gap-2">
                                    <input type="text" required value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Type patch message stream..." className="flex-1 text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white" />
                                    <button type="submit" className="bg-indigo-950 text-white px-4 rounded-xl text-xs font-bold">Send</button>
                                </form>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 font-bold m-auto text-xs py-12">
                                🔮 Select an active tenant ticket stream to deploy remediation patches, assign agents, or load chat threads.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {subTab === 'faqs' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Add FAQ Document Form */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                        <h4 className="font-black text-gray-900 text-sm">Index Knowledge Base Doc</h4>
                        <form onSubmit={handleCreateFaq} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1">Knowledge Question</label>
                                <input type="text" required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full border p-3 rounded-xl outline-none text-gray-800" placeholder="e.g., How to configure custom PF deductions?" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1">Remediation Resolution Answer</label>
                                <textarea required rows="4" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full border p-3 rounded-xl outline-none text-gray-800 font-medium" placeholder="Step-by-step resolution details..."></textarea>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1">Module Category Domain</label>
                                <select value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})} className="w-full border p-3 bg-white rounded-xl outline-none text-gray-800">
                                    <option value="General">General Platform</option><option value="Billing">Billing Accounts</option><option value="Attendance">Attendance Modules</option><option value="Payroll">Payroll Processors</option><option value="Troubleshooting">Core Troubleshooting</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-950 hover:bg-black font-black uppercase text-white py-3 rounded-xl shadow-md transition-colors tracking-wider text-[10px]">Index Document Base</button>
                        </form>
                    </div>

                    {/* FAQ Directory Table */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden p-5 space-y-4">
                        <h4 className="font-black text-gray-900 text-sm">Indexed Help Manual Directory</h4>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                            {faqs.map(f => (
                                <div key={f._id} className="p-4 rounded-2xl border bg-gray-50/40 hover:bg-white hover:border-gray-200 transition-all">
                                    <div className="flex justify-between mb-1.5"><span className="bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">{f.category} Node</span></div>
                                    <h5 className="font-black text-gray-900 text-xs mb-1">Q: {f.question}</h5>
                                    <p className="text-gray-600 text-xs font-medium pl-3 border-l border-indigo-200">A: {f.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}