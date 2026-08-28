"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { Activity, Users, Calendar, Settings, LogOut, ChevronRight, Search, Bell, Moon, Sun } from "lucide-react";
import { signOut } from "firebase/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check local storage for theme
    const savedTheme = localStorage.getItem("medflow-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") document.documentElement.classList.add("dark");
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/doctor/login");
      } else {
        try {
          const email = user.email || "";
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            // Assuming data.name is "Dr. Test User"
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("medflow-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/doctor/login");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Activity className="w-12 h-12 animate-pulse" />
          <p className="text-xl font-bold">Authenticating...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Patient Intelligence", href: "/dashboard", icon: <Users className="w-5 h-5" /> },
    { name: "Appointments", href: "/dashboard/appointments", icon: <Calendar className="w-5 h-5" /> },
    { name: "Financial Billing", href: "/dashboard/billing", icon: <Activity className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Enterprise Sidebar */}
      <aside className="w-72 bg-[#0f172a] text-slate-300 hidden md:flex flex-col border-r border-slate-800 shadow-2xl z-20 relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Activity className="w-64 h-64 text-blue-400" />
        </div>
        
        <div className="p-8 pb-6 flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50 text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">MedFlow AI</h1>
            <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mt-1">Clinical Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
          <div className="mb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Main Navigation</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-800 hover:text-white font-medium"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                {item.name}
                {!isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-700">
              {doctorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Dr. {doctorName}</p>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full p-3 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl transition-colors font-bold text-sm border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Secure Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-200">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global Search (Patients, Records, Appointments...)" 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all outline-none text-slate-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="text-slate-400 hover:text-blue-600 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative text-slate-400 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">MedFlow Terminal</div>
          </div>
        </header>

        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg relative z-20">
          <div className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            MedFlow AI
          </div>
          <button onClick={handleLogout} className="text-white hover:text-rose-400 transition-colors"><LogOut className="w-6 h-6" /></button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900 transition-colors duration-200 p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
