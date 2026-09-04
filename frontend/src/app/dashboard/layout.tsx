"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { Activity, Users, Calendar, Settings, LogOut, ChevronRight, Search, Bell, CreditCard, Sun, Moon } from "lucide-react";
import { signOut } from "firebase/auth";
import { useTheme } from "@/components/ThemeProvider";

/* ═══ 3D Rotating Concentric Rings ═══ */
function ConcentricRings() {
  return (
    <div className="scene-3d inset-0 w-full h-full">
      {/* Top-right large ring system */}
      <svg className="absolute top-[6%] right-[3%] w-[280px] h-[280px]" viewBox="0 0 280 280" style={{ opacity: 1 }}>
        <circle cx="140" cy="140" r="130" fill="none" stroke="var(--accent-blue)" strokeWidth="0.6" strokeDasharray="8 6" className="rotate-slow" opacity="0.12" />
        <circle cx="140" cy="140" r="105" fill="none" stroke="var(--accent-indigo)" strokeWidth="0.5" strokeDasharray="5 8" className="rotate-slow-reverse" opacity="0.09" />
        <circle cx="140" cy="140" r="80" fill="none" stroke="var(--accent-blue)" strokeWidth="0.4" strokeDasharray="3 7" className="rotate-medium" opacity="0.07" />
        <circle cx="140" cy="140" r="55" fill="none" stroke="var(--accent-emerald)" strokeWidth="0.4" strokeDasharray="4 6" className="rotate-slow" opacity="0.06" />
        {/* Orbiting dots on rings */}
        <circle r="3" fill="var(--accent-blue)" opacity="0.2"><animateMotion dur="20s" repeatCount="indefinite"><mpath href="#ring1" /></animateMotion></circle>
        <circle r="2.5" fill="var(--accent-indigo)" opacity="0.15"><animateMotion dur="28s" repeatCount="indefinite"><mpath href="#ring2" /></animateMotion></circle>
        {/* Path definitions */}
        <path id="ring1" d="M270,140 A130,130 0 1,1 269.99,140" fill="none" />
        <path id="ring2" d="M245,140 A105,105 0 1,0 245.01,140" fill="none" />
      </svg>

      {/* Bottom-left smaller ring system */}
      <svg className="absolute bottom-[8%] left-[4%] w-[180px] h-[180px]" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="80" fill="none" stroke="var(--accent-emerald)" strokeWidth="0.5" strokeDasharray="6 5" className="rotate-slow-reverse" opacity="0.1" />
        <circle cx="90" cy="90" r="55" fill="none" stroke="var(--accent-blue)" strokeWidth="0.4" strokeDasharray="4 7" className="rotate-medium" opacity="0.07" />
        <circle cx="90" cy="90" r="30" fill="none" stroke="var(--accent-indigo)" strokeWidth="0.5" strokeDasharray="3 5" className="rotate-slow" opacity="0.08" />
      </svg>

      {/* Center-right helix-inspired wave */}
      <svg className="absolute top-[35%] right-[15%] w-[200px] h-[100px] opacity-[0.05]" viewBox="0 0 200 100">
        <path d="M0,50 C25,20 50,80 75,50 C100,20 125,80 150,50 C175,20 200,80 225,50" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="d" 
            values="M0,50 C25,20 50,80 75,50 C100,20 125,80 150,50 C175,20 200,80 225,50;M0,50 C25,80 50,20 75,50 C100,80 125,20 150,50 C175,80 200,20 225,50;M0,50 C25,20 50,80 75,50 C100,20 125,80 150,50 C175,20 200,80 225,50" 
            dur="8s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}

/* ═══ Morphing Blobs (bigger, more visible) ═══ */
function MorphBlobs() {
  return (
    <div className="scene-3d inset-0 w-full h-full">
      <div className="absolute top-[15%] right-[18%] w-48 h-48 morph-blob" style={{ background: 'var(--blob-color-1)' }}></div>
      <div className="absolute bottom-[20%] left-[12%] w-36 h-36 morph-blob" style={{ background: 'var(--blob-color-2)', animationDelay: '5s', animationDuration: '18s' }}></div>
      <div className="absolute top-[55%] right-[40%] w-28 h-28 morph-blob" style={{ background: 'var(--blob-color-3)', animationDelay: '8s', animationDuration: '22s' }}></div>
    </div>
  );
}

/* ═══ Floating Particles ═══ */
function FloatingParticles() {
  return (
    <div className="scene-3d inset-0 w-full h-full">
      {[
        { top: '12%', left: '20%', size: 6, delay: '0s', dur: '7s' },
        { top: '28%', left: '75%', size: 4, delay: '2s', dur: '9s' },
        { top: '60%', left: '30%', size: 5, delay: '4s', dur: '8s' },
        { top: '45%', left: '85%', size: 3, delay: '1s', dur: '10s' },
        { top: '80%', left: '55%', size: 4, delay: '3s', dur: '7s' },
        { top: '20%', left: '50%', size: 5, delay: '5s', dur: '11s' },
        { top: '70%', left: '15%', size: 3, delay: '6s', dur: '8s' },
        { top: '35%', left: '65%', size: 4, delay: '2.5s', dur: '9s' },
      ].map((p, i) => (
        <div key={i} className="particle breathe" style={{
          top: p.top, left: p.left,
          width: p.size, height: p.size,
          background: i % 3 === 0 ? 'var(--accent-blue)' : i % 3 === 1 ? 'var(--accent-indigo)' : 'var(--accent-emerald)',
          opacity: 'var(--particle-opacity)',
          animationDelay: p.delay,
          animationDuration: p.dur,
        }}></div>
      ))}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("Doctor");
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/doctor/login");
      } else {
        try {
          const email = user.email || "";
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            setDoctorName(data.name.replace("Dr. ", ""));
          } else {
            const name = user.displayName || (user.email ? user.email.split('@')[0] : "Doctor");
            setDoctorName(name.charAt(0).toUpperCase() + name.slice(1));
          }
        } catch (err) {
          const name = user.displayName || (user.email ? user.email.split('@')[0] : "Doctor");
          setDoctorName(name.charAt(0).toUpperCase() + name.slice(1));
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => { await signOut(auth); router.push("/doctor/login"); };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center" style={{ animation: 'logo-pulse 2s ease-in-out infinite' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-4 rounded-3xl pulse-ring" style={{ border: '2px solid var(--accent-blue)', opacity: 0.2 }}></div>
          </div>
          <p className="text-lg font-bold tracking-wide" style={{ color: 'var(--text-muted)' }}>Initializing MedFlow...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Patient Intelligence", href: "/dashboard", icon: <Users className="w-5 h-5" /> },
    { name: "Appointments", href: "/dashboard/appointments", icon: <Calendar className="w-5 h-5" /> },
    { name: "Financial Billing", href: "/dashboard/billing", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--bg-deep)' }}>
      {/* ═══ Dark Sidebar ═══ */}
      <aside className="w-72 hidden md:flex flex-col relative z-20 sidebar-glass" style={{ borderRight: `1px solid var(--sidebar-border)` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)' }}></div>
          <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)' }}></div>
        </div>
        
        <Link href="/" className="p-8 pb-6 flex items-center gap-3 relative z-10 hover:opacity-80 transition-opacity">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg" style={{ animation: 'logo-pulse 3s ease-in-out infinite' }}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-white">MedFlow AI</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-blue-300/70 uppercase mt-1">Clinical Portal</p>
          </div>
        </Link>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto relative z-10">
          <div className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sidebar-text)' }}>Navigation</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive ? "font-bold" : "font-medium"}`}
                style={{
                  color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  ...(isActive ? {
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.12))',
                    border: '1px solid rgba(59,130,246,0.25)',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.1)',
                  } : {})
                }}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-400"></div>}
                <span className={`transition-colors duration-300 ${isActive ? 'text-blue-300' : 'text-slate-400/50 group-hover:text-blue-300'}`}>{item.icon}</span>
                <span className="text-sm">{item.name}</span>
                {!isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-50 transition-all duration-300 transform group-hover:translate-x-0.5" />}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 relative z-10" style={{ borderTop: `1px solid var(--sidebar-border)` }}>
          <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl" style={{ background: 'var(--sidebar-hover)', border: `1px solid var(--sidebar-border)` }}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 status-active" style={{ borderColor: '#1e3a5f' }}></div>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Dr. {doctorName}</p>
              <p className="text-xs text-emerald-400/80 font-medium">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl transition-all duration-300 font-bold text-sm hover:text-rose-300 hover:bg-rose-500/10" style={{ color: 'var(--sidebar-text)' }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background layers */}
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
        <ConcentricRings />
        <MorphBlobs />
        <FloatingParticles />

        {/* Frosted Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 z-10 sticky top-0 glass-panel" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search patients, records, appointments..." 
                  className="w-full rounded-xl py-2 pl-11 pr-10 text-sm font-medium outline-none input-glow" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setShowDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-xl p-2 shadow-2xl z-50 glass-card animate-scale-in" style={{ border: '1px solid var(--border-glow)' }}>
                  {isSearching ? (
                    <div className="p-4 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                      {searchResults.map(p => (
                        <button key={p.patient_id} 
                          className="flex items-center justify-between p-3 rounded-lg hover-bg-glow text-left transition-all"
                          style={{ background: 'var(--bg-hover)' }}
                          onClick={() => {
                            setSearchQuery("");
                            setShowDropdown(false);
                            router.push(`/dashboard?patientId=${p.patient_id}`);
                          }}>
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {p.patient_id} • DOB: {p.dob || p.date_of_birth}</p>
                          </div>
                          <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>No patients found for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button className="relative" style={{ color: 'var(--text-muted)' }}>
              <Bell className="w-5 h-5 hover:text-blue-500 transition-colors duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2" style={{ borderColor: 'var(--bg-surface)' }}></span>
            </button>
            <div className="h-6 w-px" style={{ background: 'var(--border-glass)' }}></div>
            <div className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>MedFlow v2.0</div>
          </div>
        </header>

        {/* Mobile Header (Search + Actions) */}
        <div className="md:hidden glass-panel p-4 flex flex-col gap-3 relative z-20" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Activity className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
              <span className="font-black" style={{ color: 'var(--text-primary)' }}>MedFlow AI</span>
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="theme-toggle" style={{ width: 32, height: 32, borderRadius: 8 }}>
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleLogout} className="text-rose-400 hover:text-rose-500 transition-colors"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
          {/* Mobile Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full rounded-xl py-2 pl-10 pr-10 text-sm font-medium outline-none input-glow" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setShowDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full rounded-xl p-2 shadow-2xl z-50 glass-card animate-scale-in" style={{ border: '1px solid var(--border-glow)' }}>
                {isSearching ? (
                  <div className="p-4 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                    {searchResults.map(p => (
                      <button key={p.patient_id} 
                        className="flex items-center justify-between p-3 rounded-lg hover-bg-glow text-left transition-all"
                        style={{ background: 'var(--bg-hover)' }}
                        onClick={() => {
                          setSearchQuery("");
                          setShowDropdown(false);
                          router.push(`/dashboard?patientId=${p.patient_id}`);
                        }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {p.patient_id} • DOB: {p.dob || p.date_of_birth}</p>
                        </div>
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>No patients found for "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page Content (Added pb-20 to clear bottom nav) */}
        <main className="flex-1 overflow-y-auto relative z-[1] p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel z-50 flex items-center justify-around px-2" style={{ borderTop: '1px solid var(--border-glass)', background: 'var(--bg-glass-strong)', backdropFilter: 'blur(20px)' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full h-full gap-1 relative">
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'opacity-70'}`} style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold" style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)', opacity: isActive ? 1 : 0.7 }}>
                  {item.name.split(" ")[0]}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
