"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Calendar, Clock, FileText, Pill } from "lucide-react";

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
        const profileRes = await fetch(`http://localhost:8000/api/users/profile?email=${email}`);
        if (!profileRes.ok) return;
        const profileData = await profileRes.json();
        const docId = profileData.user_id;

        const res = await fetch(`http://localhost:8000/api/appointments?doctor_id=${docId}`);
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
      const res = await fetch(`http://localhost:8000/api/appointments/${appointmentId}/record`);
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
      await fetch(`http://localhost:8000/api/appointments/${appointmentId}/status`, {
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
      const res = await fetch(`http://localhost:8000/api/prescriptions`, {
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
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="mb-8 bg-blue-600 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-200" />
            Clinic Schedule
          </h2>
          <p className="text-blue-100 font-medium">Manage your daily appointments and incoming patient requests.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200 font-bold uppercase tracking-wider mb-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-2xl font-black">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden text-slate-800 dark:text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Patient</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Duration</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {appointments.map(apt => (
                <tr key={apt.appointment_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <span className="font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">{apt.date}</span>
                  </td>
                  <td className="p-4 text-slate-900 dark:text-slate-100 font-bold">Patient #{apt.patient_id}</td>
                  <td className="p-4">Consultation</td>
                  <td className="p-4 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400"/>{apt.time}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      apt.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {apt.status === "Pending" ? (
                      <>
                        <button onClick={() => handleStatusUpdate(apt.appointment_id, "Confirmed", apt.patient_id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-colors">Approve</button>
                        <button onClick={() => handleStatusUpdate(apt.appointment_id, "Rejected", apt.patient_id)} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-bold transition-colors">Reject</button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold uppercase mr-2">{apt.status}</span>
                        {apt.status === "Confirmed" && (
                          <>
                            <button onClick={() => fetchRecord(apt.appointment_id)} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-400 rounded text-xs font-bold transition-colors flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Record
                            </button>
                            <button onClick={() => setWritingPrescription(apt)} className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 dark:text-indigo-400 rounded text-xs font-bold transition-colors flex items-center gap-1">
                              <Pill className="w-3 h-3" /> Prescribe
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-blue-50 dark:bg-slate-900">
              <h3 className="font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Patient Intake Record
              </h3>
              <button onClick={() => setViewingRecord(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symptoms</h4>
                <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">{viewingRecord.symptoms || "None provided"}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Medicines</h4>
                <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">{viewingRecord.medicines || "None provided"}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previous Tests</h4>
                <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">{viewingRecord.tests || "None provided"}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setViewingRecord(null)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">Close Record</button>
            </div>
          </div>
        </div>
      )}

      {writingPrescription && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/30">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                <Pill className="w-5 h-5" /> Write Prescription
              </h3>
              <button onClick={() => setWritingPrescription(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-500">Prescription for Patient #{writingPrescription.patient_id}</p>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medications (Rx)</h4>
                <textarea 
                  placeholder="e.g. Lisinopril 10mg..."
                  value={prescriptionForm.medication}
                  onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 h-24" 
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Instructions</h4>
                <textarea 
                  placeholder="e.g. Take once daily with food..."
                  value={prescriptionForm.instructions}
                  onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 h-24" 
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-3">
              <button onClick={() => setWritingPrescription(null)} className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors">Cancel</button>
              <button onClick={submitPrescription} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">Save & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
