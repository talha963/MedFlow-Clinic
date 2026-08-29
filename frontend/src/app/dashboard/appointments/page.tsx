"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Calendar, Clock, FileText, Pill, Loader2, CheckCircle, XCircle } from "lucide-react";

/* ═══ Animated Heartbeat ECG ═══ */
function HeartbeatECG() {
  return (
    <svg className="w-[320px] h-[70px]" viewBox="0 0 320 70" fill="none" style={{ opacity: 'var(--helix-opacity)' }}>
      <path d="M0,35 L70,35 L85,12 L100,58 L115,25 L130,45 L145,35 L200,35 L215,12 L230,58 L245,25 L260,45 L275,35 L320,35" 
        stroke="var(--accent-blue)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="800" strokeDashoffset="800">
        <animate attributeName="stroke-dashoffset" from="800" to="0" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M0,35 L70,35 L85,12 L100,58 L115,25 L130,45 L145,35 L200,35 L215,12 L230,58 L245,25 L260,45 L275,35 L320,35" 
        stroke="var(--accent-indigo)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="800" strokeDashoffset="800" opacity="0.4">
        <animate attributeName="stroke-dashoffset" from="800" to="0" dur="4s" begin="0.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/* ═══ 3D Clock Rings ═══ */
function ClockRings() {
  return (
    <svg className="w-[140px] h-[140px]" viewBox="0 0 140 140" style={{ opacity: 'var(--helix-opacity)' }}>
      <circle cx="70" cy="70" r="60" fill="none" stroke="var(--accent-blue)" strokeWidth="0.8" strokeDasharray="6 4" className="rotate-slow" />
      <circle cx="70" cy="70" r="48" fill="none" stroke="var(--accent-indigo)" strokeWidth="0.6" strokeDasharray="4 5" className="rotate-slow-reverse" />
      <circle cx="70" cy="70" r="36" fill="none" stroke="var(--accent-emerald)" strokeWidth="0.5" strokeDasharray="3 6" className="rotate-medium" />
      {/* Hour hand */}
      <line x1="70" y1="70" x2="70" y2="35" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" className="rotate-slow" style={{ transformOrigin: '70px 70px' }} />
      {/* Minute hand */}
      <line x1="70" y1="70" x2="95" y2="70" stroke="var(--accent-indigo)" strokeWidth="1.5" strokeLinecap="round" className="rotate-medium" style={{ transformOrigin: '70px 70px' }} />
      {/* Center dot */}
      <circle cx="70" cy="70" r="4" fill="var(--accent-blue)" opacity="0.4" className="breathe" />
      {/* Hour markers */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
        <circle key={i} cx={70 + 54 * Math.cos((deg - 90) * Math.PI / 180)} cy={70 + 54 * Math.sin((deg - 90) * Math.PI / 180)} r="1.5" fill="var(--accent-blue)" opacity="0.3" />
      ))}
    </svg>
  );
}

/* ═══ Stethoscope Wave ═══ */
function StethoscopeWave() {
  return (
    <svg className="w-[180px] h-[60px]" viewBox="0 0 180 60" fill="none" style={{ opacity: 'var(--helix-opacity)' }}>
      <path d="M0,30 Q15,10 30,30 Q45,50 60,30 Q75,10 90,30 Q105,50 120,30 Q135,10 150,30 Q165,50 180,30" stroke="var(--accent-emerald)" strokeWidth="1.5" fill="none">
        <animate attributeName="d" 
          values="M0,30 Q15,10 30,30 Q45,50 60,30 Q75,10 90,30 Q105,50 120,30 Q135,10 150,30 Q165,50 180,30;M0,30 Q15,50 30,30 Q45,10 60,30 Q75,50 90,30 Q105,10 120,30 Q135,50 150,30 Q165,10 180,30;M0,30 Q15,10 30,30 Q45,50 60,30 Q75,10 90,30 Q105,50 120,30 Q135,10 150,30 Q165,50 180,30"
          dur="6s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [writingPrescription, setWritingPrescription] = useState<any>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", instructions: "" });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    const fetchAppointments = async (email: string) => {
      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?email=${email}`);
        if (!profileRes.ok) return;
        const profileData = await profileRes.json();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?doctor_id=${profileData.user_id}`);
        if (res.ok) { const data = await res.json(); setAppointments(data); }
      } catch (err) { console.error("Failed to fetch appointments:", err); }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => { if (user?.email) fetchAppointments(user.email); });
    return () => unsubscribe();
  }, []);

  const fetchRecord = async (id: number) => {
    try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}/record`); if (res.ok) setViewingRecord(await res.json()); } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status } : a));
      if (status === "Confirmed") fetchRecord(id);
    } catch (err) { console.error("Failed to update status", err); }
  };

  const submitPrescription = async () => {
    if (!writingPrescription) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: writingPrescription.patient_id, doctor_email: auth.currentUser?.email || "", medication_details: prescriptionForm.medication, instructions: prescriptionForm.instructions })
      });
      if (res.ok) { alert("Prescription saved successfully!"); setWritingPrescription(null); setPrescriptionForm({ medication: "", instructions: "" }); }
    } catch (err) { alert("Error saving prescription"); }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-8">
      {/* ═══ Hero Banner ═══ */}
      <div className="rounded-2xl p-8 flex items-center justify-between animate-fade-in-up overflow-hidden relative glass-card" style={{
        background: 'linear-gradient(135deg, var(--badge-blue-bg), var(--glow-indigo), transparent)',
        border: '1px solid var(--badge-blue-border)',
      }}>
        {/* 3D Decorations */}
        <div className="absolute top-1 right-2 pointer-events-none"><ClockRings /></div>
        <div className="absolute bottom-0 left-4 pointer-events-none"><HeartbeatECG /></div>
        <div className="absolute bottom-2 right-[35%] pointer-events-none"><StethoscopeWave /></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 rounded-xl float-gentle" style={{ background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
              <Calendar className="w-7 h-7" style={{ color: 'var(--accent-blue)' }} />
            </div>
            Clinic Schedule
          </h2>
          <p style={{ color: 'var(--text-muted)' }} className="font-medium">Manage your daily appointments and incoming patient requests.</p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-2xl font-black gradient-text">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* ═══ Appointments Table ═══ */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-glass)' }}>
                {["Date", "Patient", "Type", "Time", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`p-4 text-[10px] font-bold uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <tr key={apt.appointment_id} className={`table-row-glow animate-fade-in-up stagger-${Math.min(idx+1,5)}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-4">
                    <span className="font-bold text-sm px-3 py-1.5 rounded-lg" style={{ color: 'var(--badge-blue-text)', background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>{apt.date}</span>
                  </td>
                  <td className="p-4 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Patient #{apt.patient_id}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Consultation</td>
                  <td className="p-4 text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Clock className="w-4 h-4" />{apt.time}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'Confirmed' ? 'status-active' : ''}`} style={{
                      color: apt.status === 'Confirmed' ? 'var(--badge-emerald-text)' : apt.status === 'Pending' ? 'var(--badge-amber-text)' : 'var(--text-muted)',
                      background: apt.status === 'Confirmed' ? 'var(--badge-emerald-bg)' : apt.status === 'Pending' ? 'var(--badge-amber-bg)' : 'var(--bg-empty)',
                      border: `1px solid ${apt.status === 'Confirmed' ? 'var(--badge-emerald-border)' : apt.status === 'Pending' ? 'var(--badge-amber-border)' : 'var(--border-subtle)'}`,
                    }}>{apt.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {apt.status === "Pending" ? (
                        <>
                          <button onClick={() => handleStatusUpdate(apt.appointment_id, "Confirmed")} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1" style={{ color: 'var(--badge-emerald-text)', background: 'var(--badge-emerald-bg)', border: `1px solid var(--badge-emerald-border)` }}>
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(apt.appointment_id, "Rejected")} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1" style={{ color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase mr-1" style={{ color: 'var(--text-muted)' }}>{apt.status}</span>
                          {apt.status === "Confirmed" && (
                            <>
                              <button onClick={() => fetchRecord(apt.appointment_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1" style={{ color: 'var(--badge-blue-text)', background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                                <FileText className="w-3 h-3" /> Record
                              </button>
                              <button onClick={() => setWritingPrescription(apt)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1" style={{ color: 'var(--accent-indigo)', background: 'var(--glow-indigo)', border: `1px solid rgba(99,102,241,0.15)` }}>
                                <Pill className="w-3 h-3" /> Prescribe
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {viewingRecord && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full overflow-hidden animate-scale-in rounded-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-glass)', background: 'linear-gradient(135deg, var(--glow-blue), transparent)' }}>
              <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><FileText className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} /> Patient Intake Record</h3>
              <button onClick={() => setViewingRecord(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="p-6 space-y-5">
              {[{ label: 'Symptoms', value: viewingRecord.symptoms }, { label: 'Current Medicines', value: viewingRecord.medicines }, { label: 'Previous Tests', value: viewingRecord.tests }].map(item => (
                <div key={item.label}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-muted)' }}>{item.label}</h4>
                  <p className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-empty)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{item.value || "None provided"}</p>
                </div>
              ))}
            </div>
            <div className="p-6" style={{ borderTop: '1px solid var(--border-glass)' }}>
              <button onClick={() => setViewingRecord(null)} className="w-full py-3 rounded-xl font-bold text-white btn-glow" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }}>Close Record</button>
            </div>
          </div>
        </div>
      )}

      {writingPrescription && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full overflow-hidden animate-scale-in rounded-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-glass)', background: 'linear-gradient(135deg, var(--glow-indigo), transparent)' }}>
              <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Pill className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} /> Write Prescription</h3>
              <button onClick={() => setWritingPrescription(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Prescription for Patient #{writingPrescription.patient_id}</p>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-muted)' }}>Medications (Rx)</h4>
                <textarea placeholder="e.g. Lisinopril 10mg..." value={prescriptionForm.medication} onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})} className="w-full p-4 rounded-xl h-24 input-glow resize-none" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-muted)' }}>Patient Instructions</h4>
                <textarea placeholder="e.g. Take once daily with food..." value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})} className="w-full p-4 rounded-xl h-24 input-glow resize-none" />
              </div>
            </div>
            <div className="p-6 flex gap-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
              <button onClick={() => setWritingPrescription(null)} className="flex-1 py-3 rounded-xl font-bold transition-all" style={{ background: 'var(--bg-empty)', color: 'var(--text-muted)' }}>Cancel</button>
              <button onClick={submitPrescription} className="flex-1 py-3 rounded-xl font-bold text-white btn-glow" style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-blue))' }}>Save & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
