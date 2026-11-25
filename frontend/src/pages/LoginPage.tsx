import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Sparkles, Zap, IdCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../services/api';
import { pageTransitionVariants, EASE_PREMIUM } from '../animations/motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (targetIdentifier: string, targetPassword: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(targetIdentifier, targetPassword);
      addToast({
        type: 'success',
        title: `Welcome back, ${user.name}`,
        description: `Voter ID ${user.voter_id} · ${user.role === 'admin' ? 'Administrator' : 'Demo Voter'}`,
      });
      if (from && (from.startsWith('/admin') ? user.role === 'admin' : true)) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Unable to sign in right now.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role: 'voter' | 'admin', instant = false, useVoterId = false) => {
    const targetId =
      role === 'voter'
        ? useVoterId
          ? 'VID-2026-1001'
          : 'voter@securevote.demo'
        : useVoterId
          ? 'ADM-2026-0001'
          : 'admin@securevote.demo';
    const targetPassword = role === 'voter' ? 'DemoVoter2026!' : 'DemoAdmin2026!';
    setIdentifier(targetId);
    setPassword(targetPassword);
    setError(null);
    if (instant) {
      performLogin(targetId, targetPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(identifier, password);
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_PREMIUM }}
          className="lg:col-span-7 border border-[#DDDAD0] bg-white p-6 sm:p-10 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
            <IdCard className="h-4 w-4" />
            <span>Email or Voter ID Authentication</span>
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#0B1120]">
            Sign in to SecureVote
          </h1>
          <p className="mt-2 text-sm text-[#1E293B]/75">
            {from
              ? `Sign in with your Email or Voter ID to continue to ${from}.`
              : 'Sign in using your registered Email address or unique Voter ID.'}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 border border-[#E05A47] bg-[#E05A47]/10 px-4 py-3 text-sm text-[#0B1120]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
                Email Address or Voter ID
              </label>
              <input
                id="login-identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="VID-2026-1001 or voter@securevote.demo"
                className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2]/60 px-3.5 py-2.5 text-sm text-[#0B1120] focus:border-[#0D9488] focus:bg-white transition-colors rounded-[4px]"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2]/60 px-3.5 py-2.5 text-sm text-[#0B1120] focus:border-[#0D9488] focus:bg-white transition-colors rounded-[4px]"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-[#0B1120] px-5 py-3 text-sm font-semibold text-[#F7F6F2] hover:bg-[#141D30] transition-colors disabled:opacity-60 rounded-[4px]"
            >
              <Lock className="h-4 w-4 text-[#14B8A6]" />
              <span>{submitting ? 'Verifying Session...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4 text-[#E5A93C]" />
            </motion.button>
          </form>

          <p className="mt-6 border-t border-[#DDDAD0]/70 pt-5 text-sm text-[#1E293B]/80">
            New to the prototype?{' '}
            <Link to="/register" className="font-semibold text-[#0D9488] underline underline-offset-4 hover:text-[#0B1120]">
              Register with a Voter ID
            </Link>
          </p>
        </motion.div>

        {/* Quick Demo Credentials Panel */}
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE_PREMIUM }}
          className="lg:col-span-5 border border-[#1E293B] bg-[#0B1120] p-6 sm:p-8 text-[#F7F6F2] flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 border border-[#14B8A6]/40 bg-[#14B8A6]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#14B8A6]">
              <Sparkles className="h-3 w-3" />
              <span>Hackathon Demo Access</span>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-white">
              Instant Prototype Sign-In
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
              Use one-tap sign-in (with Voter ID) or fill credentials to test voter and admin workflows.
            </p>

            <div className="mt-6 space-y-3">
              <div className="border border-[#23304C] bg-[#141D30] p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      Demo Voter (Maya Lin)
                    </span>
                    <span className="font-mono text-[11px] text-[#14B8A6]">
                      VID-2026-1001
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#94A3B8] font-mono">
                    voter@securevote.demo · DemoVoter2026!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => fillDemo('voter', true, true)}
                    className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 bg-[#14B8A6] px-3 py-1.5 text-xs font-semibold text-[#0B1120] hover:bg-[#2DD4BF] transition-colors rounded-[3px]"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>One-Tap Voter ID</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => fillDemo('voter', false, true)}
                    className="min-h-[40px] border border-[#23304C] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] hover:border-[#14B8A6] transition-colors rounded-[3px]"
                  >
                    Fill ID
                  </button>
                </div>
              </div>

              <div className="border border-[#23304C] bg-[#141D30] p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      Demo Admin (Elena Vance)
                    </span>
                    <span className="font-mono text-[11px] text-[#E5A93C]">
                      ADM-2026-0001
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#94A3B8] font-mono">
                    admin@securevote.demo · DemoAdmin2026!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => fillDemo('admin', true, true)}
                    className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 bg-[#E5A93C] px-3 py-1.5 text-xs font-semibold text-[#0B1120] hover:bg-[#F3BC56] transition-colors rounded-[3px]"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>One-Tap Admin</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => fillDemo('admin', false, true)}
                    className="min-h-[40px] border border-[#23304C] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] hover:border-[#E5A93C] transition-colors rounded-[3px]"
                  >
                    Fill ID
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 border-t border-[#1E293B] pt-4 text-[11px] leading-relaxed text-[#64748B]">
            Each Voter ID can register once and submit at most one simulated ballot per active election.
          </p>
        </motion.aside>
      </div>
    </motion.div>
  );
};
