import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiRequest, ApiError } from '../../services/api';
import type { UserSummary } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/Skeletons';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatShortDate } from '../../utils/format';
import { pageTransitionVariants } from '../../animations/motion';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    apiRequest<UserSummary[]>('/admin/users')
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (u: UserSummary) => {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active';
    try {
      await apiRequest(`/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      addToast({
        type: 'success',
        title: `Account ${nextStatus}`,
        description: `${u.name} is now ${nextStatus}.`,
      });
      loadUsers();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: err instanceof ApiError ? err.message : 'Action rejected.',
      });
    }
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <div className="border-b border-[#DDDAD0] pb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
          Admin · Demo Registry
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold text-[#0B1120] sm:text-3xl">
          Demo Voter Management
        </h1>
        <p className="mt-1 text-xs text-[#141D30]/75">
          Shows account roles, registration dates, and election participation counts—never individual ballot choices.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => {
              const isSelf = u.id === currentAdmin?.id;
              return (
                <div key={u.id} className="border border-[#DDDAD0] bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-[#0B1120] truncate">{u.name}</p>
                      <p className="text-xs text-[#1E293B]/70 truncate">{u.email}</p>
                      <p className="font-mono text-[11px] text-[#0D9488] mt-0.5">{u.voter_id}</p>
                    </div>
                    <StatusBadge status={u.role} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#141D30]/75">
                    <StatusBadge
                      status={u.status}
                      labelOverride={u.status === 'active' ? 'Active' : undefined}
                    />
                    <span>{u.participated_elections_count} elections · {formatShortDate(u.created_at)}</span>
                  </div>
                  <button
                    type="button"
                    disabled={isSelf}
                    onClick={() => toggleStatus(u)}
                    className="w-full min-h-[40px] border border-[#DDDAD0] px-3 py-1.5 text-xs font-medium hover:border-[#0B1120] disabled:opacity-40 rounded-[3px]"
                  >
                    {isSelf
                      ? 'Current Admin'
                      : u.status === 'active'
                        ? 'Suspend Account'
                        : 'Activate Account'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block border border-[#DDDAD0] bg-white overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDDAD0] bg-[#F7F6F2]/60 text-[11px] uppercase tracking-wider text-[#141D30]/70">
                <th className="px-3 py-3">Account</th>
                <th className="px-2.5 py-3">Voter ID</th>
                <th className="px-2.5 py-3">Role</th>
                <th className="px-2.5 py-3">Status</th>
                <th className="px-2.5 py-3">Ballots</th>
                <th className="hidden xl:table-cell px-2.5 py-3">Joined</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDAD0]/60">
              {users.map((u) => {
                const isSelf = u.id === currentAdmin?.id;
                return (
                  <tr key={u.id}>
                    <td className="px-3 py-3.5 max-w-[220px]">
                      <p className="font-display font-semibold text-[#0B1120] truncate">{u.name}</p>
                      <p className="text-xs text-[#1E293B]/70 truncate">{u.email}</p>
                    </td>
                    <td className="px-2.5 py-3.5 font-mono text-xs font-semibold text-[#0D9488] whitespace-nowrap">
                      {u.voter_id}
                    </td>
                    <td className="px-2.5 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        status={u.role}
                        labelOverride={u.role === 'admin' ? 'Admin' : 'Voter'}
                      />
                    </td>
                    <td className="px-2.5 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        status={u.status}
                        labelOverride={u.status === 'active' ? 'Active' : undefined}
                      />
                    </td>
                    <td className="px-2.5 py-3.5 tabular-nums text-xs font-medium whitespace-nowrap">
                      {u.participated_elections_count} cast
                    </td>
                    <td className="hidden xl:table-cell px-2.5 py-3.5 text-xs text-[#141D30]/70 whitespace-nowrap">
                      {formatShortDate(u.created_at)}
                    </td>
                    <td className="px-3 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => toggleStatus(u)}
                        className="border border-[#DDDAD0] px-3 py-1 text-xs font-medium hover:border-[#0B1120] disabled:opacity-40 rounded-[3px]"
                      >
                        {isSelf
                          ? 'Current Admin'
                          : u.status === 'active'
                            ? 'Suspend'
                            : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </motion.div>
  );
};
