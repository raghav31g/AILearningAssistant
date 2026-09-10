import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  GraduationCap,
  School,
  FileText,
  BookOpen,
  ClipboardList,
  Search,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminPage = () => {
  const { user: currentAdmin, refreshProtectedMode } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProtectedMode, setIsProtectedMode] = useState(false);
  const [togglingProtected, setTogglingProtected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // New user modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, protectedRes] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getAllUsers(),
        adminService.getProtectedModeStatus()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (protectedRes && typeof protectedRes.isProtectedMode === 'boolean') {
        setIsProtectedMode(protectedRes.isProtectedMode);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleProtectedMode = async () => {
    setTogglingProtected(true);
    try {
      const newStatus = !isProtectedMode;
      const res = await adminService.toggleProtectedMode(newStatus);
      if (res.success) {
        setIsProtectedMode(res.isProtectedMode);
        refreshProtectedMode();
        toast.success(
          res.isProtectedMode
            ? '🔒 Protected Mode ENABLED — Student write actions are restricted.'
            : '🔓 Protected Mode DISABLED — All normal access restored.'
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update protected mode');
    } finally {
      setTogglingProtected(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
        // Refresh stats
        const statsRes = await adminService.getSystemStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err) {
      toast.error(err.error || err.message || 'Failed to update user role');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res = await adminService.toggleUserActive(userId);
      if (res.success) {
        toast.success(res.message);
        setUsers(users.map(u => (u._id === userId ? { ...u, isActive: res.data.isActive } : u)));
      }
    } catch (err) {
      toast.error(err.error || err.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await adminService.createAdminUser(newUserForm);
      if (res.success) {
        toast.success(`Account for ${res.data.username} created successfully!`);
        setShowCreateModal(false);
        setNewUserForm({ username: '', email: '', password: '', role: 'student' });
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.error || err.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrator Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            System Administration
          </h1>
          <p className="text-purple-200/80 text-sm max-w-xl">
            Manage system users, assign roles (Student, Teacher, Administrator), and monitor platform activity.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/30 cursor-pointer"
          >
            <UserPlus size={16} /> Create User
          </button>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* System Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Users</span>
              <Users size={16} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.users?.total || 0}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Students</span>
              <GraduationCap size={16} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.users?.students || 0}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Teachers</span>
              <School size={16} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.users?.teachers || 0}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Documents</span>
              <FileText size={16} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.content?.documents || 0}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Flashcards</span>
              <BookOpen size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.content?.flashcards || 0}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Quizzes</span>
              <ClipboardList size={16} className="text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.content?.quizzes || 0}</p>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">User Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and update user roles, toggle account access status, and see activity stats.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 sm:w-64 h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  roleFilter === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  roleFilter === 'student' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setRoleFilter('teacher')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  roleFilter === 'teacher' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Teachers
              </button>
              <button
                onClick={() => setRoleFilter('administrator')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  roleFilter === 'administrator' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Admins
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u._id === currentAdmin?.id || u._id === currentAdmin?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-xs">
                            {u.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.username}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="px-6 py-4">
                        <select
                          value={u.role || 'student'}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition-colors cursor-pointer ${
                            u.role === 'administrator'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'teacher'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="administrator">Administrator</option>
                        </select>
                      </td>

                      {/* Stats */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span title="Documents">📄 {u.stats?.documents || 0}</span>
                          <span title="Flashcards">🗂️ {u.stats?.flashcards || 0}</span>
                          <span title="Quizzes">📝 {u.stats?.quizzes || 0}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.isActive !== false ? (
                            <>
                              <CheckCircle2 size={12} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Suspended
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleActive(u._id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                              u.isActive !== false
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Create New Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g. prof_smith"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g. smith@school.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
