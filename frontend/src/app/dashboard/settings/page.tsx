"use client";
import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Database, Loader2, Zap, Globe, Sun, Moon } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/components/ThemeProvider";

/* ═══ 3D Network Graph (larger, more visible) ═══ */
function NetworkGraph({ size = 180 }: { size?: number }) {
  const nodes = [
    { cx: 40, cy: 25, r: 5 }, { cx: 90, cy: 45, r: 4 }, { cx: 25, cy: 75, r: 4.5 },
    { cx: 75, cy: 85, r: 3.5 }, { cx: 15, cy: 40, r: 3 }, { cx: 100, cy: 20, r: 3.5 },
    { cx: 55, cy: 55, r: 6 }, { cx: 120, cy: 65, r: 3 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 140 110" style={{ opacity: 'var(--helix-opacity)' }}>
      {nodes.map((n, i) => nodes.slice(i+1).filter((_, j) => (i + j) % 2 === 0).map((m, j) => (
        <line key={`${i}-${j}`} x1={n.cx} y1={n.cy} x2={m.cx} y2={m.cy} stroke="var(--accent-blue)" strokeWidth="0.6" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${3+j}s`} repeatCount="indefinite" />
        </line>
      )))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="var(--accent-blue)" opacity="0.5">
            <animate attributeName="r" values={`${n.r};${n.r+1.5};${n.r}`} dur={`${2+i*0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={n.r * 3} fill="none" stroke="var(--accent-blue)" strokeWidth="0.3" opacity="0.15">
            <animate attributeName="r" values={`${n.r*2.5};${n.r*4};${n.r*2.5}`} dur={`${3+i*0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.03;0.15" dur={`${3+i*0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ═══ Gear Rings ═══ */
function GearRings() {
  return (
    <svg className="w-[120px] h-[120px]" viewBox="0 0 120 120" style={{ opacity: 'var(--helix-opacity)' }}>
      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-blue)" strokeWidth="0.5" strokeDasharray="5 3 2 3" className="rotate-slow" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="var(--accent-indigo)" strokeWidth="0.5" strokeDasharray="3 5" className="rotate-slow-reverse" />
      <circle cx="60" cy="60" r="26" fill="none" stroke="var(--accent-emerald)" strokeWidth="0.5" strokeDasharray="2 4 3 4" className="rotate-medium" />
      {/* Gear teeth on outer ring */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <rect key={i} x={60 + 46 * Math.cos((deg) * Math.PI / 180) - 2} y={60 + 46 * Math.sin((deg) * Math.PI / 180) - 4} 
          width="4" height="8" rx="1" fill="var(--accent-blue)" opacity="0.3" className="rotate-slow"
          style={{ transformOrigin: '60px 60px' }} />
      ))}
    </svg>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", specialty: "General Practice", role: "Doctor", avatarUrl: "" });
  const { theme, toggleTheme } = useTheme();

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

  const handleSave = async () => {
    try {
      const name = `Dr. ${profile.firstName} ${profile.lastName}`.trim();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, name, specialty: profile.specialty })
      });
      if (res.ok) {
        alert("Profile settings saved successfully!");
      } else {
        alert("Failed to save profile settings.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving.");
    }
  };

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
        <div className="w-full md:w-64 p-6 flex flex-col gap-1.5 relative overflow-hidden" style={{ background: 'var(--bg-empty)', borderRight: '1px solid var(--border-glass)' }}>
          <div className="absolute -bottom-6 -right-6 pointer-events-none"><NetworkGraph size={200} /></div>
          <div className="absolute top-4 right-4 pointer-events-none"><GearRings /></div>
          
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10" style={{ color: 'var(--text-primary)' }}>
            <div className="p-1.5 rounded-lg" style={{ background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
              <Settings className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
            </div>
            Settings
          </h2>
          
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative z-10`}
              style={{
                background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab.id ? 'var(--badge-blue-border)' : 'transparent'}`,
                boxShadow: activeTab === tab.id ? 'var(--shadow-card)' : 'none',
              }}>
              <span style={{ color: activeTab === tab.id ? 'var(--accent-blue)' : undefined }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Settings Content ═══ */}
        <div className="flex-1 p-8 md:p-12">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: 'var(--accent-blue)' }} />
              <p className="font-bold" style={{ color: 'var(--text-muted)' }}>Loading Settings...</p>
            </div>
          ) : activeTab === 'profile' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Profile Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" style={{ border: '4px solid var(--bg-surface)', boxShadow: '0 0 0 3px var(--border-glow), 0 8px 24px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black" style={{ 
                        color: 'var(--accent-blue)',
                        background: 'var(--glow-blue)',
                        border: '4px solid var(--bg-surface)',
                        boxShadow: '0 0 0 3px var(--border-glow), 0 8px 24px rgba(0,0,0,0.1)' 
                      }}>
                        {profile.firstName ? profile.firstName.charAt(0) : "D"}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center status-active" style={{ border: '3px solid var(--bg-surface)' }}>
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <div className="absolute -inset-3 rounded-full pulse-ring" style={{ border: '2px solid var(--ring-color)' }}></div>
                    <div className="absolute -inset-6 rounded-full pulse-ring pulse-ring-delay" style={{ border: '1px solid var(--ring-color)' }}></div>
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                    Change Avatar
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const reader = new FileReader();
                        reader.onload = (event) => { if (event.target?.result) { const b = event.target.result as string; setProfile(prev => ({ ...prev, avatarUrl: b })); localStorage.setItem('medflow_avatar', b); } };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} />
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>First Name</label>
                    <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Last Name</label>
                    <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <input type="email" disabled value={profile.email} className="w-full px-4 py-3 rounded-xl text-sm font-medium cursor-not-allowed opacity-60" style={{ background: 'var(--bg-empty)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Specialty</label>
                  <select value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm font-medium input-glow" style={{ background: 'var(--bg-input)' }}>
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Theme Toggle in Settings */}
                <div className="flex items-center justify-between p-5 rounded-xl" style={{ background: 'var(--bg-empty)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Appearance</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Switch between light and dark theme.</p>
                  </div>
                  <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300" style={{ color: 'var(--accent-blue)', background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                    {theme === 'light' ? <><Moon className="w-4 h-4" /> Dark Mode</> : <><Sun className="w-4 h-4" /> Light Mode</>}
                  </button>
                </div>
                
                <button onClick={handleSave} className="px-8 py-3 rounded-xl font-bold transition-all mt-6 text-white btn-glow" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { title: "Email Alerts", desc: "Receive daily summaries of patient activity.", default: true },
                  { title: "Critical Clinical Flags", desc: "Immediate push notifications for dangerous drug interactions.", default: true },
                  { title: "Appointment Reminders", desc: "Get notified 15 minutes before each appointment.", default: false },
                  { title: "Billing Notifications", desc: "Alerts when a patient pays their invoice via Safepay.", default: true },
                ].map((item, idx) => (
                  <label key={item.title} className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 cursor-pointer animate-fade-in-up stagger-${idx+1}`}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={item.default} className="toggle-switch" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Security & Authentication</h3>
              <div className="space-y-4">
                {[
                  { title: "Change Password", desc: "Update your Firebase authentication credentials.", icon: <Shield className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} /> },
                  { title: "Two-Factor Authentication (2FA)", desc: "Currently disabled. Enable for HIPAA compliance.", icon: <Zap className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} /> },
                  { title: "Active Sessions", desc: "View and manage active login sessions.", icon: <Globe className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} /> },
                ].map((item, idx) => (
                  <button key={item.title} className={`w-full text-left p-5 rounded-xl transition-all duration-300 flex items-start gap-4 animate-fade-in-up stagger-${idx+1}`}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glow)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glass)'; }}>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--bg-empty)' }}>{item.icon}</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl animate-slide-in-right">
              <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>System Integrations</h3>
              <div className="space-y-4">
                {[
                  { name: "n8n Automation", desc: "Connected to webhook /appointment-approved", badge: "N8N", color: "emerald" },
                  { name: "Neo4j Graph Database", desc: "Connected for Clinical Pathways", badge: "N4J", color: "blue" },
                  { name: "Pinecone Vector DB", desc: "RAG Knowledge Base (medflow-rag-v2)", badge: "PNC", color: "indigo" },
                  { name: "Safepay Payments", desc: "Processing billing invoices", badge: "SPY", color: "amber" },
                ].map((item, idx) => {
                  const c: Record<string, { accent: string; glow: string; border: string }> = {
                    emerald: { accent: 'var(--badge-emerald-text)', glow: 'var(--badge-emerald-bg)', border: 'var(--badge-emerald-border)' },
                    blue: { accent: 'var(--badge-blue-text)', glow: 'var(--badge-blue-bg)', border: 'var(--badge-blue-border)' },
                    indigo: { accent: 'var(--accent-indigo)', glow: 'var(--glow-indigo)', border: 'rgba(99,102,241,0.15)' },
                    amber: { accent: 'var(--badge-amber-text)', glow: 'var(--badge-amber-bg)', border: 'var(--badge-amber-border)' },
                  };
                  const cv = c[item.color];
                  return (
                    <div key={item.name} className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 animate-fade-in-up stagger-${idx+1}`}
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs" style={{ color: cv.accent, background: cv.glow, border: `1px solid ${cv.border}` }}>
                          {item.badge}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full status-active" style={{ background: 'var(--accent-emerald)' }}></span>
                        <span className="text-xs font-bold" style={{ color: 'var(--badge-emerald-text)' }}>Active</span>
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
