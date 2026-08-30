"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Activity, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Stethoscope, Sun, Moon, Home } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function LandingPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [degree, setDegree] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        
        // Sync with MySQL backend
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            specialty: specialty,
            degree: degree,
            email: email
          })
        });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials or Firebase config.");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* Left Side - Enhanced Visuals */}
      <div className="hidden lg:flex w-7/12 relative overflow-hidden flex-col items-center justify-center bg-blue-900 dark:bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 hover:scale-105 transition-transform duration-[20s]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-slate-900/90"></div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="z-10 px-16 w-full max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 mb-8">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span className="text-sm font-medium tracking-wide">HIPAA Compliant AI Engine</span>
          </div>
          
          <h1 className="text-6xl font-black text-white leading-tight mb-6 drop-shadow-lg">
            Clinical Decisions, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-200">
              Powered by Advanced AI.
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 leading-relaxed font-light mb-10 max-w-xl">
            MedFlow AI orchestrates clinical guidelines, patient histories, and safety checks to instantly synthesize complex medical data into actionable insights.
          </p>

          <div className="flex gap-6 text-white/80">
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="p-3 bg-blue-500/20 rounded-xl"><Activity className="w-6 h-6 text-blue-300" /></div>
              <div>
                <div className="font-bold text-white">Clinical AI Engine</div>
                <div className="text-sm">Smart Patient Analysis</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="p-3 bg-teal-500/20 rounded-xl"><Stethoscope className="w-6 h-6 text-teal-300" /></div>
              <div>
                <div className="font-bold text-white">Deep Context</div>
                <div className="text-sm">Comprehensive Histories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Glassmorphism Auth Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 dark:from-blue-900/20 via-slate-50 dark:via-slate-950 to-slate-50 dark:to-slate-950 opacity-70 transition-colors duration-300"></div>
        
        {/* Theme Toggle Top Right */}
        {mounted && (
          <>
            <Link 
              href="/"
              className="absolute top-6 left-6 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 z-50 shadow-sm flex items-center gap-2 font-bold text-sm group"
            >
              <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <button 
              onClick={toggleTheme}
            className="absolute top-6 right-6 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 z-50 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          </>
        )}
        
        <div className="w-full max-w-md relative z-10 bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
              {isLogin ? "Enter your credentials to access the portal." : "Join MedFlow AI to streamline your practice."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="Dr. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Degree (e.g. MBBS, MD)</label>
                  <input type="text" required value={degree} onChange={(e) => setDegree(e.target.value)} className="block w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="MBBS, MS" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Specialty</label>
                  <input type="text" required value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="block w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="Cardiology" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="doctor@hospital.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 mt-8 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg shadow-blue-600/20 disabled:opacity-70 transition-all font-bold text-lg"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
              {isLogin ? "New to MedFlow?" : "Already a member?"}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {isLogin ? "Sign up now" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
