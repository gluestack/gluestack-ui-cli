import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { client } from '@app-launch-kit/modules/init/supabase/supabaseClient';
import { Service } from '@app-launch-kit/modules/auth/providers';
import {
  Session,
  SessionContext as SessionContextType,
} from '@app-launch-kit/modules/auth/types/IAuthContext';
import { IAuthService } from '@app-launch-kit/modules/auth/types/IAuthProvider';

export const SessionContext = createContext<SessionContextType>({
  isLoading: true,
  session: null,
  error: null,
  client: {} as any,
  Service: {} as IAuthService,
});

export interface SessionContextProviderProps {
  initialSession?: Session;
  children: React.ReactNode;
}

export const SessionContextProvider = ({
  initialSession = null,
  children,
}: PropsWithChildren<SessionContextProviderProps>) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);
  const [error, setError] = useState<any>();

  useEffect(() => {
    if (!session && initialSession) {
      setSession(initialSession);
    }
  }, [session, initialSession]);

  useEffect(() => {
    let mounted = true;
    async function getSession() {
      const { data, error } = await Service.getSession();

      if (mounted) {
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }

        setSession(data.session);
        setIsLoading(false);
      }
    }

    getSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    (async () => {
      const subscriptionObject = await Service.onAuthStateChange(
        (event: string, session: Session) => {
          if (
            session &&
            (event === 'SIGNED_IN' ||
              event === 'TOKEN_REFRESHED' ||
              event === 'USER_UPDATED')
          ) {
            setSession(session);
          }

          if (event === 'SIGNED_OUT') {
            setSession(null);
          }
        }
      );
      unsubscribe = subscriptionObject.unsubscribe;
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value: SessionContextType = useMemo(() => {
    if (isLoading) {
      return {
        isLoading: true,
        session: null,
        error: null,
        client,
        Service,
      };
    }

    if (error) {
      return {
        isLoading: false,
        session: null,
        error,
        client,
        Service,
      };
    }

    return {
      isLoading: false,
      session,
      error: null,
      client,
      Service,
    };
  }, [isLoading, session, error, client, Service]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
