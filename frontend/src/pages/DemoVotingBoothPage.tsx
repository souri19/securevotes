import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  IdCard,
  Lock,
  ShieldAlert,
  Vote,
} from 'lucide-react';
import { apiRequest, ApiError } from '../services/api';
import type { DemoBallotReceipt, ElectionDetail, VotingEligibility } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { CardSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getInitials } from '../utils/format';
import { pageTransitionVariants, EASE_PREMIUM } from '../animations/motion';

type BoothStep = 'select' | 'review' | 'receipt';

export const DemoVotingBoothPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [eligibility, setEligibility] = useState<VotingEligibility | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState<number | null>(null);
  const [step, setStep] = useState<BoothStep>('select');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<DemoBallotReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiRequest<ElectionDetail>(`/elections/${id}`),
      apiRequest<VotingEligibility>(`/voting/eligibility/${id}`),
    ])
      .then(([elData, eligData]) => {
        setElection(elData);
        setEligibility(eligData);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to initialize demo voting booth.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedCandidate =
    election?.candidates.find((c) => c.id === selectedCandidateId) || null;

  const handleCastBallot = async () => {
    if (!election || !selectedCandidate) return;
    setSubmitting(true);
    try {
      const res = await apiRequest<DemoBallotReceipt>('/voting/submit', {
        method: 'POST',
        body: JSON.stringify({
          election_id: election.id,
          candidate_id: selectedCandidate.id,
        }),
      });
      setReceipt(res);
      setConfirmOpen(false);
      setStep('receipt');
      addToast({
        type: 'success',
        title: 'Single demo ballot recorded',
        description: `Receipt ${res.receipt_ref} issued. Voter ID locked for this election.`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit demo ballot.';
      addToast({ type: 'error', title: 'Submission blocked', description: msg });
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReceipt = async () => {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.receipt_ref);
      addToast({ type: 'info', title: 'Receipt copied', description: receipt.receipt_ref });
    } catch {
      addToast({ type: 'info', title: 'Receipt code', description: receipt.receipt_ref });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="border border-[#E05A47] bg-white p-8">
          <h1 className="font-display text-2xl font-bold text-[#0B1120]">Voting Booth Unavailable</h1>
          <p className="mt-2 text-sm text-[#1E293B]/80">{error || 'Election not found.'}</p>
          <Link to="/elections" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline">
            <ArrowLeft className="h-4 w-4" /> Return to Elections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-4 py-8 sm:py-10 sm:px-6 space-y-6"
    >
      {/* Explicit Demo & One-Vote Enforcement Notice */}
      <div className="border border-[#1E293B] bg-[#0B1120] px-4 sm:px-5 py-3.5 text-[#F7F6F2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs">
          <ShieldAlert className="h-4 w-4 text-[#14B8A6] shrink-0" />
          <span>
            <strong>Demo Booth · One-Vote Rule:</strong> Voter ID{' '}
            <span className="font-mono text-[#E5A93C]">{user?.voter_id}</span> may cast exactly one simulated ballot in this election.
          </span>
        </div>
        <span className="inline-flex items-center gap-1 border border-[#14B8A6]/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#14B8A6]">
          <IdCard className="h-3 w-3" />
          1 Ballot Max
        </span>
      </div>

      {/* Stepper Header */}
      <div className="border border-[#DDDAD0] bg-white p-5 sm:p-8">
        <Link
          to={`/elections/${election.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1E293B]/70 hover:text-[#0B1120]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Election Details</span>
        </Link>

        <h1 className="mt-3 font-display text-2xl font-bold text-[#0B1120] sm:text-3xl">
          {election.title}
        </h1>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 border-t border-[#DDDAD0]/60 pt-5">
          {[
            { key: 'select', num: '01', label: 'Select' },
            { key: 'review', num: '02', label: 'Review' },
            { key: 'receipt', num: '03', label: 'Receipt' },
          ].map((item) => {
            const active = step === item.key;
            const completed =
              (item.key === 'select' && (step === 'review' || step === 'receipt')) ||
              (item.key === 'review' && step === 'receipt');
            return (
              <div
                key={item.key}
                className={`border-t-2 pt-2.5 transition-colors ${
                  active
                    ? 'border-[#0D9488]'
                    : completed
                      ? 'border-[#E5A93C]'
                      : 'border-[#DDDAD0]'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                  Step {item.num}
                </span>
                <p
                  className={`text-xs font-semibold sm:text-sm ${
                    active || completed ? 'text-[#0B1120]' : 'text-[#64748B]'
                  }`}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ineligible or Already Voted Guard */}
      {eligibility && !eligibility.eligible && step !== 'receipt' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-[#DDDAD0] bg-white p-8 text-center"
        >
          <Lock className="mx-auto h-9 w-9 text-[#0D9488]" />
          <h2 className="mt-4 font-display text-xl font-bold text-[#0B1120]">
            {eligibility.has_voted ? 'Vote Already Recorded (1/1 Used)' : 'Voting Not Available'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#1E293B]/80">
            {eligibility.reason}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={`/results?election=${election.id}`}
              className="min-h-[44px] inline-flex items-center bg-[#0B1120] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] rounded-[4px]"
            >
              View Simulated Results
            </Link>
            <Link
              to="/dashboard"
              className="min-h-[44px] inline-flex items-center border border-[#DDDAD0] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0B1120] rounded-[4px]"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="step-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: EASE_PREMIUM }}
              className="space-y-4"
            >
              <div role="radiogroup" aria-label="Select one candidate" className="space-y-3">
                {election.candidates.map((cand) => {
                  const selected = selectedCandidateId === cand.id;
                  const expanded = expandedCandidateId === cand.id;
                  return (
                    <motion.div
                      key={cand.id}
                      whileHover={{ y: -2 }}
                      className={`border transition-all rounded-[4px] bg-white ${
                        selected
                          ? 'border-[#0B1120] ring-2 ring-[#14B8A6]'
                          : 'border-[#DDDAD0] hover:border-[#0B1120]'
                      }`}
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSelectedCandidateId(cand.id)}
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 sm:gap-4">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center font-display text-xs font-bold text-white rounded-[4px]"
                            style={{ backgroundColor: cand.accent_color || '#0B1120' }}
                          >
                            {getInitials(cand.name)}
                          </div>
                          <div>
                            <h2 className="font-display text-base sm:text-lg font-bold text-[#0B1120]">
                              {cand.name}
                            </h2>
                            <p className="text-xs font-medium text-[#0D9488]">
                              {cand.position} · {cand.organization}
                            </p>
                            <p className="mt-2 text-sm text-[#1E293B]/80 line-clamp-2">
                              {cand.manifesto}
                            </p>
                          </div>
                        </div>

                        <motion.div
                          animate={selected ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center border rounded-full transition-colors ${
                            selected
                              ? 'border-[#0D9488] bg-[#0D9488] text-white'
                              : 'border-[#DDDAD0] bg-[#F7F6F2]'
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </motion.div>
                      </button>

                      <div className="border-t border-[#DDDAD0]/50 px-4 sm:px-5 py-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCandidateId(expanded ? null : cand.id)
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#1E293B]/75 hover:text-[#0B1120]"
                        >
                          {expanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              <span>Hide full platform</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              <span>Read full platform &amp; objectives</span>
                            </>
                          )}
                        </button>
                        {selected && (
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0D9488]">
                            Selected
                          </span>
                        )}
                      </div>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-[#DDDAD0]/50 bg-[#F7F6F2]/70"
                          >
                            <div className="px-4 sm:px-5 py-4 space-y-2.5 text-xs">
                              <p className="leading-relaxed text-[#1E293B]/85">
                                <strong className="text-[#0B1120]">Biography:</strong> {cand.biography}
                              </p>
                              <p className="leading-relaxed text-[#1E293B]/85">
                                <strong className="text-[#0B1120]">Manifesto:</strong> {cand.manifesto}
                              </p>
                              {cand.objectives.length > 0 && (
                                <ul className="space-y-1 pt-1 text-[#0B1120]">
                                  {cand.objectives.map((obj, idx) => (
                                    <li key={idx}>• {obj}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-[#DDDAD0] bg-white p-5">
                <p className="text-xs text-[#1E293B]/75">
                  {selectedCandidate
                    ? `Selected: ${selectedCandidate.name}`
                    : 'Choose one candidate above to proceed to review.'}
                </p>
                <motion.button
                  whileHover={selectedCandidate ? { scale: 1.02 } : undefined}
                  whileTap={selectedCandidate ? { scale: 0.98 } : undefined}
                  type="button"
                  disabled={!selectedCandidate}
                  onClick={() => setStep('review')}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#0B1120] px-5 py-2.5 text-sm font-semibold text-[#F7F6F2] hover:bg-[#141D30] disabled:opacity-40 transition-colors rounded-[4px]"
                >
                  <span>Review Selection</span>
                  <ArrowRight className="h-4 w-4 text-[#14B8A6]" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'review' && selectedCandidate && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: EASE_PREMIUM }}
              className="border border-[#DDDAD0] bg-white p-6 sm:p-8 space-y-6"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D9488]">
                  Final Review Before Demo Submission
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#0B1120]">
                  Confirm your selected candidate
                </h2>
              </div>

              <div className="border border-[#0B1120] bg-[#F7F6F2] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-wider text-[#0D9488] font-semibold">
                  {election.title}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-[#0B1120]">
                  {selectedCandidate.name}
                </p>
                <p className="text-sm text-[#1E293B]/80">
                  {selectedCandidate.position} · {selectedCandidate.organization}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-[#1E293B]/75">
                Once submitted, Voter ID <strong className="font-mono text-[#0B1120]">{user?.voter_id}</strong> is permanently locked from voting again in this election, and your ballot selection is recorded without your identity.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-[#DDDAD0]/60 pt-5">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 border border-[#DDDAD0] px-4 py-2.5 text-sm font-medium text-[#0B1120] hover:bg-[#F7F6F2] rounded-[4px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Change Selection</span>
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#0B1120] px-6 py-2.5 text-sm font-semibold text-[#F7F6F2] hover:bg-[#141D30] rounded-[4px]"
                >
                  <Vote className="h-4 w-4 text-[#14B8A6]" />
                  <span>Submit Demo Ballot</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'receipt' && receipt && (
            <motion.div
              key="step-receipt"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="border border-[#1E293B] bg-[#0B1120] p-6 sm:p-10 text-[#F7F6F2] space-y-6"
            >
              <div className="flex items-center gap-3.5">
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-[#0B1120]"
                >
                  <CheckCircle2 className="h-6 w-6" />
                </motion.div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#14B8A6]">
                    One-Vote Lock Applied · Simulated Complete
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Demo Ballot Recorded
                  </h2>
                </div>
              </div>

              <div className="border border-[#23304C] bg-[#141D30] p-5 space-y-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[#94A3B8]">Demo Receipt Reference</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#E5A93C]">
                      {receipt.receipt_ref}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyReceipt}
                      aria-label="Copy receipt reference"
                      className="border border-[#23304C] p-1.5 text-[#CBD5E1] hover:border-[#14B8A6] hover:text-white rounded-[3px]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#94A3B8]">Election</span>
                  <span className="font-medium text-white">{receipt.election_title}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#94A3B8]">Status</span>
                  <span className="uppercase text-xs tracking-wider text-[#14B8A6] font-semibold">
                    Simulated Recorded
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#94A3B8]">
                {receipt.privacy_notice}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to={`/results?election=${receipt.election_id}`}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#14B8A6] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0B1120] hover:bg-[#2DD4BF] rounded-[4px]"
                >
                  <span>View Simulated Results</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 border border-[#23304C] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F6F2] hover:border-[#14B8A6] rounded-[4px]"
                >
                  <span>Return to Dashboard</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Simulated Ballot Submission"
        description={`You are submitting your single simulated ballot for ${selectedCandidate?.name || 'your selected candidate'}. Voter ID ${user?.voter_id} cannot vote again in this election.`}
        confirmLabel="Confirm & Submit"
        loading={submitting}
        onConfirm={handleCastBallot}
        onClose={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
};
