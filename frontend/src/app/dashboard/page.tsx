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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-[1600px] mx-auto">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
        <div className="xl:col-span-4 space-y-8 relative z-10">
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<User className="text-blue-600" />} title="Patients" value="1,284" trend="+12% this week" />
            <StatCard icon={<Activity className="text-blue-600" />} title="AI Reports" value="892" trend="Saved ~44 hours" />
          </div>

          <div className="bg-white dark:bg-slate-800 dark:border-slate-700 p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <button 
                onClick={() => setSearchMode("chat")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${searchMode === 'chat' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                GraphRAG Chat
              </button>
              <button 
                onClick={() => setSearchMode("manual")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${searchMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                Manual ID
              </button>
            </div>

            <div className="relative z-10">
              {searchMode === "chat" ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 min-h-[150px] max-h-[300px] overflow-y-auto">
                    {chatResponse ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 text-sm">
                            <p className="mb-2">{chatResponse.message}</p>
                            {chatResponse.type === "patient_list" && chatResponse.patients && (
                              <div className="space-y-2 mt-3">
                                {chatResponse.patients.map((p: any) => (
                                  <button
                                    key={p.patient_id}
                                    onClick={() => {
                                      const idStr = p.patient_id.toString();
                                      setPatientId(idStr);
                                      fetchSummary(idStr);
                                    }}
                                    className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-slate-700 border border-blue-100 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
                                  >
                                    <p className="font-bold text-blue-900 dark:text-blue-100">{p.name}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">ID: {p.patient_id} • DOB: {p.dob}</p>
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
                  <div>
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
                      className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm resize-none"
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !chatQuery}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 transition-all font-bold text-sm"
                  >
                    {chatLoading ? <><Loader2 className="animate-spin h-4 w-4" /> Searching Graph...</> : "Send Request"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Patient Database ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter Patient ID (e.g. 1)" 
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchSummary()}
                      className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-lg"
                    />
                  </div>
                  <button 
                    onClick={() => fetchSummary()}
                    disabled={loading || !patientId}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 disabled:opacity-70 font-bold text-lg"
                  >
                    {loading ? <><Loader2 className="animate-spin h-6 w-6" /> Processing Data...</> : "Synthesize Clinical Data"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-8">
          {(!summary && !loading) ? (
            <div className="h-[400px] bg-white dark:bg-slate-800 dark:border-slate-700 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">No Patient Selected</h3>
              <p className="max-w-sm">Enter a Patient ID or search to generate a comprehensive AI-assisted clinical summary.</p>
            </div>
          ) : (
            <div className="min-h-[400px] bg-white dark:bg-slate-800 dark:border-slate-700 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 overflow-hidden flex flex-col">
              <div className={`px-8 py-6 border-b flex items-center justify-between ${error ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                <div className="flex items-center gap-3">
                  {error ? <AlertCircle className="text-red-500 w-6 h-6" /> : <TrendingUp className="text-blue-600 w-6 h-6" />}
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {loading ? "Analyzing Clinical Pathways..." : error ? "Diagnostic Error" : "Clinical Synthesis Report"}
                  </h3>
                </div>
                {(!loading && !error && summary) && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowBillingModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                      <DollarSign className="w-4 h-4" />
                      Generate Bill
                    </button>
                    <button 
                      onClick={() => setShowPrescribeModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                      <Pill className="w-4 h-4" />
                      Write Prescription
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-8 flex-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-blue-600 space-y-6">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="font-bold text-xl text-slate-700 dark:text-slate-200">Synthesizing Data</p>
                  </div>
                ) : (
                  <div className="prose prose-lg prose-blue dark:prose-invert max-w-none">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {timelineData.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Patient History Timeline</h3>
              </div>
              
              <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-4 space-y-8 pb-4">
                {timelineData.map((item, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-800 -left-[9px] top-1"></div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{item.description}</p>
                      
                      {item.bill_amount && (
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Status</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Rs. {item.bill_amount}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            item.bill_status === 'Paid' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
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

      {/* Prescription Modal */}
      {showPrescribeModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                  <Pill className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Write Prescription</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowPrescribeModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medications</h4>
                <textarea 
                  placeholder="e.g. Amoxicillin 500mg - 1 strip..."
                  value={prescriptionForm.medication}
                  onChange={e => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 h-32"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions & Dosage</h4>
                <textarea 
                  placeholder="e.g. Take once daily after meals..."
                  value={prescriptionForm.instructions}
                  onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 h-24"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowPrescribeModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors">Cancel</button>
                <button 
                  onClick={submitPrescription} 
                  disabled={prescribing}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {prescribing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Send Prescription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Generate Medical Bill</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Patient ID: {patientId}</p>
                </div>
              </div>
              <button onClick={() => setShowBillingModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Amount (PKR) *</label>
                <input 
                  type="number"
                  placeholder="e.g. 1500"
                  value={billingForm.amount}
                  onChange={e => setBillingForm({...billingForm, amount: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 text-lg font-bold"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Medical Coding</h4>
                  <button 
                    onClick={handleAutoCode}
                    disabled={autoCoding}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold transition-colors"
                  >
                    {autoCoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                    ✨ Auto-Code with AI
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">ICD-10 Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. J01.90"
                      value={billingForm.icd10}
                      onChange={e => setBillingForm({...billingForm, icd10: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 uppercase font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">CPT Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. 99213"
                      value={billingForm.cpt}
                      onChange={e => setBillingForm({...billingForm, cpt: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 font-mono text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Verify AI-suggested codes before submission.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowBillingModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors">Cancel</button>
                <button 
                  onClick={submitBilling} 
                  disabled={billingSaving || !billingForm.amount}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
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

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: string, trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 dark:border-slate-700 p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">{icon}</div>
      </div>
      <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">{title}</h3>
      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">{value}</div>
      <p className="text-xs font-bold text-slate-400">{trend}</p>
    </div>
  );
}
