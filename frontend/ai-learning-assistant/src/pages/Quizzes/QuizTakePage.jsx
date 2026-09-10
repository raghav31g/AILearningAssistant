import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import {
  ArrowLeft,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Camera,
  CameraOff,
  ShieldAlert,
  ShieldCheck,
  Maximize,
  Minimize,
  Eye,
  AlertOctagon,
} from 'lucide-react';

const MAX_TAB_SWITCHES = 3;

const QuizTakePage = () => {
  const { QuizId } = useParams();
  const navigate = useNavigate();

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Proctored Mode state: Camera
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraCollapsed, setCameraCollapsed] = useState(false);

  // Proctored Mode state: Tab Switch Detection
  const [tabSwitches, setTabSwitches] = useState(0);
  const [tabSwitchLogs, setTabSwitchLogs] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ref to prevent double-counting rapid blur/visibility events
  const lastBlurTimeRef = useRef(0);

  // 1. Fetch Quiz
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await quizService.getQuizById(QuizId);
        setQuiz(res.data);
      } catch {
        toast.error('Quiz not found');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [QuizId]);

  // 2. Timer
  useEffect(() => {
    if (!quiz) return;
    const t = setInterval(() => setTimeElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [quiz]);

  // 3. Initialize Camera (Webcam Proctoring)
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setCameraError(null);
      } else {
        setCameraError('Camera API not supported on this browser');
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access required for proctored mode');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();

    // Clean up camera stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update video element when stream is active
  useEffect(() => {
    if (videoRef.current && streamRef.current && cameraActive) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive, cameraCollapsed]);

  // 4. Tab Switch & Window Blur Detection
  useEffect(() => {
    if (!quiz) return;

    const handleViolation = (reason) => {
      const now = Date.now();
      // Debounce: ignore triggers within 1.5 seconds of each other
      if (now - lastBlurTimeRef.current < 1500) return;
      lastBlurTimeRef.current = now;

      setTabSwitches((prevCount) => {
        const newCount = prevCount + 1;
        const newLog = {
          timestamp: new Date(),
          message: `${reason} (#${newCount})`,
        };
        setTabSwitchLogs((prevLogs) => [...prevLogs, newLog]);

        if (newCount >= MAX_TAB_SWITCHES) {
          // Auto submit immediately when max violations reached
          toast.error(
            '⚠️ Maximum tab switch limit reached (3/3). Auto-submitting quiz now!'
          );
          triggerSubmit(answers, newCount, [...tabSwitchLogs, newLog]);
        } else {
          setShowWarningModal(true);
        }

        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab switch detected (page hidden)');
      }
    };

    const handleWindowBlur = () => {
      handleViolation('Window focus lost (switched app/tab)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [quiz, answers, tabSwitchLogs]);

  // 5. Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const q = quiz?.questions?.[current];
  const answered = Object.keys(answers).length;
  const total = quiz?.questions?.length || 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  };

  const triggerSubmit = async (finalAnswers, currentTabSwitches = tabSwitches, currentLogs = tabSwitchLogs) => {
    setSubmitting(true);
    try {
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const payload = quiz.questions
        .map((_, i) => ({
          questionIndex: i,
          selectedAnswer: finalAnswers[i] || '',
        }))
        .filter((a) => a.selectedAnswer);

      await quizService.submitQuiz(QuizId, payload, currentTabSwitches, currentLogs);
      toast.success('Quiz submitted successfully!');
      navigate(`/quizzes/${QuizId}/results`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (answered < total) {
      const unanswered = total - answered;
      if (
        !confirm(
          `You have ${unanswered} unanswered question${
            unanswered > 1 ? 's' : ''
          }. Submit anyway?`
        )
      )
        return;
    }
    triggerSubmit(answers);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  if (!quiz) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16 relative">
      {/* Tab Switch Security Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertOctagon size={36} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-700 border border-red-200 mb-2">
              Proctoring Violation
            </span>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Tab Switch Detected!
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              You navigated away from the exam window. This quiz is in{' '}
              <strong>Proctored Mode</strong> and all tab switches are recorded.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-800">
                  Tab Switch Warnings:
                </span>
                <span className="text-sm font-bold text-red-600">
                  {tabSwitches} / {MAX_TAB_SWITCHES}
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(tabSwitches / MAX_TAB_SWITCHES) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-red-700 mt-2 font-medium">
                {MAX_TAB_SWITCHES - tabSwitches === 1
                  ? '⚠️ FINAL WARNING: Next tab switch will immediately auto-submit your quiz!'
                  : `${MAX_TAB_SWITCHES - tabSwitches} more violation(s) will cause automatic submission.`}
              </p>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              I Understand, Resume Quiz
            </button>
          </div>
        </div>
      )}

      {/* Floating / Docked Live Camera Feed */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        <div
          className={`bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-3 text-white transition-all duration-300 ${
            cameraCollapsed ? 'w-48' : 'w-56'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
                Proctoring
              </span>
            </div>
            <button
              onClick={() => setCameraCollapsed(!cameraCollapsed)}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
            >
              {cameraCollapsed ? 'Expand' : 'Minimize'}
            </button>
          </div>

          {!cameraCollapsed && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-3 text-slate-400">
                  <CameraOff size={24} className="mx-auto mb-1 text-slate-500" />
                  <p className="text-[10px] leading-tight">
                    {cameraError || 'Camera Starting…'}
                  </p>
                  {cameraError && (
                    <button
                      onClick={startCamera}
                      className="mt-2 text-[10px] bg-emerald-600 text-white px-2 py-1 rounded"
                    >
                      Retry Camera
                    </button>
                  )}
                </div>
              )}
              {cameraActive && (
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-medium text-emerald-300">
                  <Eye size={10} /> Live Monitoring
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Controls & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (
              confirm(
                'Are you sure you want to exit? Your progress will not be saved.'
              )
            ) {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
              }
              navigate('/quizzes');
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} /> Exit Quiz
        </button>

        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
        </button>
      </div>

      {/* Proctored Security Status Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Proctored Mode Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Webcam monitoring active &bull; Tab switching is restricted
            </p>
          </div>
        </div>

        {/* Tab switch counter indicator */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
          <AlertTriangle
            size={14}
            className={tabSwitches > 0 ? 'text-amber-400' : 'text-slate-400'}
          />
          <span className="text-xs text-slate-200 font-medium">Tab Switches:</span>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              tabSwitches === 0
                ? 'bg-emerald-500/30 text-emerald-300'
                : tabSwitches === 1
                ? 'bg-amber-500/30 text-amber-300'
                : 'bg-red-500/30 text-red-300'
            }`}
          >
            {tabSwitches} / {MAX_TAB_SWITCHES}
          </span>
        </div>
      </div>

      {/* Quiz Progress & Timer Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">
                {quiz.title || 'Quiz Assessment'}
              </h1>
              <p className="text-xs text-slate-400">
                {answered}/{total} answered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-sm font-mono font-semibold text-slate-600 border border-slate-100">
            <Clock size={14} className="text-emerald-500" />
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                i === current
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : answers[i]
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      {q && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-emerald-500/20">
              {current + 1}
            </span>
            <p className="text-slate-800 font-semibold text-base leading-relaxed pt-1">
              {q.question}
            </p>
          </div>

          {q.difficulty && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                q.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-700'
                  : q.difficulty === 'hard'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {q.difficulty}
            </span>
          )}

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const selected = answers[current] === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                    selected
                      ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-500/10'
                      : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      selected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {letter}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      selected ? 'text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    {opt}
                  </span>
                  {selected && (
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 ml-auto shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation & Submit Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrent((i) => Math.max(i - 1, 0))}
          disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {current < total - 1 ? (
          <button
            onClick={() => setCurrent((i) => i + 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
          >
            <Trophy size={15} />
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTakePage;
