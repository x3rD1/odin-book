import { useContext, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import AuthContext from "./AuthContext";
import { api } from "../../api/client";
import Loading from "../../components/Loading";
import styles from "./auth.module.css";

function Signup() {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { user, loading } = useContext(AuthContext);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      await api.post("/auth/signup", input);
      navigate("/login", { replace: true });
    } catch (err) {
      console.log("Signup failed", err);

      if (Array.isArray(err.errors)) {
        setErrors(err.errors);
      } else if (err.message) {
        setErrors([{ field: "_form", message: err.message }]);
      } else {
        setErrors([{ field: "_form", message: "Signup failed" }]);
      }
    }
  };

  const getFieldError = (field) => {
    return errors.find((err) => err.field === field)?.message;
  };

  if (user) return <Navigate to="/" replace />;

  return (
    <div className={styles.page}>
      {loading && <Loading />}
      <div className={`${styles.container} ${loading ? styles.blurred : ""}`}>
        <h1 className={styles.welcomeText}>Create account</h1>

        <form onSubmit={handleSignup} className={styles.form}>
          {getFieldError("_form") && (
            <div className={styles.errorBanner}>{getFieldError("_form")}</div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={input.username}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Choose a username"
              required
            />
            {getFieldError("username") && (
              <span className={styles.fieldError}>
                {getFieldError("username")}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={input.email}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter your email"
              required
            />
            {getFieldError("email") && (
              <span className={styles.fieldError}>
                {getFieldError("email")}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={input.password}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Create a password"
              required
            />
            {getFieldError("password") && (
              <span className={styles.fieldError}>
                {getFieldError("password")}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={input.confirmPassword}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm your password"
              required
            />
            {getFieldError("confirmPassword") && (
              <span className={styles.fieldError}>
                {getFieldError("confirmPassword")}
              </span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className={styles.redirectText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
