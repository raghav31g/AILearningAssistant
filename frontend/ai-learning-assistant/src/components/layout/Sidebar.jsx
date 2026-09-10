import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  BookOpen,
  ClipboardList,
  User,
  LogOut,
  X,
  Sparkles,
  Users,
  ShieldCheck,
  Lock,
} from 'lucide-react';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/flashcards', icon: BookOpen, label: 'Flashcards' },
  { to: '/quizzes', icon: ClipboardList, label: 'Quizzes' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user, isTeacher, isAdmin, isProtectedMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'student';

  const getRoleBadge = () => {
    switch (role) {
      case 'administrator':
        return {
          label: 'Admin',
          bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'teacher':
        return {
          label: 'Teacher',
          bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
          gradient: 'from-blue-500 to-cyan-600',
        };
      default:
        return {
          label: 'Student',
          bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200',
          gradient: 'from-emerald-400 to-teal-500',
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-full flex flex-col
          w-64 bg-white border-r border-slate-100
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleBadge.gradient} flex items-center justify-center shadow-lg`}>
              <BrainCircuit size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 tracking-tight text-sm leading-tight">
                AI Learning
              </span>
              <span className="text-[10px] font-medium text-slate-400 capitalize">
                {role} Portal
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Learning
          </p>
          {baseNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => isOpen && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                    }`}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Teacher & Admin Section */}
          {(isTeacher || isAdmin) && (
            <div className="pt-4 mt-3 border-t border-slate-100">
              <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Instructor
              </p>
              <NavLink
                to="/teacher"
                onClick={() => isOpen && toggleSidebar()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                      }`}
                    >
                      <Users size={15} strokeWidth={2} />
                    </span>
                    Student Roster
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </>
                )}
              </NavLink>
            </div>
          )}

          {/* Admin Only Section */}
          {isAdmin && (
            <div className="pt-2 mt-2">
              <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={() => isOpen && toggleSidebar()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                      }`}
                    >
                      <ShieldCheck size={15} strokeWidth={2} />
                    </span>
                    Admin Panel
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* AI Badge */}
        <div className="mx-3 mb-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">AI Powered</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Generate flashcards, quizzes &amp; summaries from your documents.
          </p>
        </div>

        {/* User + Logout */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleBadge.gradient} flex items-center justify-center text-white text-xs font-bold shadow`}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-700 truncate">{user?.username || 'User'}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase ${roleBadge.bg}`}>
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
