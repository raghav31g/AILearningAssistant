import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import moment from 'moment';
import Spinner from '../../components/common/Spinner';
import {
  FileText, Upload, Search, Trash2, BookOpen, BrainCircuit,
  Clock, HardDrive, Plus, X, File, AlertCircle, CheckCircle2,
  Loader2, ChevronRight,
} from 'lucide-react';

const StatusPill = ({ status }) => {
  const map = {
    ready:      { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={11}/>, label: 'Ready' },
    processing: { cls: 'bg-amber-100 text-amber-700',   icon: <Loader2 size={11} className="animate-spin"/>, label: 'Processing' },
    failed:     { cls: 'bg-red-100 text-red-600',       icon: <AlertCircle size={11}/>, label: 'Failed' },
  };
  const s = map[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
};

const UploadModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else toast.error('Only PDF files are supported');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file');
    if (!title.trim()) return toast.error('Please provide a title');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('title', title.trim());
      await documentService.uploadDocument(fd);
      toast.success('Document uploaded! Processing…');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={18}/>
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25">
            <Upload size={18} className="text-white"/>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Upload Document</h2>
            <p className="text-xs text-slate-400">PDF files only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Document Title</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Machine Learning Chapter 3"
              className="w-full h-10 px-3.5 border-2 border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
              ${dragging ? 'border-blue-400 bg-blue-50' : file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
          >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])}/>
            {file ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <File size={20} className="text-emerald-600"/>
                </div>
                <p className="text-sm font-semibold text-emerald-700 text-center">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size/1024/1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Upload size={20} className="text-slate-400"/>
                </div>
                <p className="text-sm font-medium text-slate-600">Drop PDF here or <span className="text-blue-500 font-semibold">browse</span></p>
                <p className="text-xs text-slate-400">Maximum 10MB</p>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-semibold transition-all shadow-md shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin"/>Uploading…</> : <><Upload size={14}/>Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    setDeleting(id);
    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d._id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = documents.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); fetchDocuments(); }}/>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Documents</h1>
          <p className="text-sm text-slate-400 mt-0.5">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
        >
          <Plus size={16}/>Upload PDF
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner/></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-slate-300"/>
          </div>
          <p className="text-base font-semibold text-slate-500">
            {search ? 'No documents found' : 'No documents yet'}
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {search ? 'Try a different search term' : 'Upload your first PDF to start learning with AI'}
          </p>
          {!search && (
            <button onClick={() => setShowUpload(true)} className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-600 transition-all">
              <Plus size={15}/>Upload First Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <Link
              key={doc._id} to={`/documents/${doc._id}`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-200 p-5 flex flex-col gap-4"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  <FileText size={18} className="text-white"/>
                </div>
                <button
                  onClick={e => handleDelete(doc._id, e)}
                  disabled={deleting === doc._id}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  {deleting === doc._id ? <Loader2 size={15} className="animate-spin"/> : <Trash2 size={15}/>}
                </button>
              </div>

              {/* Title */}
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{doc.title}</p>
                <p className="text-xs text-slate-400 mt-1 truncate">{doc.fileName}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <BookOpen size={12}/>{doc.flashcardCount ?? 0} sets
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <BrainCircuit size={12}/>{doc.quizCount ?? 0} quizzes
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                  <HardDrive size={12}/>{doc.fileSize ? (doc.fileSize/1024/1024).toFixed(1)+'MB' : '—'}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <StatusPill status={doc.status}/>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock size={10}/>{moment(doc.uploadDate || doc.createdAt).fromNow()}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                Open document <ChevronRight size={13}/>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
