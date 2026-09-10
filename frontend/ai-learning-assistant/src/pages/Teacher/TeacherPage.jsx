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
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const TeacherPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents();
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const res = await adminService.getStudentProgress(student._id);
      if (res.success) {
        setStudentDetails(res.data);
      }
    } catch (err) {
      toast.error('Failed to load student details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aggregate teacher statistics
  const totalStudents = students.length;
  const totalDocs = students.reduce((acc, s) => acc + (s.stats?.documentsCount || 0), 0);
  const totalQuizzes = students.reduce((acc, s) => acc + (s.stats?.completedQuizzes || 0), 0);
  const overallAvg =
    students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.stats?.averageScore || 0), 0) /
            (students.filter((s) => (s.stats?.completedQuizzes || 0) > 0).length || 1)
        )
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Student Performance &amp; Progress
          </h1>
          <p className="text-blue-200/80 text-sm max-w-xl">
            Monitor student engagement, inspect uploaded study documents, and track quiz proficiency scores across your class.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Roster
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
          <p className="text-xs text-slate-400 mt-1">Enrolled in learning space</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Student Documents
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalDocs}</p>
          <p className="text-xs text-slate-400 mt-1">Materials uploaded & analyzed</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Quizzes Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardList size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalQuizzes}</p>
          <p className="text-xs text-slate-400 mt-1">Total assessment submissions</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Class Average Score
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{overallAvg}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallAvg >= 80
                  ? 'bg-emerald-500'
                  : overallAvg >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${overallAvg}%` }}
            />
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any student to view detailed breakdown of their quiz scores and materials.
            </p>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No students registered yet.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
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

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {s.stats?.documentsCount || 0}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {s.stats?.flashcardsCount || 0}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {s.stats?.completedQuizzes || 0}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`font-bold text-xs ${
                              avg >= 80
                                ? 'text-emerald-600'
                                : avg >= 60
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {avg > 0 ? `${avg}%` : 'N/A'}
                          </span>
                          {avg > 0 && (
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  avg >= 80
                                    ? 'bg-emerald-500'
                                    : avg >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${avg}%` }}
                              />
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                  {selectedStudent.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {selectedStudent.username}'s Learning Profile
                  </h3>
                  <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentDetails(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw size={24} className="animate-spin text-blue-600" />
                </div>
              ) : studentDetails ? (
                <>
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-center">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Documents</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">
                        {studentDetails.stats?.totalDocuments || 0}
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-center">
                      <p className="text-xs text-emerald-600 font-semibold uppercase">Quizzes</p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">
                        {studentDetails.stats?.completedQuizzes || 0}
                      </p>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 text-center">
                      <p className="text-xs text-amber-600 font-semibold uppercase">Avg Score</p>
                      <p className="text-xl font-bold text-amber-900 mt-1">
                        {studentDetails.stats?.averageScore || 0}%
                      </p>
                    </div>
                  </div>

                  {/* Quizzes List */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <ClipboardList size={16} className="text-blue-600" /> Quiz Submissions &amp; Scores
                    </h4>
                    {studentDetails.quizzes?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No quizzes taken yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {studentDetails.quizzes?.map((quiz) => (
                          <div
                            key={quiz._id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-800">{quiz.title}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(quiz.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                                quiz.score >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : quiz.score >= 60
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {quiz.score ?? 0}% ({quiz.userAnswers?.length || 0}/{quiz.questions?.length || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-indigo-600" /> Uploaded Learning Materials
                    </h4>
                    {studentDetails.documents?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No documents uploaded yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {studentDetails.documents?.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
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
