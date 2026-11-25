import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ArrowUpRight,
  Vote,
  BarChart3,
  Eye,
  LayoutDashboard,
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Logo } from '../components/Logo';
import { DemoBanner } from '../components/DemoBanner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 28, restDelta: 0.001 });

  const navLinks = [
    { to: '/elections', label: 'Elections' },
    { to: '/candidates', label: 'Candidates' },
    { to: '/results', label: 'Results' },
    { to: '/transparency', label: 'Transparency' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Portal' }] : []),
  ];

  const mobileBottomLinks = [
    { to: '/elections', label: 'Elections', icon: Vote },
    { to: '/results', label: 'Results', icon: BarChart3 },
    { to: '/transparency', label: 'Audit', icon: Eye },
    user
      ? {
          to: user.role === 'admin' ? '/admin' : '/dashboard',
          label: user.role === 'admin' ? 'Admin' : 'Dashboard',
          icon: LayoutDashboard,
        }
      : { to: '/login', label: 'Sign In', icon: UserIcon },
  ];

  const handleLogout = async () => {
    await logout();
    addToast({ type: 'info', title: 'Signed out', description: 'Your demo session has ended.' });
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#0B1120]">
      <DemoBanner />

      <header className="sticky top-0 z-40 border-b border-[#DDDAD0] bg-[#F7F6F2]/95 backdrop-blur-md">
        <motion.div
          style={{ scaleX, transformOrigin: 'left' }}
          aria-hidden="true"
          className="h-[2.5px] w-full bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#E5A93C]"
        />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="SecureVote home">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors py-1.5 ${
                    isActive
                      ? 'text-[#0B1120]'
                      : 'text-[#1E293B]/70 hover:text-[#0B1120]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="main-nav-underline"
                        className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#0D9488]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 border border-[#DDDAD0] bg-white px-3 py-1.5 text-xs font-medium text-[#0B1120] hover:border-[#0D9488] transition-colors rounded-[4px]"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#0D9488]" />
                  <span>{user.name}</span>
                  <span className="font-mono text-[10px] bg-[#ECEAE2] px-1.5 py-0.5 text-[#0B1120]">
                    {user.voter_id}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 border border-[#DDDAD0] bg-white px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#0B1120] hover:text-white hover:border-[#0B1120] transition-colors rounded-[4px]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-[#0B1120] hover:text-[#0D9488] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 bg-[#0B1120] px-4 py-2 text-sm font-medium text-[#F7F6F2] hover:bg-[#141D30] transition-colors rounded-[4px]"
                >
                  <span>Voter ID Register</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#14B8A6]" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex h-11 w-11 items-center justify-center border border-[#DDDAD0] bg-white text-[#0B1120] rounded-[4px]"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#DDDAD0] bg-white overflow-hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center min-h-[44px] px-3 py-2 text-sm font-medium rounded-[4px] ${
                        isActive
                          ? 'bg-[#0B1120] text-[#F7F6F2]'
                          : 'text-[#1E293B] hover:bg-[#F7F6F2]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-3 border-t border-[#DDDAD0] pt-3 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between min-h-[44px] border border-[#DDDAD0] px-3 py-2 text-sm font-medium text-[#0B1120] rounded-[4px]"
                      >
                        <span>Profile · {user.name}</span>
                        <span className="font-mono text-xs text-[#0D9488]">{user.voter_id}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full min-h-[44px] text-left border border-[#E05A47]/40 bg-[#E05A47]/10 px-3 py-2 text-sm font-medium text-[#E05A47] rounded-[4px]"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center min-h-[44px] border border-[#DDDAD0] px-3 py-2 text-sm font-medium rounded-[4px]"
                      >
                        Sign In (Email / Voter ID)
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center min-h-[44px] bg-[#0B1120] px-3 py-2 text-sm font-medium text-[#F7F6F2] rounded-[4px]"
                      >
                        Register with Voter ID
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <footer className="border-t border-[#1E293B] bg-[#0B1120] text-[#CBD5E1] pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo dark />
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#94A3B8]">
                &ldquo;Every voice deserves a future.&rdquo; — A civic-tech prototype demonstrating Voter ID authentication, one-vote-per-election enforcement, and public audit summaries.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 border border-[#23304C] bg-[#141D30] px-3 py-1.5 text-xs text-[#14B8A6]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Simulated Demo Platform · Non-Production Prototype</span>
              </div>
            </div>
            <div>
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F6F2]">
                Civic Modules
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/elections" className="hover:text-[#14B8A6] transition-colors">
                    Election Directory
                  </Link>
                </li>
                <li>
                  <Link to="/candidates" className="hover:text-[#14B8A6] transition-colors">
                    Candidate Profiles
                  </Link>
                </li>
                <li>
                  <Link to="/results" className="hover:text-[#14B8A6] transition-colors">
                    Simulated Results
                  </Link>
                </li>
                <li>
                  <Link to="/transparency" className="hover:text-[#14B8A6] transition-colors">
                    Transparency Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F6F2]">
                Access Portals
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/dashboard" className="hover:text-[#14B8A6] transition-colors">
                    Voter Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-[#14B8A6] transition-colors">
                    Admin Console
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#14B8A6] transition-colors">
                    Voter ID Sign-In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#1E293B] pt-6 text-xs text-[#64748B]">
            <p>
              SecureVote Prototype. Uses simulated election datasets; does not claim cryptographic end-to-end verifiability.
            </p>
            <p className="font-display tracking-wide text-[#E5A93C]">
              Midnight Ink · Civic Teal · Amber
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom App Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#1E293B] bg-[#0B1120]/95 backdrop-blur-md text-[#CBD5E1] safe-pb"
      >
        <div className="grid grid-cols-4 h-16">
          {mobileBottomLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-[#14B8A6]' : 'text-[#94A3B8] hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
