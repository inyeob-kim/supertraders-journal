/**
 * Auth state and backend user sync. Call GET /api/v1/users/me after Firebase login.
 */
import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import type { User } from 'firebase/auth';
import { usersApi } from '../api/endpoints';
import type { UserMe } from '../api/types';
import { ApiError } from '../api/client';

export interface AuthState {
  firebaseUser: User | null;
  backendUser: UserMe | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): AuthState & { syncBackendUser: () => Promise<void>; signOut: () => Promise<void> } {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncBackendUser = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) {
      setBackendUser(null);
      return;
    }
    try {
      setError(null);
      const me = await usersApi.getMe();
      setBackendUser(me);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setBackendUser(null);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to sync user');
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    await auth.signOut();
    setFirebaseUser(null);
    setBackendUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseUser(null);
      setBackendUser(null);
      setIsLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user ?? null);
      if (user) {
        await syncBackendUser();
      } else {
        setBackendUser(null);
        setError(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [syncBackendUser]);

  return {
    firebaseUser,
    backendUser,
    isLoading,
    error,
    syncBackendUser,
    signOut,
  };
}
