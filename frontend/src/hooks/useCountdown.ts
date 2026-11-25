import { useEffect, useState } from 'react';
import { formatCountdown } from '../utils/format';

export function useCountdown(targetIso: string | undefined) {
  const [state, setState] = useState(() =>
    targetIso ? formatCountdown(targetIso) : { label: '—', expired: true }
  );

  useEffect(() => {
    if (!targetIso) return;
    setState(formatCountdown(targetIso));
    const timer = setInterval(() => {
      setState(formatCountdown(targetIso));
    }, 30000);
    return () => clearInterval(timer);
  }, [targetIso]);

  return state;
}
