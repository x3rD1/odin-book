import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
        setErrors([
          {
            field: "_form",
            message: err.message,
          },
        ]);
      } else {
        setErrors([
          {
            field: "_form",
            message: "Signup failed",
          },
        ]);
      }
    }
  };

  if (loading) return <Loading />;

  if (user) return <Navigate to="/" replace />;

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeText}>Sign up for Anonemousse</h1>
      <form onSubmit={handleSignup} className={styles.form}>
        {errors.map(
          (err) =>
            err.field === "_form" && (
              <p className={styles.error} style={{ color: "red" }}>
                {err.message}
              </p>
            ),
        )}
        <div className={styles.inputContainer}>
          <label>Username</label>
          <input
            type="text"
            value={input.username}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, username: e.target.value }))
            }
            required
          />
          {errors.map(
            (err) =>
              err.field === "username" && (
                <p className={styles.error} style={{ color: "red" }}>
                  {err.message}
                </p>
              ),
          )}
        </div>
        <div className={styles.inputContainer}>
          <label>Email</label>
          <input
            type="email"
            value={input.email}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
          {errors.map(
            (err) =>
              err.field === "email" && (
                <p className={styles.error} style={{ color: "red" }}>
                  {err.message}
                </p>
              ),
          )}
        </div>
        <div className={styles.inputContainer}>
          <label>Password</label>
          <input
            type="password"
            value={input.password}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />
          {errors.map(
            (err) =>
              err.field === "password" && (
                <p className={styles.error} style={{ color: "red" }}>
                  {err.message}
                </p>
              ),
          )}
        </div>
        <div className={styles.inputContainer}>
          <label>Confirm password</label>
          <input
            type="password"
            value={input.confirmPassword}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            required
          />
          {errors.map(
            (err) =>
              err.field === "confirmPassword" && (
                <p className={styles.error} style={{ color: "red" }}>
                  {err.message}
                </p>
              ),
          )}
        </div>
        <div className={styles.btnContainer}>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
      <p className={styles.redirectText}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}

export default Signup;
