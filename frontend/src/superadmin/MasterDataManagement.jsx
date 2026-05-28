import { useState, useEffect } from 'react';

export default function MasterDataManagement() {
    // Backend ENUM ke hisaab se categories
    const categories = [
        { id: 'Department', label: '🏢 Departments' },
        { id: 'Designation', label: '🧑‍💼 Designations' },
        { id: 'Skill', label: '⭐ Skill Sets' },
        { id: 'Holiday', label: '🏖️ Holiday Calendar' },
        { id: 'LeaveType', label: '📅 Leave Types' },
        { id: 'SalaryComponent', label: '💰 Salary Components' },
        { id: 'DocumentType', label: '📄 Document Types' },
        { id: 'KPI', label: '📈 KPIs & Performance' },
        { id: 'Training', label: '🎓 Training Modules' },
        { id: 'ExpenseCategory', label: '💸 Expense Categories' },
        { id: 'AssetCategory', label: '💻 Asset Categories' }
    ];

    const [activeCategory, setActiveCategory] = useState(categories[0].id);
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

    useEffect(() => {
        fetchData(activeCategory);
    }, [activeCategory]);

    const fetchData = async (category) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/master-data?category=${category}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDataList(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch master data", err);
        } finally {
            setLoading(false);
        }
    };

    // ==========================
    // ACTIONS
    // ==========================
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedId(null);
        setFormData({ name: '', description: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setSelectedId(item._id);
        setFormData({ name: item.name, description: item.description, isActive: item.isActive });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template permanently? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5001/api/master-data/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("✅ Record Deleted.");
                fetchData(activeCategory);
            }
        } catch (err) {
            alert("Error deleting record.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const url = modalMode === 'edit' 
                ? `http://localhost:5001/api/master-data/${selectedId}` 
                : 'http://localhost:5001/api/master-data';
            
            const method = modalMode === 'edit' ? 'PUT' : 'POST';
            
            const payload = { ...formData, category: activeCategory };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`✅ ${activeCategory} ${modalMode === 'edit' ? 'Updated' : 'Created'} Successfully!`);
                setIsModalOpen(false);
                fetchData(activeCategory);
            } else {
                const errorData = await res.json();
                alert(`❌ Failed: ${errorData.message}`);
            }
        } catch (err) {
            alert("Network Error");
        }
    };

    return (
        /* 👇 Root div matches the dashboard's light gray background 👇 */
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6 font-sans">
            
            {/* LEFT SIDEBAR: Categories */}
            {/* Dashboard style: White card, rounded, thin border */}
            <div className="w-full md:w-64 shrink-0 bg-white border border-gray-100 rounded-3xl overflow-hidden h-fit shadow-sm sticky top-6">
                <div className="p-5 border-b border-gray-100 bg-white">
                    <h2 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Global Matrix</h2>
                    <p className="text-[10px] font-medium text-gray-500 mt-1">Select category templates to manage</p>
                </div>
                <div className="p-3 flex flex-col gap-1.5 max-h-[75vh] overflow-y-auto scrollbar-thin">
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            /* 👇 Active state matches dashboard Indigo active tab 👇 */
                            className={`text-left px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${activeCategory === cat.id ? 'bg-indigo-950 text-white shadow-md transform scale-[1.02]' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-800'}`}
                        >
                            <span>{cat.label}</span>
                            {activeCategory === cat.id && <span className="text-lg">›</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT MAIN CONTENT: Data Grid */}
            <div className="flex-1 space-y-6">
                
                {/* Header Summary Card (like dashboard metrics cards) */}
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Active Category Template</p>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                             {categories.find(c => c.id === activeCategory)?.label}
                        </h2>
                    </div>
                    {/* 👇 Primary Action Button matches Dashboard Indigo button 👇 */}
                    <button 
                        onClick={openCreateModal}
                        className="bg-white text-indigo-950 hover:bg-gray-100 transition-colors px-6 py-3.5 rounded-xl text-sm font-black shadow-lg hover:scale-105 transform flex items-center gap-2 z-10"
                    >
                        ⚡ Provision New Template
                    </button>
                </div>

                {/* Data Card Grid */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[70vh] flex flex-col">
                    
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        {loading ? (
                            <div className="text-center text-gray-400 font-bold p-12 text-sm">🔄 Syncing with Master Node...</div>
                        ) : dataList.length === 0 ? (
                            <div className="text-center text-gray-400 font-medium p-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-3">
                                <span className="text-5xl">🗄️</span>
                                <p className="text-sm">No templates defined for <span className="font-bold text-gray-600">{activeCategory}</span> category.</p>
                                <p className="text-xs text-gray-500 max-w-sm">Use the 'Provision New Template' button above to establish your first global master data template.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {dataList.map(item => (
                                    /* White data cards, soft grays */
                                    <div key={item._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-black text-gray-900 text-base flex-1 line-clamp-1 group-hover:text-indigo-700 transition-colors">{item.name}</h3>
                                                {/* Semantic Badges */}
                                                <span className={`ml-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border flex-shrink-0 ${item.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                    {item.isActive ? 'Operational' : 'Deprioritized'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-zinc-400 mb-5 line-clamp-2 min-h-[32px] font-medium">
                                                {item.description || 'No specific description matrix provided for this template.'}
                                            </p>
                                        </div>
                                        {/* Softer action buttons */}
                                        <div className="flex gap-2.5 border-t border-gray-50 pt-4 mt-1">
                                            <button onClick={() => openEditModal(item)} className="flex-1 text-xs font-bold px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors">✏️ Edit Matrix</button>
                                            <button onClick={() => handleDelete(item._id)} className="flex-1 text-xs font-bold px-3 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">🗑️ Decommission</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DYNAMIC MODAL (White and Indigo themed) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-black text-indigo-950">
                                {modalMode === 'edit' ? '✏️ Modify Template' : `➕ Establish New ${activeCategory}`}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl bg-white p-2 rounded-full shadow-sm transition-colors">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Template Identity *</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold" placeholder={`e.g., Global ${activeCategory} Standard`} />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Operational Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-4 py-3.5 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium" placeholder="Describe the purpose of this template..."></textarea>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                                    <div className="w-10 h-5.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                                <span className="text-sm font-bold text-gray-800">Operational Status: <span className={formData.isActive ? 'text-emerald-600' : 'text-red-600'}>{formData.isActive ? '✅ Active' : '🛑 Inactive'}</span></span>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-6">
                                <button type="submit" className="w-full bg-indigo-950 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-colors text-sm uppercase tracking-wider">
                                    {modalMode === 'edit' ? '💾 Apply Matrix Updates' : '🚀 Establish Global Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}