import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  ArrowRight,
  Upload,
  Plus,
  TrendingUp,
  Clock,
  BarChart3,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, gradient, shadowColor, sub, subIcon: SubIcon }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group`}>
    {/* Subtle gradient blob */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${gradient}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800 leading-tight">{value ?? 0}</p>
        {sub && (
          <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
            {SubIcon && <SubIcon size={11} className="text-emerald-500" />}
            {sub}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={20} className="text-white" strokeWidth={2} />
      </div>
    </div>
  </div>
);

// ─── Quick Action Card ───────────────────────────────────────────────────────
const QuickAction = ({ to, icon: Icon, label, desc, gradient, shadowColor }) => (
  <Link
    to={to}
    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
  >
    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md ${shadowColor} group-hover:scale-105 transition-transform duration-200`}>
      <Icon size={18} className="text-white" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
  </Link>
);

// ─── Score Badge ─────────────────────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  const color =
    score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                  'text-red-600 bg-red-50 border-red-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score}%
    </span>
  );
};

// ─── Circular Progress ───────────────────────────────────────────────────────
const CircularProgress = ({ value, size = 64, stroke = 6, color = '#10b981' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.data?.overview || {};
  const recentActivity = dashboardData?.data?.recentActivity || {};
  const recentDocuments = recentActivity.documents || [];
  const recentQuizzes = recentActivity.quizzes || [];

  const reviewedPct = overview.totalFlashcards > 0
    ? Math.round((overview.reviewedFlashcards / overview.totalFlashcards) * 100)
    : 0;
  const completedPct = overview.totalQuizzes > 0
    ? Math.round((overview.completedQuizzes / overview.totalQuizzes) * 100)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 md:p-8 shadow-xl shadow-emerald-500/20">
        {/* Decorative circles */}
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -right-4 -bottom-16 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute right-32 top-4 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full mb-3">
              <Flame size={13} className="text-orange-300" />
              <span className="text-xs font-semibold text-white/90">{overview.studyStreak || 1} day streak 🔥</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {greeting()}, {user?.username?.split(' ')[0] || 'Learner'}! 👋
            </h1>
            <p className="text-white/70 text-sm">
              You have <strong className="text-white">{overview.totalDocuments || 0} documents</strong> ready to explore. Keep learning!
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <Upload size={15} />
              Upload Doc
            </Link>
            <Link
              to="/flashcards"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/20"
            >
              <Zap size={15} />
              Study Now
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Documents"
          value={overview.totalDocuments}
          icon={FileText}
          gradient="from-blue-400 to-indigo-500"
          shadowColor="shadow-blue-500/30"
          sub="Total uploaded"
          subIcon={TrendingUp}
        />
        <StatCard
          title="Flashcards"
          value={overview.totalFlashcards}
          icon={BookOpen}
          gradient="from-violet-400 to-purple-500"
          shadowColor="shadow-violet-500/30"
          sub={`${overview.starredFlashcards || 0} starred`}
          subIcon={Star}
        />
        <StatCard
          title="Quizzes"
          value={overview.totalQuizzes}
          icon={BrainCircuit}
          gradient="from-emerald-400 to-teal-500"
          shadowColor="shadow-emerald-500/30"
          sub={`${overview.completedQuizzes || 0} completed`}
          subIcon={CheckCircle2}
        />
        <StatCard
          title="Avg Score"
          value={overview.averageScore != null ? `${overview.averageScore}%` : 'N/A'}
          icon={Trophy}
          gradient="from-amber-400 to-orange-500"
          shadowColor="shadow-amber-500/30"
          sub="Quiz performance"
          subIcon={BarChart3}
        />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Progress Rings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
            <BarChart3 size={15} className="text-emerald-500" />
            Learning Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Flashcard review */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <CircularProgress value={reviewedPct} size={72} stroke={7} color="#8b5cf6" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                  {reviewedPct}%
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-600">Reviewed</p>
                <p className="text-[10px] text-slate-400">
                  {overview.reviewedFlashcards || 0}/{overview.totalFlashcards || 0} cards
                </p>
              </div>
            </div>
            {/* Quiz completion */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <CircularProgress value={completedPct} size={72} stroke={7} color="#10b981" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                  {completedPct}%
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-600">Quizzes</p>
                <p className="text-[10px] text-slate-400">
                  {overview.completedQuizzes || 0}/{overview.totalQuizzes || 0} done
                </p>
              </div>
            </div>
          </div>

          {/* Streak bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Flame size={12} className="text-orange-400" /> Study Streak
              </span>
              <span className="text-xs font-bold text-orange-500">{overview.studyStreak || 1} days</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    i < (overview.studyStreak || 1)
                      ? 'bg-gradient-to-r from-orange-400 to-amber-400'
                      : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-400">Mon</span>
              <span className="text-[9px] text-slate-400">Sun</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Zap size={15} className="text-amber-500" />
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <QuickAction
              to="/documents"
              icon={Upload}
              label="Upload Document"
              desc="Add a PDF to study from"
              gradient="from-blue-400 to-indigo-500"
              shadowColor="shadow-blue-500/25"
            />
            <QuickAction
              to="/flashcards"
              icon={BookOpen}
              label="Study Flashcards"
              desc="Review your card decks"
              gradient="from-violet-400 to-purple-500"
              shadowColor="shadow-violet-500/25"
            />
            <QuickAction
              to="/documents"
              icon={Plus}
              label="Take a Quiz"
              desc="Test your knowledge"
              gradient="from-emerald-400 to-teal-500"
              shadowColor="shadow-emerald-500/25"
            />
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              Recent Quizzes
            </h2>
            <Link
              to="/documents"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentQuizzes.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="No quizzes yet"
              desc="Complete a quiz to see your results here"
            />
          ) : (
            <div className="space-y-2">
              {recentQuizzes.slice(0, 4).map((quiz, idx) => (
                <div
                  key={quiz._id || idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
                    <Trophy size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {quiz.documentId?.title || 'Quiz'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={9} />
                      {quiz.completedAt
                        ? moment(quiz.completedAt).fromNow()
                        : 'In progress'}
                    </p>
                  </div>
                  <ScoreBadge score={quiz.score || 0} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Documents ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={15} className="text-blue-500" />
            Recent Documents
          </h2>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            desc="Upload your first PDF to get started with AI-powered learning"
            actionTo="/documents"
            actionLabel="Upload Document"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentDocuments.map((doc, idx) => (
              <Link
                key={doc._id || idx}
                to={`/documents/${doc._id}`}
                className="group flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <FileText size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-700 transition-colors">
                    {doc.title || doc.fileName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {doc.lastAccessed
                      ? moment(doc.lastAccessed).fromNow()
                      : 'Recently added'}
                  </p>
                  <div className="mt-2">
                    <StatusPill status={doc.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    ready:      'bg-emerald-100 text-emerald-700',
    processing: 'bg-amber-100 text-amber-700',
    failed:     'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status === 'ready' && '✓ '}
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, desc, actionTo, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
      <Icon size={24} className="text-slate-300" />
    </div>
    <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
    <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">{desc}</p>
    {actionTo && (
      <Link
        to={actionTo}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md shadow-emerald-500/25"
      >
        <Plus size={13} />
        {actionLabel}
      </Link>
    )}
  </div>
);

export default DashboardPage;
