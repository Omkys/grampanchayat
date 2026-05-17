"use client";

import { useEffect, useRef } from "react";

/** Default interval: refetch every 30s while the browser tab is visible. */
export const LIVE_POLL_INTERVAL_MS = 30_000;

type LivePollOptions = {
  /** Poll interval in ms (default 30_000). */
  intervalMs?: number;
  /** Set false to disable polling. */
  enabled?: boolean;
  /** If false, only interval + visibility refetch (use when the component loads data on mount separately). */
  runOnMount?: boolean;
};

/**
 * Periodically refetches data while the tab is visible, and refetches when the user returns to the tab.
 * Pauses when the tab is hidden (no background polling).
 */
export function useLivePoll(
  fetchFn: () => void | Promise<void>,
  options?: LivePollOptions
) {
  const { intervalMs = LIVE_POLL_INTERVAL_MS, enabled = true, runOnMount = true } = options ?? {};
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      if (document.visibilityState !== "visible") return;
      void fnRef.current();
    };

    if (runOnMount) run();

    const timer = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
    };
  }, [intervalMs, enabled, runOnMount]);
}
