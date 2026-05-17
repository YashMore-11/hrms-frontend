import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar'; // ✅ Integrated unified sidebar component

export default function AdminCreateUser() {
    // Form input states matching your Mongoose EmployeeSchema exactly
    const [empId, setEmpId] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('Male');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee'); // 'employee' or 'hr'
    const [department, setDepartment] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [previousCompany, setPreviousCompany] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');

    const [message, setMessage] = useState({ text: '', isError: false });
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', isError: false });

        // Payload exactly matching your database schema values
        const payload = {
            empId,
            name,
            gender,
            age: Number(age),
            email,
            password,
            role,
            department,
            phone,
            address,
            previousCompany: previousCompany || 'None',
            yearsOfExperience: yearsOfExperience || '0 Years'
        };

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/auth/create-employee', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create user account');
            }

            setMessage({ text: `🎉 ${role.toUpperCase()} account created successfully!`, isError: false });

            // Clear all form inputs on success
            setEmpId('');
            setName('');
            setGender('Male');
            setAge('');
            setEmail('');
            setPassword('');
            setDepartment('');
            setPhone('');
            setAddress('');
            setPreviousCompany('');
            setYearsOfExperience('');
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* MAIN CONTAINER: Pure White Background */
        <div className="min-h-screen flex bg-white font-sans">

            {/* ✅ REUSABLE TELEMETRY ADMIN SIDEBAR */}
            <AdminSidebar activeModule="onboard" />

            {/* Main Panel Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Section Description */}
                    <div className="border-b border-slate-100 pb-6">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Onboard New Personnel</h1>
                        <p className="text-sm text-slate-500 mt-1">Register new corporate system accounts directly into the MongoDB runtime index</p>
                    </div>

                    {/* Status Alert Windows */}
                    {message.text && (
                        <div className={`p-4 text-xs font-black uppercase tracking-wider border rounded-xl animate-fadeIn ${message.isError ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                            {message.isError ? '⚠️' : '✓'} {message.text}
                        </div>
                    )}

                    {/* Form Node Body layout */}
                    <form onSubmit={handleCreateUser} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-8 shadow-sm">

                        {/* Group 1: Core System Identifiers */}
                        <div>
                            <h3 className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest mb-4">1. System Identity Info</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Employee ID</label>
                                    <input type="text" value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g. EMP-2026-089" required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Access Role</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold text-fuchsia-700 bg-fuchsia-50/20">
                                        <option value="employee">Standard Staff Employee</option>
                                        <option value="hr">Human Resources Management (HR)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Group 2: Personal Context Specifications */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest mb-4">2. Profile Personal Specifics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="sm:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Yash" required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Age</label>
                                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="21" required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender Option</label>
                                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold text-slate-700">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Group 3: Contact & Deployment Fields */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest mb-4">3. Contact & Department Info</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corporate Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yash.dev@company.com" required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Secure Account Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Department Wing</label>
                                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering / Frontend Team" required className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Mobile Number</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 019-2834" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Residential Address Location</label>
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Tech Avenue, Silicon Valley, CA" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Group 4: Historical Professional Background */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest mb-4">4. Professional Industry Background</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Previous Corporate Employer</label>
                                    <input type="text" value={previousCompany} onChange={(e) => setPreviousCompany(e.target.value)} placeholder="PixelCraft Studios Inc. (Optional)" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cumulative Track Record Duration</label>
                                    <input type="text" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="e.g. 2.5 Years (Optional)" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Application Execution Trigger Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all shadow-md shadow-slate-200 disabled:opacity-50"
                        >
                            {isLoading ? "Writing Profile Ledger..." : "Commit Profile to Database"}
                        </button>
                    </form>

                </div>
            </main>
        </div>
    );
}