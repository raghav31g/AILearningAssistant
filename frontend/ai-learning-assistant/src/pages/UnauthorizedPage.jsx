import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const roleName = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Access Restricted
        </span>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Permission Denied
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
          Your current account role (<strong className="text-slate-800 dark:text-slate-200">{roleName}</strong>) does not have authorization to view this resource.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg shadow-primary-500/20"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
