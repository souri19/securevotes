import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import type {
  AuditEvent,
  Candidate,
  Election,
  ElectionResults,
  PlatformOverview,
} from '../types';
import { CinematicHero } from '../components/landing/CinematicHero';
import { TheIdeaSection } from '../components/landing/TheIdeaSection';
import { HowItWorksSticky } from '../components/landing/HowItWorksSticky';
import { CandidateShowcaseSection } from '../components/landing/CandidateShowcaseSection';
import { VotingExperienceSticky } from '../components/landing/VotingExperienceSticky';
import { ResultsDataSection } from '../components/landing/ResultsDataSection';
import { TransparencyTimelineSection } from '../components/landing/TransparencyTimelineSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';

export const LandingPage: React.FC = () => {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [featuredResults, setFeaturedResults] = useState<ElectionResults | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    apiRequest<PlatformOverview>('/results/overview')
      .then(setOverview)
      .catch(() => null);

    apiRequest<Candidate[]>('/candidates')
      .then(setCandidates)
      .catch(() => null);

    apiRequest<AuditEvent[]>('/transparency/events?limit=6')
      .then(setAuditEvents)
      .catch(() => null);

    apiRequest<Election[]>('/elections?status=active')
      .then((list) => {
        if (list.length > 0) {
          return apiRequest<ElectionResults>(`/results/${list[0].id}`);
        }
        return null;
      })
      .then((res) => {
        if (res) setFeaturedResults(res);
      })
      .catch(() => null);
  }, []);

  return (
    <div>
      <CinematicHero
        totalBallots={overview?.total_simulated_ballots ?? 1034}
        activeElections={overview?.active_elections ?? 2}
      />
      <TheIdeaSection />
      <HowItWorksSticky />
      <CandidateShowcaseSection candidates={candidates} />
      <VotingExperienceSticky />
      <ResultsDataSection overview={overview} featuredResults={featuredResults} />
      <TransparencyTimelineSection events={auditEvents} />
      <FinalCtaSection />
    </div>
  );
};
