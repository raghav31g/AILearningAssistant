import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Menu, ShieldAlert, ShieldCheck } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user, isProtectedMode } = useAuth();
  const role = user?.role || 'student';

  const getRoleStyle = () => {
    switch (role) {
      case 'administrator':
        return {
          title: 'Administrator',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500',
          avatarGradient: 'from-purple-500 to-indigo-600',
        };
      case 'teacher':
        return {
          title: 'Teacher',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500',
          avatarGradient: 'from-blue-500 to-cyan-600',
        };
      default:
        return {
          title: 'Student',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
          avatarGradient: 'from-emerald-400 to-teal-500',
        };
    }
  };

  const roleStyle = getRoleStyle();

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 shrink-0">
      <div className="flex items-center justify-between h-full px-6 gap-4">
        {/* Mobile menu + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search bar */}
          <div className="relative hidden sm:flex items-center max-w-sm w-full">
            <Search size={15} className="absolute left-3.5 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search documents, quizzes, flashcards..."
              className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200">
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* User avatar & Role pill */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleStyle.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {user?.username || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dotClass}`} />
                <span className="text-[11px] text-slate-500 font-medium capitalize">
                  {roleStyle.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
