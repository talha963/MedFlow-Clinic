"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock, CreditCard, Activity } from "lucide-react";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-500" />
            Financial Dashboard
          </h2>
          <p className="text-slate-500 font-medium">Manage clinic revenue, insurance claims, and patient invoices via Safepay.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStats} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Total Collected</h3>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-100">Rs. {stats?.revenue_collected?.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Pending Revenue</h3>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-100">Rs. {stats?.revenue_pending?.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Total Invoices</h3>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats?.total_invoices}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Paid Invoices</h3>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats?.paid_invoices}</div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount (PKR)</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {stats?.recent?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-center text-slate-500">
                    No billing records found. Generate an invoice from the Patient Dashboard.
                  </td>
                </tr>
              ) : (
                stats?.recent?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-4 font-medium text-slate-800 dark:text-slate-200">#INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-4 font-bold text-slate-700 dark:text-slate-300">{inv.patient_name}</td>
                    <td className="px-8 py-4 text-slate-500">{inv.date}</td>
                    <td className="px-8 py-4 font-black text-slate-800 dark:text-slate-100">Rs. {inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        inv.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      {inv.stripe_payment_link ? (
                        <a href={inv.stripe_payment_link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                          Pay Now
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">No Link</span>
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
