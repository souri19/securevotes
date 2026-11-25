export type UserRole = 'voter' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type ElectionStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'archived';

export interface User {
  id: number;
  name: string;
  email: string;
  voter_id: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface AuthSessionResponse {
  user: User;
  csrf_token: string;
  demo_notice: string;
}

export interface Candidate {
  id: number;
  name: string;
  position: string;
  organization: string;
  biography: string;
  manifesto: string;
  vision: string;
  objectives: string[];
  accent_color: string;
  election_id: number;
  election_title?: string | null;
  election_status?: string | null;
}

export interface Election {
  id: number;
  title: string;
  description: string;
  election_type: string;
  eligibility_note: string;
  start_time: string;
  end_time: string;
  status: ElectionStatus;
  eligible_voter_count: number;
  created_at: string;
  candidate_count: number;
  total_ballots: number;
  participation_rate: number;
  has_voted: boolean;
}

export interface ElectionDetail extends Election {
  candidates: Candidate[];
}

export interface VotingEligibility {
  election_id: number;
  eligible: boolean;
  has_voted: boolean;
  reason: string;
}

export interface DemoBallotReceipt {
  receipt_ref: string;
  election_id: number;
  election_title: string;
  submitted_at: string;
  status: string;
  privacy_notice: string;
}

export interface CandidateResult {
  candidate_id: number;
  name: string;
  position: string;
  organization: string;
  accent_color: string;
  votes: number;
  percentage: number;
}

export interface ParticipationPoint {
  timestamp: string;
  label: string;
  participation_count: number;
}

export interface ElectionResults {
  election_id: number;
  title: string;
  election_type: string;
  status: string;
  start_time: string;
  end_time: string;
  eligible_voter_count: number;
  total_votes: number;
  participation_percentage: number;
  is_simulated: boolean;
  disclaimer: string;
  candidates: CandidateResult[];
  timeline: ParticipationPoint[];
}

export interface PlatformOverview {
  total_elections: number;
  active_elections: number;
  upcoming_elections: number;
  completed_elections: number;
  total_candidates: number;
  total_simulated_ballots: number;
  registered_demo_voters: number;
  average_participation_rate: number;
}

export interface AuditEvent {
  id: number;
  event_type: string;
  election_id: number | null;
  election_title: string | null;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface TransparencySummary {
  prototype_disclaimer: string;
  security_architecture_gaps: string[];
  total_audit_events: number;
  elections_published: number;
  total_simulated_participation: number;
  recent_events: AuditEvent[];
}

export interface ParticipationHistoryItem {
  election_id: number;
  election_title: string;
  election_status: string;
  participated_at: string;
  privacy_note: string;
}

export interface UserSummary extends User {
  participated_elections_count: number;
}
