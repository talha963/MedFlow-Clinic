"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock, CreditCard, Activity, TrendingUp, Loader2 } from "lucide-react";

/* ═══ 3D Bar Chart ═══ */
function AnimatedBarChart() {
  return (
    <svg className="opacity-[0.07]" width="160" height="120" viewBox="0 0 160 120">
      {[
        { x: 10, h: 60, color: '#3b82f6', delay: '0s' },
        { x: 35, h: 85, color: '#6366f1', delay: '0.2s' },
        { x: 60, h: 45, color: '#10b981', delay: '0.4s' },
        { x: 85, h: 70, color: '#3b82f6', delay: '0.6s' },
        { x: 110, h: 95, color: '#6366f1', delay: '0.8s' },
        { x: 135, h: 55, color: '#10b981', delay: '1s' },
      ].map((bar, i) => (
        <rect key={i} x={bar.x} y={120 - bar.h} width="18" height={bar.h} rx="4" fill={bar.color} opacity="0.6">
          <animate attributeName="height" from="0" to={bar.h} dur="1.5s" begin={bar.delay} fill="freeze" />
          <animate attributeName="y" from="120" to={120 - bar.h} dur="1.5s" begin={bar.delay} fill="freeze" />
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" begin={bar.delay} repeatCount="indefinite" />
        </rect>
      ))}
      {/* Baseline */}
      <line x1="5" y1="119" x2="155" y2="119" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/* ═══ Circular Progress Ring ═══ */
function ProgressRing({ percent }: { percent: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg className="transform -rotate-90" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#progressGrad)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black gradient-text">{percent}%</span>
      </div>
    </div>
  );
}

export default function BillingDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/stats`);
      if (res.ok) { const data = await res.json(); setStats(data); }
    } catch (error) { console.error("Failed to fetch billing stats", error); }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-sm font-bold text-slate-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = (stats?.revenue_collected || 0) + (stats?.revenue_pending || 0);
  const collectedPercent = totalRevenue > 0 ? Math.round((stats?.revenue_collected / totalRevenue) * 100) : 0;

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-black mb-2 text-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
              <CreditCard className="w-7 h-7 text-indigo-500" />
            </div>
            Financial Dashboard
          </h2>
          <p className="text-slate-500 font-medium">Manage clinic revenue, insurance claims, and patient invoices via Safepay.</p>
        </div>
        <button onClick={fetchStats} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 transition-all duration-300 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 shadow-sm">
          Refresh Data
        </button>
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: <DollarSign className="w-5 h-5" />, title: "Total Collected", value: `Rs. ${stats?.revenue_collected?.toLocaleString() || 0}`, color: "emerald" },
          { icon: <Clock className="w-5 h-5" />, title: "Pending Revenue", value: `Rs. ${stats?.revenue_pending?.toLocaleString() || 0}`, color: "amber" },
          { icon: <FileText className="w-5 h-5" />, title: "Total Invoices", value: stats?.total_invoices || 0, color: "blue" },
          { icon: <CheckCircle className="w-5 h-5" />, title: "Paid Invoices", value: stats?.paid_invoices || 0, color: "indigo" },
        ].map((card, idx) => {
          const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
            emerald: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', text: 'text-emerald-500', glow: 'rgba(16,185,129,0.1)' },
            amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', text: 'text-amber-500', glow: 'rgba(245,158,11,0.1)' },
            blue: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', text: 'text-blue-500', glow: 'rgba(59,130,246,0.1)' },
            indigo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)', text: 'text-indigo-500', glow: 'rgba(99,102,241,0.1)' },
          };
          const c = colors[card.color];
          return (
            <div key={card.title} className={`card-3d animate-fade-in-up stagger-${idx + 1}`}>
              <div className="card-3d-inner glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${c.text}`} style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.glow}` }}>
                    {card.icon}
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-300" />
                </div>
                <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-1">{card.title}</h3>
                <div className="text-2xl font-black text-slate-800">{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Revenue Overview with 3D elements ═══ */}
      {totalRevenue > 0 && (
        <div className="glass-card p-8 animate-fade-in-up stagger-3 relative overflow-hidden">
          {/* 3D Background Chart */}
          <div className="absolute right-6 top-4 pointer-events-none"><AnimatedBarChart /></div>

          <div className="flex items-center gap-8 relative z-10">
            <ProgressRing percent={collectedPercent} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Revenue Collection Rate</h3>
              {/* Animated Progress Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 mb-3">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${collectedPercent}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', boxShadow: '0 0 12px rgba(59,130,246,0.3)' }}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Collected: Rs. {stats?.revenue_collected?.toLocaleString()}</span>
                <span>Pending: Rs. {stats?.revenue_pending?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Recent Transactions ═══ */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-4">
        <div className="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {["Invoice ID", "Patient Name", "Date", "Amount (PKR)", "Status", "Action"].map((h, i) => (
                  <th key={h} className={`px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recent?.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">No billing records found. Generate an invoice from the Patient Dashboard.</td></tr>
              ) : (
                stats?.recent?.map((inv: any, idx: number) => (
                  <tr key={inv.id} className={`table-row-glow animate-fade-in-up stagger-${Math.min(idx+1,5)} border-b border-slate-50`}>
                    <td className="px-8 py-4 font-medium text-slate-600 text-sm">#INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-4 font-bold text-slate-800 text-sm">{inv.patient_name}</td>
                    <td className="px-8 py-4 text-slate-400 text-sm">{inv.date}</td>
                    <td className="px-8 py-4 font-black text-slate-800 text-sm">Rs. {inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                        inv.status === 'Pending' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                        'text-slate-500 bg-slate-50 border border-slate-100'
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      {inv.stripe_payment_link ? (
                        <a href={inv.stripe_payment_link} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm px-3 py-1.5 rounded-lg transition-all duration-300 bg-blue-50 hover:bg-blue-100 border border-blue-100">Pay Now</a>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
