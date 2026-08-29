"use client";
import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Database, Loader2, Zap, Globe } from "lucide-react";
import { auth } from "@/lib/firebase";

/* ═══ 3D Network Graph ═══ */
function NetworkGraph() {
  const nodes = [
    { cx: 50, cy: 30, r: 4 }, { cx: 80, cy: 60, r: 3 }, { cx: 30, cy: 70, r: 3.5 },
    { cx: 70, cy: 90, r: 3 }, { cx: 20, cy: 40, r: 2.5 }, { cx: 90, cy: 35, r: 2.5 },
  ];
  return (
    <svg className="opacity-[0.06]" width="120" height="120" viewBox="0 0 120 120">
      {/* Connections */}
      {nodes.map((n, i) => nodes.slice(i+1).map((m, j) => (
        <line key={`${i}-${j}`} x1={n.cx} y1={n.cy} x2={m.cx} y2={m.cy} stroke="#3b82f6" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${3+j}s`} repeatCount="indefinite" />
        </line>
      )))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="#3b82f6" opacity="0.6">
            <animate attributeName="r" values={`${n.r};${n.r+1};${n.r}`} dur={`${2+i*0.5}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={n.r * 2.5} fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.2">
            <animate attributeName="r" values={`${n.r*2};${n.r*3};${n.r*2}`} dur={`${3+i*0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur={`${3+i*0.5}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", specialty: "General Practice", role: "Doctor", avatarUrl: "" });

  useEffect(() => {
    const savedAvatar = localStorage.getItem('medflow_avatar');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const email = user.email || "";
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            const nameParts = data.name.replace("Dr. ", "").split(" ");
            setProfile({ firstName: nameParts[0] || "", lastName: nameParts.slice(1).join(" ") || "", email, specialty: data.specialty || "General Practice", role: data.role || "Doctor", avatarUrl: savedAvatar || "" });
          } else { setProfile(prev => ({ ...prev, email })); }
        } catch (err) { setProfile(prev => ({ ...prev, email })); }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => { alert("Profile settings saved successfully!"); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Database className="w-5 h-5" /> },
  ];
  
  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      <div className="glass-card overflow-hidden flex flex-col md:flex-row min-h-[70vh] animate-fade-in-up relative">
        
        {/* ═══ Settings Sidebar ═══ */}
        <div className="w-full md:w-64 p-6 flex flex-col gap-1.5 bg-slate-50/60 border-r border-slate-100 relative overflow-hidden">
          {/* 3D Network graph decoration */}
          <div className="absolute -bottom-4 -right-4 pointer-events-none"><NetworkGraph /></div>
          
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            Settings
          </h2>
          
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative z-10 ${
                activeTab === tab.id ? 'text-blue-600 bg-white shadow-sm border border-blue-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}>
              <span className={activeTab === tab.id ? 'text-blue-500' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Settings Content ═══ */}
        <div className="flex-1 p-8 md:p-12">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="font-bold text-slate-400">Loading Settings...</p>
            </div>
          ) : activeTab === 'profile' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-slate-800 mb-8">Profile Settings</h3>
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" style={{ boxShadow: '0 0 0 3px rgba(59,130,246,0.15), 0 8px 24px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-blue-500 border-4 border-white shadow-lg" style={{ 
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))',
                        boxShadow: '0 0 0 3px rgba(59,130,246,0.15), 0 8px 24px rgba(0,0,0,0.1)' 
                      }}>
                        {profile.firstName ? profile.firstName.charAt(0) : "D"}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center status-active" style={{ border: '3px solid white' }}>
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute -inset-2 rounded-full pulse-ring" style={{ border: '2px solid rgba(59,130,246,0.1)' }}></div>
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 shadow-sm">
                    Change Avatar
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0]; const reader = new FileReader();
                        reader.onload = (event) => { if (event.target?.result) { const b = event.target.result as string; setProfile(prev => ({ ...prev, avatarUrl: b })); localStorage.setItem('medflow_avatar', b); } };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">First Name</label>
                    <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Last Name</label>
                    <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow text-slate-700" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Email Address</label>
                  <input type="email" disabled value={profile.email} className="w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed opacity-60 bg-slate-50 border border-slate-100" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Specialty</label>
                  <select value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow text-slate-700 bg-white">
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                <button onClick={handleSave} className="px-8 py-3 rounded-xl font-bold transition-all mt-6 text-white btn-glow" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-slate-800 mb-8">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { title: "Email Alerts", desc: "Receive daily summaries of patient activity.", default: true },
                  { title: "Critical Clinical Flags", desc: "Immediate push notifications for dangerous drug interactions.", default: true },
                  { title: "Appointment Reminders", desc: "Get notified 15 minutes before each appointment.", default: false },
                  { title: "Billing Notifications", desc: "Alerts when a patient pays their invoice via Safepay.", default: true },
                ].map((item, idx) => (
                  <label key={item.title} className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 cursor-pointer group border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm animate-fade-in-up stagger-${idx+1}`}>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={item.default} className="toggle-switch" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-slate-800 mb-8">Security & Authentication</h3>
              <div className="space-y-4">
                {[
                  { title: "Change Password", desc: "Update your Firebase authentication credentials.", icon: <Shield className="w-5 h-5 text-blue-500" /> },
                  { title: "Two-Factor Authentication (2FA)", desc: "Currently disabled. Enable for HIPAA compliance.", icon: <Zap className="w-5 h-5 text-indigo-500" /> },
                  { title: "Active Sessions", desc: "View and manage active login sessions.", icon: <Globe className="w-5 h-5 text-emerald-500" /> },
                ].map((item, idx) => (
                  <button key={item.title} className={`w-full text-left p-5 rounded-xl transition-all duration-300 flex items-start gap-4 group border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm hover:translate-x-1 animate-fade-in-up stagger-${idx+1}`}>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{item.icon}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-slate-800 mb-8">System Integrations</h3>
              <div className="space-y-4">
                {[
                  { name: "n8n Automation", desc: "Connected to webhook /appointment-approved", badge: "N8N", color: "emerald" },
                  { name: "Neo4j Graph Database", desc: "Connected for Clinical Pathways", badge: "N4J", color: "blue" },
                  { name: "Pinecone Vector DB", desc: "RAG Knowledge Base (medflow-rag-v2)", badge: "PNC", color: "indigo" },
                  { name: "Safepay Payments", desc: "Processing billing invoices", badge: "SPY", color: "amber" },
                ].map((item, idx) => {
                  const badgeColors: Record<string, { bg: string; border: string; text: string }> = {
                    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
                    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
                    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
                    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
                  };
                  const c = badgeColors[item.color];
                  return (
                    <div key={item.name} className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm animate-fade-in-up stagger-${idx+1}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs ${c.bg} ${c.border} ${c.text} border`}>
                          {item.badge}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                          <p className="text-sm text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 status-active"></span>
                        <span className="text-xs font-bold text-emerald-500">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
