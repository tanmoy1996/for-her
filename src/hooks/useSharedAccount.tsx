import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { UserSession, clearUserSession, getSavedUserSession, refreshUserSession, saveUserSession } from '../services/firebase';

type SharedAccountContextValue = {
  session: UserSession | null;
  isHydrating: boolean;
  setSession: (session: UserSession | null) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SharedAccountContext = createContext<SharedAccountContextValue | undefined>(undefined);

export function SharedAccountProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<UserSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void getSavedUserSession().then((savedSession) => {
      if (!isMounted) {
        return;
      }

      setSessionState(savedSession);
      setIsHydrating(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const setSession = async (nextSession: UserSession | null) => {
    if (nextSession) {
      await saveUserSession(nextSession);
    } else {
      await clearUserSession();
    }

    setSessionState(nextSession);
  };

  const refreshSession = async () => {
    if (!session?.userId) {
      return;
    }

    const freshSession = await refreshUserSession(session.userId);
    setSessionState(freshSession);
  };

  return (
    <SharedAccountContext.Provider value={{ session, isHydrating, setSession, refreshSession }}>
      {children}
    </SharedAccountContext.Provider>
  );
}

export function useSharedAccount() {
  const context = useContext(SharedAccountContext);

  if (!context) {
    throw new Error('useSharedAccount must be used within SharedAccountProvider');
  }

  return context;
}
