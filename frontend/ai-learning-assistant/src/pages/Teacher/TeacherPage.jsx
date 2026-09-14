import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  FileText,
  BookOpen,
  ClipboardList,
  Search,
  Award,
  TrendingUp,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  Download,
  BrainCircuit,
  BarChart3,
  Loader2,
  ChevronRight,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import documentService from '../../services/documentService';

/* ─── Score badge ─── */
const ScoreBadge = ({ score, status }) => {
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
      <Clock size={9} /> Pending
    </span>
  );
  const cls = score >= 80 ? 'bg-emerald-100 text-emerald-700'
    : score >= 60 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-600';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      <Trophy size={9} /> {score}%
    </span>
  );
};

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('roster');

  /* ─── Student roster state ─── */
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /* ─── Assigned quizzes state ─── */
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myDocs, setMyDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ documentId: '', title: '', numQuestions: 5 });
  const [resultsModal, setResultsModal] = useState(null); // { quiz, results }
  const [loadingResults, setLoadingResults] = useState(false);
  const [downloading, setDownloading] = useState(null);

  /* ─── Fetch students ─── */
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents();
      if (res.success) setStudents(res.data);
    } catch {
      toast.error('Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Fetch teacher's assigned quizzes ─── */
  const fetchAssignedQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await adminService.getAssignedQuizzes();
      if (res.success) setAssignedQuizzes(res.data);
    } catch {
      toast.error('Failed to load assigned quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAssignedQuizzes();
  }, []);

  /* ─── Open create modal: load teacher's docs ─── */
  const openCreateModal = async () => {
    setShowCreateModal(true);
    setLoadingDocs(true);
    setCreateForm({ documentId: '', title: '', numQuestions: 5 });
    try {
      const res = await documentService.getDocuments();
      setMyDocs((res || []).filter(d => d.status === 'ready'));
    } catch {
      toast.error('Failed to load your documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  /* ─── Create & assign quiz ─── */
  const handleCreate = async () => {
    if (!createForm.documentId) { toast.error('Please select a document'); return; }
    setCreating(true);
    try {
      const res = await adminService.assignQuiz({
        documentId: createForm.documentId,
        title: createForm.title || undefined,
        numQuestions: createForm.numQuestions
      });
      toast.success(res.message || 'Quiz assigned!');
      setShowCreateModal(false);
      fetchAssignedQuizzes();
    } catch (err) {
      toast.error(err.error || err.message || 'Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  /* ─── View marks for a quiz ─── */
  const handleViewResults = async (quiz) => {
    setLoadingResults(true);
    setResultsModal({ quiz, results: [] });
    try {
      const res = await adminService.getAssignedQuizResults(quiz._id);
      setResultsModal({ quiz: res.data.quiz, results: res.data.results });
    } catch {
      toast.error('Failed to load results');
      setResultsModal(null);
    } finally {
      setLoadingResults(false);
    }
  };

  /* ─── Download CSV ─── */
  const handleDownload = async (quiz) => {
    setDownloading(quiz._id);
    try {
      await adminService.downloadQuizResults(quiz._id, quiz.title);
      toast.success('CSV downloaded!');
    } catch {
      toast.error('Failed to download CSV');
    } finally {
      setDownloading(null);
    }
  };

  /* ─── Student roster helpers ─── */
  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const res = await adminService.getStudentProgress(student._id);
      if (res.success) setStudentDetails(res.data);
    } catch {
      toast.error('Failed to load student details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudents = students.length;
  const totalDocs = students.reduce((acc, s) => acc + (s.stats?.documentsCount || 0), 0);
  const totalQuizzes = students.reduce((acc, s) => acc + (s.stats?.completedQuizzes || 0), 0);
  const overallAvg = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.stats?.averageScore || 0), 0) /
        (students.filter(s => (s.stats?.completedQuizzes || 0) > 0).length || 1))
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" /> Instructor Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Performance & Progress</h1>
          <p className="text-blue-200/80 text-sm max-w-xl">
            Monitor student engagement, assign graded quizzes, and download class marks as CSV.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto z-10">
          <button
            onClick={() => { fetchStudents(); fetchAssignedQuizzes(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg"
          >
            <Plus size={16} /> Assign Quiz
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Student Documents', value: totalDocs, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Quizzes Completed', value: totalQuizzes, icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Assigned Quizzes', value: assignedQuizzes.length, icon: BrainCircuit, color: 'bg-violet-50 text-violet-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
              <div className={`p-2 rounded-xl ${color}`}><Icon size={18} /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {[
          { key: 'roster', label: 'Student Roster', icon: Users },
          { key: 'quizzes', label: 'Assigned Quizzes', icon: BrainCircuit },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* ── STUDENT ROSTER TAB ── */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Roster</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click on any student to view their detailed quiz scores and materials.</p>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64 h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Documents</th>
                  <th className="px-6 py-4">Flashcards</th>
                  <th className="px-6 py-4">Quizzes Taken</th>
                  <th className="px-6 py-4">Avg Score</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No students registered yet.</td></tr>
                ) : filteredStudents.map(s => {
                  const avg = s.stats?.averageScore || 0;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-xs">
                            {s.username?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{s.username}</span>
                            <span className="text-xs text-slate-400">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.stats?.documentsCount || 0}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.stats?.flashcardsCount || 0}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.stats?.completedQuizzes || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`font-bold text-xs ${avg >= 80 ? 'text-emerald-600' : avg >= 60 ? 'text-amber-600' : 'text-slate-500'}`}>
                            {avg > 0 ? `${avg}%` : 'N/A'}
                          </span>
                          {avg > 0 && (
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${avg >= 80 ? 'bg-emerald-500' : avg >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${avg}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewStudent(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye size={13} /> View Progress
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ASSIGNED QUIZZES TAB ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {loadingQuizzes ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-500" /></div>
          ) : assignedQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <BrainCircuit size={28} className="text-indigo-300" />
              </div>
              <p className="text-base font-semibold text-slate-500">No assigned quizzes yet</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">Click "Assign Quiz" to create a graded quiz for all students.</p>
              <button
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-xl shadow-md hover:from-indigo-600 hover:to-violet-600 transition-all"
              >
                <Plus size={15} /> Assign First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedQuizzes.map(quiz => {
                const pct = quiz.studentsTotal > 0 ? Math.round((quiz.studentsCompleted / quiz.studentsTotal) * 100) : 0;
                return (
                  <div key={quiz._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-md shrink-0">
                          <BrainCircuit size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{quiz.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <FileText size={10} />{quiz.document?.title || '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        pct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {quiz.studentsCompleted}/{quiz.studentsTotal} done
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                        <span>Completion</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BarChart3 size={12} />
                      <span>{quiz.totalQuestions} questions</span>
                      {quiz.averageScore != null && (
                        <>
                          <span className="text-slate-300">·</span>
                          <Trophy size={12} className="text-amber-500" />
                          <span>Avg {quiz.averageScore}%</span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleViewResults(quiz)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200"
                      >
                        <Eye size={12} /> View Marks
                      </button>
                      <button
                        onClick={() => handleDownload(quiz)}
                        disabled={downloading === quiz._id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-60"
                      >
                        {downloading === quiz._id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Download CSV
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE QUIZ MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-md">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Assign Graded Quiz</h2>
                <p className="text-xs text-slate-400">AI generates questions from your document and assigns to all students</p>
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Quiz Title <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Chapter 3 — Mid-term Assessment"
                value={createForm.title}
                onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              />
            </div>

            {/* Questions count */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Number of Questions</label>
              <select
                value={createForm.numQuestions}
                onChange={e => setCreateForm(f => ({ ...f, numQuestions: Number(e.target.value) }))}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors"
              >
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>

            {/* Document picker */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-600 block mb-2">Select Your Document <span className="text-red-500">*</span></label>
              {loadingDocs ? (
                <div className="flex items-center justify-center py-6"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
              ) : myDocs.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                  <AlertCircle size={14} /> No ready documents. Upload a document first.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {myDocs.map(doc => (
                    <button
                      key={doc._id}
                      onClick={() => setCreateForm(f => ({ ...f, documentId: doc._id }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        createForm.documentId === doc._id
                          ? 'border-indigo-400 bg-indigo-50/60'
                          : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        createForm.documentId === doc._id ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}>
                        <FileText size={12} className={createForm.documentId === doc._id ? 'text-white' : 'text-slate-500'} />
                      </div>
                      <p className="flex-1 text-xs font-medium text-slate-700 truncate">{doc.title}</p>
                      {createForm.documentId === doc._id && (
                        <CheckCircle size={14} className="text-indigo-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.documentId}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Assign Quiz</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS MODAL ── */}
      {resultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{resultsModal.quiz?.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{resultsModal.quiz?.totalQuestions} questions · {resultsModal.results?.length || 0} students</p>
              </div>
              <button
                onClick={() => setResultsModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {loadingResults ? (
                <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
              ) : resultsModal.results?.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No students assigned yet.</p>
              ) : (
                <div className="space-y-2">
                  {resultsModal.results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {r.studentName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{r.studentName}</p>
                          <p className="text-[10px] text-slate-400">{r.studentEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {r.status === 'completed' && r.tabSwitches > 0 && (
                          <span className="text-[10px] text-amber-600 font-medium">{r.tabSwitches} tab switch{r.tabSwitches > 1 ? 'es' : ''}</span>
                        )}
                        <ScoreBadge score={r.score} status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100">
              <button
                onClick={() => handleDownload(resultsModal.quiz)}
                disabled={downloading === resultsModal.quiz?.id}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md disabled:opacity-60"
              >
                {downloading === resultsModal.quiz?.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download Marks as CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENT DETAIL MODAL ── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                  {selectedStudent.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedStudent.username}'s Learning Profile</h3>
                  <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setStudentDetails(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12"><RefreshCw size={24} className="animate-spin text-blue-600" /></div>
              ) : studentDetails ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-center">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Documents</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">{studentDetails.stats?.totalDocuments || 0}</p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-center">
                      <p className="text-xs text-emerald-600 font-semibold uppercase">Quizzes</p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">{studentDetails.stats?.completedQuizzes || 0}</p>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 text-center">
                      <p className="text-xs text-amber-600 font-semibold uppercase">Avg Score</p>
                      <p className="text-xl font-bold text-amber-900 mt-1">{studentDetails.stats?.averageScore || 0}%</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <ClipboardList size={16} className="text-blue-600" /> Quiz Submissions & Scores
                    </h4>
                    {studentDetails.quizzes?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No quizzes taken yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {studentDetails.quizzes?.map(quiz => (
                          <div key={quiz._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{quiz.title}</p>
                              <p className="text-[10px] text-slate-400">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                              quiz.score >= 80 ? 'bg-emerald-100 text-emerald-800'
                                : quiz.score >= 60 ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {quiz.score ?? 0}% ({quiz.userAnswers?.length || 0}/{quiz.questions?.length || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-indigo-600" /> Uploaded Learning Materials
                    </h4>
                    {studentDetails.documents?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No documents uploaded yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {studentDetails.documents?.map(doc => (
                          <div key={doc._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-medium text-slate-700 truncate max-w-xs">{doc.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPage;

