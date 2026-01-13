
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEALTH' | 'REPORTS' | 'COMMUNICATION' | 'SUPPORT' | 'SETTINGS' | 'USERS'>('OVERVIEW');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'ALL' | 'STUDENT' | 'WRITER'>('ALL');

  useEffect(() => {
    if (activeTab === 'HEALTH') {
      api.getSystemLogs().then(setLogs);
      api.getTransactions().then(setTransactions);
    }
    if (activeTab === 'USERS') {
      loadUsers();
    }
  }, [activeTab, userFilter]);

  const loadUsers = async () => {
    // If filter changes, we might want to refetch or just filter client side if small dataset
    // For now, let's fetch based on filter if api supports it, or just all.
    // The api.getUsers supports role.
    const users = await api.getUsers(userFilter);
    setAllUsers(users);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      await api.deleteUser(userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Simulated Backend Architecture Monitor</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Overview</button>
          <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'USERS' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Users</button>
          <button onClick={() => setActiveTab('COMMUNICATION')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'COMMUNICATION' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Communication</button>
          <button onClick={() => setActiveTab('SUPPORT')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'SUPPORT' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Support</button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Settings</button>
          <button onClick={() => setActiveTab('HEALTH')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'HEALTH' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>System</button>
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
                  <span className={`font-bold w-12 ${log.method === 'GET' ? 'text-blue-400' :
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
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${tr.type === 'PAYMENT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
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

      {activeTab === 'COMMUNICATION' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold mb-4">Post Announcement</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Subject" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" id="announcement-title" />
              <textarea placeholder="Message to users..." className="w-full px-4 py-2 border rounded-lg h-32 outline-none" id="announcement-content"></textarea>
              <div className="flex justify-between items-center">
                <select className="px-4 py-2 border rounded-lg text-sm outline-none" id="announcement-audience">
                  <option value="ALL">All Users</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="WRITER">Writers Only</option>
                </select>
                <button
                  onClick={async () => {
                    const title = (document.getElementById('announcement-title') as HTMLInputElement).value;
                    const content = (document.getElementById('announcement-content') as HTMLInputElement).value;
                    const audience = (document.getElementById('announcement-audience') as HTMLSelectElement).value;
                    await api.createAnnouncement({ title, content, target_audience: audience });
                    alert('Announcement Posted!');
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                  Post Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SUPPORT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="font-bold">Support Tickets</h2>
            <span className="text-xs text-slate-500">View recent issues</span>
          </div>
          <div className="divide-y">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 flex justify-between items-start hover:bg-slate-50">
                <div>
                  <h3 className="font-bold text-sm">Login Issue #{i}</h3>
                  <p className="text-sm text-slate-600 mt-1">User cannot access account via Google login.</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">OPEN</span>
                    <span className="text-[10px] text-slate-400 flex items-center">john@example.com</span>
                  </div>
                </div>
                <button className="text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">Resolve</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold mb-6">Platform Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Maintenance Mode</h3>
                  <p className="text-xs text-slate-500">Disable access for all non-admin users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className="pt-6 border-t">
                <label className="block text-sm font-bold mb-2">Platform Fee (%)</label>
                <div className="flex gap-4">
                  <input type="number" defaultValue={10} className="w-24 px-3 py-2 border rounded-lg" />
                  <button className="text-sm font-bold text-indigo-600">Update</button>
                </div>
              </div>
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
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-800">User Management</h2>
            <div className="flex gap-2">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-xs font-bold text-slate-600 outline-none"
              >
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students</option>
                <option value="WRITER">Writers</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="w-8 h-8 rounded-full bg-slate-200" />
                        <span className="font-bold text-slate-700">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'WRITER' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.is_verified ? (
                        <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                          ✓ VERIFIED
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-[10px]">UNVERIFIED</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allUsers.length === 0 && (
              <div className="p-10 text-center text-slate-400">No users found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
