import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../lib/api.js';
import { useLoading } from './LoadingContext.jsx';

const AuthContext = createContext(null);

/**
 * AuthProvider keeps the current user and exposes auth actions.
 * - checkAuth(): GET /api/auth/me
 * - login({ email, password })
 * - register({ name, email, password, avatarUrl? } | FormData with 'avatar')
 * - logout()
 */
export function AuthProvider({ children }) {
  const { show, hide } = useLoading();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

  const checkAuth = useCallback(async () => {
    setStatus('loading');
    show();
    try {
      const data = await api('/api/auth/me');
      setUser(data?.user || null);
      setStatus(data?.user ? 'authenticated' : 'unauthenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    } finally {
      hide();
    }
  }, [show, hide]);

  const login = useCallback(
    async ({ email, password }) => {
      show();
      try {
        const data = await api('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        setUser(data.user);
        setStatus('authenticated');
        return data.user;
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  /**
   * Register supports either:
   *  - JSON body: { name, email, password, avatarUrl? }
   *  - FormData body with a file field named 'avatar'
   */
  const register = useCallback(
    async (payload) => {
      show();
      try {
        const isFormData = payload instanceof FormData;
        const data = await api('/api/auth/register', {
          method: 'POST',
          body: isFormData ? payload : payload,
        });
        setUser(data.user);
        setStatus('authenticated');
        return data.user;
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  const logout = useCallback(async () => {
    show();
    try {
      await api('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setStatus('unauthenticated');
    } finally {
      hide();
    }
  }, [show, hide]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      user,
      status,
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      checkAuth,
      login,
      register,
      logout,
    }),
    [user, status, checkAuth, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** useAuth gives { user, status, authenticated, unauthenticated, login, register, logout, checkAuth } */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
