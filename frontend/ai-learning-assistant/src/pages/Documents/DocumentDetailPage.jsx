import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import moment from 'moment';
import {
  FileText, BookOpen, BrainCircuit, Sparkles, MessageSquare,
  Send, Loader2, ArrowLeft, ChevronRight, CheckCircle2,
  AlertCircle, HardDrive, Clock, FileSearch, X,
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'chat',     label: 'AI Chat',  icon: MessageSquare },
  { id: 'summary',  label: 'Summary',  icon: FileSearch },
];

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // AI states
  const [generating, setGenerating] = useState('');
  const [summary, setSummary] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await documentService.getDocumentById(id);
        setDoc(res.data);
      } catch {
        toast.error('Document not found');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadChatHistory = async () => {
    if (historyLoaded) return;
    try {
      const res = await aiService.getChatHistory(id);
      if (res?.data) setChatMessages(res.data.map(m => ({ role: m.role, content: m.content })));
    } catch {}
    setHistoryLoaded(true);
  };

  const handleTabChange = (t) => {
    setActiveTab(t);
    if (t === 'chat') loadChatHistory();
  };

  const handleGenerateFlashcards = async () => {
    if (doc.status !== 'ready') return toast.error('Document is still processing');
    setGenerating('flashcards');
    try {
      await aiService.generateFlashcards(id, { count: 10 });
      toast.success('Flashcards generated!');
      navigate(`/documents/${id}/flashcards`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate flashcards');
    } finally { setGenerating(''); }
  };

  const handleGenerateQuiz = async () => {
    if (doc.status !== 'ready') return toast.error('Document is still processing');
    setGenerating('quiz');
    try {
      const res = await aiService.generateQuiz(id, { numQuestions: 5 });
      toast.success('Quiz generated!');
      navigate(`/quizzes/${res.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally { setGenerating(''); }
  };

  const handleGenerateSummary = async () => {
    if (doc.status !== 'ready') return toast.error('Document is still processing');
    if (summary) return;
    setGenerating('summary');
    try {
      const res = await aiService.generateSummary(id);
      setSummary(res?.summary || '');
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate summary');
    } finally { setGenerating(''); }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    if (doc.status !== 'ready') return toast.error('Document is still processing');
    const question = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);
    try {
      const res = await aiService.chat(id, question);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data?.answer || 'No response' }]);
    } catch (err) {
      toast.error(err.message || 'Chat failed');
    } finally { setChatLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner/></div>;
  if (!doc) return null;

  const isReady = doc.status === 'ready';

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* Back */}
      <button onClick={() => navigate('/documents')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={15}/> Back to Documents
      </button>

      {/* Doc Hero */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <FileText size={24} className="text-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">{doc.title}</h1>
                <p className="text-sm text-slate-400 mt-0.5">{doc.fileName}</p>
              </div>
              <StatusBadge status={doc.status}/>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><HardDrive size={12}/>{(doc.fileSize/1024/1024).toFixed(2)} MB</span>
              <span className="flex items-center gap-1.5"><BookOpen size={12}/>{doc.flashcardCount} flashcard sets</span>
              <span className="flex items-center gap-1.5"><BrainCircuit size={12}/>{doc.quizCount} quizzes</span>
              <span className="flex items-center gap-1.5"><Clock size={12}/>{moment(doc.uploadDate || doc.createdAt).format('MMM D, YYYY')}</span>
            </div>
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <AIActionBtn
            icon={BookOpen} label="Generate Flashcards" desc="Create study cards with AI"
            gradient="from-violet-400 to-purple-500" shadow="shadow-violet-500/25"
            loading={generating === 'flashcards'} disabled={!isReady || !!generating}
            onClick={handleGenerateFlashcards}
          />
          <AIActionBtn
            icon={BrainCircuit} label="Generate Quiz" desc="Test your knowledge"
            gradient="from-emerald-400 to-teal-500" shadow="shadow-emerald-500/25"
            loading={generating === 'quiz'} disabled={!isReady || !!generating}
            onClick={handleGenerateQuiz}
          />
          <AIActionBtn
            icon={FileSearch} label="Generate Summary" desc="Get a concise overview"
            gradient="from-amber-400 to-orange-500" shadow="shadow-amber-500/25"
            loading={generating === 'summary'} disabled={!isReady || !!generating}
            onClick={() => { handleTabChange('summary'); handleGenerateSummary(); }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-4">
          {tabs.map(({ id: t, label, icon: Icon }) => (
            <button
              key={t} onClick={() => handleTabChange(t)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px
                ${activeTab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Status" value={<StatusBadge status={doc.status}/>}/>
                <InfoRow label="Uploaded" value={moment(doc.uploadDate || doc.createdAt).format('MMMM D, YYYY')}/>
                <InfoRow label="Last Accessed" value={doc.lastAccessed ? moment(doc.lastAccessed).fromNow() : 'Never'}/>
                <InfoRow label="File Size" value={`${(doc.fileSize/1024/1024).toFixed(2)} MB`}/>
                <InfoRow label="Flashcard Sets" value={`${doc.flashcardCount} sets`}/>
                <InfoRow label="Quizzes" value={`${doc.quizCount} quizzes`}/>
              </div>
              {doc.flashcardCount > 0 && (
                <Link to={`/documents/${id}/flashcards`} className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-violet-50 text-violet-700 text-sm font-semibold rounded-xl hover:bg-violet-100 transition-colors border border-violet-200">
                  <BookOpen size={14}/> View Flashcards <ChevronRight size={13}/>
                </Link>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-4" style={{ height: '420px' }}>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                      <MessageSquare size={24} className="text-emerald-400"/>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Ask anything about this document</p>
                    <p className="text-xs text-slate-400 mt-1">Powered by Gemini AI</p>
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-md'
                      : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-md'
                    }`}>
                      {m.role === 'assistant'
                        ? <div className="prose prose-sm max-w-none prose-slate">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                        : m.content
                      }
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                      </div>
                      <span className="text-xs text-slate-400">Thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <form onSubmit={handleChat} className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder={isReady ? "Ask a question about this document…" : "Document is still processing…"}
                  disabled={!isReady || chatLoading}
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors disabled:opacity-60"
                />
                <button
                  type="submit" disabled={!chatInput.trim() || chatLoading || !isReady}
                  className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  <Send size={15}/>
                </button>
              </form>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="min-h-48">
              {generating === 'summary' ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Sparkles size={22} className="text-amber-500 animate-pulse"/>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Generating summary…</p>
                  <p className="text-xs text-slate-400">This may take a moment</p>
                </div>
              ) : summary ? (
                <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <FileSearch size={22} className="text-amber-400"/>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No summary yet</p>
                  <button
                    onClick={handleGenerateSummary} disabled={!isReady}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-500/25 hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={14}/>Generate Summary
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    ready:      { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12}/>, label: 'Ready' },
    processing: { cls: 'bg-amber-100 text-amber-700 border-amber-200',       icon: <Loader2 size={12} className="animate-spin"/>, label: 'Processing' },
    failed:     { cls: 'bg-red-100 text-red-600 border-red-200',             icon: <AlertCircle size={12}/>, label: 'Failed' },
  };
  const s = map[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl px-4 py-3">
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <div className="text-sm font-semibold text-slate-700">{value}</div>
  </div>
);

const AIActionBtn = ({ icon: Icon, label, desc, gradient, shadow, loading, disabled, onClick }) => (
  <button
    onClick={onClick} disabled={disabled}
    className={`flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}
  >
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${shadow} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
      {loading ? <Loader2 size={16} className="text-white animate-spin"/> : <Icon size={16} className="text-white"/>}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-[11px] text-slate-400">{desc}</p>
    </div>
  </button>
);

export default DocumentDetailPage;