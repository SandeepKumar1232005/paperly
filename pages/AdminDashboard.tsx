
import React, { useMemo, useState, useEffect } from 'react';
import { User, Assignment, AssignmentStatus, SystemLog, Transaction } from '../types';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, ComposedChart, Line
} from 'recharts';

interface AdminDashboardProps {
  user: User;
  assignments: Assignment[];
  users: User[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, assignments, users }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEALTH' | 'REPORTS'>('OVERVIEW');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (activeTab === 'HEALTH') {
      api.getSystemLogs().then(setLogs);
      api.getTransactions().then(setTransactions);
    }
  }, [activeTab]);

  // Aggregate stats
  const totalRevenue = assignments.reduce((sum, a) => sum + a.budget, 0);
  const totalWriters = users.filter(u => u.role === 'WRITER').length;
  const completedOrders = assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length;
  const conversionRate = assignments.length > 0 ? ((completedOrders / assignments.length) * 100).toFixed(1) : 0;

  // Monthly Trends
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: Record<string, { name: string, orders: number, revenue: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      data[monthName] = { name: monthName, orders: 0, revenue: 0 };
    }
    assignments.forEach(asgn => {
      const date = new Date(asgn.createdAt);
      const monthName = months[date.getMonth()];
      if (data[monthName]) {
        data[monthName].orders += 1;
        data[monthName].revenue += asgn.budget;
      }
    });
    return Object.values(data);
  }, [assignments]);

  const topWriters = useMemo(() => {
    return users
      .filter(u => u.role === 'WRITER')
      .map(writer => {
        const writerAsgn = assignments.filter(a => a.writerId === writer.id);
        const completed = writerAsgn.filter(a => a.status === AssignmentStatus.COMPLETED).length;
        const earnings = writerAsgn.reduce((sum, a) => sum + a.budget, 0);
        return { ...writer, completed, earnings };
      })
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
  }, [users, assignments]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-slate-500 mt-1">Simulated Backend Architecture Monitor</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Overview</button>
          <button onClick={() => setActiveTab('HEALTH')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'HEALTH' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Server Health</button>
          <button onClick={() => setActiveTab('REPORTS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'REPORTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Reports</button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Revenue (Escrow)', value: `$${totalRevenue.toLocaleString()}`, color: 'text-emerald-600', icon: '💰' },
              { label: 'System Uptime', value: '99.9%', color: 'text-indigo-600', icon: '⚡' },
              { label: 'Active Sessions', value: '42', color: 'text-purple-600', icon: '👤' },
              { label: 'DB Queries/sec', value: '1.2', color: 'text-slate-800', icon: '🗄️' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <span>{kpi.icon}</span> {kpi.label}
                </p>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="font-bold mb-6">Traffic Analysis</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="#EEF2FF" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="font-bold mb-4 text-sm">Top Writers (Revenue Share)</h2>
              <div className="space-y-4">
                {topWriters.map(w => (
                  <div key={w.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={w.avatar} className="w-6 h-6 rounded-full" />
                      <span className="font-bold">{w.name}</span>
                    </div>
                    <span className="text-indigo-600 font-bold">${w.earnings.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'HEALTH' && (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {/* Server Logs */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-white/5">
              <h2 className="text-indigo-400 font-bold text-sm tracking-widest uppercase">Live Server Logs</h2>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-green-500 font-bold">CONNECTED</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2">
              {logs.map(log => (
                <div key={log.id} className="text-slate-400 flex gap-4 border-b border-white/5 pb-2">
                  <span className="text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`font-bold w-12 ${
                    log.method === 'GET' ? 'text-blue-400' : 
                    log.method === 'POST' ? 'text-green-400' : 'text-yellow-400'
                  }`}>{log.method}</span>
                  <span className="flex-1 text-slate-300">{log.endpoint}</span>
                  <span className={`${log.statusCode >= 400 ? 'text-red-500' : 'text-green-500'}`}>{log.statusCode}</span>
                  <span className="text-indigo-400">{log.duration}ms</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm">Escrow Transaction Ledger</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">STABLE</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {transactions.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#{tr.id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          tr.type === 'PAYMENT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>{tr.type}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">${tr.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-emerald-600 text-xs font-bold">{tr.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="bg-white p-20 rounded-3xl border text-center">
          <h2 className="text-2xl font-bold mb-4">Export Reports</h2>
          <p className="text-slate-500">Select a report type to generate a simulated download link.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
