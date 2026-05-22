import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import type { Category } from '../types';
import { MOCK_CATEGORIES } from '../api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '📄', color: '#6366F1' });

  const addCategory = () => {
    const newCat: Category = {
      id: Date.now().toString(),
      name: form.name,
      slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      icon: form.icon,
      color: form.color,
      test_count: 0,
      created_at: new Date().toISOString(),
    };
    setCategories(prev => [newCat, ...prev]);
    setForm({ name: '', slug: '', description: '', icon: '📄', color: '#6366F1' });
    setShowForm(false);
  };

  const deleteCategory = (id: string) => {
    if (confirm('Delete this category?')) setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">{categories.length} categories · Organize your tests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. News Typing" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Icon (Emoji)</label>
              <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="📰" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-sm text-slate-400 font-mono">{form.color}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addCategory} disabled={!form.name} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
              Save Category
            </button>
            <button onClick={() => setShowForm(false)} className="bg-white/5 hover:bg-white/10 text-slate-400 px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 group transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: cat.color + '20', border: `1px solid ${cat.color}40` }}>
                  {cat.icon || '📄'}
                </div>
                <div>
                  <div className="text-white font-bold">{cat.name}</div>
                  <div className="text-xs text-slate-500 font-mono">/{cat.slug}</div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                  <Edit size={13} />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {cat.description && <p className="text-xs text-slate-500 mb-3">{cat.description}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Tag size={12} />
                <span>{cat.test_count} tests</span>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
