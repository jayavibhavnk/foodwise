import { useState, useEffect } from 'react';
import { authService, AuthState } from '@/services/authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateUser: authService.updateUser.bind(authService),
    completeOnboarding: authService.completeOnboarding.bind(authService),
  };
}