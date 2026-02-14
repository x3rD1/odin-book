import { useContext, useState } from "react";
import BackIcon from "../assets/icons/arrow-left.svg?react";
import AuthContext from "../features/auth/AuthContext";
import styles from "./Settings.module.css";
import { updateUser } from "../features/users/users.api";
import { logout } from "../features/auth/auth.api";
import { useNavigate } from "react-router-dom";

const AVATAR_OPTIONS = [
  {
    seed: "Amaya",
    url: "https://api.dicebear.com/9.x/bottts/svg?seed=Amaya",
  },
  {
    seed: "Aiden",
    url: "https://api.dicebear.com/9.x/toon-head/svg?seed=Aiden",
  },
  {
    seed: "Jude",
    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Jude",
  },
  {
    seed: "Robert",
    url: "https://api.dicebear.com/9.x/bottts/svg?seed=Robert",
  },
  {
    seed: "Jessica",
    url: "https://api.dicebear.com/9.x/toon-head/svg?seed=Jessica",
  },
  {
    seed: "Alexander",
    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Alexander",
  },
  {
    seed: "Ryan",
    url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Ryan",
  },
  {
    seed: "Oliver",
    url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Oliver",
  },
  {
    seed: "Christopher",
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Christopher",
  },
  {
    seed: "Kimberly",
    url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Kimberly",
  },
  {
    seed: "Nolan",
    url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Nolan",
  },
  {
    seed: "Sophia",
    url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sophia",
  },
  {
    seed: "Avery",
    url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Avery",
  },
  {
    seed: "Riley",
    url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Riley",
  },
  {
    seed: "Chase",
    url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Chase",
  },
  {
    seed: "Sara",
    url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sara",
  },
  {
    seed: "Aidenho",
    url: "https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Aiden",
  },
  {
    seed: "Jameson",
    url: "https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Jameson",
  },
];

function Settings() {
  const { user, refreshUser } = useContext(AuthContext);
  const [picture, setPicture] = useState(
    user.profilePicture || "https://img.icons8.com/nolan/64/user-default.png",
  );
  const [username, setUsername] = useState(user.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setIsLoading(true);
    setSaveStatus(null);

    try {
      await updateUser(user.id, { profilePicture: picture, username });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus("error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      await refreshUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const hasChanges =
    picture !== user.profilePicture || username !== user.username;

  if (isLoggingOut) {
    return (
      <div className={styles.logoutOverlay}>
        <span className={styles.spinner} />
        <p>Logging out...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        onClick={() => navigate(-1)}
        className={styles.backButton}
        aria-label="Go back"
      >
        <BackIcon className={styles.backIcon} />
      </button>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile Settings</h1>
          <p className={styles.subtitle}>Manage your profile information</p>
        </header>

        <section className={styles.previewSection}>
          <div className={styles.avatarWrapper}>
            <img
              src={picture}
              alt={username}
              className={styles.currentAvatar}
            />
            <div className={styles.avatarOverlay}>
              <span className={styles.avatarLabel}>Current</span>
            </div>
          </div>
          <h2 className={styles.usernameDisplay}>@{username}</h2>
        </section>

        <section className={styles.formSection}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Enter username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Choose Avatar</label>
            <div className={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.seed}
                  onClick={() => setPicture(avatar.url)}
                  className={`${styles.avatarButton} ${
                    picture === avatar.url ? styles.avatarButtonActive : ""
                  }`}
                  aria-label={`Select ${avatar.seed} avatar`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.seed}
                    className={styles.avatarOption}
                  />
                  {picture === avatar.url && (
                    <div className={styles.checkmark}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          {saveStatus === "success" && (
            <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
              Changes saved successfully!
            </div>
          )}
          {saveStatus === "error" && (
            <div className={`${styles.statusMessage} ${styles.statusError}`}>
              Failed to save changes. Please try again.
            </div>
          )}

          <button
            onClick={handleUpdate}
            disabled={!hasChanges || isLoading}
            className={`${styles.saveButton} ${
              !hasChanges ? styles.saveButtonDisabled : ""
            } ${isLoading ? styles.saveButtonLoading : ""}`}
          >
            {isLoading ? <span className={styles.spinner} /> : "Save Changes"}
          </button>
        </footer>

        <div className={styles.divider} />

        <div className={styles.logoutSection}>
          <span className={styles.logoutHint}>Account Actions</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={styles.logoutButton}
          >
            {isLoggingOut ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <svg
                  className={styles.logoutIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </>
            )}
          </button>
          <span className={styles.logoutSubtext}>
            Sign out of your account on this device
          </span>
        </div>
      </div>
    </div>
  );
}

export default Settings;
