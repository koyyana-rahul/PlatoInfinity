/**
 * useAutoRefresh.js
 *
 * Production-ready auto-refresh hook
 * - Efficient interval-based data refresh
 * - Automatic pause when tab is hidden
 * - Proper cleanup on unmount
 * - No initial fetch to prevent double-loading
 */

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * @param {Function} refreshCallback - Function to call for refreshing data
 * @param {number} interval - Refresh interval in milliseconds (default: 60000ms = 60s)
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether auto-refresh is enabled (default: true)
 * @param {boolean} options.pauseWhenHidden - Pause when tab is hidden (default: true)
 * @returns {Object} - { isRefreshing, manualRefresh, toggleAutoRefresh, isAutoRefreshEnabled }
 */
export function useAutoRefresh(
  refreshCallback,
  interval = 60000,
  options = {},
) {
  const { enabled = true, pauseWhenHidden = true } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(enabled);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const callbackRef = useRef(refreshCallback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = refreshCallback;
  }, [refreshCallback]);

  // Manual refresh trigger
  const manualRefresh = useCallback(async () => {
    if (isRefreshing || !callbackRef.current) return;

    try {
      setIsRefreshing(true);
      await callbackRef.current();
    } catch (error) {
      console.error("❌ Auto-refresh error:", error);
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing]);

  // Toggle auto-refresh on/off
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled((prev) => !prev);
  }, []);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!isAutoRefreshEnabled || !callbackRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Setup interval (no initial fetch - component should handle that)
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        // Check if should pause when hidden
        if (pauseWhenHidden && document.hidden) {
          return;
        }
        manualRefresh();
      }
    }, interval);

    // Page visibility change handler
    const handleVisibilityChange = () => {
      if (!pauseWhenHidden) return;

      if (!document.hidden && mountedRef.current) {
        // Tab became visible - refresh immediately
        manualRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAutoRefreshEnabled, interval, pauseWhenHidden, manualRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    isRefreshing,
    manualRefresh,
    toggleAutoRefresh,
    isAutoRefreshEnabled,
  };
}

export default useAutoRefresh;
