import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextValue {
  isLoggedIn: boolean | null;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: null,
  signIn: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_session').then(val => {
      setIsLoggedIn(val !== null);
    });
  }, []);

  const signIn = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem('user_session');
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
