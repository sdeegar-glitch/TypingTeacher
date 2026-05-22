import { LayoutDashboard, Users, FileText, Tag, Cpu, Search, Bell, ClipboardList, Shield, Settings, BarChart2, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import type { SidebarPage } from './types';
import { useState } from 'react';

const NAV_ITEMS: { id: SidebarPage; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'overview',     label: 'Overview',        icon: <LayoutDashboard size={18} /> },
  { id: 'analytics',   label: 'Analytics',        icon: <BarChart2 size={18} /> },
  { id: 'users',       label: 'Users',            icon: <Users size={18} />,   badge: '1.2k' },
  { id: 'tests',       label: 'Typing Tests',     icon: <FileText size={18} /> },
  { id: 'categories',  label: 'Categories',       icon: <Tag size={18} /> },
  { id: 'ai-generator',label: 'AI Generator',     icon: <Cpu size={18} />,     badge: 'NEW' },
  { id: 'seo',         label: 'SEO Manager',      icon: <Search size={18} /> },
  { id: 'notifications',label:'Notifications',    icon: <Bell size={18} />,    badge: '3' },
  { id: 'logs',        label: 'Reports & Logs',   icon: <ClipboardList size={18} /> },
  { id: 'security',    label: 'Security Center',  icon: <Shield size={18} /> },
  { id: 'settings',    label: 'Settings',         icon: <Settings size={18} /> },
];

interface AdminSidebarProps {
  activePage: SidebarPage;
  onNavigate: (page: SidebarPage) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ activePage, onNavigate, onLogout }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-sm">FT</div>
            <div>
              <div className="text-white font-bold text-sm leading-none">FastTypingLab</div>
              <div className="text-indigo-300 text-[10px] uppercase tracking-widest">Admin Panel</div>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/50 hover:text-white transition-colors p-1 rounded">
          <Menu size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                active
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badge === 'NEW' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight size={14} className="text-indigo-400" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg shadow-lg border border-slate-700"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-[#0f1117] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0f1117] border-r border-white/5 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
