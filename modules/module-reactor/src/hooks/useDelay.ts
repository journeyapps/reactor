import { useEffect, useMemo, useRef } from 'react';

/**
 * Manage one delayed callback. Scheduling again replaces the pending callback,
 * and unmounting cancels it. Returned methods are stable across renders.
 */
export const useDelay = () => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delay = useMemo(() => {
    const cancel = () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
    return {
      cancel,
      isPending: () => timer.current !== null,
      schedule: (callback: () => void, milliseconds: number) => {
        cancel();
        timer.current = setTimeout(() => {
          timer.current = null;
          callback();
        }, milliseconds);
      }
    };
  }, []);

  useEffect(() => delay.cancel, [delay]);
  return delay;
};
