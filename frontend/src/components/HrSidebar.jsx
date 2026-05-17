import { useNavigate } from 'react-router-dom';

export default function HRSidebar({ activeModule }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard Overview', icon: '📊', path: '/hr/dashboard' },
        { id: 'ledger', label: 'Employee Ledger', icon: '👥', path: '/hr/dashboard' }, // Links to dashboard's employee ledger tab view
        { id: 'attendance', label: 'Staff Attendance', icon: '⏱', path: '/hr/attendance' },
    ];

    const personalItems = [
        { id: 'profile', label: 'My HR Profile', icon: '👤', path: '/hr/profile' },
        { id: 'leave', label: 'Request My Leave', icon: '📅', path: '/hr/leave' },
    ];

    return (
        <aside className="w-64 h-screen sticky top-0 border-r border-slate-100 p-6 flex flex-col justify-between flex-shrink-0 bg-white select-none">
            <div className="space-y-8">

                {/* Workspace Brand Hub */}
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-teal-100">
                        HR
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none">HR Management</h2>
                        <span className="text-[10px] font-bold text-slate-400 font-mono mt-1 block tracking-tighter">v3.0.0-FLASH</span>
                    </div>
                </div>

                {/* Core Administrative Utilities */}
                <div className="space-y-6">
                    <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 mb-2.5">
                            Management Core
                        </span>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 border ${activeModule === item.id
                                            ? 'bg-teal-50 text-teal-600 border-teal-100/70 shadow-xs'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                                        }`}
                                >
                                    <span className="text-base leading-none">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Personal Account Utilities */}
                    <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 mb-2.5">
                            Personal Space
                        </span>
                        <nav className="space-y-1">
                            {personalItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 border ${activeModule === item.id
                                            ? 'bg-teal-50 text-teal-600 border-teal-100/70 shadow-xs'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                                        }`}
                                >
                                    <span className="text-base leading-none">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Persistent Session Terminal Footer */}
            <div className="pt-6 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-xs active:scale-[0.98]"
                >
                    <span>Exit Account</span>
                    <span className="text-sm">🚪</span>
                </button>
            </div>
        </aside>
    );
}