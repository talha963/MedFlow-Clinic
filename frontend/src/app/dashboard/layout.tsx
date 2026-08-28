"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { Activity, Users, Calendar, Settings, LogOut, ChevronRight, Search, Bell, CreditCard } from "lucide-react";
import { signOut } from "firebase/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("Doctor");

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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/doctor/login");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center" style={{ animation: 'logo-pulse 2s ease-in-out infinite' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-300 tracking-wide">Initializing MedFlow...</p>
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
      {/* ═══ Glassmorphic Sidebar ═══ */}
      <aside className="w-72 hidden md:flex flex-col relative z-20 glass-panel" style={{ borderRight: '1px solid var(--border-glass)' }}>
        {/* Ambient sidebar glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)' }}></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)' }}></div>
        </div>
        
        {/* Logo */}
        <div className="p-8 pb-6 flex items-center gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg" style={{ animation: 'logo-pulse 3s ease-in-out infinite' }}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none gradient-text">MedFlow AI</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400/70 uppercase mt-1">Clinical Portal</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto relative z-10">
          <div className="mb-5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Navigation</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? "text-white font-bold" 
                    : "hover:text-white font-medium text-slate-400"
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(6,182,212,0.2)',
                  boxShadow: '0 4px 20px rgba(6,182,212,0.1)',
                } : {}}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-gradient-to-b from-cyan-400 to-violet-500"></div>
                )}
                <span className={`transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
                {!isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-50 transition-all duration-300 transform group-hover:translate-x-0.5" />}
              </Link>
            );
          })}
        </nav>
        
        {/* Doctor Profile Card */}
        <div className="p-4 relative z-10" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl glass-card" style={{ border: '1px solid var(--border-glass)' }}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 status-active" style={{ borderColor: 'var(--bg-surface)' }}></div>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Dr. {doctorName}</p>
              <p className="text-xs text-emerald-400/80 font-medium">Online</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full p-2.5 text-slate-500 rounded-xl transition-all duration-300 font-bold text-sm hover:text-rose-400 hover:bg-rose-500/5"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Floating Ambient Orbs */}
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>

        {/* Frosted Glass Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 z-10 sticky top-0 glass-panel" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search patients, records, appointments..." 
                className="w-full rounded-xl py-2 pl-11 pr-4 text-sm font-medium outline-none input-glow text-slate-300 placeholder-slate-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-slate-500 hover:text-cyan-400 transition-colors duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2" style={{ borderColor: 'var(--bg-surface)' }}></span>
            </button>
            <div className="h-6 w-px" style={{ background: 'var(--border-glass)' }}></div>
            <div className="text-xs font-bold text-slate-500 tracking-wider uppercase">MedFlow v2.0</div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden glass-panel text-white p-4 flex justify-between items-center relative z-20" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <div className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="gradient-text">MedFlow AI</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative z-[1] p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
