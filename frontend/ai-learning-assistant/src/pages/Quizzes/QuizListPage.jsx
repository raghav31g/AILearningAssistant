import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import documentService from '../../services/documentService';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import moment from 'moment';
import {
  BrainCircuit, Trophy, Trash2, Loader2, ChevronRight,
  Clock, CheckCircle2, Circle, Plus, Sparkles, ArrowRight,
  BarChart3, FileText, RefreshCw,
} from 'lucide-react';

const ScoreBadge = ({ score, completed }) => {
  if (!completed) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
      <Circle size={9}/> Pending
    </span>
  );
  const cls = score >= 80 ? 'bg-emerald-100 text-emerald-700'
    : score >= 60 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-600';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      <Trophy size={9}/> {score}%
    </span>
  );
};

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes]     = useState([]);
  const [docs, setDocs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null);
  const [generating, setGenerating] = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);

  // Build full quiz list by fetching quizzes per document
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Get all documents first
        const docsData = await documentService.getDocuments();
        const readyDocs = (docsData || []).filter(d => d.status === 'ready');
        setDocs(readyDocs);

        // Fetch quizzes for each document
        const allQuizzes = [];
        await Promise.all(
          readyDocs.map(async (doc) => {
            try {
              const res = await quizService.getQuizzesForDocument(doc._id);
              const docQuizzes = (res?.data || []).map(q => ({ ...q, _docTitle: doc.title }));
              allQuizzes.push(...docQuizzes);
            } catch {}
          })
        );
        // Sort newest first
        allQuizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setQuizzes(allQuizzes);
      } catch {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this quiz?')) return;
    setDeleting(id);
    try {
      await quizService.deleteQuiz(id);
      toast.success('Quiz deleted');
      setQuizzes(prev => prev.filter(q => q._id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally { setDeleting(null); }
  };

  const handleGenerate = async (docId) => {
    setGenerating(docId);
    try {
      const res = await aiService.generateQuiz(docId, { numQuestions: 5 });
      toast.success('Quiz generated!');
      navigate(`/quizzes/${res.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally { setGenerating(null); setShowGenModal(false); }
  };

  const completedQuizzes = quizzes.filter(q => q.completedAt);
  const avgScore = completedQuizzes.length > 0
    ? Math.round(completedQuizzes.reduce((s, q) => s + q.score, 0) / completedQuizzes.length)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
                <Sparkles size={18} className="text-white"/>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Generate a Quiz</h2>
                <p className="text-xs text-slate-400">Pick a ready document</p>
              </div>
            </div>
            {docs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No ready documents found.</p>
                <Link to="/documents" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  Upload a document <ArrowRight size={13}/>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {docs.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => handleGenerate(doc._id)}
                    disabled={!!generating}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group text-left disabled:opacity-60"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                      {generating === doc._id
                        ? <Loader2 size={14} className="text-white animate-spin"/>
                        : <FileText size={14} className="text-white"/>
                      }
                    </div>
                    <p className="flex-1 text-sm font-medium text-slate-700 truncate group-hover:text-emerald-700 transition-colors">{doc.title}</p>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0"/>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowGenModal(false)}
              className="mt-4 w-full h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Quizzes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} · {completedQuizzes.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/25"
        >
          <Plus size={16}/>Generate Quiz
        </button>
      </div>

      {/* Stats */}
      {quizzes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Quizzes',  value: quizzes.length,          icon: BrainCircuit, cls: 'from-emerald-400 to-teal-500' },
            { label: 'Completed',      value: completedQuizzes.length,  icon: CheckCircle2, cls: 'from-blue-400 to-indigo-500' },
            { label: 'Average Score',  value: avgScore != null ? `${avgScore}%` : '—', icon: Trophy, cls: 'from-amber-400 to-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.cls} flex items-center justify-center shadow-md`}>
                <s.icon size={15} className="text-white"/>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner/></div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <BrainCircuit size={28} className="text-emerald-300"/>
          </div>
          <p className="text-base font-semibold text-slate-500">No quizzes yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">
            Generate a quiz from any of your ready documents to test your knowledge
          </p>
          <button
            onClick={() => setShowGenModal(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <Sparkles size={15}/>Generate Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => {
            const isCompleted = !!quiz.completedAt;
            const score = quiz.score || 0;
            const scoreColor = score >= 80 ? 'from-emerald-400 to-teal-500'
              : score >= 60 ? 'from-amber-400 to-orange-500'
              : 'from-red-400 to-rose-500';

            return (
              <div
                key={quiz._id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4"
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${isCompleted ? scoreColor : 'from-emerald-400 to-teal-500'} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      <BrainCircuit size={18} className="text-white"/>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                        {quiz.title || quiz._docTitle || 'Quiz'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <FileText size={10}/>{quiz._docTitle || '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={e => handleDelete(quiz._id, e)}
                    disabled={deleting === quiz._id}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    {deleting === quiz._id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                  </button>
                </div>

                {/* Info row */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><BarChart3 size={12}/>{quiz.totalQuestions} questions</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12}/>{moment(quiz.createdAt).fromNow()}
                  </span>
                  <span className="ml-auto"><ScoreBadge score={score} completed={isCompleted}/></span>
                </div>

                {/* Score bar (if completed) */}
                {isCompleted && (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                      <span>Score</span><span className="font-semibold">{score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreColor} rounded-full`}
                        style={{ width: `${score}%`, transition: 'width 1s ease' }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex gap-2 pt-1">
                  {isCompleted ? (
                    <>
                      <Link
                        to={`/quizzes/${quiz._id}/results`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
                      >
                        <Trophy size={12}/>View Results
                      </Link>
                      <button
                        onClick={() => handleGenerate(quiz.documentId?._id || quiz.documentId)}
                        disabled={!!generating}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-60"
                      >
                        <RefreshCw size={12}/>Retake
                      </button>
                    </>
                  ) : (
                    <Link
                      to={`/quizzes/${quiz._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/25"
                    >
                      <BrainCircuit size={12}/>Start Quiz <ChevronRight size={12}/>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizListPage;
