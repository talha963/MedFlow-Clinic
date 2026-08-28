"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock, CreditCard, Activity, TrendingUp, Loader2 } from "lucide-react";

export default function BillingDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch billing stats", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-sm font-bold text-slate-500">Loading financial data...</p>
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
          <h2 className="text-3xl font-black mb-2 text-white flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <CreditCard className="w-7 h-7 text-violet-400" />
            </div>
            Financial Dashboard
          </h2>
          <p className="text-slate-500 font-medium">Manage clinic revenue, insurance claims, and patient invoices via Safepay.</p>
        </div>
        <button 
          onClick={fetchStats} 
          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 transition-all duration-300 hover:text-cyan-300"
          style={{ background: 'rgba(100,116,160,0.08)', border: '1px solid var(--border-glass)' }}
        >
          Refresh Data
        </button>
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: <DollarSign className="w-5 h-5" />, title: "Total Collected", value: `Rs. ${stats?.revenue_collected?.toLocaleString() || 0}`, color: "emerald" },
          { icon: <Clock className="w-5 h-5" />, title: "Pending Revenue", value: `Rs. ${stats?.revenue_pending?.toLocaleString() || 0}`, color: "amber" },
          { icon: <FileText className="w-5 h-5" />, title: "Total Invoices", value: stats?.total_invoices || 0, color: "cyan" },
          { icon: <CheckCircle className="w-5 h-5" />, title: "Paid Invoices", value: stats?.paid_invoices || 0, color: "violet" },
        ].map((card, idx) => {
          const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
            emerald: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.15)', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.12)' },
            amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.15)', text: 'text-amber-400', glow: 'rgba(245,158,11,0.12)' },
            cyan: { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.15)', text: 'text-cyan-400', glow: 'rgba(6,182,212,0.12)' },
            violet: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.15)', text: 'text-violet-400', glow: 'rgba(139,92,246,0.12)' },
          };
          const c = colors[card.color];
          return (
            <div key={card.title} className={`card-3d animate-fade-in-up stagger-${idx + 1}`}>
              <div className="card-3d-inner glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${c.text}`} style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.glow}` }}>
                    {card.icon}
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.15em] mb-1">{card.title}</h3>
                <div className="text-2xl font-black text-white">{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Revenue Progress Bar ═══ */}
      {totalRevenue > 0 && (
        <div className="glass-card p-6 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Collection Rate</h3>
            <span className="text-sm font-black text-cyan-400">{collectedPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(100,116,160,0.15)' }}>
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${collectedPercent}%`, 
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
                boxShadow: '0 0 12px rgba(6,182,212,0.3)',
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>Collected: Rs. {stats?.revenue_collected?.toLocaleString()}</span>
            <span>Pending: Rs. {stats?.revenue_pending?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ═══ Recent Transactions Table ═══ */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-4">
        <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(10,14,26,0.3)' }}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" /> Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                {["Invoice ID", "Patient Name", "Date", "Amount (PKR)", "Status", "Action"].map((h, i) => (
                  <th key={h} className={`px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recent?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                    No billing records found. Generate an invoice from the Patient Dashboard.
                  </td>
                </tr>
              ) : (
                stats?.recent?.map((inv: any, idx: number) => (
                  <tr key={inv.id} className={`table-row-glow animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td className="px-8 py-4 font-medium text-slate-300 text-sm">#INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-4 font-bold text-white text-sm">{inv.patient_name}</td>
                    <td className="px-8 py-4 text-slate-500 text-sm">{inv.date}</td>
                    <td className="px-8 py-4 font-black text-white text-sm">Rs. {inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'Paid' ? 'text-emerald-300' :
                        inv.status === 'Pending' ? 'text-amber-300' :
                        'text-slate-400'
                      }`} style={{
                        background: inv.status === 'Paid' ? 'rgba(16,185,129,0.1)' :
                          inv.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,160,0.1)',
                        border: `1px solid ${inv.status === 'Paid' ? 'rgba(16,185,129,0.2)' :
                          inv.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,160,0.1)'}`,
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      {inv.stripe_payment_link ? (
                        <a href={inv.stripe_payment_link} target="_blank" rel="noreferrer" className="text-cyan-300 font-bold text-sm px-3 py-1.5 rounded-lg transition-all duration-300 btn-glow" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                          Pay Now
                        </a>
                      ) : (
                        <span className="text-slate-600 text-sm">—</span>
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
