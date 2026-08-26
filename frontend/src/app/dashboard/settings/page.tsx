"use client";
import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Database, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialty: "General Practice",
    role: "Doctor",
    avatarUrl: ""
  });

  useEffect(() => {
    const savedAvatar = localStorage.getItem('medflow_avatar');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const email = user.email || "";
        try {
          const res = await fetch(`http://localhost:8000/api/users/profile?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            const nameParts = data.name.replace("Dr. ", "").split(" ");
            setProfile({
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              email: email,
              specialty: data.specialty || "General Practice",
              role: data.role || "Doctor",
              avatarUrl: savedAvatar || ""
            });
          } else {
            setProfile(prev => ({ ...prev, email }));
          }
        } catch (err) {
          setProfile(prev => ({ ...prev, email }));
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    alert("Profile settings saved successfully!");
  };
  
  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[70vh]">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-2">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> Settings
          </h2>
          
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <User className="w-5 h-5" /> Profile
          </button>
          
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <Bell className="w-5 h-5" /> Notifications
          </button>

          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <Shield className="w-5 h-5" /> Security
          </button>
          
          <button onClick={() => setActiveTab('integrations')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'integrations' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <Database className="w-5 h-5" /> Integrations
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-8 md:p-12">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-blue-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold">Loading Settings...</p>
            </div>
          ) : activeTab === 'profile' && (
            <div className="max-w-2xl animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Profile Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-600 shadow-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-lg flex items-center justify-center text-3xl font-black text-blue-600 dark:text-blue-400">
                      {profile.firstName ? profile.firstName.charAt(0) : "D"}
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors">
                    Change Avatar
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              const base64str = event.target.result as string;
                              setProfile(prev => ({ ...prev, avatarUrl: base64str }));
                              localStorage.setItem('medflow_avatar', base64str);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">First Name</label>
                    <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Last Name</label>
                    <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Email Address</label>
                  <input type="email" disabled value={profile.email} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 opacity-70 cursor-not-allowed" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Specialty</label>
                  <select value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                <button onClick={handleSave} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all mt-8">
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="max-w-2xl animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Email Alerts</p>
                    <p className="text-sm text-slate-500">Receive daily summaries of patient activity.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Critical Clinical Flags</p>
                    <p className="text-sm text-slate-500">Immediate push notifications for dangerous drug interactions.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Security & Authentication</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Change Password</p>
                  <p className="text-sm text-slate-500">Update your Firebase authentication credentials.</p>
                </button>
                <button className="w-full text-left p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
                  <p className="text-sm text-slate-500">Currently disabled. Enable for HIPAA compliance.</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">System Integrations</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center font-bold text-green-700">N8N</div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">n8n Automation</p>
                      <p className="text-sm text-slate-500">Connected to webhook /appointment-approved</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center font-bold text-blue-700">N4J</div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Neo4j Graph Database</p>
                      <p className="text-sm text-slate-500">Connected for Clinical Pathways</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
