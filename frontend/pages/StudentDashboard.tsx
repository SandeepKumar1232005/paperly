
import React, { useState, useMemo } from 'react';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { PaymentModal } from '../components/PaymentModal';
import { mockUsers } from '../mockData';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { ClipboardList, Plus, Sparkles } from 'lucide-react';
import { calculateSuggestedPrice } from '../utils/pricing';

interface StudentDashboardProps {
  user: User;
  assignments: Assignment[];
  onCreateAssignment: (data: Partial<Assignment>, file?: File) => void;
  onRespondToQuote: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onOpenChat: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onNavigate: (view: any) => void;
  onUpdateStatus: (id: string, status: AssignmentStatus, feedback?: string) => void; // New prop
  preSelectedWriterId?: string | null;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, assignments, onCreateAssignment, onRespondToQuote, onOpenChat, onDeleteAssignment, onNavigate, onUpdateStatus, preSelectedWriterId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [paymentAssignment, setPaymentAssignment] = useState<Assignment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newAsgn, setNewAsgn] = useState({ title: '', subject: '', budget: 50, deadline: '', description: '', pages: 1 });

  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  React.useEffect(() => {
    if (preSelectedWriterId) {
      setShowCreateModal(true);
    }
  }, [preSelectedWriterId]);

  // Smart Pricing Effect
  React.useEffect(() => {
    if (newAsgn.subject && newAsgn.deadline) {
      const price = calculateSuggestedPrice(newAsgn.subject, newAsgn.deadline, newAsgn.pages);
      setSuggestedPrice(price);
    }
  }, [newAsgn.subject, newAsgn.deadline, newAsgn.pages]);

  // Recommendation logic
  const recommendedWriters = useMemo(() => {
    if (!newAsgn.subject || newAsgn.subject.length < 3) return [];
    // Mock recommendation based on subject similarity or popularity
    return mockUsers.filter(u => u.role === 'WRITER').slice(0, 3);
  }, [newAsgn.subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAssignment({ ...newAsgn, pages: newAsgn.pages }, selectedFile || undefined);
    setShowCreateModal(false);
    setNewAsgn({ title: '', subject: '', budget: 50, deadline: '', description: '', pages: 1 });
    setSelectedFile(null);
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your assignments and monitor progress.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('WRITERS')}
            className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-indigo-200 dark:border-slate-700"
          >
            Find a Writer
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
          >
            <Plus size={20} />
            New Assignment
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{assignments.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-white">Your Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase">
                <th className="px-6 py-3 font-semibold">Assignment Title</th>
                <th className="px-6 py-3 font-semibold">Subject</th>
                <th className="px-6 py-3 font-semibold">Deadline</th>
                <th className="px-6 py-3 font-semibold">Budget</th>
                <th className="px-6 py-3 font-semibold">Status / Progress</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.map((asgn) => (
                <tr key={asgn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{asgn.title}</p>
                    <p className="text-xs text-slate-400">ID: {asgn.id}</p>
                    {asgn.status === AssignmentStatus.QUOTED && (
                      <div className="mt-2 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-2 rounded border border-indigo-100 dark:border-indigo-800">
                        <p className="font-bold">Writer Quote: ₹{asgn.quoted_amount}</p>
                        <p className="italic">"{asgn.writer_comment}"</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => onRespondToQuote(asgn.id, 'ACCEPT')} className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Accept</button>
                          <button onClick={() => onRespondToQuote(asgn.id, 'REJECT')} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50">Reject</button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{asgn.subject}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(asgn.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {asgn.budget > 0 ? `₹${asgn.budget}` : 'Pending Quote'}
                    {asgn.pages && <span className="block text-[10px] text-slate-400 font-normal">{asgn.pages} pgs</span>}
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="space-y-2">
                      <StatusBadge status={asgn.status} />
                      <ProgressBar
                        progress={
                          asgn.status === AssignmentStatus.PENDING_REVIEW ? 10 :
                            asgn.status === AssignmentStatus.QUOTED ? 30 :
                              asgn.status === AssignmentStatus.CONFIRMED ? 50 :
                                asgn.status === AssignmentStatus.IN_PROGRESS ? 75 :
                                  asgn.status === AssignmentStatus.COMPLETED ? 100 : 0
                        }
                        colorClass={asgn.status === AssignmentStatus.COMPLETED ? "bg-green-500" : "bg-indigo-600"}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      {/* Pay Button for Confirmed (formerly just Pending) Assignments */}
                      {/* Only Pay if CONFIRMED or legacy PENDING status, BUT ensure we don't pay for PENDING_REVIEW */}
                      {(asgn.status === AssignmentStatus.CONFIRMED || asgn.status === AssignmentStatus.PENDING) && asgn.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => setPaymentAssignment(asgn)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                          Pay Now
                        </button>
                      )}

                      <button
                        onClick={() => onOpenChat(asgn)}
                        disabled={asgn.status === AssignmentStatus.PENDING || asgn.status === AssignmentStatus.PENDING_REVIEW}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${(asgn.status === AssignmentStatus.PENDING || asgn.status === AssignmentStatus.PENDING_REVIEW)
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

                      {/* Delete Button - Only for Pending/Quoted assignments */}
                      {(asgn.status === AssignmentStatus.PENDING || asgn.status === AssignmentStatus.PENDING_REVIEW || asgn.status === AssignmentStatus.QUOTED) && (
                        <button
                          onClick={() => setDeleteConfirmId(asgn.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          title="Delete Assignment"
                        >
                          {/* Trash Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10">
                    <EmptyState
                      icon={ClipboardList}
                      title="No Assignments Yet"
                      description="You haven't posted any assignments yet. Create your first assignment to get started!"
                      action={{
                        label: 'Create Assignment',
                        onClick: () => setShowCreateModal(true)
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card View for Assignments */}
          <div className="md:hidden space-y-4 p-4">
            {assignments.map(asgn => (
              <div key={asgn.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{asgn.title}</h3>
                    <p className="text-xs text-slate-500">ID: {asgn.id}</p>
                  </div>
                  <StatusBadge status={asgn.status} />
                </div>

                <div className="mb-4">
                  <ProgressBar
                    progress={
                      asgn.status === AssignmentStatus.PENDING_REVIEW ? 10 :
                        asgn.status === AssignmentStatus.QUOTED ? 30 :
                          asgn.status === AssignmentStatus.CONFIRMED ? 50 :
                            asgn.status === AssignmentStatus.IN_PROGRESS ? 75 :
                              asgn.status === AssignmentStatus.COMPLETED ? 100 : 0
                    }
                    colorClass={asgn.status === AssignmentStatus.COMPLETED ? "bg-green-500" : "bg-indigo-600"}
                  />
                </div>

                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-slate-600 dark:text-slate-400">{asgn.subject}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{asgn.budget > 0 ? asgn.budget : 'Pending'}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingAssignment(asgn)}
                    className="flex-1 py-2 text-indigo-600 dark:text-indigo-400 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                  >
                    View
                  </button>
                  {(asgn.status === AssignmentStatus.CONFIRMED || asgn.status === AssignmentStatus.PENDING) && asgn.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => setPaymentAssignment(asgn)}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <EmptyState
                icon={ClipboardList}
                title="No Assignments Yet"
                description="You haven't posted any assignments yet."
                action={{
                  label: 'Create Assignment',
                  onClick: () => setShowCreateModal(true)
                }}
              />
            )}
          </div>
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
                  onChange={e => setNewAsgn({ ...newAsgn, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. History Analysis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newAsgn.subject}
                  onChange={e => setNewAsgn({ ...newAsgn, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. History"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Pages</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNewAsgn(prev => ({ ...prev, pages: Math.max(1, prev.pages - 1) }))}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAsgn.pages}
                    onChange={e => setNewAsgn({ ...newAsgn, pages: parseInt(e.target.value) || 1 })}
                    className="w-20 text-center px-2 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setNewAsgn(prev => ({ ...prev, pages: prev.pages + 1 }))}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <span className="text-sm text-slate-500 ml-2">({newAsgn.pages * 250} words approx)</span>
                </div>
              </div>



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
                  onChange={e => setNewAsgn({ ...newAsgn, deadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={newAsgn.description}
                  onChange={e => setNewAsgn({ ...newAsgn, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="Detail your requirements here..."
                />
              </div>

              {/* Smart Pricing Display */}
              {suggestedPrice && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-center justify-between mb-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Smart Price Suggestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">₹{suggestedPrice}</span>
                    <button
                      type="button"
                      onClick={() => setNewAsgn({ ...newAsgn, budget: suggestedPrice })}
                      className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* File Attachment Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attachment (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-300">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      {selectedFile ? 'Change File' : 'Attach File'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                      }}
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-slate-600 truncate max-w-[200px] bg-indigo-50 px-2 py-1 rounded text-indigo-700 font-medium">
                      {selectedFile.name}
                    </span>
                  )}
                  {selectedFile && (
                    <button type="button" onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-600">&times;</button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div >
      )}

      {/* View Assignment Modal (Restored) */}
      {
        viewingAssignment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{viewingAssignment.title}</h2>
                  <span className="text-sm text-slate-500">ID: {viewingAssignment.id}</span>
                </div>
                <button
                  onClick={() => setViewingAssignment(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase">Subject</p>
                    <p className="font-semibold text-slate-900">{viewingAssignment.subject}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase">Budget</p>
                    <p className="font-semibold text-slate-900">₹{viewingAssignment.budget}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase">Pages</p>
                    <p className="font-semibold text-slate-900">{viewingAssignment.pages || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase">Deadline</p>
                    <p className="font-semibold text-slate-900">{new Date(viewingAssignment.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase">Status</p>
                    <StatusBadge status={viewingAssignment.status} />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                    {viewingAssignment.description}
                  </div>

                  {viewingAssignment.attachment && (
                    <div className="mt-4">
                      <p className="font-bold text-slate-900 mb-2 text-sm">Attachment</p>
                      <a
                        href={viewingAssignment.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        View Attached File
                      </a>
                    </div>
                  )}
                </div>

                {viewingAssignment.submission && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Submission</h3>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-green-900">Final Submission Available</p>
                        <p className="text-sm text-green-700">Ready for download</p>
                      </div>
                      <button
                        onClick={() => handleDownload(viewingAssignment)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Download
                      </button>
                    </div>

                    {/* Approval / Revision Actions */}
                    {(viewingAssignment.status === AssignmentStatus.PENDING_REVIEW || viewingAssignment.status === AssignmentStatus.SUBMITTED) && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => onUpdateStatus(viewingAssignment.id, AssignmentStatus.COMPLETED)}
                          className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                        >
                          Approve & Release Payment
                        </button>
                        <button
                          onClick={() => {
                            if ((viewingAssignment.revision_count || 0) >= 2) {
                              alert("Maximum of 2 free revisions reached. Please chat with the writer for further changes.");
                              return;
                            }
                            const reason = prompt("Please provide feedback for the revision:");
                            if (reason) {
                              onUpdateStatus(viewingAssignment.id, AssignmentStatus.REVISION, reason);
                            }
                          }}
                          className="bg-yellow-50 text-yellow-700 border border-yellow-200 py-3 rounded-lg font-bold hover:bg-yellow-100 transition-colors"
                        >
                          Request Revision ({(2 - (viewingAssignment.revision_count || 0))} left)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                <button
                  onClick={() => setViewingAssignment(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }


      {/* Payment Modal Integration */}
      {
        paymentAssignment && (
          <PaymentModal
            isOpen={true}
            assignment={paymentAssignment}
            onClose={() => setPaymentAssignment(null)}
            onSuccess={() => {
              // Update local status
              // Note: In a real app we would refetch, here we mutate local list for demo

              // assignments is a prop, so we can't mutate it directly without a callback or prop
              // For now, reload window or show alert
              alert("Payment Successful! The status will update momentarily.");
              setPaymentAssignment(null);
              window.location.reload(); // Simple refresh to fetch/reset mock state if persisted
            }}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Assignment?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to permanently delete this assignment? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteConfirmId) onDeleteAssignment(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Yes, Delete It
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};


export default StudentDashboard;
