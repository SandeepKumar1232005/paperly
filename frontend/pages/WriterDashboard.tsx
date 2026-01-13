
import React, { useState } from 'react';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { checkAssignmentQuality } from '../services/gemini';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import { Search, Briefcase } from 'lucide-react';

interface WriterDashboardProps {
  user: User;
  assignments: Assignment[];
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void;
  onSubmitQuote: (id: string, amount: number, comment: string, writerId: string) => void;
  onUploadSubmission: (id: string, text: string) => void;
  onOpenChat: (assignment: Assignment) => void;
  onUpdateProfile: (updates: Partial<User>) => void;
  onRejectAssignment: (id: string) => void;
}

const WriterDashboard: React.FC<WriterDashboardProps> = ({ user, assignments, onUpdateAssignment, onSubmitQuote, onUploadSubmission, onOpenChat, onUpdateProfile, onRejectAssignment }) => {
  const [selectedAsgn, setSelectedAsgn] = useState<Assignment | null>(null);
  const [quoteData, setQuoteData] = useState<{ id: string, amount: string, comment: string } | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number, feedback: string, plagiarismLikelihood: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newSampleUrl, setNewSampleUrl] = useState('');

  const myAssignments = assignments.filter(a => a.writerId === user.id);
  // Include PENDING (legacy support) and PENDING_REVIEW
  const availableAssignments = assignments.filter(a =>
    (a.status === AssignmentStatus.PENDING || a.status === AssignmentStatus.PENDING_REVIEW) &&
    !a.writerId &&
    (!a.rejectedBy || !a.rejectedBy.includes(user.id))
  );

  const handleAiCheck = async () => {
    if (!submissionText || !selectedAsgn) return;
    setIsChecking(true);
    const result = await checkAssignmentQuality(submissionText, selectedAsgn.subject);
    setAiResult(result);
    setIsChecking(false);
  };

  const handleFinalSubmit = () => {
    if (selectedAsgn) {
      onUploadSubmission(selectedAsgn.id, submissionText);
      setSelectedAsgn(null);
      setSubmissionText('');
      setAiResult(null);
    }
  };

  const submitQuote = () => {
    if (quoteData && quoteData.amount) {
      onSubmitQuote(quoteData.id, Number(quoteData.amount), quoteData.comment, user.id);
      setQuoteData(null);
    }
  };

  const addSample = () => {
    if (newSampleUrl) {
      const currentSamples = user.handwriting_samples || [];
      onUpdateProfile({ handwriting_samples: [...currentSamples, newSampleUrl] });
      setNewSampleUrl('');
    }
  };

  const removeSample = (index: number) => {
    const currentSamples = user.handwriting_samples || [];
    const newSamples = [...currentSamples];
    newSamples.splice(index, 1);
    onUpdateProfile({ handwriting_samples: newSamples });
  };

  const styles = {
    // Basic font styles for handwriting preview
    handwriting: { fontFamily: '"Cedarville Cursive", cursive' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Writer Portal</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your workload and submissions.</p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Availability Toggle */}
          <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center shadow-sm">
            {['ONLINE', 'BUSY', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => onUpdateProfile({ availability_status: status as any })}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${user.availability_status === status
                    ? (status === 'ONLINE' ? 'bg-green-100 text-green-700' : status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-700')
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
          >
            <span>{isEditingProfile ? 'Done Editing' : 'Manage Profile & Samples'}</span>
            {!isEditingProfile && <span className="bg-indigo-500 px-2 py-0.5 rounded text-xs">New</span>}
          </button>
        </div>
      </div>

      {isEditingProfile && (
        <div className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">My Handwriting Profile</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Verified Samples</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {(user.handwriting_samples || []).map((url, idx) => (
                  <div key={idx} className="relative group w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border">
                    <img src={url} alt="Sample" className="w-full h-full object-cover" />
                    <button onClick={() => removeSample(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
                {(!user.handwriting_samples || user.handwriting_samples.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No samples uploaded yet. Upload specific handwriting styles to attract more students.</p>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setIsChecking(true); // Reuse loading state or add specific one
                        try {
                          const url = await api.uploadFile(file);
                          setNewSampleUrl(url);
                        } finally {
                          setIsChecking(false);
                        }
                      }
                    }}
                  />
                  {newSampleUrl && <p className="text-xs text-green-600 mt-1">✓ Image selected (Click 'Add' to confirm)</p>}
                </div>
                <button
                  onClick={addSample}
                  disabled={!newSampleUrl}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${newSampleUrl ? 'bg-slate-900 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">✨ Tip: Upload high-clarity images of your cursive, print, and block handwriting.</p>
            </div>
            <div className="border-l pl-8">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Profile Preview</h3>
              <div className="flex items-center gap-4">
                <img src={user.avatar} className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-bold text-slate-700">{user.average_rating || 'New'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Tasks */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Marketplace
          </h2>
          <div className="space-y-4">
            {assignments.filter(a => a.status === AssignmentStatus.QUOTED && a.provider?.id === user.id).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
                <h3 className="font-bold text-yellow-800 text-sm">Pending Student Approval</h3>
                <p className="text-xs text-yellow-600 mt-1">You have sent quotes for some assignments. Waiting for student confirmation.</p>
              </div>
            )}

            {availableAssignments.map(asgn => (
              <div key={asgn.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{asgn.title}</h3>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">₹{asgn.budget}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider font-semibold">{asgn.subject} • {new Date(asgn.deadline).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">{asgn.description}</p>


                {quoteData?.id === asgn.id ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="number"
                      className="w-full text-sm p-2 border rounded"
                      placeholder="Your Price (₹)"
                      value={quoteData.amount}
                      onChange={e => setQuoteData({ ...quoteData, amount: e.target.value })}
                    />
                    <textarea
                      className="w-full text-sm p-2 border rounded resize-none"
                      placeholder="Why this price? (Comment)"
                      rows={2}
                      value={quoteData.comment}
                      onChange={e => setQuoteData({ ...quoteData, comment: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button onClick={submitQuote} className="flex-1 bg-indigo-600 text-white text-xs py-2 rounded font-bold">Submit</button>
                      <button onClick={() => setQuoteData(null)} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 text-xs py-2 rounded font-bold">Reject</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setQuoteData({ id: asgn.id, amount: String(asgn.budget), comment: '' })}
                    className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-indigo-600 hover:text-white transition-all text-sm"
                  >
                    Review & Quote
                  </button>
                )}
              </div>
            ))}
            {availableAssignments.length === 0 && (
              <EmptyState
                icon={Search}
                title="No Tasks Available"
                description="Check back later for new assignments."
              />
            )}
          </div>
        </div>

        {/* Active Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Active Workflows
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Project</th>
                    <th className="px-6 py-3 font-semibold">Deadline</th>
                    <th className="px-6 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAssignments.map(asgn => (
                    <tr key={asgn.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{asgn.title}</p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={asgn.status} />
                          <span className="text-[10px] text-slate-400 uppercase">{asgn.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(asgn.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => onOpenChat(asgn)}
                            className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            Chat
                          </button>
                          {(asgn.status === AssignmentStatus.CONFIRMED || asgn.status === AssignmentStatus.IN_PROGRESS || asgn.status === AssignmentStatus.ASSIGNED) && (
                            <button
                              onClick={() => onRejectAssignment(asgn.id)}
                              className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                            >
                              Reject
                            </button>
                          )}
                          {asgn.status !== AssignmentStatus.COMPLETED && (
                            <button
                              onClick={() => setSelectedAsgn(asgn)}
                              className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myAssignments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12">
                        <EmptyState
                          icon={Briefcase}
                          title="No Active Work"
                          description="Pick tasks from the marketplace to start earning."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal with AI Support */}
      {
        selectedAsgn && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submit: {selectedAsgn.title}</h2>
                  <p className="text-sm text-indigo-600 font-medium">Subject: {selectedAsgn.subject}</p>
                </div>
                <button onClick={() => setSelectedAsgn(null)} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block font-bold text-slate-800">Your Work (Text Content)</label>
                  <textarea
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                    className="w-full h-[400px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 font-mono text-sm"
                    placeholder="Paste or type your completed assignment content here..."
                  />
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <span className="text-indigo-600">✨</span> Gemini AI Quality Check
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Use our AI engine to review your work for quality, structure, and plagiarism risk before final submission.
                    </p>

                    {isChecking ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-indigo-600 font-medium animate-pulse text-sm">Analyzing content structure...</p>
                      </div>
                    ) : aiResult ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-500">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-600">Quality Score</span>
                          <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center">
                            <span className="text-xl font-bold text-indigo-600">{aiResult.score}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border text-sm text-slate-700 italic">
                          "{aiResult.feedback}"
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Plagiarism Risk:</span>
                          <span className={`font-bold ${aiResult.plagiarismLikelihood.toLowerCase().includes('low') ? 'text-green-600' : 'text-red-500'}`}>
                            {aiResult.plagiarismLikelihood}
                          </span>
                        </div>
                        <button
                          onClick={() => { setAiResult(null); setSubmissionText(''); }}
                          className="text-indigo-600 text-xs font-semibold hover:underline"
                        >
                          Reset & Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAiCheck}
                        disabled={!submissionText}
                        className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
                      >
                        Run AI Quality Check
                      </button>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-4">
                      By submitting, you confirm that this work is original and meets the academic standards requested by the student.
                    </p>
                    <button
                      onClick={handleFinalSubmit}
                      disabled={!submissionText}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                    >
                      Final Submission
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default WriterDashboard;
