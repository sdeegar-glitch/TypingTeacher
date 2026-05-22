import { useState, useMemo } from 'react';
import { Search, Ban, Trash2, Shield, Eye, ChevronDown, Download } from 'lucide-react';
import type { PlatformUser } from '../types';
import { MOCK_USERS } from '../api';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  user: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  moderator: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  content_manager: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let u = users;
    if (search) u = u.filter(x => x.email.includes(search) || (x.name || '').toLowerCase().includes(search.toLowerCase()));
    if (filterRole !== 'all') u = u.filter(x => x.role === filterRole);
    return u;
  }, [users, search, filterRole]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const banUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_banned: !u.is_banned } : u));
  };

  const deleteUser = (id: string) => {
    if (confirm('Delete this user?')) setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Users Management</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} users found</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
        <div className="relative">
          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(1); }}
            className="appearance-none bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-2.5">
          <span className="text-indigo-300 text-sm font-semibold">{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-white ml-2">Clear</button>
          <div className="ml-auto flex gap-2">
            <button className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors">
              Bulk Delete
            </button>
            <button className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg hover:bg-amber-500/30 transition-colors">
              Bulk Ban
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={e => setSelectedIds(e.target.checked ? new Set(paged.map(u => u.id)) : new Set())}
                    className="rounded"
                  />
                </th>
                {['User', 'Role', 'Tests', 'Best WPM', 'Accuracy', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paged.map(user => (
                <tr key={user.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{user.name || '—'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{user.total_tests}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-indigo-400">{user.best_wpm}</span>
                    <span className="text-slate-500 text-xs"> wpm</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{user.average_accuracy}%</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    {user.is_banned ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Banned</span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="View" className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                      <button title={user.is_banned ? 'Unban' : 'Ban'} onClick={() => banUser(user.id)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors">
                        {user.is_banned ? <Shield size={14} /> : <Ban size={14} />}
                      </button>
                      <button title="Delete" onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors">
              Previous
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
