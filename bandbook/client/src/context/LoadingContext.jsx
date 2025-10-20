import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

const LoadingContext = createContext(null);

/**
 * LoadingProvider tracks a global loading counter.
 * Call show()/hide() around async operations to toggle the overlay.
 */
export function LoadingProvider({ children }) {
  const [count, setCount] = useState(0);

  const show = useCallback(() => setCount((c) => c + 1), []);
  const hide = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  const value = useMemo(() => ({ count, show, hide }), [count, show, hide]);

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

/** useLoading gives access to { count, show, hide } */
export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used inside <LoadingProvider>');
  return ctx;
}
