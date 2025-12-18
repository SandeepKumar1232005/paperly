
import React, { useState, useMemo } from 'react';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { mockUsers } from '../mockData';

interface StudentDashboardProps {
  user: User;
  assignments: Assignment[];
  onCreateAssignment: (data: Partial<Assignment>) => void;
  onOpenChat: (assignment: Assignment) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, assignments, onCreateAssignment, onOpenChat }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [newAsgn, setNewAsgn] = useState({ title: '', subject: '', budget: 50, deadline: '', description: '' });

  // Recommendation logic
  const recommendedWriters = useMemo(() => {
    if (!newAsgn.subject || newAsgn.subject.length < 3) return [];
    // Mock recommendation based on subject similarity or popularity
    return mockUsers.filter(u => u.role === 'WRITER').slice(0, 3);
  }, [newAsgn.subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAssignment(newAsgn);
    setShowCreateModal(false);
    setNewAsgn({ title: '', subject: '', budget: 50, deadline: '', description: '' });
  };

  const handleDownload = (asgn: Assignment) => {
    if (!asgn.submission) return;
    const blob = new Blob([asgn.submission], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asgn.title.replace(/\s+/g, '_')}_Final_Submission.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Workspace</h1>
          <p className="text-slate-500">Manage your assignments and monitor progress.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          New Assignment
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-slate-900">{assignments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-indigo-600">
            {assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">
            {assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="font-bold text-slate-800">Your Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
                <th className="px-6 py-3 font-semibold">Assignment Title</th>
                <th className="px-6 py-3 font-semibold">Subject</th>
                <th className="px-6 py-3 font-semibold">Deadline</th>
                <th className="px-6 py-3 font-semibold">Budget</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asgn) => (
                <tr key={asgn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{asgn.title}</p>
                    <p className="text-xs text-slate-400">ID: {asgn.id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{asgn.subject}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(asgn.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">${asgn.budget}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={asgn.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => onOpenChat(asgn)}
                        disabled={asgn.status === AssignmentStatus.PENDING}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          asgn.status === AssignmentStatus.PENDING 
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        Chat
                      </button>
                      <button 
                        onClick={() => setViewingAssignment(asgn)}
                        className="text-indigo-600 hover:underline text-sm font-bold"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No assignments found. Click "New Assignment" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-50/50">
              <h2 className="text-xl font-bold text-slate-900">Post New Assignment</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAsgn.title}
                  onChange={e => setNewAsgn({...newAsgn, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. History Analysis"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newAsgn.subject}
                    onChange={e => setNewAsgn({...newAsgn, subject: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. History"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={newAsgn.budget}
                    onChange={e => setNewAsgn({...newAsgn, budget: Number(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* AI Recommendations */}
              {recommendedWriters.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <span className="text-sm">✨</span> AI Recommended Writers for {newAsgn.subject}
                  </p>
                  <div className="flex gap-2">
                    {recommendedWriters.map(w => (
                      <div key={w.id} className="flex-1 bg-white p-2 rounded-lg border border-indigo-50 flex items-center gap-2">
                        <img src={w.avatar} className="w-6 h-6 rounded-full" alt="" />
                        <span className="text-[10px] font-bold text-slate-700 truncate">{w.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  required
                  value={newAsgn.deadline}
                  onChange={e => setNewAsgn({...newAsgn, deadline: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={newAsgn.description}
                  onChange={e => setNewAsgn({...newAsgn, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="Detail your requirements here..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Assignment Modal code kept as is ... */}
    </div>
  );
};

export default StudentDashboard;
