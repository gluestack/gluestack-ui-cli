import { useContext } from 'react';
import { SessionContext } from '../contexts';
import { SessionContext as SessionContextType } from '../types/IAuthContext';

export const useAuth = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(
      `useSessionContext must be used within a SessionContextProvider.`
    );
  }

  return context;
};
