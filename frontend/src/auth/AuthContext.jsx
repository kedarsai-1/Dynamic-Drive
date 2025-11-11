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

  const saveUser = (usr) => {
    setUser(usr);
    localStorage.setItem("user", JSON.stringify(usr));
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
  };

  /** ✅ LOGIN */
  const login = async (formData) => {
    const res = await api.post("/api/auth/login", formData, {
      withCredentials: true,
    });
    saveUser(res.data.user);
  };

  /** ✅ LOGOUT */
  const logout = async () => {
    await api.post("/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
    localStorage.removeItem("user");
  };

  /** ✅ CHECK SESSION */
  const checkUser = async () => {
    try {
      const stored = localStorage.getItem("user");

      // If nothing stored → no need to call backend
      if (!stored || stored === "undefined") return;

      const res = await api.get("/api/auth/me", { withCredentials: true });
      if (res?.data?.user) saveUser(res.data.user);

    } catch (error) {
      console.warn("Session expired — keeping localStorage user");
      // Do not clear user; allow localStorage session
      // Remove only if you want strict backend validation
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
