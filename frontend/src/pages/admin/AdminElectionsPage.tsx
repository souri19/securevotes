import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { apiRequest, ApiError } from '../../services/api';
import type { Election, ElectionStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { TableSkeleton } from '../../components/Skeletons';
import { useToast } from '../../context/ToastContext';
import { formatShortDate } from '../../utils/format';
import { pageTransitionVariants } from '../../animations/motion';

const STATUS_OPTIONS: ElectionStatus[] = ['draft', 'upcoming', 'active', 'completed', 'archived'];

export const AdminElectionsPage: React.FC = () => {
  const { addToast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Election | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [electionType, setElectionType] = useState('Civic Council');
  const [eligibilityNote, setEligibilityNote] = useState('All registered demo voters');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eligibleCount, setEligibleCount] = useState(400);
  const [statusVal, setStatusVal] = useState<ElectionStatus>('upcoming');

  const loadElections = () => {
    setLoading(true);
    apiRequest<Election[]>('/admin/elections')
      .then(setElections)
      .catch((err) =>
        addToast({
          type: 'error',
          title: 'Load error',
          description: err instanceof Error ? err.message : 'Unable to load elections.',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadElections();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setElectionType('Civic Council');
    setEligibilityNote('All registered demo voters');
    const now = new Date();
    const later = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    setStartTime(now.toISOString().slice(0, 16));
    setEndTime(later.toISOString().slice(0, 16));
    setEligibleCount(400);
    setStatusVal('upcoming');
    setFormOpen(true);
  };

  const openEditForm = (el: Election) => {
    setEditingId(el.id);
    setTitle(el.title);
    setDescription(el.description);
    setElectionType(el.election_type);
    setEligibilityNote(el.eligibility_note);
    setStartTime(new Date(el.start_time).toISOString().slice(0, 16));
    setEndTime(new Date(el.end_time).toISOString().slice(0, 16));
    setEligibleCount(el.eligible_voter_count);
    setStatusVal(el.status);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        election_type: electionType,
        eligibility_note: eligibilityNote,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        eligible_voter_count: Number(eligibleCount),
        ...(editingId ? {} : { status: statusVal }),
      };

      if (editingId) {
        await apiRequest(`/admin/elections/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        addToast({ type: 'success', title: 'Election updated' });
      } else {
        await apiRequest('/admin/elections', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        addToast({ type: 'success', title: 'Demo election created' });
      }
      setFormOpen(false);
      loadElections();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: err instanceof ApiError ? err.message : 'Check election fields.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: ElectionStatus) => {
    try {
      await apiRequest(`/admin/elections/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      addToast({ type: 'success', title: `Status updated to ${newStatus}` });
      loadElections();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Status change failed',
        description: err instanceof ApiError ? err.message : 'Unable to update status.',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiRequest(`/admin/elections/${deleteTarget.id}`, { method: 'DELETE' });
      addToast({ type: 'info', title: 'Election deleted' });
      setDeleteTarget(null);
      loadElections();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Unable to delete.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDAD0] pb-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
            Admin · Lifecycle Control
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#0B1120] sm:text-3xl">
            Manage Demo Elections
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 bg-[#0B1120] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:bg-[#141D30] rounded-[4px]"
        >
          <Plus className="h-4 w-4 text-[#14B8A6]" />
          <span>New Election</span>
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSave}
          className="border border-[#0B1120] bg-white p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#DDDAD0]/60 pb-3">
            <h2 className="font-display text-lg font-bold text-[#0B1120]">
              {editingId ? 'Edit Demo Election' : 'Create Demo Election'}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="text-[#141D30]/60 hover:text-[#0B1120]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
                Title
              </label>
              <input
                type="text"
                required
                minLength={4}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
                Election Type
              </label>
              <input
                type="text"
                required
                value={electionType}
                onChange={(e) => setElectionType(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
              Description
            </label>
            <textarea
              required
              minLength={10}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
                End Time
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
                Eligible Demo Pool
              </label>
              <input
                type="number"
                min={1}
                required
                value={eligibleCount}
                onChange={(e) => setEligibleCount(Number(e.target.value))}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
                  Initial Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as ElectionStatus)}
                  className="mt-1 w-full border border-[#DDDAD0] bg-white px-3 py-2 text-sm rounded-[4px]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#141D30]">
              Eligibility Note
            </label>
            <input
              type="text"
              value={eligibilityNote}
              onChange={(e) => setEligibilityNote(e.target.value)}
              className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="border border-[#DDDAD0] px-4 py-2 text-xs font-semibold uppercase rounded-[4px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B1120] px-5 py-2 text-xs font-semibold uppercase text-white rounded-[4px]"
            >
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Election'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {elections.map((el) => (
              <div key={el.id} className="border border-[#DDDAD0] bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-[#0B1120]">{el.title}</p>
                    <p className="text-xs text-[#141D30]/65">
                      {el.election_type} · {el.candidate_count} candidates
                    </p>
                  </div>
                  <StatusBadge status={el.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-[#141D30]/75">
                  <span>{formatShortDate(el.start_time)} → {formatShortDate(el.end_time)}</span>
                  <span className="tabular-nums font-medium">
                    {el.total_ballots}/{el.eligible_voter_count} ({el.participation_rate}%)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-[#DDDAD0]/60 pt-3">
                  <select
                    aria-label={`Change status for ${el.title}`}
                    value={el.status}
                    onChange={(e) =>
                      handleStatusChange(el.id, e.target.value as ElectionStatus)
                    }
                    className="min-h-[40px] flex-1 border border-[#DDDAD0] bg-white px-2.5 py-1.5 text-xs rounded-[3px]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        Status: {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openEditForm(el)}
                    aria-label={`Edit ${el.title}`}
                    className="inline-flex h-10 w-10 items-center justify-center border border-[#DDDAD0] text-[#0B1120] rounded-[3px]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(el)}
                    aria-label={`Delete ${el.title}`}
                    className="inline-flex h-10 w-10 items-center justify-center border border-[#E05A47]/40 text-[#E05A47] rounded-[3px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-[#DDDAD0] bg-white overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#DDDAD0] bg-[#F7F6F2]/60 text-[11px] uppercase tracking-wider text-[#141D30]/70">
                <th className="px-4 py-3">Election</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Turnout</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDAD0]/60">
              {elections.map((el) => (
                <tr key={el.id}>
                  <td className="px-4 py-4">
                    <p className="font-display font-semibold text-[#0B1120]">{el.title}</p>
                    <p className="text-xs text-[#141D30]/65">
                      {el.election_type} · {el.candidate_count} candidates
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#141D30]/75">
                    {formatShortDate(el.start_time)} → {formatShortDate(el.end_time)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={el.status} />
                      <select
                        aria-label={`Change status for ${el.title}`}
                        value={el.status}
                        onChange={(e) =>
                          handleStatusChange(el.id, e.target.value as ElectionStatus)
                        }
                        className="border border-[#DDDAD0] bg-white px-2 py-1 text-xs rounded-[3px]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs tabular-nums font-medium">
                    {el.total_ballots} / {el.eligible_voter_count} ({el.participation_rate}%)
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(el)}
                        aria-label={`Edit ${el.title}`}
                        className="border border-[#DDDAD0] p-1.5 text-[#0B1120] hover:border-[#0B1120] rounded-[3px]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(el)}
                        aria-label={`Delete ${el.title}`}
                        className="border border-[#E05A47]/40 p-1.5 text-[#E05A47] hover:bg-[#E05A47]/10 rounded-[3px]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Demo Election"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This removes all associated candidates and simulated ballots.`}
        confirmLabel="Delete Election"
        destructive
        loading={submitting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
