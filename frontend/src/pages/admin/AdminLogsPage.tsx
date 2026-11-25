import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../services/api';
import type { AuditEvent } from '../../types';
import { TableSkeleton } from '../../components/Skeletons';
import { formatDateTime } from '../../utils/format';
import { pageTransitionVariants } from '../../animations/motion';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (eventTypeFilter) params.set('event_type', eventTypeFilter);

    apiRequest<AuditEvent[]>(`/admin/logs?${params.toString()}`)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [eventTypeFilter]);

  const distinctTypes = Array.from(new Set(logs.map((l) => l.event_type)));

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DDDAD0] pb-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
            Admin · System Telemetry
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#0B1120] sm:text-3xl">
            Activity &amp; Audit Logs
          </h1>
        </div>
        <select
          aria-label="Filter logs by event type"
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="border border-[#DDDAD0] bg-white px-3 py-2 text-xs font-medium rounded-[4px]"
        >
          <option value="">All Event Types</option>
          {distinctTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : logs.length === 0 ? (
        <div className="border border-[#DDDAD0] bg-white p-10 text-center text-sm text-[#141D30]/70">
          No audit events recorded for this filter.
        </div>
      ) : (
        <div className="border border-[#DDDAD0] bg-white divide-y divide-[#DDDAD0]/60">
          {logs.map((ev) => (
            <div
              key={ev.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="border border-[#DDDAD0] bg-[#F7F6F2] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0B1120]">
                    {ev.event_type}
                  </span>
                  {ev.election_title && (
                    <span className="text-xs font-medium text-[#0B1120]">
                      {ev.election_title}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#141D30]/70">
                  {JSON.stringify(ev.metadata)}
                </p>
              </div>
              <span className="text-xs text-[#141D30]/60 tabular-nums shrink-0">
                {formatDateTime(ev.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
