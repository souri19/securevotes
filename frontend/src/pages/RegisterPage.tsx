import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, IdCard, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../services/api';
import { pageTransitionVariants } from '../animations/motion';

function generateSampleVoterId(): string {
  const num = Math.floor(2000 + Math.random() * 7999);
  return `VID-2026-${num}`;
}

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Please choose a password of at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await register(name, email, voterId, password);
      addToast({
        type: 'success',
        title: 'Demo voter registered',
        description: `Assigned Voter ID ${user.voter_id}.`,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Unable to register right now.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-xl px-4 py-10 sm:py-12 sm:px-6"
    >
      <div className="border border-[#DDDAD0] bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
          <UserPlus className="h-4 w-4" />
          <span>Voter ID Registration (Demo)</span>
        </div>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#0B1120]">
          Create a Demo Voter Account
        </h1>
        <p className="mt-2 text-sm text-[#1E293B]/75">
          Each unique Voter ID can register once and cast a single simulated ballot per election.
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
            <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Samira Patel"
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2]/60 px-3.5 py-2.5 text-sm text-[#0B1120] focus:border-[#0D9488] focus:bg-white transition-colors rounded-[4px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="reg-voter-id" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
                Voter ID (Unique Identifier)
              </label>
              <button
                type="button"
                onClick={() => setVoterId(generateSampleVoterId())}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D9488] hover:text-[#0B1120]"
              >
                <Wand2 className="h-3 w-3" />
                <span>Generate Demo ID</span>
              </button>
            </div>
            <div className="relative mt-1.5">
              <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                id="reg-voter-id"
                type="text"
                required
                minLength={4}
                maxLength={32}
                value={voterId}
                onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                placeholder="VID-2026-4091"
                className="w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2]/60 pl-10 pr-3.5 py-2.5 font-mono text-sm uppercase text-[#0B1120] focus:border-[#0D9488] focus:bg-white transition-colors rounded-[4px]"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              Letters, numbers, and hyphens only (4–32 characters). Duplicate Voter IDs are blocked.
            </p>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="samira@example.com"
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2]/60 px-3.5 py-2.5 text-sm text-[#0B1120] focus:border-[#0D9488] focus:bg-white transition-colors rounded-[4px]"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
              Password (min. 8 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong demo password"
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
            <span>{submitting ? 'Creating Account...' : 'Register Demo Voter'}</span>
            <ArrowRight className="h-4 w-4 text-[#14B8A6]" />
          </motion.button>
        </form>

        <p className="mt-6 border-t border-[#DDDAD0]/70 pt-5 text-sm text-[#1E293B]/80">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#0D9488] underline underline-offset-4 hover:text-[#0B1120]">
            Sign in with Email or Voter ID
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
