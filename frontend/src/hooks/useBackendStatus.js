import { useEffect, useState } from "react";
import { getHealth, getInfo } from "../services/api";

const POLL_INTERVAL_MS = 15000;

/**
 * Polls GET /health so the sidebar can show a live online/offline
 * indicator, and fetches GET /info once for the footer (model name,
 * embedding model, retrieval mode) — both real, existing endpoints.
 */
export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState(null); // null = not checked yet
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        await getHealth();
        if (!cancelled) setIsOnline(true);
      } catch {
        if (!cancelled) setIsOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getInfo()
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        // /info failing isn't critical — the footer just stays hidden.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { isOnline, info };
}
