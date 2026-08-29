"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Search, Loader2, FileText, AlertCircle, TrendingUp, Activity, User, HeartPulse, Clock, Pill, DollarSign } from "lucide-react";
import { auth } from "@/lib/firebase";

/* ═══ 3D Orbiting Atom ═══ */
function OrbitingAtom({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: 140, height: 140 }}>
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full pulse-ring" style={{ border: '1px solid rgba(59,130,246,0.1)' }}></div>
      <div className="absolute inset-2 rounded-full pulse-ring pulse-ring-delay" style={{ border: '1px solid rgba(99,102,241,0.08)' }}></div>
      <div className="absolute inset-4 rounded-full pulse-ring pulse-ring-delay-2" style={{ border: '1px solid rgba(59,130,246,0.06)' }}></div>
      {/* Orbiting dots */}
      <div className="orbit-dot orbit-dot-1" style={{ background: 'rgba(59,130,246,0.5)' }}></div>
      <div className="orbit-dot orbit-dot-2" style={{ background: 'rgba(99,102,241,0.4)' }}></div>
      <div className="orbit-dot orbit-dot-3" style={{ background: 'rgba(16,185,129,0.35)' }}></div>
      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)' }}></div>
    </div>
  );
}

/* ═══ DNA Helix SVG ═══ */
function DNAHelix({ className = "" }: { className?: string }) {
  return (
    <svg className={`opacity-[0.06] ${className}`} width="60" height="200" viewBox="0 0 60 200">
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <g key={i}>
          <circle cx={30 + 20 * Math.sin(i * 0.7)} cy={i * 20 + 10} r="3" fill="#3b82f6" opacity={0.4 + (i % 3) * 0.2}>
            <animate attributeName="cy" values={`${i*20+10};${i*20+5};${i*20+10}`} dur={`${3+i*0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={30 - 20 * Math.sin(i * 0.7)} cy={i * 20 + 10} r="3" fill="#6366f1" opacity={0.3 + (i % 3) * 0.15}>
            <animate attributeName="cy" values={`${i*20+10};${i*20+15};${i*20+10}`} dur={`${3+i*0.3}s`} repeatCount="indefinite" />
          </circle>
          <line x1={30 + 20 * Math.sin(i * 0.7)} y1={i * 20 + 10} x2={30 - 20 * Math.sin(i * 0.7)} y2={i * 20 + 10} stroke="#3b82f6" strokeWidth="0.5" opacity="0.2" />
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [patientId, setPatientId] = useState("");
  const [summary, setSummary] = useState("");
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [searchMode, setSearchMode] = useState<"chat" | "manual">("chat");
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState<any>(null);

  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", instructions: "" });
  const [prescribing, setPrescribing] = useState(false);

  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingForm, setBillingForm] = useState({ amount: "", icd10: "", cpt: "" });
  const [autoCoding, setAutoCoding] = useState(false);
  const [billingSaving, setBillingSaving] = useState(false);

  const handleAutoCode = async () => {
    if (!patientId) return;
    setAutoCoding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/suggest-codes`);
      if (res.ok) {
        const data = await res.json();
        setBillingForm(prev => ({ ...prev, icd10: data.icd10, cpt: data.cpt }));
      }
    } catch (err) { console.error(err); }
    setAutoCoding(false);
  };

  const submitBilling = async () => {
    if (!patientId || !billingForm.amount) return alert("Missing required fields");
    setBillingSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: parseInt(patientId), appointment_id: parseInt(patientId), amount: parseFloat(billingForm.amount), icd10_codes: billingForm.icd10, cpt_codes: billingForm.cpt })
      });
      if (res.ok) { alert("Bill generated successfully and sent!"); setShowBillingModal(false); setBillingForm({ amount: "", icd10: "", cpt: "" }); }
      else { alert("Failed to generate bill"); }
    } catch (err) { alert("Network error generating bill"); }
    setBillingSaving(false);
  };

  const submitPrescription = async () => {
    if (!patientId) return alert("No patient selected");
    setPrescribing(true);
    try {
      const email = auth.currentUser?.email || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: parseInt(patientId), doctor_email: email, medication_details: prescriptionForm.medication, instructions: prescriptionForm.instructions })
      });
      if (res.ok) { alert("Prescription saved successfully and emailed to the patient via n8n!"); setShowPrescribeModal(false); setPrescriptionForm({ medication: "", instructions: "" }); }
      else { alert("Error saving prescription"); }
    } catch (err) { console.error("Failed to submit prescription", err); alert("Network error saving prescription"); }
    setPrescribing(false);
  };

  const handleChatSubmit = async () => {
    if (!chatQuery) return;
    setChatLoading(true); setChatResponse(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctor/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatQuery })
      });
      if (res.ok) { const data = await res.json(); setChatResponse(data); }
      else { setChatResponse({ type: "text", message: "Failed to connect to the Chat AI." }); }
    } catch (err) { setChatResponse({ type: "text", message: "Network error calling the Chat AI." }); }
    setChatLoading(false);
  };

  const fetchSummary = async (idToFetch?: any) => {
    const targetId = (typeof idToFetch === 'string') ? idToFetch : patientId;
    if (!targetId) return;
    setLoading(true); setError(false); setSummary(""); setTimelineData([]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${targetId}/summary`);
      if (res.ok) { const data = await res.json(); setSummary(data.summary); }
      else { setSummary("Error fetching summary. Ensure the patient exists in the database."); setError(true); }
      const timelineRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${targetId}/timeline`);
      if (timelineRes.ok) { const tData = await timelineRes.json(); setTimelineData(tData); }
    } catch (err) { setSummary("Failed to connect to the MedFlow Clinical API."); setError(true); }
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto relative">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="xl:col-span-4 space-y-6 relative z-10">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<User className="w-5 h-5" />} title="Patients" value="1,284" trend="+12% this week" color="blue" delay="stagger-1" />
            <StatCard icon={<Activity className="w-5 h-5" />} title="AI Reports" value="892" trend="Saved ~44 hours" color="indigo" delay="stagger-2" />
          </div>

          {/* Search Panel */}
          <div className="glass-card p-6 space-y-5 animate-fade-in-up stagger-3 relative overflow-hidden">
            {/* 3D Decorative Element */}
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <OrbitingAtom />
            </div>
            
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100/80 relative z-10">
              <button onClick={() => setSearchMode("chat")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${searchMode === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                GraphRAG Chat
              </button>
              <button onClick={() => setSearchMode("manual")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${searchMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                Manual ID
              </button>
            </div>

            {/* Search Content */}
            <div className="relative z-10">
            {searchMode === "chat" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl min-h-[150px] max-h-[300px] overflow-y-auto bg-slate-50/80 border border-slate-100">
                  {chatResponse ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1 border border-blue-100">
                          <Search className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-700 flex-1">
                          <p className="mb-2">{chatResponse.message}</p>
                          {chatResponse.type === "patient_list" && chatResponse.patients && (
                            <div className="space-y-2 mt-3">
                              {chatResponse.patients.map((p: any, idx: number) => (
                                <button key={p.patient_id} onClick={() => { const idStr = p.patient_id.toString(); setPatientId(idStr); fetchSummary(idStr); }}
                                  className={`w-full text-left p-3 rounded-lg bg-blue-50/50 border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:translate-x-1 animate-fade-in-up stagger-${Math.min(idx+1,5)}`}>
                                  <p className="font-bold text-slate-800">{p.name}</p>
                                  <p className="text-xs text-blue-500">ID: {p.patient_id} • DOB: {p.dob}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center mt-10">Ask GraphRAG to find a patient record.</p>
                  )}
                </div>
                <textarea placeholder="Type natural language query..." value={chatQuery} onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }}
                  rows={2} className="block w-full px-4 py-3 rounded-xl text-sm resize-none input-glow text-slate-700 placeholder-slate-400" />
                <button onClick={handleChatSubmit} disabled={chatLoading || !chatQuery}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all duration-300 btn-glow"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  {chatLoading ? <><Loader2 className="animate-spin h-4 w-4" /> Searching Graph...</> : "Send Request"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Database ID</label>
                  <input type="text" placeholder="Enter Patient ID (e.g. 1)" value={patientId} onChange={(e) => setPatientId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchSummary()}
                    className="block w-full px-4 py-4 rounded-xl font-medium text-lg input-glow text-slate-700 placeholder-slate-400" />
                </div>
                <button onClick={() => fetchSummary()} disabled={loading || !patientId}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white disabled:opacity-50 font-bold text-lg transition-all duration-300 btn-glow"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  {loading ? <><Loader2 className="animate-spin h-6 w-6" /> Processing Data...</> : "Synthesize Clinical Data"}
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="xl:col-span-8 space-y-8">
          {(!summary && !loading) ? (
            <div className="h-[400px] glass-card flex flex-col items-center justify-center text-slate-400 p-12 text-center relative overflow-hidden" style={{ border: '2px dashed rgba(148,163,184,0.2)' }}>
              {/* 3D DNA Helix decoration */}
              <div className="absolute right-8 top-4 pointer-events-none"><DNAHelix /></div>
              <div className="absolute left-8 bottom-4 pointer-events-none" style={{ transform: 'scaleX(-1)' }}><DNAHelix /></div>
              
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-blue-50 relative">
                <FileText className="w-10 h-10 text-blue-300" />
                {/* Pulse ring around icon */}
                <div className="absolute inset-0 rounded-full pulse-ring" style={{ border: '2px solid rgba(59,130,246,0.15)' }}></div>
              </div>
              <h3 className="text-xl font-bold text-slate-500 mb-2">No Patient Selected</h3>
              <p className="max-w-sm text-slate-400">Enter a Patient ID or search to generate a comprehensive AI-assisted clinical summary.</p>
            </div>
          ) : (
            <div className="min-h-[400px] glass-card overflow-hidden flex flex-col animate-fade-in-up">
              <div className={`px-8 py-5 flex items-center justify-between`} style={{ 
                borderBottom: '1px solid var(--border-glass)',
                background: error ? 'rgba(244, 63, 94, 0.04)' : 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(99,102,241,0.02))'
              }}>
                <div className="flex items-center gap-3">
                  {error ? <AlertCircle className="text-rose-500 w-6 h-6" /> : <TrendingUp className="text-blue-500 w-6 h-6" />}
                  <h3 className="text-lg font-bold text-slate-800">
                    {loading ? "Analyzing Clinical Pathways..." : error ? "Diagnostic Error" : "Clinical Synthesis Report"}
                  </h3>
                </div>
                {(!loading && !error && summary) && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowBillingModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 btn-glow text-white" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                      <DollarSign className="w-4 h-4" /> Generate Bill
                    </button>
                    <button onClick={() => setShowPrescribeModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 btn-glow text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                      <Pill className="w-4 h-4" /> Write Prescription
                    </button>
                  </div>
                )}
              </div>
              <div className="p-8 flex-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                      <div className="absolute inset-[-8px] rounded-full pulse-ring" style={{ border: '2px solid rgba(59,130,246,0.15)' }}></div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-slate-800 mb-1">Synthesizing Data</p>
                      <p className="text-sm text-slate-400">Running AI agents across your clinical database...</p>
                    </div>
                    <div className="w-48 h-1.5 rounded-full overflow-hidden bg-slate-100">
                      <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-800 prose-li:text-slate-600 prose-a:text-blue-500">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timelineData.length > 0 && (
            <div className="glass-card p-8 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Patient History Timeline</h3>
              </div>
              <div className="relative ml-4 space-y-8 pb-4" style={{ borderLeft: '2px solid rgba(59,130,246,0.15)' }}>
                {timelineData.map((item, idx) => (
                  <div key={idx} className={`relative pl-8 animate-fade-in-up stagger-${Math.min(idx+1,5)}`}>
                    <div className="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 status-active" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}></div>
                    <div className="glass-card p-5" style={{ borderRadius: '1rem' }}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <span className="text-xs font-bold px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-100">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">{item.description}</p>
                      {item.bill_amount && (
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing</span>
                          <span className="text-sm font-bold text-slate-800">Rs. {item.bill_amount}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${item.bill_status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-amber-600 bg-amber-50 border border-amber-100'}`}>
                            {item.bill_status || 'Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Prescription Modal ═══ */}
      {showPrescribeModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-2xl overflow-hidden animate-scale-in border border-indigo-100 bg-white/90">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 border border-indigo-200">
                  <Pill className="text-indigo-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Write Prescription</h3>
                  <p className="text-sm text-slate-400">Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowPrescribeModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medications</h4>
                <textarea placeholder="e.g. Amoxicillin 500mg - 1 strip..." value={prescriptionForm.medication} onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full p-4 rounded-xl h-32 input-glow text-slate-700 placeholder-slate-400 resize-none" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions & Dosage</h4>
                <textarea placeholder="e.g. Take once daily after meals..." value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow text-slate-700 placeholder-slate-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowPrescribeModal(false)} className="px-6 py-3 rounded-xl font-bold transition-all text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button onClick={submitPrescription} disabled={prescribing}
                  className="flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white btn-glow"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                  {prescribing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Send Prescription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Billing Modal ═══ */}
      {showBillingModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-xl overflow-hidden animate-scale-in border border-emerald-100 bg-white/90">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 border border-emerald-200">
                  <DollarSign className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Generate Medical Bill</h3>
                  <p className="text-sm text-slate-400">Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowBillingModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Amount (PKR) *</label>
                <input type="number" placeholder="e.g. 1500" value={billingForm.amount} onChange={e => setBillingForm({...billingForm, amount: e.target.value})}
                  className="w-full p-4 rounded-xl text-lg font-bold input-glow text-slate-700 placeholder-slate-400" />
              </div>
              <div className="rounded-xl p-5 bg-slate-50/80 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-700">Medical Coding</h4>
                  <button onClick={handleAutoCode} disabled={autoCoding} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100">
                    {autoCoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />} ✨ Auto-Code with AI
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">ICD-10 Code</label>
                    <input type="text" placeholder="e.g. J01.90" value={billingForm.icd10} onChange={e => setBillingForm({...billingForm, icd10: e.target.value})}
                      className="w-full p-3 rounded-lg uppercase font-mono text-sm input-glow text-slate-700 placeholder-slate-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">CPT Code</label>
                    <input type="text" placeholder="e.g. 99213" value={billingForm.cpt} onChange={e => setBillingForm({...billingForm, cpt: e.target.value})}
                      className="w-full p-3 rounded-lg font-mono text-sm input-glow text-slate-700 placeholder-slate-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Verify AI-suggested codes before submission.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowBillingModal(false)} className="px-6 py-3 rounded-xl font-bold transition-all text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button onClick={submitBilling} disabled={billingSaving || !billingForm.amount}
                  className="flex-1 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50 btn-glow py-3"
                  style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                  {billingSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />} Submit Bill & Email Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ 3D Stat Card ═══ */
function StatCard({ icon, title, value, trend, color, delay }: { icon: React.ReactNode, title: string, value: string, trend: string, color: string, delay: string }) {
  const styles: Record<string, { bg: string; text: string; glow: string }> = {
    blue: { bg: 'rgba(59,130,246,0.08)', text: 'text-blue-500', glow: 'rgba(59,130,246,0.12)' },
    indigo: { bg: 'rgba(99,102,241,0.08)', text: 'text-indigo-500', glow: 'rgba(99,102,241,0.12)' },
    emerald: { bg: 'rgba(16,185,129,0.08)', text: 'text-emerald-500', glow: 'rgba(16,185,129,0.12)' },
  };
  const s = styles[color];
  return (
    <div className={`card-3d animate-fade-in-up ${delay}`}>
      <div className="card-3d-inner glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${s.text}`} style={{ background: s.bg, boxShadow: `0 0 20px ${s.glow}` }}>{icon}</div>
        </div>
        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-2xl font-black text-slate-800 mb-1">{value}</div>
        <p className="text-xs font-medium text-slate-400">{trend}</p>
      </div>
    </div>
  );
}
