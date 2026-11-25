import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  ScrollText,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { DemoBanner } from '../components/DemoBanner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/elections', label: 'Elections', icon: Vote, end: false },
  { to: '/admin/candidates', label: 'Candidates', icon: UserCheck, end: false },
  { to: '/admin/users', label: 'Demo Voters', icon: Users, end: false },
  { to: '/admin/logs', label: 'Audit Logs', icon: ScrollText, end: false },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    addToast({ type: 'info', title: 'Signed out' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#0B1120]">
      <DemoBanner />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#1E293B] bg-[#0B1120] text-[#F7F6F2]">
          <div>
            <div className="flex h-16 items-center justify-between border-b border-[#1E293B] px-5">
              <Link to="/">
                <Logo dark />
              </Link>
              <span className="border border-[#E5A93C]/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#E5A93C]">
                Admin
              </span>
            </div>

            <nav className="p-4 space-y-1" aria-label="Admin sidebar navigation">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors rounded-[4px] ${
                        isActive
                          ? 'bg-[#14B8A6] text-[#0B1120] font-semibold'
                          : 'text-[#CBD5E1] hover:bg-[#141D30] hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-[#1E293B] p-4 space-y-3">
            <div className="border border-[#23304C] bg-[#141D30] p-3">
              <p className="text-[11px] uppercase tracking-wider text-[#14B8A6]">
                Signed in Administrator
              </p>
              <p className="mt-1 font-display text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="font-mono text-[11px] text-[#E5A93C] mt-0.5">{user?.voter_id}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/elections"
                className="flex items-center gap-2 border border-[#23304C] px-3 py-2 text-xs font-medium text-[#CBD5E1] hover:text-white hover:border-[#14B8A6] transition-colors rounded-[4px]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Public Portal</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 border border-[#E05A47]/40 px-3 py-2 text-xs font-medium text-[#E05A47] hover:bg-[#E05A47]/10 transition-colors rounded-[4px]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex h-14 items-center justify-between border-b border-[#DDDAD0] bg-white px-4">
            <Link to="/admin" className="font-display text-base font-bold text-[#0B1120]">
              SecureVote · Admin
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label="Toggle admin menu"
              className="inline-flex h-10 w-10 items-center justify-center border border-[#DDDAD0] rounded-[4px]"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </header>

          {sidebarOpen && (
            <div className="lg:hidden border-b border-[#1E293B] bg-[#0B1120] p-3 space-y-1 text-[#F7F6F2]">
              {adminNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center min-h-[44px] px-3 py-2 text-sm font-medium rounded-[4px] ${
                      isActive ? 'bg-[#14B8A6] text-[#0B1120]' : 'text-[#CBD5E1]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/elections"
                onClick={() => setSidebarOpen(false)}
                className="block px-3 py-2 text-sm text-[#E5A93C]"
              >
                ← Back to Public Portal
              </Link>
            </div>
          )}

          <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
