import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import {
  Trophy, CheckCircle2, XCircle, ArrowLeft, RotateCcw,
  ChevronDown, ChevronUp, BookOpen, BrainCircuit, Sparkles,
} from 'lucide-react';

const ScoreRing = ({ score }) => {
  const r = 54, stroke = 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={128} height={128} className="-rotate-90">
        <circle cx={64} cy={64} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke}/>
        <circle cx={64} cy={64} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}/>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-800">{score}%</span>
        <span className="text-xs text-slate-400 font-medium">Score</span>
      </div>
    </div>
  );
};

const QuizResultPage = () => {
  const { QuizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await quizService.getQuizResults(QuizId);
        setResults(res.data);
      } catch {
        toast.error('Failed to load results');
        navigate('/documents');
      } finally { setLoading(false); }
    };
    fetch();
  }, [QuizId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner/></div>;
  if (!results) return null;

  const { quiz, results: qResults } = results;
  const correct = qResults.filter(r => r.isCorrect).length;
  const wrong   = qResults.filter(r => !r.isCorrect).length;
  const score   = quiz.score || 0;
  const grade   = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const emoji   = score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪';
  const msg     = score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good effort!' : 'Keep practising!';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Back */}
      <button onClick={() => navigate('/documents')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={15}/> Back to Documents
      </button>

      {/* Score Hero */}
      <div className={`relative overflow-hidden rounded-3xl p-7 text-center shadow-xl ${
        score >= 80 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
        : score >= 60 ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20'
        : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/20'
      }`}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10"/>
        <div className="absolute -left-4 -bottom-10 w-32 h-32 rounded-full bg-white/5"/>
        <div className="relative">
          <div className="text-4xl mb-2">{emoji}</div>
          <h2 className="text-xl font-bold text-white mb-1">{msg}</h2>
          <p className="text-white/70 text-sm">{quiz.document?.title || 'Quiz'}</p>
          <div className="flex justify-center mt-5 mb-3">
            <div className="bg-white/20 rounded-3xl p-4 backdrop-blur-sm">
              <ScoreRing score={score}/>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{grade}</p>
              <p className="text-xs text-white/70">Grade</p>
            </div>
            <div className="w-px h-10 bg-white/20 my-auto"/>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{correct}</p>
              <p className="text-xs text-white/70">Correct</p>
            </div>
            <div className="w-px h-10 bg-white/20 my-auto"/>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{wrong}</p>
              <p className="text-xs text-white/70">Wrong</p>
            </div>
            <div className="w-px h-10 bg-white/20 my-auto"/>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{quiz.totalQuestions}</p>
              <p className="text-xs text-white/70">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Integrity Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            (quiz.tabSwitches || 0) === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <BrainCircuit size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {(quiz.tabSwitches || 0) === 0 ? '🛡️ Clean Proctored Session' : '⚠️ Proctoring Notice'}
            </h4>
            <p className="text-xs text-slate-400">
              {(quiz.tabSwitches || 0) === 0
                ? 'No tab switches detected during this assessment.'
                : `${quiz.tabSwitches} tab switch violation(s) recorded during exam.`}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          (quiz.tabSwitches || 0) === 0
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          {quiz.tabSwitches || 0} Tab Switches
        </span>
      </div>

      {/* CTA */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/documents" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <BookOpen size={15}/>My Documents
        </Link>
        <Link to="/flashcards" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-purple-600 transition-all">
          <Sparkles size={15}/>Study Flashcards
        </Link>
      </div>

      {/* Detailed Results */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <BrainCircuit size={15} className="text-emerald-500"/>Question Review
        </h3>
        {qResults.map((r, i) => (
          <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${r.isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
            {/* Row header */}
            <button
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                r.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
              }`}>{i+1}</span>
              <p className="flex-1 text-sm font-medium text-slate-700 text-left line-clamp-1">{r.question}</p>
              {r.isCorrect
                ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>
                : <XCircle size={16} className="text-red-500 shrink-0"/>
              }
              {expanded === i ? <ChevronUp size={14} className="text-slate-400 shrink-0"/> : <ChevronDown size={14} className="text-slate-400 shrink-0"/>}
            </button>

            {/* Expanded */}
            {expanded === i && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                <p className="text-sm text-slate-700 font-medium">{r.question}</p>
                <div className="space-y-2">
                  {r.options.map((opt, j) => {
                    const isCorrect  = opt === r.correctAnswer;
                    const isSelected = opt === r.selectedAnswer;
                    return (
                      <div key={j} className={`flex items-center gap-2.5 p-3 rounded-xl text-sm ${
                        isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : isSelected && !isCorrect ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-slate-50 border border-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>{['A','B','C','D'][j]}</span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle2 size={14} className="text-emerald-600 shrink-0"/>}
                        {isSelected && !isCorrect && <XCircle size={14} className="text-red-500 shrink-0"/>}
                      </div>
                    );
                  })}
                </div>
                {r.explanation && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                    <p className="text-xs text-blue-600 leading-relaxed">{r.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultPage;
