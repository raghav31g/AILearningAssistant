import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcardService';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import {
  ArrowLeft, Star, RotateCcw, ChevronLeft, ChevronRight,
  BookOpen, CheckCircle2, Eye, EyeOff, Shuffle,
} from 'lucide-react';

const FlashcardPage = () => {
  const { id } = useParams(); // documentId
  const navigate = useNavigate();
  const [cards, setCards]   = useState([]);
  const [setInfo, setSetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped]  = useState(false);
  const [filter, setFilter]    = useState('all'); // all | starred | unreviewed

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await flashcardService.getFlashcardsForDocument(id);
        const sets = res?.data || [];
        if (!sets.length) { toast.error('No flashcards found'); navigate('/flashcards'); return; }
        const set = sets[0];
        setSetInfo(set);
        setCards(set.cards || []);
      } catch {
        toast.error('Failed to load flashcards');
        navigate('/flashcards');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const filtered = cards.filter(c => {
    if (filter === 'starred')    return c.isStarred;
    if (filter === 'unreviewed') return c.reviewCount === 0;
    return true;
  });

  const card = filtered[current];

  const goNext = () => { setFlipped(false); setTimeout(() => setCurrent(i => Math.min(i+1, filtered.length-1)), 100); };
  const goPrev = () => { setFlipped(false); setTimeout(() => setCurrent(i => Math.max(i-1, 0)), 100); };

  const handleReview = async () => {
    if (!card) return;
    try {
      await flashcardService.reviewFlashcard(card._id);
      setCards(prev => prev.map(c => c._id === card._id ? {...c, reviewCount: c.reviewCount + 1, lastReviewed: new Date()} : c));
      toast.success('Marked as reviewed!');
      if (current < filtered.length - 1) goNext();
    } catch { toast.error('Failed to mark review'); }
  };

  const handleStar = async (e) => {
    e.stopPropagation();
    if (!card) return;
    try {
      await flashcardService.toggleStar(card._id);
      setCards(prev => prev.map(c => c._id === card._id ? {...c, isStarred: !c.isStarred} : c));
    } catch { toast.error('Failed to toggle star'); }
  };

  const handleShuffle = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0); setFlipped(false);
    toast.success('Cards shuffled!');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner/></div>;

  const reviewed  = cards.filter(c => c.reviewCount > 0).length;
  const progress  = cards.length > 0 ? Math.round((reviewed / cards.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Back */}
      <button onClick={() => navigate('/flashcards')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={15}/> Back to Flashcards
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-base font-bold text-slate-800">{setInfo?.documentId?.title || 'Flashcard Study'}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{reviewed}/{cards.length} reviewed · {progress}% complete</p>
          </div>
          <button onClick={handleShuffle} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <Shuffle size={13}/>Shuffle
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['all','All Cards'],['starred','Starred'],['unreviewed','Not Reviewed']].map(([val, lbl]) => (
          <button
            key={val} onClick={() => { setFilter(val); setCurrent(0); setFlipped(false); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === val ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25' : 'bg-white text-slate-500 border border-slate-200 hover:border-violet-300'}`}
          >
            {lbl} {val === 'all' ? `(${cards.length})` : val === 'starred' ? `(${cards.filter(c=>c.isStarred).length})` : `(${cards.filter(c=>c.reviewCount===0).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <BookOpen size={32} className="text-slate-300 mb-3"/>
          <p className="text-sm font-semibold text-slate-500">No cards in this filter</p>
        </div>
      ) : (
        <>
          {/* Counter */}
          <p className="text-center text-sm font-semibold text-slate-400">{current + 1} / {filtered.length}</p>

          {/* Flip Card */}
          <div
            className="relative cursor-pointer select-none"
            style={{ perspective: '1200px', height: '280px' }}
            onClick={() => setFlipped(f => !f)}
          >
            <div
              className="absolute inset-0 transition-transform duration-500"
              style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-white border border-slate-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 gap-4"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center"><BookOpen size={14} className="text-violet-600"/></div>
                  <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Question</span>
                </div>
                <p className="text-center text-slate-800 font-semibold text-lg leading-snug">{card.question}</p>
                <div className="flex items-center gap-2 mt-4 text-slate-400">
                  <Eye size={14}/><span className="text-xs">Tap to reveal answer</span>
                </div>
                {card.difficulty && (
                  <span className={`absolute top-4 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold ${card.difficulty==='easy'?'bg-emerald-100 text-emerald-700':card.difficulty==='hard'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-700'}`}>
                    {card.difficulty}
                  </span>
                )}
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 gap-4"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center"><EyeOff size={14} className="text-white"/></div>
                  <span className="text-xs font-semibold text-violet-200 uppercase tracking-wide">Answer</span>
                </div>
                <p className="text-center text-white font-semibold text-lg leading-snug">{card.answer}</p>
                <div className="flex items-center gap-2 mt-4 text-violet-200">
                  <RotateCcw size={14}/><span className="text-xs">Tap to flip back</span>
                </div>
                {card.reviewCount > 0 && (
                  <span className="absolute top-4 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    Reviewed {card.reviewCount}×
                  </span>
                )}
              </div>
            </div>

            {/* Star button overlay */}
            <button
              onClick={handleStar}
              className={`absolute top-4 right-4 z-10 p-2 rounded-xl transition-all ${card.isStarred ? 'text-amber-500 bg-amber-50' : 'text-slate-300 bg-white hover:text-amber-400 hover:bg-amber-50'}`}
            >
              <Star size={16} fill={card.isStarred ? 'currentColor' : 'none'}/>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={goPrev} disabled={current === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16}/>Prev
            </button>

            <button
              onClick={handleReview}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/25"
            >
              <CheckCircle2 size={15}/>Got it!
            </button>

            <button
              onClick={goNext} disabled={current === filtered.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next<ChevronRight size={16}/>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlashcardPage;
