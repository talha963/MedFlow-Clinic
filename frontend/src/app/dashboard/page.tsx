"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Search, Loader2, FileText, AlertCircle, TrendingUp, Activity, User, HeartPulse, Clock, Pill, DollarSign } from "lucide-react";
import { auth } from "@/lib/firebase";

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
    } catch (err) {
      console.error(err);
    }
    setAutoCoding(false);
  };

  const submitBilling = async () => {
    if (!patientId || !billingForm.amount) return alert("Missing required fields");
    setBillingSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: parseInt(patientId),
          appointment_id: parseInt(patientId),
          amount: parseFloat(billingForm.amount),
          icd10_codes: billingForm.icd10,
          cpt_codes: billingForm.cpt
        })
      });
      if (res.ok) {
        alert("Bill generated successfully and sent!");
        setShowBillingModal(false);
        setBillingForm({ amount: "", icd10: "", cpt: "" });
      } else {
        alert("Failed to generate bill");
      }
    } catch (err) {
      alert("Network error generating bill");
    }
    setBillingSaving(false);
  };

  const submitPrescription = async () => {
    if (!patientId) return alert("No patient selected");
    setPrescribing(true);
    try {
      const email = auth.currentUser?.email || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: parseInt(patientId),
          doctor_email: email,
          medication_details: prescriptionForm.medication,
          instructions: prescriptionForm.instructions
        })
      });
      
      if (res.ok) {
        alert("Prescription saved successfully and emailed to the patient via n8n!");
        setShowPrescribeModal(false);
        setPrescriptionForm({ medication: "", instructions: "" });
      } else {
        alert("Error saving prescription");
      }
    } catch (err) {
      console.error("Failed to submit prescription", err);
      alert("Network error saving prescription");
    }
    setPrescribing(false);
  };

  const handleChatSubmit = async () => {
    if (!chatQuery) return;
    setChatLoading(true);
    setChatResponse(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setChatResponse(data);
      } else {
        setChatResponse({ type: "text", message: "Failed to connect to the Chat AI." });
      }
    } catch (err) {
      setChatResponse({ type: "text", message: "Network error calling the Chat AI." });
    }
    setChatLoading(false);
  };

  const fetchSummary = async (idToFetch?: any) => {
    const targetId = (typeof idToFetch === 'string') ? idToFetch : patientId;
    if (!targetId) return;
    setLoading(true);
    setError(false);
    setSummary("");
    setTimelineData([]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${targetId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      } else {
        setSummary("Error fetching summary. Ensure the patient exists in the database.");
        setError(true);
      }

      const timelineRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${targetId}/timeline`);
      if (timelineRes.ok) {
        const tData = await timelineRes.json();
        setTimelineData(tData);
      }
    } catch (err) {
      setSummary("Failed to connect to the MedFlow Clinical API.");
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="xl:col-span-4 space-y-6 relative z-10">
          
          {/* Stat Cards with 3D Tilt */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              icon={<User className="w-5 h-5" />} 
              title="Patients" 
              value="1,284" 
              trend="+12% this week" 
              color="cyan"
              delay="stagger-1"
            />
            <StatCard 
              icon={<Activity className="w-5 h-5" />} 
              title="AI Reports" 
              value="892" 
              trend="Saved ~44 hours" 
              color="violet"
              delay="stagger-2"
            />
          </div>

          {/* Search Panel */}
          <div className="glass-card p-6 space-y-5 animate-fade-in-up stagger-3">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => setSearchMode("chat")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                  searchMode === 'chat' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-glow-cyan' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                style={searchMode === 'chat' ? { border: '1px solid rgba(6,182,212,0.2)' } : {}}
              >
                GraphRAG Chat
              </button>
              <button 
                onClick={() => setSearchMode("manual")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                  searchMode === 'manual' 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-glow-cyan' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                style={searchMode === 'manual' ? { border: '1px solid rgba(6,182,212,0.2)' } : {}}
              >
                Manual ID
              </button>
            </div>

            {/* Search Content */}
            {searchMode === "chat" ? (
              <div className="space-y-4">
                {/* Chat Response Area */}
                <div className="p-4 rounded-xl min-h-[150px] max-h-[300px] overflow-y-auto" style={{ background: 'rgba(10, 14, 26, 0.5)', border: '1px solid var(--border-glass)' }}>
                  {chatResponse ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 mt-1" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
                          <Search className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="glass-card p-3 text-sm text-slate-300 flex-1" style={{ borderRadius: '0.75rem' }}>
                          <p className="mb-2">{chatResponse.message}</p>
                          {chatResponse.type === "patient_list" && chatResponse.patients && (
                            <div className="space-y-2 mt-3">
                              {chatResponse.patients.map((p: any, idx: number) => (
                                <button
                                  key={p.patient_id}
                                  onClick={() => {
                                    const idStr = p.patient_id.toString();
                                    setPatientId(idStr);
                                    fetchSummary(idStr);
                                  }}
                                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 hover:translate-x-1 animate-fade-in-up stagger-${idx + 1}`}
                                  style={{ 
                                    background: 'rgba(6, 182, 212, 0.05)', 
                                    border: '1px solid rgba(6, 182, 212, 0.1)' 
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.08)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                  <p className="font-bold text-white">{p.name}</p>
                                  <p className="text-xs text-cyan-400/70">ID: {p.patient_id} • DOB: {p.dob}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center mt-10">Ask GraphRAG to find a patient record.</p>
                  )}
                </div>
                {/* Chat Input */}
                <textarea 
                  placeholder="Type natural language query..." 
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  rows={2}
                  className="block w-full px-4 py-3 rounded-xl text-sm resize-none input-glow text-slate-200 placeholder-slate-500"
                ></textarea>
                {/* Send Button */}
                <button 
                  onClick={handleChatSubmit}
                  disabled={chatLoading || !chatQuery}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all duration-300 btn-glow"
                  style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(139,92,246,0.8))' }}
                >
                  {chatLoading ? <><Loader2 className="animate-spin h-4 w-4" /> Searching Graph...</> : "Send Request"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Database ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter Patient ID (e.g. 1)" 
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchSummary()}
                    className="block w-full px-4 py-4 rounded-xl font-medium text-lg input-glow text-slate-200 placeholder-slate-500"
                  />
                </div>
                <button 
                  onClick={() => fetchSummary()}
                  disabled={loading || !patientId}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white disabled:opacity-50 font-bold text-lg transition-all duration-300 btn-glow"
                  style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(139,92,246,0.8))' }}
                >
                  {loading ? <><Loader2 className="animate-spin h-6 w-6" /> Processing Data...</> : "Synthesize Clinical Data"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Clinical Report ═══ */}
        <div className="xl:col-span-8 space-y-8">
          {(!summary && !loading) ? (
            <div className="h-[400px] glass-card flex flex-col items-center justify-center text-slate-500 p-12 text-center" style={{ border: '2px dashed rgba(100,116,160,0.15)' }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(6,182,212,0.05)' }}>
                <FileText className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">No Patient Selected</h3>
              <p className="max-w-sm text-slate-500">Enter a Patient ID or search to generate a comprehensive AI-assisted clinical summary.</p>
            </div>
          ) : (
            <div className="min-h-[400px] glass-card overflow-hidden flex flex-col animate-fade-in-up">
              {/* Report Header */}
              <div className={`px-8 py-5 flex items-center justify-between ${error ? '' : ''}`} style={{ 
                borderBottom: '1px solid var(--border-glass)',
                background: error ? 'rgba(244, 63, 94, 0.05)' : 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(139,92,246,0.03))'
              }}>
                <div className="flex items-center gap-3">
                  {error ? <AlertCircle className="text-rose-400 w-6 h-6" /> : <TrendingUp className="text-cyan-400 w-6 h-6" />}
                  <h3 className="text-lg font-bold text-white">
                    {loading ? "Analyzing Clinical Pathways..." : error ? "Diagnostic Error" : "Clinical Synthesis Report"}
                  </h3>
                </div>
                {(!loading && !error && summary) && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowBillingModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 btn-glow text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(6,182,212,0.6))' }}
                    >
                      <DollarSign className="w-4 h-4" />
                      Generate Bill
                    </button>
                    <button 
                      onClick={() => setShowPrescribeModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 btn-glow text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(6,182,212,0.6))' }}
                    >
                      <Pill className="w-4 h-4" />
                      Write Prescription
                    </button>
                  </div>
                )}
              </div>
              
              {/* Report Content */}
              <div className="p-8 flex-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
                      <div className="absolute inset-0 w-12 h-12 rounded-full" style={{ boxShadow: '0 0 30px rgba(6,182,212,0.2)' }}></div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-white mb-1">Synthesizing Data</p>
                      <p className="text-sm text-slate-500">Running AI agents across your clinical database...</p>
                    </div>
                    <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-glass)' }}>
                      <div className="h-full rounded-full shimmer-bg" style={{ background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet), var(--accent-cyan))', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300 prose-a:text-cyan-400">
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
                <div className="p-2 rounded-xl" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Patient History Timeline</h3>
              </div>
              
              <div className="relative ml-4 space-y-8 pb-4" style={{ borderLeft: '2px solid rgba(6,182,212,0.15)' }}>
                {timelineData.map((item, idx) => (
                  <div key={idx} className={`relative pl-8 animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}>
                    <div className="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 status-active" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))' }}></div>
                    <div className="glass-card p-5" style={{ borderRadius: '1rem' }}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white">{item.title}</h4>
                        <span className="text-xs font-bold px-3 py-1 rounded-full text-cyan-300" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.15)' }}>
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{item.description}</p>
                      
                      {item.bill_amount && (
                        <div className="flex flex-wrap items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing</span>
                          <span className="text-sm font-bold text-white">Rs. {item.bill_amount}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            item.bill_status === 'Paid' 
                              ? 'text-emerald-300' 
                              : 'text-amber-300'
                          }`} style={{
                            background: item.bill_status === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${item.bill_status === 'Paid' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                          }}>
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
          <div className="glass-card w-full max-w-2xl overflow-hidden animate-scale-in" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(139,92,246,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Pill className="text-violet-400 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Write Prescription</h3>
                  <p className="text-sm text-slate-500">Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowPrescribeModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prescribed Medications</h4>
                <textarea 
                  placeholder="e.g. Amoxicillin 500mg - 1 strip..."
                  value={prescriptionForm.medication}
                  onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full p-4 rounded-xl h-32 input-glow text-slate-200 placeholder-slate-500 resize-none"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Instructions & Dosage</h4>
                <textarea 
                  placeholder="e.g. Take once daily after meals..."
                  value={prescriptionForm.instructions}
                  onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full p-4 rounded-xl h-24 input-glow text-slate-200 placeholder-slate-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowPrescribeModal(false)} className="px-6 py-3 rounded-xl font-bold transition-all text-slate-400 hover:text-white" style={{ background: 'rgba(100,116,160,0.1)', border: '1px solid var(--border-glass)' }}>Cancel</button>
                <button 
                  onClick={submitPrescription} 
                  disabled={prescribing}
                  className="flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white btn-glow"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(6,182,212,0.6))' }}
                >
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
          <div className="glass-card w-full max-w-xl overflow-hidden animate-scale-in" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(16,185,129,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <DollarSign className="text-emerald-400 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Generate Medical Bill</h3>
                  <p className="text-sm text-slate-500">Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowBillingModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Amount (PKR) *</label>
                <input 
                  type="number"
                  placeholder="e.g. 1500"
                  value={billingForm.amount}
                  onChange={e => setBillingForm({...billingForm, amount: e.target.value})}
                  className="w-full p-4 rounded-xl text-lg font-bold input-glow text-slate-200 placeholder-slate-500"
                />
              </div>

              <div className="rounded-xl p-5" style={{ background: 'rgba(10,14,26,0.5)', border: '1px solid var(--border-glass)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-300">Medical Coding</h4>
                  <button 
                    onClick={handleAutoCode}
                    disabled={autoCoding}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-cyan-300 btn-glow"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.15)' }}
                  >
                    {autoCoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                    ✨ Auto-Code with AI
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">ICD-10 Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. J01.90"
                      value={billingForm.icd10}
                      onChange={e => setBillingForm({...billingForm, icd10: e.target.value})}
                      className="w-full p-3 rounded-lg uppercase font-mono text-sm input-glow text-slate-200 placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">CPT Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. 99213"
                      value={billingForm.cpt}
                      onChange={e => setBillingForm({...billingForm, cpt: e.target.value})}
                      className="w-full p-3 rounded-lg font-mono text-sm input-glow text-slate-200 placeholder-slate-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Verify AI-suggested codes before submission.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowBillingModal(false)} className="px-6 py-3 rounded-xl font-bold transition-all text-slate-400 hover:text-white" style={{ background: 'rgba(100,116,160,0.1)', border: '1px solid var(--border-glass)' }}>Cancel</button>
                <button 
                  onClick={submitBilling} 
                  disabled={billingSaving || !billingForm.amount}
                  className="flex-1 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50 btn-glow py-3"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(6,182,212,0.6))' }}
                >
                  {billingSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                  Submit Bill & Email Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ═══ 3D Stat Card Component ═══ */
function StatCard({ icon, title, value, trend, color, delay }: { icon: React.ReactNode, title: string, value: string, trend: string, color: string, delay: string }) {
  const gradients: Record<string, string> = {
    cyan: 'rgba(6, 182, 212, 0.12)',
    violet: 'rgba(139, 92, 246, 0.12)',
    emerald: 'rgba(16, 185, 129, 0.12)',
  };
  const glows: Record<string, string> = {
    cyan: 'rgba(6, 182, 212, 0.15)',
    violet: 'rgba(139, 92, 246, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
  };
  const textColors: Record<string, string> = {
    cyan: 'text-cyan-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className={`card-3d animate-fade-in-up ${delay}`}>
      <div className="card-3d-inner glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${textColors[color]}`} style={{ background: gradients[color], boxShadow: `0 0 20px ${glows[color]}` }}>
            {icon}
          </div>
        </div>
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-2xl font-black text-white mb-1">{value}</div>
        <p className="text-xs font-medium text-slate-500">{trend}</p>
      </div>
    </div>
  );
}
