import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage } from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      setProfile(response.data.profile);
      return response.data;
    } catch (error) {
      tokenStorage.clear();
      setUser(null);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = tokenStorage.getAccess();
      const refreshToken = tokenStorage.getRefresh();

      if (!accessToken && refreshToken) {
        try {
          const response = await api.post('/auth/refresh', { refreshToken }, { withAuth: false });
          const newAccessToken = response?.data?.accessToken;
          if (newAccessToken) {
            tokenStorage.setTokens({ accessToken: newAccessToken });
          }
        } catch (error) {
          tokenStorage.clear();
        }
      }

      if (tokenStorage.getAccess()) {
        await fetchProfile();
      }
      setLoading(false);
    };

    bootstrap();
  }, [fetchProfile]);

  const login = useCallback(async (payload) => {
    const response = await api.post('/auth/login', payload, { withAuth: false });
    tokenStorage.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    await fetchProfile();
    return response;
  }, [fetchProfile]);

  const register = useCallback(async (payload) => {
    const response = await api.post('/auth/register', payload, { withAuth: false });
    tokenStorage.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });
    await fetchProfile();
    return response;
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      // ignore logout failure
    }
    tokenStorage.clear();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    login,
    register,
    logout,
    refreshProfile: fetchProfile,
  }), [user, profile, loading, login, register, logout, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
