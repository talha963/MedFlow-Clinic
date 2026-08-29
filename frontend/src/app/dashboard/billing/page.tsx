"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock, CreditCard, Activity, TrendingUp, Loader2, Mail } from "lucide-react";

/* ═══ 3D Animated Bar Chart ═══ */
function AnimatedBarChart() {
  const bars = [
    { x: 8, h: 55, color: 'var(--accent-blue)', delay: '0s' },
    { x: 32, h: 80, color: 'var(--accent-indigo)', delay: '0.15s' },
    { x: 56, h: 40, color: 'var(--accent-emerald)', delay: '0.3s' },
    { x: 80, h: 65, color: 'var(--accent-blue)', delay: '0.45s' },
    { x: 104, h: 90, color: 'var(--accent-indigo)', delay: '0.6s' },
    { x: 128, h: 50, color: 'var(--accent-emerald)', delay: '0.75s' },
    { x: 152, h: 72, color: 'var(--accent-blue)', delay: '0.9s' },
  ];
  return (
    <svg className="w-[200px] h-[120px]" viewBox="0 0 200 120" style={{ opacity: 'var(--helix-opacity)' }}>
      {bars.map((bar, i) => (
        <g key={i}>
          <rect x={bar.x} y={120 - bar.h} width="16" height={bar.h} rx="3" fill={bar.color} opacity="0.5">
            <animate attributeName="height" from="0" to={bar.h} dur="1.2s" begin={bar.delay} fill="freeze" />
            <animate attributeName="y" from="120" to={120 - bar.h} dur="1.2s" begin={bar.delay} fill="freeze" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" begin={bar.delay} repeatCount="indefinite" />
          </rect>
          {/* Reflection */}
          <rect x={bar.x} y="120" width="16" height={bar.h * 0.3} rx="3" fill={bar.color} opacity="0.08">
            <animate attributeName="height" from="0" to={bar.h * 0.3} dur="1.2s" begin={bar.delay} fill="freeze" />
          </rect>
        </g>
      ))}
      <line x1="3" y1="119" x2="197" y2="119" stroke="var(--text-muted)" strokeWidth="0.4" opacity="0.2" />
    </svg>
  );
}

/* ═══ Animated Pie Arc ═══ */
function PieArc() {
  return (
    <svg className="w-[100px] h-[100px]" viewBox="0 0 100 100" style={{ opacity: 'var(--helix-opacity)' }}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-glass)" strokeWidth="6" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-blue)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray="160 100" className="rotate-slow" opacity="0.5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="var(--accent-indigo)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray="80 120" className="rotate-slow-reverse" opacity="0.3" />
    </svg>
  );
}

/* ═══ Circular Progress Ring ═══ */
function ProgressRing({ percent }: { percent: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 110, height: 110 }}>
      <svg className="transform -rotate-90" width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border-glass)" strokeWidth="7" />
        <circle cx="55" cy="55" r={r} fill="none" stroke="url(#progressGrad)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-blue)" />
            <stop offset="100%" stopColor="var(--accent-indigo)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-black gradient-text">{percent}%</span>
      </div>
      {/* Glow ring */}
      <div className="absolute -inset-2 rounded-full pulse-ring" style={{ border: '1px solid var(--ring-color)' }}></div>
    </div>
  );
}

export default function BillingDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/stats`); if (res.ok) setStats(await res.json()); } catch (error) { console.error("Failed to fetch billing stats", error); }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent-blue)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading financial data...</p>
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
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <div className="p-2 rounded-xl float-gentle" style={{ background: 'var(--glow-indigo)', border: `1px solid rgba(99,102,241,0.15)` }}>
              <CreditCard className="w-7 h-7" style={{ color: 'var(--accent-indigo)' }} />
            </div>
            Financial Dashboard
          </h2>
          <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Manage clinic revenue, insurance claims, and patient invoices via Safepay.</p>
        </div>
        <button onClick={fetchStats} className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
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
          const colorVars: Record<string, { accent: string; glow: string }> = {
            emerald: { accent: 'var(--accent-emerald)', glow: 'var(--glow-emerald)' },
            amber: { accent: 'var(--accent-amber)', glow: 'var(--badge-amber-bg)' },
            blue: { accent: 'var(--accent-blue)', glow: 'var(--glow-blue)' },
            indigo: { accent: 'var(--accent-indigo)', glow: 'var(--glow-indigo)' },
          };
          const c = colorVars[card.color];
          return (
            <div key={card.title} className={`card-3d animate-fade-in-up stagger-${idx + 1}`}>
              <div className="card-3d-inner glass-card p-6 relative overflow-hidden">
                <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full breathe" style={{ background: c.glow, opacity: 0.6 }}></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-2.5 rounded-xl" style={{ color: c.accent, background: c.glow, boxShadow: `0 0 20px ${c.glow}` }}>{card.icon}</div>
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                </div>
                <h3 className="font-bold text-[10px] uppercase tracking-[0.15em] mb-1 relative z-10" style={{ color: 'var(--text-muted)' }}>{card.title}</h3>
                <div className="text-2xl font-black relative z-10" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Revenue Overview ═══ */}
      {totalRevenue > 0 && (
        <div className="glass-card p-8 animate-fade-in-up stagger-3 relative overflow-hidden">
          <div className="absolute right-4 top-2 pointer-events-none"><AnimatedBarChart /></div>
          <div className="absolute right-[200px] top-4 pointer-events-none"><PieArc /></div>

          <div className="flex items-center gap-8 relative z-10">
            <ProgressRing percent={collectedPercent} />
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Revenue Collection Rate</h3>
              <div className="w-full h-3.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-empty)' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${collectedPercent}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-indigo))', boxShadow: '0 0 14px var(--glow-blue)' }}></div>
              </div>
              <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                <span>Collected: Rs. {stats?.revenue_collected?.toLocaleString()}</span>
                <span>Pending: Rs. {stats?.revenue_pending?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Recent Transactions ═══ */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-4">
        <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', background: 'var(--table-header-bg)' }}>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Activity className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} /> Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                {["Invoice ID", "Patient Name", "Date", "Amount (PKR)", "Status", "Delivery"].map((h, i) => (
                  <th key={h} className={`px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recent?.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No billing records found. Generate an invoice from the Patient Dashboard.</td></tr>
              ) : (
                stats?.recent?.map((inv: any, idx: number) => (
                  <tr key={inv.id} className={`table-row-glow animate-fade-in-up stagger-${Math.min(idx+1,5)}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-8 py-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>#INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-4 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{inv.patient_name}</td>
                    <td className="px-8 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                    <td className="px-8 py-4 font-black text-sm" style={{ color: 'var(--text-primary)' }}>Rs. {inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                        color: inv.status === 'Paid' ? 'var(--badge-emerald-text)' : 'var(--badge-amber-text)',
                        background: inv.status === 'Paid' ? 'var(--badge-emerald-bg)' : 'var(--badge-amber-bg)',
                        border: `1px solid ${inv.status === 'Paid' ? 'var(--badge-emerald-border)' : 'var(--badge-amber-border)'}`,
                      }}>{inv.status}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="flex items-center justify-end gap-1.5 text-xs font-bold" style={{ color: 'var(--badge-blue-text)' }}>
                        <Mail className="w-3.5 h-3.5" /> Sent via n8n
                      </span>
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
