/**
 * useAsync.js
 * Production-ready async data fetching hook
 */

import { useState, useEffect, useCallback } from "react";

export default function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState("idle");
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus("success");
      return response;
    } catch (error) {
      setError(error);
      setStatus("error");
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (!immediate) return;
    execute();
  }, [execute, immediate]);

  return {
    execute,
    status,
    value,
    error,
    isLoading: status === "pending",
    isError: status === "error",
    isSuccess: status === "success",
    isIdle: status === "idle",
  };
}
