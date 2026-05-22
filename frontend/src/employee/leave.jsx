import { useState } from 'react';
import EmployeeSidebar from '@/components/EmployeeSidebar'; // Fixed shortcut path alias

// Constants for initial leave balance allocations
const INITIAL_LEAVE_BALANCES = {
  casual: 8,
  medical: 12,
  earned: 15,
  paid: 10
};

// Mock history for leave lists
const MOCK_LEAVE_HISTORY = [
  { id: 1, type: "Medical Leave", startDate: "2026-05-08", endDate: "2026-05-08", days: 1, reason: "Dental checkup alignment", status: "Approved" },
  { id: 2, type: "Casual Leave", startDate: "2026-06-01", endDate: "2026-06-03", days: 3, reason: "Family function travel", status: "Pending" },
];

export default function LeaveApplicationPage() {
  const [balances] = useState(INITIAL_LEAVE_BALANCES);
  const [leaveHistory, setLeaveHistory] = useState(MOCK_LEAVE_HISTORY);
  const [isLoading, setIsLoading] = useState(false);

  // Form input states
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Calculate total days between chosen dates
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays || 0;
  };

  const totalDaysRequested = calculateDays(startDate, endDate);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (totalDaysRequested <= 0) {
      alert("Please select a valid date range.");
      return;
    }

    setIsLoading(true);

    // Simulating backend processing timeout
    setTimeout(() => {
      const newLeaveRequest = {
        id: leaveHistory.length + 1,
        type: leaveType,
        startDate,
        endDate,
        days: totalDaysRequested,
        reason,
        status: "Pending"
      };

      setLeaveHistory([newLeaveRequest, ...leaveHistory]);
      setIsLoading(false);
      
      // Clear form fields
      setStartDate('');
      setEndDate('');
      setReason('');
      
      alert("Leave application submitted successfully for review!");
    }, 1000);
  };

  return (
    /* MAIN CONTAINER: Pure White Background */
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* LOCKED VIEWPORT SIDEBAR */}
      <div className="md:sticky md:top-0 md:h-screen z-20 flex-shrink-0 border-r border-gray-100">
        <EmployeeSidebar activeModule="leave" />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8">
        
        {/* Module Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">Request time off and track your balances</p>
        </div>

        {/* Leave Balances Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Casual Leave', value: balances.casual },
            { label: 'Medical Leave', value: balances.medical },
            { label: 'Earned Leave', value: balances.earned },
            { label: 'Paid Leave', value: balances.paid },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900">{item.value}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">days</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Leave Application Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 h-fit">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
              New Leave Request
            </h3>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Leave Category</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-3 text-sm rounded-xl border border-gray-300 bg-gray-50 font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Paid Leave">Paid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 font-bold bg-gray-50 focus:bg-white text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 font-bold bg-gray-50 focus:bg-white text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {totalDaysRequested > 0 && (
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase text-center border border-indigo-100">
                  Duration: {totalDaysRequested} {totalDaysRequested === 1 ? 'Day' : 'Days'}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Leave</label>
                <textarea 
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context..."
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-3 text-sm rounded-xl border border-gray-300 bg-gray-50 focus:bg-white font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Submit Application"}
              </button>
            </form>
          </div>

          {/* Leave History Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
                My Leave History
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] uppercase tracking-tight">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-black tracking-widest bg-gray-50">
                      <th className="p-3">Leave Type</th>
                      <th className="p-3">Timeline</th>
                      <th className="p-3">Days</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold text-gray-700">
                    {leaveHistory.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-black text-gray-900">{log.type}</td>
                        <td className="p-3 text-gray-400 font-mono text-[10px]">{log.startDate} - {log.endDate}</td>
                        <td className="p-3 font-mono font-black">{log.days}D</td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest shadow-sm ${
                            log.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center pt-6 border-t border-gray-100 mt-4">
              Requests are routed to HR for verified approval
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}