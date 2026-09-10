import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, BrainCircuit } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="text-center max-w-sm">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25">
        <BrainCircuit size={36} className="text-white"/>
      </div>
      <h1 className="text-7xl font-black text-slate-200 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Page not found</h2>
      <p className="text-sm text-slate-400 mb-8">Looks like this page doesn't exist. Let's get you back on track.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all">
          <Home size={15}/>Go Home
        </Link>
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={15}/>Go Back
        </button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
