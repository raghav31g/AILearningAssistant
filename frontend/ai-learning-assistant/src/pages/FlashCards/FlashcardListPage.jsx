import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import flashcardService from '../../services/flashcardService';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import moment from 'moment';
import {
  BookOpen, Star, Trash2, Loader2, ArrowRight, ChevronRight,
  BookMarked, Clock, RotateCw, Sparkles,
} from 'lucide-react';

const DifficultyPill = ({ difficulty }) => {
  const map = {
    easy:   'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard:   'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[difficulty] || 'bg-slate-100 text-slate-500'}`}>
      {difficulty}
    </span>
  );
};

const FlashcardListPage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await flashcardService.getAllFlashcardSets();
        setSets(res?.data || []);
      } catch {
        toast.error('Failed to load flashcard sets');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this flashcard set?')) return;
    setDeleting(id);
    try {
      await flashcardService.deleteFlashcardSet(id);
      toast.success('Flashcard set deleted');
      setSets(prev => prev.filter(s => s._id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const totalCards = sets.reduce((sum, s) => sum + (s.cards?.length || 0), 0);
  const starredCards = sets.reduce((sum, s) => sum + (s.cards?.filter(c => c.isStarred)?.length || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Flashcard Sets</h1>
          <p className="text-sm text-slate-400 mt-0.5">{sets.length} sets · {totalCards} cards · {starredCards} starred</p>
        </div>
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all shadow-md shadow-violet-500/25"
        >
          <Sparkles size={15}/>Generate New
        </Link>
      </div>

      {/* Summary cards */}
      {sets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Sets',  value: sets.length,   cls: 'from-violet-400 to-purple-500' },
            { label: 'Total Cards', value: totalCards,     cls: 'from-blue-400 to-indigo-500' },
            { label: 'Starred',     value: starredCards,   cls: 'from-amber-400 to-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.cls} flex items-center justify-center shadow-md`}>
                <BookOpen size={15} className="text-white"/>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner/></div>
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <BookMarked size={28} className="text-violet-300"/>
          </div>
          <p className="text-base font-semibold text-slate-500">No flashcard sets yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">Upload a document and generate flashcards to start studying</p>
          <Link
            to="/documents"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-purple-600 transition-all"
          >
            <Sparkles size={15}/>Generate Flashcards
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sets.map(set => {
            const total    = set.cards?.length || 0;
            const reviewed = set.cards?.filter(c => c.reviewCount > 0)?.length || 0;
            const starred  = set.cards?.filter(c => c.isStarred)?.length || 0;
            const pct      = total > 0 ? Math.round((reviewed / total) * 100) : 0;

            return (
              <Link
                key={set._id}
                to={`/documents/${set.documentId?._id || set.documentId}/flashcards`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-violet-200 transition-all duration-200 p-5 flex flex-col gap-4"
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <BookOpen size={18} className="text-white"/>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-violet-700 transition-colors line-clamp-2">
                        {set.documentId?.title || 'Flashcard Set'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10}/>{moment(set.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={e => handleDelete(set._id, e)}
                    disabled={deleting === set._id}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    {deleting === set._id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                  </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen size={12}/>{total} cards</span>
                  <span className="flex items-center gap-1"><RotateCw size={12}/>{reviewed} reviewed</span>
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-400"/>{starred} starred</span>
                </div>

                {/* Difficulty breakdown */}
                <div className="flex gap-1.5 flex-wrap">
                  {['easy','medium','hard'].map(d => {
                    const count = set.cards?.filter(c => c.difficulty === d)?.length || 0;
                    if (!count) return null;
                    return <DifficultyPill key={d} difficulty={d}/>;
                  })}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                    <span>Progress</span><span>{pct}% reviewed</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}/>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Study now <ChevronRight size={13}/>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardListPage;
