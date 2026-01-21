import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import * as auth_api from "./auth.api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    auth_api
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
