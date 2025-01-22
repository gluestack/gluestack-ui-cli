import { Service } from '../providers';

export type Session = any; // Replace 'any' with a more specific type if available

export type SessionContextState = {
  isLoading: boolean;
  session: Session | null;
  error: any | null;
  client: any;
  Service: typeof Service;
};

export type SessionContext =
  | (SessionContextState & { isLoading: true; session: null; error: null })
  | (SessionContextState & { isLoading: false; session: Session; error: null })
  | (SessionContextState & { isLoading: false; session: null; error: any })
  | (SessionContextState & { isLoading: false; session: null; error: null });

export interface SessionContextProviderProps {
  initialSession?: Session;
  children: React.ReactNode;
}

export type AuthStateChangeEvent =
  | 'SIGNED_IN'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'SIGNED_OUT';

export interface AuthStateChangeHandler {
  (event: AuthStateChangeEvent, session: Session): void;
}

export interface ServiceInterface {
  getSession(): Promise<{ data: { session: Session }; error: any }>;
  onAuthStateChange(callback: AuthStateChangeHandler): {
    unsubscribe: () => void;
  };
}
