"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Search, Loader2, FileText, AlertCircle, TrendingUp, Activity, User, HeartPulse, Clock, Pill, DollarSign } from "lucide-react";
import { auth } from "@/lib/firebase";

/* ═══ 3D Orbiting Atom with Multiple Rings ═══ */
function OrbitingAtom({ size = 160, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full pulse-ring" style={{ border: '1.5px solid var(--ring-color)' }}></div>
      <div className="absolute inset-3 rounded-full pulse-ring pulse-ring-delay" style={{ border: '1px solid var(--ring-color)' }}></div>
      <div className="absolute inset-6 rounded-full pulse-ring pulse-ring-delay-2" style={{ border: '1px solid var(--ring-color)' }}></div>
      <div className="orbit-dot orbit-dot-1" style={{ background: 'var(--accent-blue)', opacity: 0.6, boxShadow: '0 0 8px var(--glow-blue)' }}></div>
      <div className="orbit-dot orbit-dot-2" style={{ background: 'var(--accent-indigo)', opacity: 0.5, boxShadow: '0 0 6px var(--glow-indigo)' }}></div>
      <div className="orbit-dot orbit-dot-3" style={{ background: 'var(--accent-emerald)', opacity: 0.45, boxShadow: '0 0 6px var(--glow-emerald)' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full breathe" style={{ background: 'radial-gradient(circle, var(--accent-blue), transparent 70%)', opacity: 0.4 }}></div>
    </div>
  );
}

/* ═══ Animated DNA Helix ═══ */
function DNAHelix({ height = 240, className = "" }: { height?: number; className?: string }) {
  const steps = 12;
  return (
    <svg className={className} width="80" height={height} viewBox={`0 0 80 ${height}`} style={{ opacity: 'var(--helix-opacity)' }}>
      {Array.from({ length: steps }).map((_, i) => {
        const y = (i / steps) * height + 10;
        const xOffset = 25 * Math.sin(i * 0.65);
        return (
          <g key={i}>
            <circle cx={40 + xOffset} cy={y} r={3.5} fill="var(--accent-blue)">
              <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${3 + i * 0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${4 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={40 - xOffset} cy={y} r={3.5} fill="var(--accent-indigo)">
              <animate attributeName="cy" values={`${y};${y + 6};${y}`} dur={`${3 + i * 0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur={`${4 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
            <line x1={40 + xOffset} y1={y} x2={40 - xOffset} y2={y} stroke="var(--accent-blue)" strokeWidth="0.8" opacity="0.25">
              <animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ Isometric Grid Decoration ═══ */
function IsometricGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="200" height="120" viewBox="0 0 200 120" style={{ opacity: 'var(--particle-opacity)' }}>
      {Array.from({ length: 6 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <g key={`${i}-${j}`}>
            <circle cx={i * 35 + 20} cy={j * 30 + 15} r="2" fill="var(--accent-blue)" opacity="0.3">
              <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${3 + (i + j) * 0.4}s`} repeatCount="indefinite" />
            </circle>
            {i < 5 && <line x1={i * 35 + 20} y1={j * 30 + 15} x2={(i + 1) * 35 + 20} y2={j * 30 + 15} stroke="var(--accent-blue)" strokeWidth="0.3" opacity="0.1" />}
            {j < 3 && <line x1={i * 35 + 20} y1={j * 30 + 15} x2={i * 35 + 20} y2={(j + 1) * 30 + 15} stroke="var(--accent-blue)" strokeWidth="0.3" opacity="0.1" />}
          </g>
        ))
      )}
    </svg>
  );
}

export default function Dashboard() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const urlPatientId = searchParams.get("patientId");
    if (urlPatientId && urlPatientId !== patientId) {
      setSearchMode("manual");
      setPatientId(urlPatientId);
      fetchSummary(urlPatientId);
    }
  }, [searchParams]);

  const handleAutoCode = async () => {
    if (!patientId) return;
    setAutoCoding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}/suggest-codes`);
      if (res.ok) { const data = await res.json(); setBillingForm(prev => ({ ...prev, icd10: data.icd10, cpt: data.cpt })); }
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
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<User className="w-5 h-5" />} title="Patients" value="1,284" trend="+12% this week" color="blue" delay="stagger-1" />
            <StatCard icon={<Activity className="w-5 h-5" />} title="AI Reports" value="892" trend="Saved ~44 hours" color="indigo" delay="stagger-2" />
          </div>

          {/* Search Panel */}
          <div className="glass-card p-6 space-y-5 animate-fade-in-up stagger-3 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 pointer-events-none"><OrbitingAtom size={180} /></div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg relative z-10" style={{ background: 'var(--bg-empty)' }}>
              <button onClick={() => setSearchMode("chat")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${searchMode === 'chat' ? 'shadow-sm' : ''}`}
                style={{ background: searchMode === 'chat' ? 'var(--bg-surface)' : 'transparent', color: searchMode === 'chat' ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                GraphRAG Chat
              </button>
              <button onClick={() => setSearchMode("manual")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${searchMode === 'manual' ? 'shadow-sm' : ''}`}
                style={{ background: searchMode === 'manual' ? 'var(--bg-surface)' : 'transparent', color: searchMode === 'manual' ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                Manual ID
              </button>
            </div>

            <div className="relative z-10">
            {searchMode === "chat" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl min-h-[150px] max-h-[300px] overflow-y-auto" style={{ background: 'var(--bg-empty)', border: '1px solid var(--border-subtle)' }}>
                  {chatResponse ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                        <Search className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                      </div>
                      <div className="glass-card p-3 text-sm flex-1" style={{ borderRadius: '0.75rem', color: 'var(--text-secondary)' }}>
                        <p className="mb-2">{chatResponse.message}</p>
                        {chatResponse.type === "patient_list" && chatResponse.patients && (
                          <div className="space-y-2 mt-3">
                            {chatResponse.patients.map((p: any, idx: number) => (
                              <button key={p.patient_id} onClick={() => { const idStr = p.patient_id.toString(); setPatientId(idStr); fetchSummary(idStr); }}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-300 hover:translate-x-1 animate-fade-in-up stagger-${Math.min(idx+1,5)}`}
                                style={{ background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                                <p className="text-xs" style={{ color: 'var(--accent-blue)' }}>ID: {p.patient_id} • DOB: {p.dob}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-center mt-10" style={{ color: 'var(--text-muted)' }}>Ask GraphRAG to find a patient record.</p>
                  )}
                </div>
                <textarea placeholder="Type natural language query..." value={chatQuery} onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }}
                  rows={2} className="block w-full px-4 py-3 rounded-xl text-sm resize-none input-glow" />
                <button onClick={handleChatSubmit} disabled={chatLoading || !chatQuery}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all duration-300 btn-glow"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }}>
                  {chatLoading ? <><Loader2 className="animate-spin h-4 w-4" /> Searching Graph...</> : "Send Request"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Patient Database ID</label>
                  <input type="text" placeholder="Enter Patient ID (e.g. 1)" value={patientId} onChange={(e) => setPatientId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchSummary()}
                    className="block w-full px-4 py-4 rounded-xl font-medium text-lg input-glow" />
                </div>
                <button onClick={() => fetchSummary()} disabled={loading || !patientId}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white disabled:opacity-50 font-bold text-lg transition-all duration-300 btn-glow"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }}>
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
            <div className="h-[400px] glass-card flex flex-col items-center justify-center p-12 text-center relative overflow-hidden" style={{ border: '2px dashed var(--border-glass)' }}>
              <div className="absolute right-6 top-0 pointer-events-none"><DNAHelix height={400} /></div>
              <div className="absolute left-6 top-0 pointer-events-none" style={{ transform: 'scaleX(-1)' }}><DNAHelix height={400} /></div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"><IsometricGrid /></div>
              
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative" style={{ background: 'var(--badge-blue-bg)' }}>
                <FileText className="w-10 h-10" style={{ color: 'var(--accent-blue)', opacity: 0.5 }} />
                <div className="absolute inset-0 rounded-full pulse-ring" style={{ border: '2px solid var(--ring-color)' }}></div>
                <div className="absolute -inset-3 rounded-full pulse-ring pulse-ring-delay" style={{ border: '1px solid var(--ring-color)' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>No Patient Selected</h3>
              <p className="max-w-sm" style={{ color: 'var(--text-muted)' }}>Enter a Patient ID or search to generate a comprehensive AI-assisted clinical summary.</p>
            </div>
          ) : (
            <div className="min-h-[400px] glass-card overflow-hidden flex flex-col animate-fade-in-up">
              <div className="px-8 py-5 flex items-center justify-between" style={{ 
                borderBottom: '1px solid var(--border-glass)',
                background: error ? 'rgba(244, 63, 94, 0.04)' : 'linear-gradient(135deg, var(--badge-blue-bg), transparent)'
              }}>
                <div className="flex items-center gap-3">
                  {error ? <AlertCircle className="w-6 h-6" style={{ color: 'var(--accent-rose)' }} /> : <TrendingUp className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />}
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {loading ? "Analyzing Clinical Pathways..." : error ? "Diagnostic Error" : "Clinical Synthesis Report"}
                  </h3>
                </div>
                {(!loading && !error && summary) && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowBillingModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 btn-glow text-white" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))' }}>
                      <DollarSign className="w-4 h-4" /> Generate Bill
                    </button>
                    <button onClick={() => setShowPrescribeModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 btn-glow text-white" style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-blue))' }}>
                      <Pill className="w-4 h-4" /> Write Prescription
                    </button>
                  </div>
                )}
              </div>
              <div className="p-8 flex-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--accent-blue)' }} />
                      <div className="absolute -inset-3 rounded-full pulse-ring" style={{ border: '2px solid var(--ring-color)' }}></div>
                      <div className="absolute -inset-6 rounded-full pulse-ring pulse-ring-delay" style={{ border: '1px solid var(--ring-color)' }}></div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Synthesizing Data</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Running AI agents across your clinical database...</p>
                    </div>
                    <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-empty)' }}>
                      <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-indigo), var(--accent-blue))', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none prose-themed">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {timelineData.length > 0 && (
            <div className="glass-card p-8 animate-fade-in-up stagger-2 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 pointer-events-none"><OrbitingAtom size={120} /></div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2 rounded-xl" style={{ background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                  <Clock className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Patient History Timeline</h3>
              </div>
              <div className="relative ml-4 space-y-8 pb-4 z-10" style={{ borderLeft: '2px solid var(--ring-color)' }}>
                {timelineData.map((item, idx) => (
                  <div key={idx} className={`relative pl-8 animate-fade-in-up stagger-${Math.min(idx+1,5)}`}>
                    <div className="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 status-active" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))' }}></div>
                    <div className="glass-card p-5" style={{ borderRadius: '1rem' }}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: 'var(--badge-blue-text)', background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                      {item.bill_amount && (
                        <div className="flex flex-wrap items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Billing</span>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Rs. {item.bill_amount}</span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{
                            color: item.bill_status === 'Paid' ? 'var(--badge-emerald-text)' : 'var(--badge-amber-text)',
                            background: item.bill_status === 'Paid' ? 'var(--badge-emerald-bg)' : 'var(--badge-amber-bg)',
                            border: `1px solid ${item.bill_status === 'Paid' ? 'var(--badge-emerald-border)' : 'var(--badge-amber-border)'}`,
                          }}>{item.bill_status || 'Pending'}</span>
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
          <div className="w-full max-w-2xl overflow-hidden animate-scale-in rounded-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)' }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', background: 'linear-gradient(135deg, var(--glow-indigo), transparent)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--glow-indigo)', border: `1px solid var(--badge-blue-border)` }}>
                  <Pill className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Write Prescription</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowPrescribeModal(false)} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Prescribed Medications</h4>
                <textarea placeholder="e.g. Amoxicillin 500mg - 1 strip..." value={prescriptionForm.medication} onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full p-4 rounded-xl h-32 input-glow resize-none" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Instructions & Dosage</h4>
                <textarea placeholder="e.g. Take once daily after meals..." value={prescriptionForm.instructions} onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowPrescribeModal(false)} className="px-6 py-3 rounded-xl font-bold transition-all" style={{ background: 'var(--bg-empty)', color: 'var(--text-muted)' }}>Cancel</button>
                <button onClick={submitPrescription} disabled={prescribing}
                  className="flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white btn-glow"
                  style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-blue))' }}>
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
          <div className="w-full max-w-xl overflow-hidden animate-scale-in rounded-2xl" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glow)' }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', background: 'linear-gradient(135deg, var(--glow-emerald), transparent)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--glow-emerald)', border: `1px solid var(--badge-emerald-border)` }}>
                  <DollarSign className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Generate Medical Bill</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowBillingModal(false)} style={{ color: 'var(--text-muted)' }} className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Amount (PKR) *</label>
                <input type="number" placeholder="e.g. 1500" value={billingForm.amount} onChange={e => setBillingForm({...billingForm, amount: e.target.value})}
                  className="w-full p-4 rounded-xl text-lg font-bold input-glow" />
              </div>
              <div className="rounded-xl p-5" style={{ background: 'var(--bg-empty)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Medical Coding</h4>
                  <button onClick={handleAutoCode} disabled={autoCoding} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ color: 'var(--badge-blue-text)', background: 'var(--badge-blue-bg)', border: `1px solid var(--badge-blue-border)` }}>
                    {autoCoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />} ✨ Auto-Code with AI
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>ICD-10 Code</label>
                    <input type="text" placeholder="e.g. J01.90" value={billingForm.icd10} onChange={e => setBillingForm({...billingForm, icd10: e.target.value})}
                      className="w-full p-3 rounded-lg uppercase font-mono text-sm input-glow" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>CPT Code</label>
                    <input type="text" placeholder="e.g. 99213" value={billingForm.cpt} onChange={e => setBillingForm({...billingForm, cpt: e.target.value})}
                      className="w-full p-3 rounded-lg font-mono text-sm input-glow" />
                  </div>
                </div>
                <p className="text-xs mt-3 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><AlertCircle className="w-3 h-3"/> Verify AI-suggested codes before submission.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowBillingModal(false)} className="px-6 py-3 rounded-xl font-bold transition-all" style={{ background: 'var(--bg-empty)', color: 'var(--text-muted)' }}>Cancel</button>
                <button onClick={submitBilling} disabled={billingSaving || !billingForm.amount}
                  className="flex-1 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50 btn-glow py-3"
                  style={{ background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))' }}>
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

function StatCard({ icon, title, value, trend, color, delay }: { icon: React.ReactNode, title: string, value: string, trend: string, color: string, delay: string }) {
  const colorMap: Record<string, string> = { blue: 'var(--accent-blue)', indigo: 'var(--accent-indigo)', emerald: 'var(--accent-emerald)' };
  const glowMap: Record<string, string> = { blue: 'var(--glow-blue)', indigo: 'var(--glow-indigo)', emerald: 'var(--glow-emerald)' };
  return (
    <div className={`card-3d animate-fade-in-up ${delay}`}>
      <div className="card-3d-inner glass-card p-5 relative overflow-hidden">
        <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full breathe" style={{ background: glowMap[color], opacity: 0.5 }}></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="p-2.5 rounded-xl" style={{ color: colorMap[color], background: glowMap[color], boxShadow: `0 0 20px ${glowMap[color]}` }}>{icon}</div>
        </div>
        <h3 className="font-bold text-xs uppercase tracking-wider mb-1 relative z-10" style={{ color: 'var(--text-muted)' }}>{title}</h3>
        <div className="text-2xl font-black mb-1 relative z-10" style={{ color: 'var(--text-primary)' }}>{value}</div>
        <p className="text-xs font-medium relative z-10" style={{ color: 'var(--text-muted)' }}>{trend}</p>
      </div>
    </div>
  );
}
