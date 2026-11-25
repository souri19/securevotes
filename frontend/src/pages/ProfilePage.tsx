import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, KeyRound, ShieldCheck, IdCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest, ApiError } from '../services/api';
import type { ParticipationHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../utils/format';
import { pageTransitionVariants } from '../animations/motion';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [history, setHistory] = useState<ParticipationHistoryItem[]>([]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    apiRequest<ParticipationHistoryItem[]>('/profile/participation')
      .then(setHistory)
      .catch(() => null);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await apiRequest('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      await refreshUser();
      addToast({ type: 'success', title: 'Profile updated' });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: err instanceof ApiError ? err.message : 'Unable to update name.',
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await apiRequest('/profile/password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      addToast({ type: 'success', title: 'Password updated' });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Password update failed',
        description: err instanceof ApiError ? err.message : 'Check your current password.',
      });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="border-b border-[#DDDAD0] pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
            Account &amp; Voter ID Identity
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#0B1120]">
            Your Demo Profile
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-[#DDDAD0] bg-white px-3 py-1 font-mono text-xs font-semibold text-[#0B1120] rounded-[3px]">
            <IdCard className="h-3.5 w-3.5 text-[#0D9488]" />
            {user?.voter_id}
          </span>
          {user && <StatusBadge status={user.role} />}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={handleUpdateProfile} className="border border-[#DDDAD0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DDDAD0]/60 pb-3">
            <UserIcon className="h-4 w-4 text-[#0D9488]" />
            <h2 className="font-display text-lg font-bold text-[#0B1120]">Identity Details</h2>
          </div>

          <div>
            <label htmlFor="prof-voter-id" className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Verified Demo Voter ID
            </label>
            <input
              id="prof-voter-id"
              type="text"
              disabled
              value={user?.voter_id || ''}
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2] px-3 py-2 font-mono text-sm font-semibold text-[#0B1120] rounded-[4px]"
            />
          </div>

          <div>
            <label htmlFor="prof-email" className="block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Email Address
            </label>
            <input
              id="prof-email"
              type="text"
              disabled
              value={user?.email || ''}
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-[#F7F6F2] px-3 py-2 text-sm text-[#64748B] rounded-[4px]"
            />
          </div>

          <div>
            <label htmlFor="prof-name" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
              Display Name
            </label>
            <input
              id="prof-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] bg-white px-3 py-2 text-sm text-[#0B1120] rounded-[4px]"
            />
          </div>

          <button
            type="submit"
            disabled={savingName}
            className="min-h-[44px] bg-[#0B1120] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:bg-[#141D30] disabled:opacity-60 rounded-[4px]"
          >
            {savingName ? 'Saving...' : 'Save Name'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="border border-[#DDDAD0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DDDAD0]/60 pb-3">
            <KeyRound className="h-4 w-4 text-[#E5A93C]" />
            <h2 className="font-display text-lg font-bold text-[#0B1120]">Update Password</h2>
          </div>

          <div>
            <label htmlFor="curr-pw" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
              Current Password
            </label>
            <input
              id="curr-pw"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
            />
          </div>

          <div>
            <label htmlFor="new-pw" className="block text-xs font-semibold uppercase tracking-wider text-[#0B1120]">
              New Password (min. 8 characters)
            </label>
            <input
              id="new-pw"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5 w-full min-h-[44px] border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
            />
          </div>

          <button
            type="submit"
            disabled={savingPw}
            className="min-h-[44px] border border-[#0B1120] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:bg-[#0B1120] hover:text-white transition-colors disabled:opacity-60 rounded-[4px]"
          >
            {savingPw ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      <section className="border border-[#DDDAD0] bg-white p-6">
        <div className="flex items-center gap-2 border-b border-[#DDDAD0]/60 pb-3">
          <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
          <h2 className="font-display text-lg font-bold text-[#0B1120]">
            Simulated Participation Record
          </h2>
        </div>
        {history.length === 0 ? (
          <p className="py-6 text-sm text-[#1E293B]/70">
            No demo elections participated in yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#DDDAD0]/60">
            {history.map((item) => (
              <li key={item.election_id} className="py-3.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold text-[#0B1120]">{item.election_title}</p>
                  <p className="text-xs text-[#1E293B]/70">
                    {formatDateTime(item.participated_at)} · {item.privacy_note}
                  </p>
                </div>
                <StatusBadge status={item.election_status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
};
