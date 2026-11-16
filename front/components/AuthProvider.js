'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api, getStoredUser, storeUser, onSourceChange, isDemoForced } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState('api');

  useEffect(() => {
    setUser(getStoredUser());
    if (isDemoForced()) setSource('demo');
    setReady(true);
    return onSourceChange(setSource);
  }, []);

  const signIn = async data => {
    const res = await api.signIn(data);
    storeUser(res.user);
    setUser(res.user);
    return res;
  };

  const signUp = async data => {
    const res = await api.signUp(data);
    storeUser(res.user);
    setUser(res.user);
    return res;
  };

  const signOut = async () => {
    try {
      await api.signOut();
    } finally {
      storeUser(null);
      setUser(null);
    }
  };

  const updateSelf = next => {
    storeUser(next);
    setUser(next);
  };

  return (
    <AuthContext.Provider value={{ user, ready, source, signIn, signUp, signOut, updateSelf }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
