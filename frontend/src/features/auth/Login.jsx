import { useContext, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import Loading from "../../components/Loading";
import AuthContext from "./AuthContext";
import styles from "./auth.module.css";

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

  // Redirect if already logged in
  if (user) return <Navigate to="/" replace />;

  return (
    <div className={styles.page}>
      {loading && <Loading />}

      <div className={`${styles.container} ${loading ? styles.blurred : ""}`}>
        <h1 className={styles.welcomeText}>Welcome back</h1>
        <form onSubmit={handleLogin} className={styles.form}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className={styles.redirectText}>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
