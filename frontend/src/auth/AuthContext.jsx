import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  /** ✅ Save User */
  const saveUser = (usr) => {
    setUser(usr);
    localStorage.setItem("user", JSON.stringify(usr));
  };

  /** ✅ Save Tokens */
  const saveToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    }
  };

  /** ✅ REGISTER */
  const register = async (formData) => {
    await api.post("/api/auth/register", formData, { withCredentials: true });

    const res = await api.post(
      "/api/auth/login",
      { email: formData.email, password: formData.password },
      { withCredentials: true }
    );

    saveUser(res.data.user);
    saveToken(res.data.accessToken);
  };

  /** ✅ LOGIN */
  const login = async (formData) => {
    const res = await api.post("/api/auth/login", formData, {
      withCredentials: true,
    });

    saveUser(res.data.user);
    saveToken(res.data.accessToken);
  };

  /** ✅ LOGOUT */
  const logout = async () => {
    await api.post("/api/auth/logout", {}, { withCredentials: true });

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  /** ✅ CHECK SESSION */
  const checkUser = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser || storedUser === "undefined") return;

      const res = await api.get("/api/auth/me", { withCredentials: true });

      if (res?.data?.user) {
        saveUser(res.data.user);
      }
    } catch (error) {
      console.warn("Session expired — keeping localStorage user");
      // Optional: Clear local data if strict validation needed
      // logout();
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
