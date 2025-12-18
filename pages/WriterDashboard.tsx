
import React, { useState } from 'react';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { checkAssignmentQuality } from '../services/gemini';

interface WriterDashboardProps {
  user: User;
  assignments: Assignment[];
  onUpdateStatus: (id: string, status: AssignmentStatus) => void;
  onUploadSubmission: (id: string, text: string) => void;
  onOpenChat: (assignment: Assignment) => void;
}

const WriterDashboard: React.FC<WriterDashboardProps> = ({ user, assignments, onUpdateStatus, onUploadSubmission, onOpenChat }) => {
  const [selectedAsgn, setSelectedAsgn] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number, feedback: string, plagiarismLikelihood: string } | null>(null);

  const myAssignments = assignments.filter(a => a.writerId === user.id);
  const availableAssignments = assignments.filter(a => a.status === AssignmentStatus.PENDING && !a.writerId);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Writer Portal</h1>
        <p className="text-slate-500">Manage your workload and submissions.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Tasks */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Marketplace
          </h2>
          <div className="space-y-4">
            {availableAssignments.map(asgn => (
              <div key={asgn.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{asgn.title}</h3>
                  <span className="text-indigo-600 font-bold text-sm">${asgn.budget}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">{asgn.subject}</p>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{asgn.description}</p>
                <button
                  onClick={() => onUpdateStatus(asgn.id, AssignmentStatus.ASSIGNED)}
                  className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-indigo-600 hover:text-white transition-all text-sm"
                >
                  Accept Task
                </button>
              </div>
            ))}
            {availableAssignments.length === 0 && (
              <p className="text-center text-slate-400 py-10 border-2 border-dashed rounded-xl bg-slate-50">No new tasks available right now.</p>
            )}
          </div>
        </div>

        {/* Active Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Active Workflows
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                        You don't have any active tasks. Check the marketplace.
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
      {selectedAsgn && (
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
      )}
    </div>
  );
};

export default WriterDashboard;
