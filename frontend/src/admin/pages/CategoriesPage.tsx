import { useEffect, useState } from 'react';
import { Tag, Info } from 'lucide-react';
import type { Category } from '../types';
import { fetchAdminCategories } from '../api';

// Deterministic color/icon per category name, since there's no categories
// table to store these in (categories here are derived from the free-text
// typing_test.category column).
const PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6'];
const ICONS = ['📄', '📰', '⚡', '💻', '🟢', '🔴', '📚'];

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return { color: PALETTE[hash % PALETTE.length], icon: ICONS[hash % ICONS.length] };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">{loading ? 'Loading…' : `${categories.length} categories found in typing tests`}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-300">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p>This is a real, read-only view derived from the <code className="text-indigo-300">category</code> field on each typing test. There's no separate categories table yet, so adding/editing/deleting categories here isn't wired up — change a test's category directly to move it between groups.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4">🏷️</div>
          <p className="font-semibold text-lg text-slate-400">No categories yet</p>
          <p className="text-sm mt-1">Categories appear here once typing tests have a category set.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map(cat => {
            const { color, icon } = paletteFor(cat.name);
            return (
              <div key={cat.id} className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: color + '20', border: `1px solid ${color}40` }}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-white font-bold">{cat.name}</div>
                    <div className="text-xs text-slate-500 font-mono">/{cat.slug}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Tag size={12} />
                    <span>{cat.test_count} tests</span>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
