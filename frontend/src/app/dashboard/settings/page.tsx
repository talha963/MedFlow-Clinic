"use client";
import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Database, Loader2, Zap, Globe } from "lucide-react";
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?email=${email}`);
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Database className="w-5 h-5" /> },
  ];
  
  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      <div className="glass-card overflow-hidden flex flex-col md:flex-row min-h-[70vh] animate-fade-in-up">
        
        {/* ═══ Settings Sidebar ═══ */}
        <div className="w-full md:w-64 p-6 flex flex-col gap-1.5" style={{ borderRight: '1px solid var(--border-glass)', background: 'rgba(10, 14, 26, 0.4)' }}>
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            Settings
          </h2>
          
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(6,182,212,0.2)',
                boxShadow: '0 4px 20px rgba(6,182,212,0.08)',
              } : { border: '1px solid transparent' }}
            >
              <span className={activeTab === tab.id ? 'text-cyan-400' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Settings Content ═══ */}
        <div className="flex-1 p-8 md:p-12">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
              <p className="font-bold text-slate-500">Loading Settings...</p>
            </div>
          ) : activeTab === 'profile' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-white mb-8">Profile Settings</h3>
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" style={{ border: '3px solid rgba(6,182,212,0.3)', boxShadow: '0 0 25px rgba(6,182,212,0.15)' }} />
                    ) : (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black" style={{ 
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
                        border: '3px solid rgba(6,182,212,0.3)', 
                        boxShadow: '0 0 25px rgba(6,182,212,0.15)',
                        color: 'var(--accent-cyan)'
                      }}>
                        {profile.firstName ? profile.firstName.charAt(0) : "D"}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center status-active" style={{ border: '3px solid var(--bg-surface)' }}>
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 text-slate-400 hover:text-cyan-300" style={{ background: 'rgba(100,116,160,0.08)', border: '1px solid var(--border-glass)' }}>
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
                
                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">First Name</label>
                    <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow text-slate-200 placeholder-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Last Name</label>
                    <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow text-slate-200 placeholder-slate-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Email Address</label>
                  <input type="email" disabled value={profile.email} className="w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed opacity-60" style={{ background: 'rgba(100,116,160,0.05)', border: '1px solid var(--border-glass)' }} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Specialty</label>
                  <select value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow text-slate-200" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                <button onClick={handleSave} className="px-8 py-3 rounded-xl font-bold transition-all mt-6 text-white btn-glow" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(139,92,246,0.6))' }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-white mb-8">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { title: "Email Alerts", desc: "Receive daily summaries of patient activity.", default: true },
                  { title: "Critical Clinical Flags", desc: "Immediate push notifications for dangerous drug interactions.", default: true },
                  { title: "Appointment Reminders", desc: "Get notified 15 minutes before each appointment.", default: false },
                  { title: "Billing Notifications", desc: "Alerts when a patient pays their invoice via Safepay.", default: true },
                ].map((item, idx) => (
                  <label key={item.title} className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 cursor-pointer group animate-fade-in-up stagger-${idx + 1}`} style={{ background: 'rgba(10,14,26,0.4)', border: '1px solid var(--border-glass)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,160,0.15)'; }}
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={item.default} className="toggle-switch" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-white mb-8">Security & Authentication</h3>
              <div className="space-y-4">
                {[
                  { title: "Change Password", desc: "Update your Firebase authentication credentials.", icon: <Shield className="w-5 h-5 text-cyan-400" /> },
                  { title: "Two-Factor Authentication (2FA)", desc: "Currently disabled. Enable for HIPAA compliance.", icon: <Zap className="w-5 h-5 text-violet-400" /> },
                  { title: "Active Sessions", desc: "View and manage active login sessions.", icon: <Globe className="w-5 h-5 text-emerald-400" /> },
                ].map((item, idx) => (
                  <button key={item.title} className={`w-full text-left p-5 rounded-xl transition-all duration-300 flex items-start gap-4 group animate-fade-in-up stagger-${idx + 1}`} style={{ background: 'rgba(10,14,26,0.4)', border: '1px solid var(--border-glass)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,160,0.15)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(100,116,160,0.08)' }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold text-white mb-8">System Integrations</h3>
              <div className="space-y-4">
                {[
                  { name: "n8n Automation", desc: "Connected to webhook /appointment-approved", badge: "N8N", color: "emerald", active: true },
                  { name: "Neo4j Graph Database", desc: "Connected for Clinical Pathways", badge: "N4J", color: "cyan", active: true },
                  { name: "Pinecone Vector DB", desc: "RAG Knowledge Base (medflow-rag-v2)", badge: "PNC", color: "violet", active: true },
                  { name: "Safepay Payments", desc: "Processing billing invoices", badge: "SPY", color: "amber", active: true },
                ].map((item, idx) => {
                  const badgeColors: Record<string, { bg: string; border: string; text: string }> = {
                    emerald: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.2)', text: 'text-emerald-400' },
                    cyan: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.2)', text: 'text-cyan-400' },
                    violet: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.2)', text: 'text-violet-400' },
                    amber: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)', text: 'text-amber-400' },
                  };
                  const c = badgeColors[item.color];
                  return (
                    <div key={item.name} className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 animate-fade-in-up stagger-${idx + 1}`} style={{ background: 'rgba(10,14,26,0.4)', border: '1px solid var(--border-glass)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,160,0.15)'; }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs ${c.text}`} style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                          {item.badge}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 status-active"></span>
                        <span className="text-xs font-bold text-emerald-400">Active</span>
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
