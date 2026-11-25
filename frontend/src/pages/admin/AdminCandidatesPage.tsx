import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { apiRequest, ApiError } from '../../services/api';
import type { Candidate, Election } from '../../types';
import { ConfirmModal } from '../../components/ConfirmModal';
import { TableSkeleton } from '../../components/Skeletons';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/format';
import { pageTransitionVariants } from '../../animations/motion';

export const AdminCandidatesPage: React.FC = () => {
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [filterElection, setFilterElection] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [biography, setBiography] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [vision, setVision] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [accentColor, setAccentColor] = useState('#14B8A6');
  const [electionId, setElectionId] = useState<number>(1);

  const loadData = () => {
    setLoading(true);
    const params = filterElection !== 'all' ? `?election_id=${filterElection}` : '';
    Promise.all([
      apiRequest<Candidate[]>(`/candidates${params}`),
      apiRequest<Election[]>('/admin/elections'),
    ])
      .then(([cands, els]) => {
        setCandidates(cands);
        setElections(els);
        if (els.length > 0 && !editingId) {
          setElectionId(els[0].id);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterElection]);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setPosition('Council Seat');
    setOrganization('');
    setBiography('');
    setManifesto('');
    setVision('');
    setObjectivesText('');
    setAccentColor('#14B8A6');
    if (elections.length > 0) setElectionId(elections[0].id);
    setFormOpen(true);
  };

  const openEdit = (c: Candidate) => {
    setEditingId(c.id);
    setName(c.name);
    setPosition(c.position);
    setOrganization(c.organization);
    setBiography(c.biography);
    setManifesto(c.manifesto);
    setVision(c.vision);
    setObjectivesText(c.objectives.join('\n'));
    setAccentColor(c.accent_color);
    setElectionId(c.election_id);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const objectives = objectivesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        name,
        position,
        organization,
        biography,
        manifesto,
        vision,
        objectives,
        accent_color: accentColor,
        election_id: Number(electionId),
      };
      if (editingId) {
        await apiRequest(`/admin/candidates/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        addToast({ type: 'success', title: 'Candidate updated' });
      } else {
        await apiRequest('/admin/candidates', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        addToast({ type: 'success', title: 'Candidate added' });
      }
      setFormOpen(false);
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: err instanceof ApiError ? err.message : 'Check candidate details.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiRequest(`/admin/candidates/${deleteTarget.id}`, { method: 'DELETE' });
      addToast({ type: 'info', title: 'Candidate removed' });
      setDeleteTarget(null);
      loadData();
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
            Admin · Slate Roster
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#0B1120] sm:text-3xl">
            Manage Candidates
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by election"
            value={filterElection}
            onChange={(e) => setFilterElection(e.target.value)}
            className="border border-[#DDDAD0] bg-white px-3 py-2 text-xs font-medium rounded-[4px]"
          >
            <option value="all">All Elections</option>
            {elections.map((el) => (
              <option key={el.id} value={String(el.id)}>
                {el.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[#0B1120] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:bg-[#141D30] rounded-[4px]"
          >
            <Plus className="h-4 w-4 text-[#14B8A6]" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSave} className="border border-[#0B1120] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDAD0]/60 pb-3">
            <h2 className="font-display text-lg font-bold text-[#0B1120]">
              {editingId ? 'Edit Candidate' : 'Add Demo Candidate'}
            </h2>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Position</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Organization</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Assigned Election</label>
              <select
                value={electionId}
                onChange={(e) => setElectionId(Number(e.target.value))}
                className="mt-1 w-full border border-[#DDDAD0] bg-white px-3 py-2 text-sm rounded-[4px]"
              >
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Monogram Accent</label>
              <select
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] bg-white px-3 py-2 text-sm rounded-[4px]"
              >
                <option value="#14B8A6">Muted Champagne (#14B8A6)</option>
                <option value="#E05A47">Coral Accent (#E05A47)</option>
                <option value="#141D30">Graphite (#141D30)</option>
                <option value="#0D9488">Warm Bronze (#0D9488)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Biography</label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Manifesto</label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">Vision Statement</label>
              <input
                type="text"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">
                Key Objectives (one per line)
              </label>
              <textarea
                rows={2}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                className="mt-1 w-full border border-[#DDDAD0] px-3 py-2 text-sm rounded-[4px]"
              />
            </div>
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
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Candidate'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {candidates.map((c) => (
              <div key={c.id} className="border border-[#DDDAD0] bg-white p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center font-display text-xs font-bold text-white rounded-[4px]"
                    style={{ backgroundColor: c.accent_color || '#0B1120' }}
                  >
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-[#0B1120] truncate">{c.name}</p>
                    <p className="text-xs text-[#141D30]/75 truncate">
                      {c.position} · {c.organization}
                    </p>
                    <p className="text-[11px] text-[#0D9488] truncate">
                      {c.election_title || `Election #${c.election_id}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    aria-label={`Edit ${c.name}`}
                    className="inline-flex h-10 w-10 items-center justify-center border border-[#DDDAD0] rounded-[3px]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    aria-label={`Delete ${c.name}`}
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
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Position / Org</th>
                <th className="px-4 py-3">Election</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDDAD0]/60">
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3.5 flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center font-display text-xs font-bold text-white rounded-[4px]"
                      style={{ backgroundColor: c.accent_color || '#0B1120' }}
                    >
                      {getInitials(c.name)}
                    </div>
                    <span className="font-display font-semibold text-[#0B1120]">{c.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#141D30]/80">
                    {c.position} · {c.organization}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#141D30]/75">
                    {c.election_title || `Election #${c.election_id}`}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                        className="border border-[#DDDAD0] p-1.5 hover:border-[#0B1120] rounded-[3px]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        aria-label={`Delete ${c.name}`}
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
        title="Remove Candidate"
        description={`Remove "${deleteTarget?.name}" from this demo election?`}
        confirmLabel="Remove Candidate"
        destructive
        loading={submitting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
