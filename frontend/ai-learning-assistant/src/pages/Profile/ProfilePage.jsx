import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import {
  User, Mail, Lock, Save, Loader2, Eye, EyeOff,
  Shield, BookOpen, BrainCircuit, Camera,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState({current: false, new: false, confirm: false});
  const [savingPw, setSavingPw]     = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username is required');
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({ username, email });
      updateUser({ username: res.data?.username || username, email: res.data?.email || email });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) return toast.error('All fields are required');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPw !== confirmPw) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed! Please log in again.');
      setTimeout(() => logout(), 1500);
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Profile hero */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-violet-500/25">
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md hover:bg-emerald-600 transition-colors">
            <Camera size={13}/>
          </button>
        </div>
        <h1 className="text-xl font-bold text-slate-800">{user?.username}</h1>
        <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-700">
              <BookOpen size={14} className="text-violet-500"/>
              <span>—</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Flashcard Sets</p>
          </div>
          <div className="w-px bg-slate-100 my-2"/>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-700">
              <BrainCircuit size={14} className="text-emerald-500"/>
              <span>—</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Quizzes Taken</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        {[['profile','Profile','User'],['security','Security','Shield']].map(([id, label, _]) => (
          <button
            key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={15} className="text-violet-500"/>Personal Information
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                className="w-full h-11 pl-9 pr-4 border-2 border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="Username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-11 pl-9 pr-4 border-2 border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-violet-400 transition-colors"
                placeholder="Email"
              />
            </div>
          </div>

          <button
            type="submit" disabled={savingProfile}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold hover:from-violet-600 hover:to-purple-600 transition-all shadow-md shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {savingProfile ? <><Loader2 size={14} className="animate-spin"/>Saving…</> : <><Save size={14}/>Save Changes</>}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Shield size={15} className="text-emerald-500"/>Change Password
          </h2>

          {[
            { label: 'Current Password', value: currentPw, setter: setCurrentPw, key: 'current' },
            { label: 'New Password',     value: newPw,     setter: setNewPw,     key: 'new' },
            { label: 'Confirm Password', value: confirmPw, setter: setConfirmPw, key: 'confirm' },
          ].map(({ label, value, setter, key }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  value={value} onChange={e => setter(e.target.value)}
                  className="w-full h-11 pl-9 pr-10 border-2 border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw[key] ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 font-medium">You will be logged out after changing your password.</p>
          </div>

          <button
            type="submit" disabled={savingPw}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {savingPw ? <><Loader2 size={14} className="animate-spin"/>Updating…</> : <><Shield size={14}/>Update Password</>}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
