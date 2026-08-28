"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Calendar, Clock, FileText, Pill, Loader2, CheckCircle, XCircle } from "lucide-react";

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
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        fetchAppointments(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRecord = async (appointmentId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentId}/record`);
      if (res.ok) {
        const data = await res.json();
        setViewingRecord(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (appointmentId: number, status: string, patientId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, status } : a));
      
      if (status === "Confirmed") {
        fetchRecord(appointmentId);
        // n8n webhook is triggered automatically by the backend when status === "Approved"
        // No need to call it from the frontend
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const submitPrescription = async () => {
    if (!writingPrescription) return;
    try {
      const email = auth.currentUser?.email || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: writingPrescription.patient_id,
          doctor_email: email,
          medication_details: prescriptionForm.medication,
          instructions: prescriptionForm.instructions
        })
      });
      
      if (res.ok) {
        alert("Prescription saved successfully! It will be queued for n8n automated email dispatch.");
        setWritingPrescription(null);
        setPrescriptionForm({ medication: "", instructions: "" });
      }
    } catch (err) {
      console.error("Failed to submit prescription", err);
      alert("Error saving prescription");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-8">
      {/* ═══ Hero Banner ═══ */}
      <div className="rounded-2xl p-8 flex items-center justify-between animate-fade-in-up overflow-hidden relative" style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(6,182,212,0.15)',
      }}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', filter: 'blur(40px)' }}></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <Calendar className="w-7 h-7 text-cyan-400" />
            </div>
            Clinic Schedule
          </h2>
          <p className="text-slate-400 font-medium">Manage your daily appointments and incoming patient requests.</p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-2xl font-black text-white" style={{ textShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
            {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* ═══ Appointments Table ═══ */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(10, 14, 26, 0.5)', borderBottom: '1px solid var(--border-glass)' }}>
                <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Date</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Patient</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Type</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Time</th>
                <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Status</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <tr key={apt.appointment_id} className={`table-row-glow animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td className="p-4">
                    <span className="font-bold text-white text-sm px-3 py-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.1)' }}>{apt.date}</span>
                  </td>
                  <td className="p-4 text-white font-bold text-sm">Patient #{apt.patient_id}</td>
                  <td className="p-4 text-slate-400 text-sm">Consultation</td>
                  <td className="p-4 text-sm text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500"/>{apt.time}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      apt.status === 'Confirmed' ? 'text-emerald-300 status-active' :
                      apt.status === 'Pending' ? 'text-amber-300' :
                      'text-slate-400'
                    }`} style={{
                      background: apt.status === 'Confirmed' ? 'rgba(16,185,129,0.1)' :
                        apt.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,160,0.1)',
                      border: `1px solid ${apt.status === 'Confirmed' ? 'rgba(16,185,129,0.2)' :
                        apt.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,160,0.1)'}`,
                    }}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {apt.status === "Pending" ? (
                        <>
                          <button onClick={() => handleStatusUpdate(apt.appointment_id, "Confirmed", apt.patient_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 text-emerald-300 btn-glow" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approve</span>
                          </button>
                          <button onClick={() => handleStatusUpdate(apt.appointment_id, "Rejected", apt.patient_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 text-rose-300" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                            <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Reject</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold uppercase mr-1">{apt.status}</span>
                          {apt.status === "Confirmed" && (
                            <>
                              <button onClick={() => fetchRecord(apt.appointment_id)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1 text-cyan-300" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                                <FileText className="w-3 h-3" /> Record
                              </button>
                              <button onClick={() => setWritingPrescription(apt)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1 text-violet-300" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
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
          <div className="glass-card max-w-lg w-full overflow-hidden animate-scale-in" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(6,182,212,0.05)' }}>
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" /> Patient Intake Record
              </h3>
              <button onClick={() => setViewingRecord(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: 'Symptoms', value: viewingRecord.symptoms },
                { label: 'Current Medicines', value: viewingRecord.medicines },
                { label: 'Previous Tests', value: viewingRecord.tests },
              ].map((item) => (
                <div key={item.label}>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">{item.label}</h4>
                  <p className="text-slate-300 p-4 rounded-xl text-sm" style={{ background: 'rgba(10,14,26,0.5)', border: '1px solid var(--border-glass)' }}>{item.value || "None provided"}</p>
                </div>
              ))}
            </div>
            <div className="p-6" style={{ borderTop: '1px solid var(--border-glass)' }}>
              <button onClick={() => setViewingRecord(null)} className="w-full py-3 rounded-xl font-bold transition-all text-white btn-glow" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(139,92,246,0.6))' }}>Close Record</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Prescription Modal ═══ */}
      {writingPrescription && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full overflow-hidden animate-scale-in" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(139,92,246,0.05)' }}>
              <h3 className="font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-violet-400" /> Write Prescription
              </h3>
              <button onClick={() => setWritingPrescription(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-500">Prescription for Patient #{writingPrescription.patient_id}</p>
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Medications (Rx)</h4>
                <textarea 
                  placeholder="e.g. Lisinopril 10mg..."
                  value={prescriptionForm.medication}
                  onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow text-slate-200 placeholder-slate-500 resize-none" 
                />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Patient Instructions</h4>
                <textarea 
                  placeholder="e.g. Take once daily with food..."
                  value={prescriptionForm.instructions}
                  onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow text-slate-200 placeholder-slate-500 resize-none" 
                />
              </div>
            </div>
            <div className="p-6 flex gap-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
              <button onClick={() => setWritingPrescription(null)} className="flex-1 py-3 rounded-xl font-bold transition-all text-slate-400 hover:text-white" style={{ background: 'rgba(100,116,160,0.1)', border: '1px solid var(--border-glass)' }}>Cancel</button>
              <button onClick={submitPrescription} className="flex-1 py-3 rounded-xl font-bold transition-all text-white btn-glow" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(6,182,212,0.6))' }}>Save & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
