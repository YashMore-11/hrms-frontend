import { useState } from 'react';
import EmployeeSidebar from '@/components/EmployeeSidebar'; // Fixed shortcut path alias

// Mock Data structure
const MOCK_EMPLOYEE_DATA = {
  empId: "EMP-2026-089", 
  name: "Yash",
  role: "Frontend Developer", 
  department: "Engineering / Frontend Team", 
  joinDate: "August 15, 2024",
  email: "yash.dev@company.com",
  phone: "+1 (555) 019-2834",
  address: "123 Tech Avenue, Silicon Valley, CA", 
  profilePhoto: null, 
  resumeName: "Yash_Frontend_Resume.pdf",
  resumeUrl: "#",
  previousCompany: "PixelCraft Studios Inc.",
  previousRole: "Junior UI Developer",
  yearsOfExperience: "2.5 Years"
};

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(MOCK_EMPLOYEE_DATA);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local Form Input States
  const [phone, setPhone] = useState(employee.phone);
  const [address, setAddress] = useState(employee.address);
  const [role, setRole] = useState(employee.role); 
  const [department, setDepartment] = useState(employee.department); 
  const [previousCompany, setPreviousCompany] = useState(employee.previousCompany);
  const [previousRole, setPreviousRole] = useState(employee.previousRole);
  const [yearsOfExperience, setYearsOfExperience] = useState(employee.yearsOfExperience);
  
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setEmployee({ 
      ...employee, 
      phone, 
      address, 
      role, 
      department,
      previousCompany,
      previousRole,
      yearsOfExperience
    });
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        alert("Photo uploaded successfully!");
      }, 1000);
    }
  };

  return (
    /* MAIN CONTAINER: Pure White Background */
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* LOCKED VIEWPORT SIDEBAR */}
      <div className="md:sticky md:top-0 md:h-screen z-20 flex-shrink-0 border-r border-slate-100">
        <EmployeeSidebar activeModule="profile" />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar Card */}
            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center h-fit">
              
              <div className="relative group w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-indigo-100 overflow-hidden mb-5">
                {employee.profilePhoto ? (
                  <img src={employee.profilePhoto} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{employee.name.charAt(0)}</span>
                )}
                
                <label className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-black uppercase cursor-pointer transition-all">
                  <span>{isUploading ? "..." : "Upload"}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
                </label>
              </div>

              <h2 className="text-xl font-black text-slate-900">{employee.name}</h2>
              <p className="text-xs font-black text-indigo-600 mt-1 uppercase tracking-widest">{employee.role}</p>
              
              <div className="w-full border-t border-slate-100 my-6" />

              <div className="w-full text-left space-y-5">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee ID</span>
                  <span className="text-sm font-mono font-bold text-slate-700">{employee.empId}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joining Date</span>
                  <span className="text-sm font-bold text-slate-700">{employee.joinDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Corporate Email</span>
                  <span className="text-sm font-bold text-slate-700 break-all">{employee.email}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Content Cards */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Specs Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profile Details</h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                      isEditing ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Current Role', value: employee.role },
                        { label: 'Department', value: employee.department },
                        { label: 'Contact Number', value: employee.phone },
                        { label: 'Residential Address', value: employee.address },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                          <span className="text-sm font-bold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Past Experience</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="block text-[9px] text-indigo-400 font-black uppercase">Company</span>
                          <span className="font-bold text-slate-800">{employee.previousCompany}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-indigo-400 font-black uppercase">Role</span>
                          <span className="font-bold text-slate-800">{employee.previousRole}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-indigo-400 font-black uppercase">Tenure</span>
                          <span className="font-bold text-slate-800">{employee.yearsOfExperience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</label>
                        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200">
                      Update Profile Info
                    </button>
                  </form>
                )}
              </div>

              {/* Documents Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5">Attached Documents</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-[10px] border border-rose-100">
                      PDF
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 tracking-tight">{employee.resumeName}</span>
                      <span className="block text-[9px] font-black text-slate-400 uppercase">Professional CV</span>
                    </div>
                  </div>
                  <a href={employee.resumeUrl} className="text-[10px] font-black text-slate-900 bg-white border border-slate-200 px-5 py-2.5 rounded-lg hover:border-slate-900 transition-all uppercase tracking-widest">
                    View
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}