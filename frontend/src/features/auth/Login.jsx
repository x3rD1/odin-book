import { useContext, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { api } from "../../api/client";
import Loading from "../../components/Loading";
import AuthContext from "./AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { refreshUser, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/login", { email, password });
      await refreshUser();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed", err);
      setError(err.message || "Login failed");
      setPassword("");
    }
  };

  if (loading) return <Loading />;

  if (user) return <Navigate to="/" replace />;

  return (
    <div>
      <form onSubmit={handleLogin}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
