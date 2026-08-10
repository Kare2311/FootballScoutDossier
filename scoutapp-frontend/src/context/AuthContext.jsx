import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("scoutapp_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("scoutapp_token");
      })
      .finally(() => setLoading(false));
  }, []);

  function login(user, token) {
    localStorage.setItem("scoutapp_token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("scoutapp_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mora biti korisceno unutar AuthProvider-a.");
  return ctx;
}
