import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trust stored credentials without a network call — avoids
    // ERR_CONNECTION_REFUSED noise when the backend is unavailable.
    // Stale tokens are cleaned up on the next failed API call.
    if (auth.isValid()) {
      setAdmin(auth.getRecord());
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setAdmin(null);
    }
    setLoading(false);

    // Subscribe to auth state changes
    const unsubscribe = auth.onChange((token, record) => {
      const valid = !!token && !!record;
      setIsAuthenticated(valid);
      setAdmin(valid ? record : null);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const authData = await auth.signIn(email, password);
      setIsAuthenticated(true);
      setAdmin(authData.record);
      return authData;
    } catch (err) {
      // Re-throw with a user-friendly message instead of a raw network error
      const msg =
        err?.code === 'ERR_NETWORK'
          ? 'Serveur indisponible. Veuillez réessayer plus tard.'
          : err?.response?.data?.error || err?.message || 'Échec de la connexion.';
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    auth.clear();
    setIsAuthenticated(false);
    setAdmin(null);
  }, []);

  return (
    <AdminContext.Provider value={{ admin, isAuthenticated, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
