"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Calendar, Clock, FileText, Pill, Loader2, CheckCircle, XCircle } from "lucide-react";

/* ═══ 3D Heartbeat Line ═══ */
function HeartbeatLine({ className = "" }: { className?: string }) {
  return (
    <svg className={`opacity-[0.08] ${className}`} width="300" height="60" viewBox="0 0 300 60" fill="none">
      <path d="M0 30 L60 30 L80 10 L100 50 L120 20 L140 40 L160 30 L300 30" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dashoffset" from="600" to="0" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-dasharray" values="0 600;300 300;600 0" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/* ═══ Floating Clock Icon ═══ */
function FloatingClock() {
  return (
    <div className="relative" style={{ width: 100, height: 100 }}>
      <svg className="w-full h-full opacity-[0.06]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" className="rotate-slow" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="3 4" className="rotate-slow-reverse" />
        {/* Clock hands */}
        <line x1="50" y1="50" x2="50" y2="25" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" className="rotate-slow" style={{ transformOrigin: '50px 50px' }} />
        <line x1="50" y1="50" x2="65" y2="50" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" className="rotate-slow-reverse" style={{ transformOrigin: '50px 50px' }} />
        <circle cx="50" cy="50" r="3" fill="#3b82f6" opacity="0.3" />
      </svg>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [writingPrescription, setWritingPrescription] = useState<any>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", instructions: "" });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAppointments = async (email: string) => {
      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?email=${email}`);
        if (!profileRes.ok) return;
        const profileData = await profileRes.json();
        const docId = profileData.user_id;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?doctor_id=${docId}`);
        if (res.ok) { const data = await res.json(); setAppointments(data); }
      } catch (err) { console.error("Failed to fetch appointments:", err); }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => { if (user && user.email) { fetchAppointments(user.email); } });
    return () => unsubscribe();
  }, []);

  const fetchRecord = async (appointmentId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentId}/record`);
      if (res.ok) { const data = await res.json(); setViewingRecord(data); }
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (appointmentId: number, status: string, patientId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
      });
      setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, status } : a));
      if (status === "Confirmed") { fetchRecord(appointmentId); }
    } catch (err) { console.error("Failed to update status", err); }
  };

  const submitPrescription = async () => {
    if (!writingPrescription) return;
    try {
      const email = auth.currentUser?.email || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: writingPrescription.patient_id, doctor_email: email, medication_details: prescriptionForm.medication, instructions: prescriptionForm.instructions })
      });
      if (res.ok) { alert("Prescription saved successfully! It will be queued for n8n automated email dispatch."); setWritingPrescription(null); setPrescriptionForm({ medication: "", instructions: "" }); }
    } catch (err) { console.error("Failed to submit prescription", err); alert("Error saving prescription"); }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-8">
      {/* ═══ Hero Banner ═══ */}
      <div className="rounded-2xl p-8 flex items-center justify-between animate-fade-in-up overflow-hidden relative glass-card" style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05), rgba(255,255,255,0.8))',
        border: '1px solid rgba(59,130,246,0.12)',
      }}>
        {/* 3D Background Elements */}
        <div className="absolute top-2 right-4 pointer-events-none"><FloatingClock /></div>
        <div className="absolute bottom-0 left-8 pointer-events-none"><HeartbeatLine /></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3 text-slate-800">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <Calendar className="w-7 h-7 text-blue-500" />
            </div>
            Clinic Schedule
          </h2>
          <p className="text-slate-500 font-medium">Manage your daily appointments and incoming patient requests.</p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-2xl font-black gradient-text">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* ═══ Appointments Table ═══ */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Date", "Patient", "Type", "Time", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`p-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <tr key={apt.appointment_id} className={`table-row-glow animate-fade-in-up stagger-${Math.min(idx+1,5)} border-b border-slate-50`}>
                  <td className="p-4">
                    <span className="font-bold text-slate-700 text-sm px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">{apt.date}</span>
                  </td>
                  <td className="p-4 text-slate-800 font-bold text-sm">Patient #{apt.patient_id}</td>
                  <td className="p-4 text-slate-500 text-sm">Consultation</td>
                  <td className="p-4 text-sm text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400"/>{apt.time}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      apt.status === 'Confirmed' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 status-active' :
                      apt.status === 'Pending' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                      'text-slate-500 bg-slate-50 border border-slate-100'
                    }`}>{apt.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {apt.status === "Pending" ? (
                        <>
                          <button onClick={() => handleStatusUpdate(apt.appointment_id, "Confirmed", apt.patient_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(apt.appointment_id, "Rejected", apt.patient_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-bold uppercase mr-1">{apt.status}</span>
                          {apt.status === "Confirmed" && (
                            <>
                              <button onClick={() => fetchRecord(apt.appointment_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100">
                                <FileText className="w-3 h-3" /> Record
                              </button>
                              <button onClick={() => setWritingPrescription(apt)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100">
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

      {/* ═══ View Record Modal ═══ */}
      {viewingRecord && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full overflow-hidden animate-scale-in border border-blue-100 bg-white/90">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-blue-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Patient Intake Record</h3>
              <button onClick={() => setViewingRecord(null)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {[{ label: 'Symptoms', value: viewingRecord.symptoms }, { label: 'Current Medicines', value: viewingRecord.medicines }, { label: 'Previous Tests', value: viewingRecord.tests }].map(item => (
                <div key={item.label}>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{item.label}</h4>
                  <p className="text-slate-600 p-4 rounded-xl text-sm bg-slate-50 border border-slate-100">{item.value || "None provided"}</p>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100">
              <button onClick={() => setViewingRecord(null)} className="w-full py-3 rounded-xl font-bold transition-all text-white btn-glow" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>Close Record</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Prescription Modal ═══ */}
      {writingPrescription && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full overflow-hidden animate-scale-in border border-indigo-100 bg-white/90">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-indigo-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Pill className="w-5 h-5 text-indigo-500" /> Write Prescription</h3>
              <button onClick={() => setWritingPrescription(null)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-400">Prescription for Patient #{writingPrescription.patient_id}</p>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Medications (Rx)</h4>
                <textarea placeholder="e.g. Lisinopril 10mg..." value={prescriptionForm.medication} onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow text-slate-700 placeholder-slate-400 resize-none" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Patient Instructions</h4>
                <textarea placeholder="e.g. Take once daily with food..." value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow text-slate-700 placeholder-slate-400 resize-none" />
              </div>
            </div>
            <div className="p-6 flex gap-3 border-t border-slate-100">
              <button onClick={() => setWritingPrescription(null)} className="flex-1 py-3 rounded-xl font-bold transition-all text-slate-500 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={submitPrescription} className="flex-1 py-3 rounded-xl font-bold transition-all text-white btn-glow" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>Save & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
