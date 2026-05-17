import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSignup() {
    const navigate = useNavigate();

    // 1. STATE TRACKING PARSED DIRECTLY FROM MONGOOSE SCHEMA CONFIGS
    const [companyName, setCompanyName] = useState('');
    const [adminId, setAdminId] = useState(''); // Mapped locally to Expected Employee Target Quota
    const [name, setName] = useState(''); // Founder/CEO Name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyStartDate, setCompanyStartDate] = useState('');
    const [phone, setPhone] = useState('');
    const [branchLocation, setBranchLocation] = useState('');

    // UI Utilities
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // 2. DYNAMIC PASSWORD STRENGTH INTERFACE EVALUATOR
    const getPasswordStrength = () => {
        if (!password) return { text: '', color: 'text-slate-400' };
        if (password.length < 4) return { text: '⚠️ Weak Password', color: 'text-rose-600' };
        if (password.length < 8) return { text: '🕒 Medium Password', color: 'text-amber-600' };
        return { text: '✓ Strong Password', color: 'text-emerald-600' };
    };

    const strength = getPasswordStrength();

    // 3. SECURE PAYLOAD STAGING HANDLER (No Database writes until checkout finishes)
    const handleSignupSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Generate a random MongoDB style Object ID stub to stand in for standard Admin Unique ID field mapping
        const assignedAdminId = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const pendingAdminPayload = {
            adminId: assignedAdminId,
            name,
            email,
            password,
            companyName,
            companyStartDate,
            branchLocation,
            phone,
            employeeQuotaTarget: Number(adminId), // Captures total worker structural cap metrics input safely
            Employee: [] // Empty reference relational array context block ready for mapping hooks
        };

        // Cache parameters into client memory storage blocks temporarily
        localStorage.setItem('pendingAdminData', JSON.stringify(pendingAdminPayload));

        // Pass administrative context seamlessly into your corporate pricing index layout page
        navigate('/admin/upgrade');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-6 md:p-10 relative overflow-hidden">

                {/* Top Fuchsia Profile Stripe Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-fuchsia-800 to-purple-900" />

                {/* Form Title Block */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-fuchsia-50 text-fuchsia-800 text-xl font-black flex items-center justify-center mx-auto mb-3 shadow-sm border border-fuchsia-100">
                        🏢
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Admin SignUp</h1>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Initialize corporate details before validating membership access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-xs font-black uppercase tracking-wider border rounded-xl bg-rose-50 text-rose-700 border-rose-100 animate-fadeIn">
                        ⚠️ {error}
                    </div>
                )}

                {/* Main Framework Inputs Form */}
                <form onSubmit={handleSignupSubmit} className="space-y-6">

                    <span className="block text-[10px] font-black text-fuchsia-700 uppercase tracking-widest pb-1 border-b border-slate-100">
                        1. Corporate Enterprise Specifics
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">🏢</span>
                                <input type="text" placeholder="Nexus Quantum Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Incorporation Launch Date</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">📅</span>
                                <input type="date" value={companyStartDate} onChange={e => setCompanyStartDate(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800 text-slate-500" />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Headquarters Base Location</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">📍</span>
                                <input type="text" placeholder="BKC Complex, Mumbai, India" value={branchLocation} onChange={e => setBranchLocation(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800" />
                            </div>
                        </div>
                    </div>

                    <span className="block text-[10px] font-black text-fuchsia-700 uppercase tracking-widest pt-2 pb-1 border-b border-slate-100">
                        2. System Identity & Access Security
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Founder Name (CEO)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">👤</span>
                                <input type="text" placeholder="Yash Patel" value={name} onChange={e => setName(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Secure Core Webmail</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">✉️</span>
                                <input type="email" placeholder="ceo@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Contact Number</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">📞</span>
                                <input
                                    type="tel"
                                    placeholder="10-digit number"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                    className={`w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800 ${phone && phone.length < 10 ? 'border-rose-300 ring-rose-100' : phone.length >= 10 ? 'border-emerald-300 ring-emerald-100' : 'border-slate-200'
                                        }`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Employee Count</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">👥</span>
                                <input type="number" placeholder="e.g. 50" value={adminId} onChange={e => setAdminId(e.target.value)} required className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800" />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Secure Account Access Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs">🔒</span>
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-12 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-fuchsia-600 transition-all text-slate-800" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400 text-sm hover:text-slate-600">
                                    {showPassword ? "🔒" : "👁️"}
                                </button>
                            </div>
                            {password && (
                                <div className={`mt-2 text-[10px] font-black uppercase tracking-wider ${strength.color}`}>
                                    {strength.text}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submission and Back Options */}
                    <div className="space-y-3 pt-4">
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-all shadow-md shadow-slate-100">
                            Proceed to Premium Subscription Plan →
                        </button>

                        <button type="button" onClick={() => navigate('/')} className="w-full text-center text-[10px] font-black uppercase tracking-widest py-2 text-slate-400 hover:text-fuchsia-700 transition-colors">
                            ← Cancel and Return to Login
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}