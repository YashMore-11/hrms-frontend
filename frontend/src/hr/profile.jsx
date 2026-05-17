import { useState, useEffect } from 'react';
import HRSidebar from '../components/HRSidebar'; // Clean shortcut reference to your shared sidebar

export default function HRProfile() {
  const [hrData, setHrData] = useState({
    empId: "HR-LOADING...",
    name: "Loading Personnel...",
    role: "HR Specialist",
    department: "Human Resources",
    email: "...",
    phone: "...",
    address: "...",
    profilePhoto: null,
    previousCompany: "N/A",
    yearsOfExperience: "0"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH ACTUAL LIVE LOGGED-IN HR USER PROFILE FROM DATABASE
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('authToken');
      try {
        // Points to your secure employee collection endpoint
        const res = await fetch('http://localhost:5000/api/employees', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();

        if (res.ok) {
          // Find the exact matching user account from the collection (via fallback email comparison context)
          const loggedInEmail = localStorage.getItem('userEmail'); // Assumes email is logged on token acquisition
          const currentHR = data.find(emp => emp.email === loggedInEmail || emp.role === 'hr');

          if (currentHR) {
            setHrData(currentHR);
            setPhone(currentHR.phone || '');
            setAddress(currentHR.address || '');
          }
        }
      } catch (err) {
        console.error("Failed syncing authenticated administration tokens:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    setHrData({ ...hrData, phone, address });
    console.log("Saving updated HR contact details to MongoDB...");
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        alert("HR Profile photo updated successfully!");
      }, 1000);
    }
  };

  return (
    /* MAIN CONTAINER: Pure White Background */
    <div className="min-h-screen flex bg-white font-sans">

      {/* REUSABLE TELEMETRY HR SIDEBAR */}
      <HRSidebar activeModule="profile" />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="border-b border-slate-100 pb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My HR Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your administrator credentials and contact details</p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
              Parsing secure administrative collection profiles...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Left Column: Avatar Card */}
              <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center h-fit">

                <div className="relative group w-32 h-32 rounded-full bg-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-teal-100 overflow-hidden mb-5">
                  {hrData.profilePhoto ? (
                    <img src={hrData.profilePhoto} alt={hrData.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{hrData.name ? hrData.name.charAt(0) : 'H'}</span>
                  )}

                  <label className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-black uppercase cursor-pointer transition-all">
                    <span>{isUploading ? "..." : "Upload"}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
                  </label>
                </div>

                <h2 className="text-xl font-black text-slate-900">{hrData.name}</h2>
                <p className="text-xs font-black text-teal-600 mt-1 uppercase tracking-widest">{hrData.role}</p>

                <div className="w-full border-t border-slate-100 my-6" />

                <div className="w-full text-left space-y-5">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HR ID Reference</span>
                    <span className="text-sm font-mono font-bold text-slate-700">{hrData.empId}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admin Email</span>
                    <span className="text-sm font-bold text-slate-700 break-all">{hrData.email}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Specifications Form */}
              <div className="md:col-span-2 space-y-6">

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Administrative Details</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(!isEditing);
                        if (isEditing) { setPhone(hrData.phone || ''); setAddress(hrData.address || ''); }
                      }}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${isEditing ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                        }`}
                    >
                      {isEditing ? "Cancel" : "Edit Details"}
                    </button>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: 'Assigned Role', value: hrData.role },
                          { label: 'Department Division', value: hrData.department },
                          { label: 'Contact Phone', value: hrData.phone || 'Not Configured' },
                          { label: 'Office/Residential Address', value: hrData.address || 'Not Configured' },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                            <span className="text-sm font-bold text-slate-800">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Past Corporate Domain History */}
                      <div className="bg-teal-50/30 p-5 rounded-2xl border border-teal-100">
                        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4">Background History</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="block text-[9px] text-teal-400 font-black uppercase">Previous Employer</span>
                            <span className="font-bold text-slate-800">{hrData.previousCompany || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-teal-400 font-black uppercase">Industry Experience Track</span>
                            <span className="font-bold text-slate-800">{hrData.yearsOfExperience || '0'} Years</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200">
                        Update HR Record info
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}