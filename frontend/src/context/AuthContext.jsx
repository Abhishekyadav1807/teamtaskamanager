import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
const normalizeUser = (u) => (u ? { ...u, _id: u._id || u.id, id: u.id || u._id } : null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(normalizeUser(data.user));
    } catch {
      localStorage.removeItem("ttm_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("ttm_token")) loadProfile();
    else setLoading(false);
  }, []);

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("ttm_token", data.token);
    setUser(normalizeUser(data.user));
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("ttm_token", data.token);
    setUser(normalizeUser(data.user));
  };

  const logout = () => {
    localStorage.removeItem("ttm_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, signup, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
